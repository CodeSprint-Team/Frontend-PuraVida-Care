import {
  Component,
  OnInit,
  OnDestroy,
  ChangeDetectorRef,
  ChangeDetectionStrategy,
  NgZone
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { ProviderBookingService } from '../../services/provider-booking-service';
import { TrackingService } from '../../services/tracking-service';
import { ServiceBookingResponse } from '../../interfaces/booking-model';
import { NavbarComponent } from '../../components/navbar/navbar';
import { Client, IMessage } from '@stomp/stompjs';

declare let L: any;

interface ServiceState {
  bookingId: number;
  trackingSessionId: number | null;
  serviceStatus: 'en-camino' | 'en-servicio';
  isPaused: boolean;
  shareLocation: boolean;
  startTimestamp: number;
  pausedAccumulatedTime: number;
  pausedAt: number | null;
  pointCount: number;
}

@Component({
  selector: 'app-in-service',
  standalone: true,
  imports: [CommonModule, NavbarComponent],
  templateUrl: './provider-in-service.html',
  styleUrls: ['./provider-in-service.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProviderInService implements OnInit, OnDestroy {
  role: 'client' | 'admin' | 'provider' | null = 'provider';
  booking: ServiceBookingResponse | null = null;
  loading = true;
  error = '';

  serviceStatus: 'en-camino' | 'en-servicio' = 'en-camino';
  isPaused = false;
  elapsedTime = 0;
  showFinishModal = false;
  finishingService = false;
  shareLocation = false;

  trackingSessionId: number | null = null;
  pointCount = 0;

  providerProfileId = 0;
  bookingId = 0;

  private startTimestamp = 0;
  private pausedAccumulatedTime = 0;
  private pausedAt: number | null = null;

  private readonly STORAGE_KEY = 'active-service-provider';

  private timerInterval: any = null;
  private locationInterval: any = null;
  private map: any = null;
  private routePolyline: any = null;
  private currentMarker: any = null;
  private originMarker: any = null;
  private destinationMarker: any = null;
  private previousLatLng: [number, number] | null = null;
  private currentAngle = 0;
  private stompClient: Client | null = null;

  // Buffer para suavizar movimiento del carro
  private animationFrameId: number | null = null;
  private targetLatLng: [number, number] | null = null;
  private currentAnimatedLatLng: [number, number] | null = null;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private bookingService: ProviderBookingService,
    private trackingService: TrackingService,
    private cdr: ChangeDetectorRef,
    private ngZone: NgZone
  ) {
    const nav = this.router.getCurrentNavigation();
    if (nav?.extras?.state) {
      this.shareLocation = nav.extras.state['shareLocation'] || false;
    }
  }

  ngOnInit(): void {
    this.bookingId = Number(this.route.snapshot.paramMap.get('id'));
    this.providerProfileId = Number(localStorage.getItem('profile_id') ?? 0);

    if (!this.providerProfileId) {
      this.error = 'No se pudo identificar el proveedor.';
      this.loading = false;
      this.cdr.markForCheck();
      return;
    }

    this.restoreState();
    this.loadBooking();
    this.startTimer();
  }

  ngOnDestroy(): void {
    this.stopTimer();
    this.stopSendingPoints();
    this.cancelAnimation();
    if (this.stompClient) {
      this.stompClient.deactivate();
    }
    if (this.map) {
      this.map.remove();
    }
  }

  // ═══════════════════════════════════════════════════════════════
  // STATE PERSISTENCE
  // ═══════════════════════════════════════════════════════════════

  private saveState(): void {
    if (!this.bookingId) return;

    const state: ServiceState = {
      bookingId: this.bookingId,
      trackingSessionId: this.trackingSessionId,
      serviceStatus: this.serviceStatus,
      isPaused: this.isPaused,
      shareLocation: this.shareLocation,
      startTimestamp: this.startTimestamp,
      pausedAccumulatedTime: this.pausedAccumulatedTime,
      pausedAt: this.pausedAt,
      pointCount: this.pointCount,
    };

    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(state));
  }

  private restoreState(): void {
    const saved = localStorage.getItem(this.STORAGE_KEY);
    if (!saved) {
      this.startTimestamp = Date.now();
      this.pausedAccumulatedTime = 0;
      this.pausedAt = null;
      return;
    }

    try {
      const state: ServiceState = JSON.parse(saved);

      if (state.bookingId !== this.bookingId) {
        this.clearState();
        this.startTimestamp = Date.now();
        return;
      }

      this.trackingSessionId = state.trackingSessionId;
      this.serviceStatus = state.serviceStatus;
      this.isPaused = state.isPaused;
      this.shareLocation = state.shareLocation;
      this.startTimestamp = state.startTimestamp;
      this.pausedAccumulatedTime = state.pausedAccumulatedTime;
      this.pausedAt = state.pausedAt;
      this.pointCount = state.pointCount;

      this.recalculateElapsedTime();
    } catch (e) {
      console.error('Error restaurando estado:', e);
      this.clearState();
      this.startTimestamp = Date.now();
    }
  }

  private clearState(): void {
    localStorage.removeItem(this.STORAGE_KEY);
  }

  private recalculateElapsedTime(): void {
    if (this.isPaused && this.pausedAt) {
      this.elapsedTime = Math.floor(this.pausedAccumulatedTime / 1000);
    } else {
      const running = Date.now() - this.startTimestamp;
      this.elapsedTime = Math.floor((this.pausedAccumulatedTime + running) / 1000);
    }
  }

  // ═══════════════════════════════════════════════════════════════
  // BOOKING
  // ═══════════════════════════════════════════════════════════════

  loadBooking(): void {
    this.loading = true;
    this.cdr.markForCheck();

    this.bookingService
      .getBookingsByProvider(this.providerProfileId)
      .subscribe({
        next: (data) => {
          this.booking = data.find((b) => b.bookingId === this.bookingId) || null;
          if (!this.booking) {
            this.error = 'No se encontró el servicio.';
          }
          this.loading = false;
          this.cdr.markForCheck();

          if (this.booking) {
            // Inicializar mapa fuera de Angular para no contaminar change detection
            this.ngZone.runOutsideAngular(() => {
              setTimeout(() => {
                this.loadLeaflet().then(() => {
                  this.initMap();
                  if (this.trackingSessionId && this.shareLocation) {
                    this.startSendingPoints();
                  } else if (this.shareLocation) {
                    this.ngZone.run(() => this.startTracking());
                  }
                });
              }, 100);
            });
          }
        },
        error: (err) => {
          console.error('Error cargando servicio:', err);
          this.error = 'No se pudo cargar el servicio.';
          this.loading = false;
          this.cdr.markForCheck();
        },
      });
  }

  // ═══════════════════════════════════════════════════════════════
  // MAP
  // ═══════════════════════════════════════════════════════════════

  private loadLeaflet(): Promise<void> {
    return new Promise((resolve) => {
      if (!document.getElementById('leaflet-css')) {
        const link = document.createElement('link');
        link.id = 'leaflet-css';
        link.rel = 'stylesheet';
        link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
        document.head.appendChild(link);
      }
      if (typeof L !== 'undefined') {
        return resolve();
      }
      const script = document.createElement('script');
      script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
      script.onload = () => resolve();
      document.head.appendChild(script);
    });
  }

  private initMap(): void {
    if (!this.booking) return;

    const originLat = this.booking.originLatitude;
    const originLng = this.booking.originLongitude;
    const destLat = this.booking.destinationLatitude;
    const destLng = this.booking.destinationLongitude;

    const centerLat = (originLat + destLat) / 2;
    const centerLng = (originLng + destLng) / 2;

    this.map = L.map('provider-map', {
      zoomAnimation: true,
      markerZoomAnimation: true,
    }).setView([centerLat, centerLng], 14);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap',
    }).addTo(this.map);

    this.originMarker = L.marker([originLat, originLng], {
      icon: this.createOriginIcon(),
    }).addTo(this.map).bindPopup('Origen');

    this.destinationMarker = L.marker([destLat, destLng], {
      icon: this.createDestinationIcon(),
    }).addTo(this.map).bindPopup('Destino');

    this.routePolyline = L.polyline([], {
      color: '#0d9488',
      weight: 4,
      opacity: 0.8,
      smoothFactor: 1.5,
    }).addTo(this.map);

    this.map.fitBounds(
      [
        [originLat, originLng],
        [destLat, destLng],
      ],
      { padding: [50, 50] }
    );
  }

  // ═══════════════════════════════════════════════════════════════
  // ANIMATED CAR MOVEMENT — suavizado con requestAnimationFrame
  // ═══════════════════════════════════════════════════════════════

  private addPointToMap(lat: number, lng: number): void {
    if (!this.map) return;

    const latlng: [number, number] = [lat, lng];

    this.routePolyline.addLatLng(latlng);

    // Calcular ángulo de rotación
    if (this.previousLatLng) {
      this.currentAngle = this.calculateBearing(
        this.previousLatLng[0], this.previousLatLng[1],
        lat, lng
      );
    }

    if (!this.currentMarker) {
      // Primera vez: crear marcador
      this.currentMarker = L.marker(latlng, {
        icon: this.createCarIcon(this.currentAngle),
        zIndexOffset: 1000,
      }).addTo(this.map);
      this.currentAnimatedLatLng = latlng;
    } else {
      // Actualizar ícono con nuevo ángulo (solo el ícono, no recrear el marcador)
      this.currentMarker.setIcon(this.createCarIcon(this.currentAngle));
    }

    // Animar movimiento suave hacia el nuevo punto
    this.targetLatLng = latlng;
    if (!this.animationFrameId) {
      this.animateCarMovement();
    }

    this.previousLatLng = latlng;
    this.pointCount++;
    this.saveState();

    // Solo actualizar UI para el contador de puntos
    this.ngZone.run(() => this.cdr.markForCheck());
  }

  private animateCarMovement(): void {
    if (!this.currentAnimatedLatLng || !this.targetLatLng || !this.currentMarker) {
      this.animationFrameId = null;
      return;
    }

    const [curLat, curLng] = this.currentAnimatedLatLng;
    const [tgtLat, tgtLng] = this.targetLatLng;

    // Interpolación suave (lerp)
    const factor = 0.08;
    const newLat = curLat + (tgtLat - curLat) * factor;
    const newLng = curLng + (tgtLng - curLng) * factor;

    this.currentAnimatedLatLng = [newLat, newLng];
    this.currentMarker.setLatLng([newLat, newLng]);

    // Mover el mapa suavemente
    this.map.panTo([newLat, newLng], { animate: true, duration: 0.3 });

    // Si ya llegó (distancia menor a threshold), parar animación
    const distance = Math.abs(tgtLat - newLat) + Math.abs(tgtLng - newLng);
    if (distance < 0.000001) {
      this.currentAnimatedLatLng = this.targetLatLng;
      this.currentMarker.setLatLng(this.targetLatLng);
      this.animationFrameId = null;
      return;
    }

    this.animationFrameId = requestAnimationFrame(() => this.animateCarMovement());
  }

  private cancelAnimation(): void {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }

  // ═══════════════════════════════════════════════════════════════
  // TIMER — fuera de NgZone
  // ═══════════════════════════════════════════════════════════════

  startTimer(): void {
    if (!this.startTimestamp) {
      this.startTimestamp = Date.now();
      this.pausedAccumulatedTime = 0;
      this.pausedAt = null;
      this.saveState();
    }

    this.ngZone.runOutsideAngular(() => {
      this.timerInterval = setInterval(() => {
        if (!this.isPaused) {
          const runningTime = Date.now() - this.startTimestamp;
          this.elapsedTime = Math.floor(
            (this.pausedAccumulatedTime + runningTime) / 1000
          );
          this.cdr.detectChanges();
        }
      }, 1000);
    });
  }

  stopTimer(): void {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
  }

  togglePause(): void {
    if (!this.isPaused) {
      this.pausedAccumulatedTime += Date.now() - this.startTimestamp;
      this.pausedAt = Date.now();
    } else {
      this.startTimestamp = Date.now();
      this.pausedAt = null;
    }
    this.isPaused = !this.isPaused;
    this.saveState();
    this.cdr.markForCheck();
  }

  formatElapsedTime(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${this.pad(hours)}:${this.pad(minutes)}:${this.pad(secs)}`;
  }

  private pad(n: number): string {
    return n.toString().padStart(2, '0');
  }

  // ═══════════════════════════════════════════════════════════════
  // TRACKING & GPS — fuera de NgZone
  // ═══════════════════════════════════════════════════════════════

  startTracking(): void {
    this.trackingService
      .startTracking(this.providerProfileId, { bookingId: this.bookingId })
      .subscribe({
        next: (session) => {
          this.trackingSessionId = session.trackingSessionId;
          this.saveState();
          this.startSendingPoints();
          this.cdr.markForCheck();
        },
        error: (err) => console.error('Error iniciando tracking:', err),
      });
  }

  private startSendingPoints(): void {
    if (!this.trackingSessionId) return;

    // GPS fuera de NgZone para no disparar change detection en cada lectura
    this.ngZone.runOutsideAngular(() => {
      this.locationInterval = setInterval(() => {
        if (this.isPaused || !this.trackingSessionId) return;

        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            (position) => {
              const lat = position.coords.latitude;
              const lng = position.coords.longitude;

              // Filtrar puntos duplicados o muy cercanos
              if (this.previousLatLng) {
                const dist = Math.abs(lat - this.previousLatLng[0])
                           + Math.abs(lng - this.previousLatLng[1]);
                if (dist < 0.00005) return; // ~5 metros, ignorar micro-movimientos
              }

              this.addPointToMap(lat, lng);

              this.trackingService
                .addTrackingPoint(this.trackingSessionId!, this.providerProfileId, {
                  latitude: lat,
                  longitude: lng,
                })
                .subscribe({
                  error: (err) => console.error('Error enviando punto:', err),
                });
            },
            (err) => console.error('Error GPS:', err),
            { enableHighAccuracy: true, timeout: 8000, maximumAge: 3000 }
          );
        }
      }, 10000);
    });
  }

  private stopSendingPoints(): void {
    if (this.locationInterval) {
      clearInterval(this.locationInterval);
      this.locationInterval = null;
    }
  }

  // ═══════════════════════════════════════════════════════════════
  // SERVICE STATUS
  // ═══════════════════════════════════════════════════════════════

  setServiceStatus(status: 'en-camino' | 'en-servicio'): void {
    this.serviceStatus = status;
    this.saveState();
    this.cdr.markForCheck();
  }

  openFinishModal(): void {
    this.showFinishModal = true;
    this.cdr.markForCheck();
  }

  closeFinishModal(): void {
    this.showFinishModal = false;
    this.cdr.markForCheck();
  }

  confirmFinish(): void {
    if (!this.booking) return;
    this.finishingService = true;
    this.cdr.markForCheck();

    if (this.trackingSessionId) {
      this.stopSendingPoints();
      this.trackingService
        .endTracking(this.trackingSessionId, this.providerProfileId)
        .subscribe({
          error: (err) => console.error('Error finalizando tracking:', err),
        });
    }

    this.bookingService
      .completeService(this.booking.bookingId, this.providerProfileId)
      .subscribe({
        next: () => {
          this.stopTimer();
          this.cancelAnimation();
          this.finishingService = false;
          this.closeFinishModal();
          this.clearState();
          this.router.navigate(['/provider-requests-service', this.providerProfileId]);
        },
        error: (err) => {
          console.error('Error completando servicio:', err);
          this.finishingService = false;
          this.cdr.markForCheck();
        },
      });
  }

  openMaps(): void {
    if (!this.booking) return;
    const url = `https://www.google.com/maps/dir/${this.booking.originLatitude},${this.booking.originLongitude}/${this.booking.destinationLatitude},${this.booking.destinationLongitude}`;
    window.open(url, '_blank');
  }

  formatPrice(price: number): string {
    return price.toLocaleString('es-CR', {
      style: 'currency',
      currency: 'CRC',
    });
  }

  // ═══════════════════════════════════════════════════════════════
  // WEBSOCKET — fuera de NgZone
  // ═══════════════════════════════════════════════════════════════

  private connectToWebSocket(onConnected: () => void): void {
    this.ngZone.runOutsideAngular(() => {
      this.stompClient = new Client({
        brokerURL: 'ws://localhost:8081/api/v1/ws',
        reconnectDelay: 5000,
      });

      this.stompClient.onConnect = () => {
        this.stompClient!.subscribe(
          `/topic/tracking/${this.trackingSessionId}`,
          (message: IMessage) => {
            const point = JSON.parse(message.body);
            this.addPointToMap(Number(point.latitude), Number(point.longitude));
          }
        );

        this.ngZone.run(() => onConnected());
      };

      this.stompClient.activate();
    });
  }

  // ═══════════════════════════════════════════════════════════════
  // SIMULATION
  // ═══════════════════════════════════════════════════════════════

  simulateTrip(): void {
    if (!this.booking) return;

    if (!this.trackingSessionId) {
      this.trackingService
        .startTracking(this.providerProfileId, { bookingId: this.bookingId })
        .subscribe({
          next: (session) => {
            this.trackingSessionId = session.trackingSessionId;
            this.saveState();
            this.cdr.markForCheck();
            this.runSimulation();
          },
          error: (err: any) => console.error('Error creando sesión:', err),
        });
    } else {
      this.runSimulation();
    }
  }

  private runSimulation(): void {
    if (!this.booking || !this.trackingSessionId) return;

    this.routePolyline.setLatLngs([]);
    this.pointCount = 0;
    this.previousLatLng = null;
    this.cancelAnimation();
    this.currentAnimatedLatLng = null;

    if (this.currentMarker) {
      this.map.removeLayer(this.currentMarker);
      this.currentMarker = null;
    }

    this.connectToWebSocket(() => {
      const waypoints = [
        [this.booking!.originLatitude, this.booking!.originLongitude],
        [this.booking!.destinationLatitude, this.booking!.destinationLongitude],
      ];

      this.trackingService.simulateRoute(
        this.trackingSessionId!,
        this.providerProfileId,
        waypoints,
        40,
        800
      ).subscribe({
        next: () => console.log('Simulación lanzada'),
        error: (err: any) => console.error('Error simulando:', err),
      });
    });
  }

  // ═══════════════════════════════════════════════════════════════
  // MAP ICONS
  // ═══════════════════════════════════════════════════════════════

  private createOriginIcon(): any {
    return L.divIcon({
      className: 'custom-marker-origin',
      html: `
        <div style="position:relative;width:44px;height:44px;">
          <div style="
            position:absolute;top:50%;left:50%;
            transform:translate(-50%,-50%);
            width:44px;height:44px;
            background:rgba(16,185,129,0.25);
            border-radius:50%;
            animation:marker-pulse 2s ease-out infinite;
          "></div>
          <div style="
            position:absolute;top:50%;left:50%;
            transform:translate(-50%,-50%);
            width:22px;height:22px;
            background:white;
            border-radius:50%;
            box-shadow:0 2px 8px rgba(0,0,0,0.25);
            display:flex;align-items:center;justify-content:center;
          ">
            <div style="width:12px;height:12px;background:#10B981;border-radius:50%;"></div>
          </div>
        </div>
      `,
      iconSize: [44, 44],
      iconAnchor: [22, 22],
    });
  }

  private createDestinationIcon(): any {
    return L.divIcon({
      className: 'custom-marker-destination',
      html: `
        <div style="position:relative;width:40px;height:52px;">
          <div style="
            position:absolute;bottom:-2px;left:50%;
            transform:translateX(-50%);
            width:14px;height:6px;
            background:rgba(0,0,0,0.2);
            border-radius:50%;
            filter:blur(2px);
          "></div>
          <svg width="40" height="52" viewBox="0 0 40 52" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M20 0C8.954 0 0 8.954 0 20c0 14 20 32 20 32s20-18 20-32C40 8.954 31.046 0 20 0z"
                  fill="url(#destGrad)"/>
            <circle cx="20" cy="18" r="9" fill="white"/>
            <path d="M17 13v12M17 13h7l-2 3 2 3h-7"
                  stroke="#EF4444" stroke-width="1.8"
                  stroke-linecap="round" stroke-linejoin="round" fill="none"/>
            <defs>
              <linearGradient id="destGrad" x1="20" y1="0" x2="20" y2="52"
                              gradientUnits="userSpaceOnUse">
                <stop offset="0" stop-color="#F87171"/>
                <stop offset="1" stop-color="#DC2626"/>
              </linearGradient>
            </defs>
          </svg>
        </div>
      `,
      iconSize: [40, 52],
      iconAnchor: [20, 52],
    });
  }

  private createCarIcon(rotationAngle: number = 0): any {
    return L.divIcon({
      className: 'custom-marker-car',
      html: `
        <div style="
          position:relative;width:52px;height:52px;
          transform:rotate(${rotationAngle}deg);
          transition:transform 0.8s cubic-bezier(0.4,0,0.2,1);
        ">
          <div style="
            position:absolute;top:50%;left:50%;
            transform:translate(-50%,-50%);
            width:52px;height:52px;
            background:radial-gradient(circle,rgba(14,165,133,0.3) 0%,transparent 70%);
            border-radius:50%;
            animation:car-glow 3s ease-in-out infinite;
          "></div>
          <svg width="52" height="52" viewBox="0 0 52 52" fill="none"
               xmlns="http://www.w3.org/2000/svg"
               style="position:absolute;top:0;left:0;
                      filter:drop-shadow(0 4px 8px rgba(0,0,0,0.35));">
            <g transform="translate(26,26)">
              <path d="M-8,-17 C-8,-20 8,-20 8,-17 L9,-5
                       C10,-3 10,12 9,15 C8,18 -8,18 -9,15
                       C-10,12 -10,-3 -9,-5 Z"
                    fill="url(#carBody)"/>
              <path d="M-6,-13 C-6,-14 6,-14 6,-13 L6.5,-7
                       C6.5,-6 -6.5,-6 -6.5,-7 Z"
                    fill="#B2F5EA" opacity="0.8"/>
              <rect x="-5.5" y="-6" width="11" height="10"
                    rx="3" fill="#0F766E"/>
              <path d="M-5,5 L5,5 L4.5,9
                       C4.5,10 -4.5,10 -4.5,9 Z"
                    fill="#B2F5EA" opacity="0.6"/>
              <rect x="-7.5" y="-17.5" width="4.5" height="1.8"
                    rx="0.9" fill="#FEF3C7"/>
              <rect x="3" y="-17.5" width="4.5" height="1.8"
                    rx="0.9" fill="#FEF3C7"/>
              <rect x="-7" y="-17.2" width="3.5" height="1.2"
                    rx="0.6" fill="#FDE68A" opacity="0.8"/>
              <rect x="3.5" y="-17.2" width="3.5" height="1.2"
                    rx="0.6" fill="#FDE68A" opacity="0.8"/>
              <rect x="-7" y="15" width="4" height="1.5"
                    rx="0.75" fill="#FCA5A5"/>
              <rect x="3" y="15" width="4" height="1.5"
                    rx="0.75" fill="#FCA5A5"/>
              <circle cx="-10" cy="-5" r="1.5" fill="#115E59"/>
              <circle cx="10" cy="-5" r="1.5" fill="#115E59"/>
              <defs>
                <linearGradient id="carBody" x1="-10" y1="-20"
                                x2="10" y2="18"
                                gradientUnits="userSpaceOnUse">
                  <stop offset="0" stop-color="#14B8A6"/>
                  <stop offset="1" stop-color="#0F766E"/>
                </linearGradient>
              </defs>
            </g>
          </svg>
        </div>
      `,
      iconSize: [52, 52],
      iconAnchor: [26, 26],
    });
  }

  private calculateBearing(
    lat1: number, lng1: number,
    lat2: number, lng2: number
  ): number {
    const toRad = (deg: number) => deg * Math.PI / 180;
    const toDeg = (rad: number) => rad * 180 / Math.PI;

    const dLng = toRad(lng2 - lng1);
    const y = Math.sin(dLng) * Math.cos(toRad(lat2));
    const x =
      Math.cos(toRad(lat1)) * Math.sin(toRad(lat2)) -
      Math.sin(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.cos(dLng);

    return (toDeg(Math.atan2(y, x)) + 360) % 360;
  }
}