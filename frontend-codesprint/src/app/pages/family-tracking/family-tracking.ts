import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { TrackingService } from '../../services/tracking-service';
import { NavbarComponent } from '../../components/navbar/navbar';
import { Client, IMessage } from '@stomp/stompjs';


declare let L: any;

interface FamilyTrackingState {
  sessionId: number;
  sessionStatus: string;
  currentPhase: 'en-camino' | 'en-servicio' | 'completado';
  pointCount: number;
  lastPoint: { latitude: number; longitude: number } | null;
  lastUpdated: string;
  timelineConfirmed: string;
  timelineOnTheWay: string;
  timelineInService: string;
  timelineCompleted: string;
  routePoints: [number, number][];
}

@Component({
  selector: 'app-family-tracking',
  standalone: true,
  imports: [CommonModule, NavbarComponent, FormsModule],
  templateUrl: './family-tracking.html',
  styleUrls: ['./family-tracking.css'],
})
export class FamilyTrackingComponent implements OnInit, OnDestroy {
  role: 'client' | 'admin' | 'provider' | null = 'client';

  sessionId = 0;
  sessionStatus = '';
  providerName = 'Proveedor';

  // Coordenadas del booking 
  originLatitude = 0;
  originLongitude = 0;
  destinationLatitude = 0;
  destinationLongitude = 0;

  // Estado
  loading = true;
  error = '';
  pointCount = 0;
  lastPoint: { latitude: number; longitude: number } | null = null;
  lastUpdated = '';

  // Timeline
  currentPhase: 'en-camino' | 'en-servicio' | 'completado' = 'en-camino';
  phaseTitle = 'En camino';
  phaseDescription = 'El proveedor se dirige a tu ubicación';
  timelineConfirmed = '';
  timelineOnTheWay = '';
  timelineInService = '';
  timelineCompleted = '';

  // Chat
  showChat = false;
  chatMessage = '';

  // Para restaurar la ruta en el mapa
  private routePoints: [number, number][] = [];

  private readonly STORAGE_KEY = 'family-tracking-state';

  // Leaflet
  private map: any = null;
  private routePolyline: any = null;
  private providerMarker: any = null;
  private originMarker: any = null;
  private destinationMarker: any = null;
  private previousLatLng: [number, number] | null = null;
  private stompClient: Client | null = null;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private trackingService: TrackingService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.sessionId = Number(this.route.snapshot.paramMap.get('sessionId'));

    if (!this.sessionId) {
      this.error = 'ID de sesión no válido.';
      this.loading = false;
      return;
    }

    this.restoreState();

    if (!this.timelineConfirmed) {
      this.timelineConfirmed = this.getCurrentTime();
    }

    this.loadSession();
  }

  ngOnDestroy(): void {
    this.disconnectWebSocket();
    if (this.map) {
      this.map.remove();
    }
  }


  // PERSISTENCIA CON LOCALSTORAGE
  private saveState(): void {
    if (!this.sessionId) return;

    const state: FamilyTrackingState = {
      sessionId: this.sessionId,
      sessionStatus: this.sessionStatus,
      currentPhase: this.currentPhase,
      pointCount: this.pointCount,
      lastPoint: this.lastPoint,
      lastUpdated: this.lastUpdated,
      timelineConfirmed: this.timelineConfirmed,
      timelineOnTheWay: this.timelineOnTheWay,
      timelineInService: this.timelineInService,
      timelineCompleted: this.timelineCompleted,
      routePoints: this.routePoints,
    };

    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(state));
  }

  private restoreState(): void {
    const saved = localStorage.getItem(this.STORAGE_KEY);
    if (!saved) return;

    try {
      const state: FamilyTrackingState = JSON.parse(saved);

      if (state.sessionId !== this.sessionId) {
        this.clearState();
        return;
      }

      this.sessionStatus = state.sessionStatus;
      this.currentPhase = state.currentPhase;
      this.pointCount = state.pointCount;
      this.lastPoint = state.lastPoint;
      this.lastUpdated = state.lastUpdated;
      this.timelineConfirmed = state.timelineConfirmed;
      this.timelineOnTheWay = state.timelineOnTheWay;
      this.timelineInService = state.timelineInService;
      this.timelineCompleted = state.timelineCompleted;
      this.routePoints = state.routePoints || [];

      this.updatePhase(this.currentPhase);

      console.log('Estado de tracking familiar restaurado');
    } catch (e) {
      console.error('Error restaurando estado de tracking:', e);
      this.clearState();
    }
  }

  private clearState(): void {
    localStorage.removeItem(this.STORAGE_KEY);
    this.routePoints = [];
  }


  // SESIÓN
  private loadSession(): void {
    this.trackingService.getTrackingSession(this.sessionId).subscribe({
      next: (session) => {
        this.sessionStatus = session.trackingState;

        // Coordenadas del booking 
        this.originLatitude = session.originLatitude;
        this.originLongitude = session.originLongitude;
        this.destinationLatitude = session.destinationLatitude;
        this.destinationLongitude = session.destinationLongitude;

        this.loading = false;

        // ── SERVICIO FINALIZADO ──
        if (session.trackingState === 'ended') {
          const now = this.getCurrentTime();

          if (!this.timelineOnTheWay) {
            this.timelineOnTheWay = this.timelineConfirmed || now;
          }
          if (!this.timelineInService) {
            this.timelineInService = this.timelineOnTheWay || now;
          }
          if (!this.timelineCompleted) {
            this.timelineCompleted = now;
          }

          this.updatePhase('completado');
          this.saveState();
          this.cdr.detectChanges();

          setTimeout(() => {
            this.loadLeaflet().then(() => {
              this.initMap();
              this.restoreRouteOnMap();
              this.loadHistoryPoints();
            });
          }, 200);

          return;
        }

        // ── SERVICIO ACTIVO ──
        this.cdr.detectChanges();

        setTimeout(() => {
          this.loadLeaflet().then(() => {
            this.initMap();
            this.restoreRouteOnMap();
            this.connectWebSocket();
          });
        }, 200);
      },
      error: (err) => {
        console.error('Error cargando sesión:', err);
        this.error = 'No se pudo cargar el seguimiento.';
        this.loading = false;
        this.cdr.detectChanges();
      },
    });
  }


  // CARGAR HISTORIAL DE PUNTOS DESDE BACKEND

  private loadHistoryPoints(): void {
    this.trackingService.getTrackingPoints(this.sessionId).subscribe({
      next: (points) => {
        if (!points || points.length === 0) return;

        if (this.routePoints.length > 0) return;

        for (const p of points) {
          const latlng: [number, number] = [p.latitude, p.longitude];
          this.routePoints.push(latlng);
          this.routePolyline?.addLatLng(latlng);
        }

        const last = this.routePoints[this.routePoints.length - 1];
        if (last && this.map) {
          let angle = 0;
          if (this.routePoints.length >= 2) {
            const prev = this.routePoints[this.routePoints.length - 2];
            angle = this.calculateBearing(prev[0], prev[1], last[0], last[1]);
          }

          if (this.providerMarker) {
            this.providerMarker.setLatLng(last);
            this.providerMarker.setIcon(this.createCarIcon(angle));
          } else {
            this.providerMarker = L.marker(last, {
              icon: this.createCarIcon(angle),
            }).addTo(this.map);
          }
          this.fitMapToAllPoints();
        }

        this.pointCount = points.length;
        this.lastPoint = {
          latitude: points[points.length - 1].latitude,
          longitude: points[points.length - 1].longitude,
        };
        this.lastUpdated = this.getCurrentTime();

        this.saveState();
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Error cargando historial de puntos:', err),
    });
  }

  private fitMapToAllPoints(): void {
    if (!this.map) return;

    const allPoints: [number, number][] = [];

    if (this.originLatitude && this.originLongitude) {
      allPoints.push([this.originLatitude, this.originLongitude]);
    }
    if (this.destinationLatitude && this.destinationLongitude) {
      allPoints.push([this.destinationLatitude, this.destinationLongitude]);
    }
    for (const p of this.routePoints) {
      allPoints.push(p);
    }

    if (allPoints.length >= 2) {
      this.map.fitBounds(allPoints, { padding: [50, 50] });
    }
  }

  private restoreRouteOnMap(): void {
    if (!this.map || !this.routePolyline || this.routePoints.length === 0) return;

    for (const point of this.routePoints) {
      this.routePolyline.addLatLng(point);
    }

    const lastPoint = this.routePoints[this.routePoints.length - 1];
    if (lastPoint) {
      let angle = 0;
      if (this.routePoints.length >= 2) {
        const prev = this.routePoints[this.routePoints.length - 2];
        angle = this.calculateBearing(prev[0], prev[1], lastPoint[0], lastPoint[1]);
        this.previousLatLng = prev;
      }

      this.providerMarker = L.marker(lastPoint, {
        icon: this.createCarIcon(angle),
      }).addTo(this.map);

      this.fitMapToAllPoints();
    }
  }


  // WEBSOCKET
  private connectWebSocket(): void {
    if (this.sessionStatus === 'ended' || this.currentPhase === 'completado') {
      return;
    }

    this.stompClient = new Client({
      brokerURL: 'ws://localhost:8081/api/v1/ws',
      reconnectDelay: 5000,
      debug: (str) => {
        // console.log('STOMP: ' + str);
      },
    });

    this.stompClient.onConnect = () => {
      console.log('WebSocket conectado');

      if (!this.timelineOnTheWay) {
        this.timelineOnTheWay = this.getCurrentTime();
      }

      if (this.currentPhase !== 'completado' && this.currentPhase !== 'en-servicio') {
        this.updatePhase('en-camino');
      }

      this.saveState();
      this.cdr.detectChanges();

      this.stompClient!.subscribe(
        `/topic/tracking/${this.sessionId}`,
        (message: IMessage) => {
          const point = JSON.parse(message.body);
          this.onPointReceived(point.latitude, point.longitude);
        }
      );
    };

    this.stompClient.onStompError = (frame) => {
      console.error('STOMP error:', frame.headers['message']);
      this.error = 'Error de conexión con el servidor.';
      this.cdr.detectChanges();
    };

    this.stompClient.activate();
  }

  private disconnectWebSocket(): void {
    if (this.stompClient) {
      this.stompClient.deactivate();
      this.stompClient = null;
    }
  }

  private onPointReceived(lat: number, lng: number): void {
    const latlng: [number, number] = [lat, lng];

    this.routePoints.push(latlng);
    this.routePolyline.addLatLng(latlng);

    let angle = 0;
    if (this.previousLatLng) {
      angle = this.calculateBearing(
        this.previousLatLng[0], this.previousLatLng[1],
        lat, lng
      );
    }
    this.previousLatLng = [lat, lng];

    if (this.providerMarker) {
      this.providerMarker.setLatLng(latlng);
      this.providerMarker.setIcon(this.createCarIcon(angle));
    } else {
      this.providerMarker = L.marker(latlng, {
        icon: this.createCarIcon(angle),
      }).addTo(this.map);
    }

    this.lastPoint = { latitude: lat, longitude: lng };
    this.pointCount++;
    this.lastUpdated = this.getCurrentTime();

    if (this.pointCount === 5 && this.currentPhase === 'en-camino') {
      this.timelineInService = this.getCurrentTime();
      this.updatePhase('en-servicio');
    }

    this.saveState();
    this.map.panTo(latlng);
    this.cdr.detectChanges();
  }


  // TIMELINE / PHASES
  private updatePhase(phase: 'en-camino' | 'en-servicio' | 'completado'): void {
    this.currentPhase = phase;

    switch (phase) {
      case 'en-camino':
        this.phaseTitle = 'En camino';
        this.phaseDescription = 'El proveedor se dirige a tu ubicación';
        break;
      case 'en-servicio':
        this.phaseTitle = 'Servicio en progreso';
        this.phaseDescription = 'El servicio ha comenzado';
        break;
      case 'completado':
        this.phaseTitle = 'Completado';
        this.phaseDescription = 'El servicio ha finalizado';
        break;
    }
  }


  // CHAT
  openChat(): void {
    this.showChat = true;
  }

  closeChat(): void {
    this.showChat = false;
  }

  sendMessage(): void {
    if (!this.chatMessage.trim()) return;
    console.log('Mensaje enviado:', this.chatMessage);
    this.chatMessage = '';
  }

  // CUSTOM ICONS (mismos del provider-in-service)
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
          "></div>
          <svg width="52" height="52" viewBox="0 0 52 52" fill="none"
               xmlns="http://www.w3.org/2000/svg"
               style="position:absolute;top:0;left:0;
                      filter:drop-shadow(0 4px 8px rgba(0,0,0,0.35));">
            <g transform="translate(26,26)">
              <path d="M-8,-17 C-8,-20 8,-20 8,-17 L9,-5
                       C10,-3 10,12 9,15 C8,18 -8,18 -9,15
                       C-10,12 -10,-3 -9,-5 Z"
                    fill="url(#carBodyF)"/>
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
              <rect x="-7" y="15" width="4" height="1.5"
                    rx="0.75" fill="#FCA5A5"/>
              <rect x="3" y="15" width="4" height="1.5"
                    rx="0.75" fill="#FCA5A5"/>
              <circle cx="-10" cy="-5" r="1.5" fill="#115E59"/>
              <circle cx="10" cy="-5" r="1.5" fill="#115E59"/>
              <defs>
                <linearGradient id="carBodyF" x1="-10" y1="-20"
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

  // LEAFLET (con marcadores de origen y destino)
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
    const container = document.getElementById('family-tracking-map');
    if (!container) {
      console.error('Map container not found, retrying...');
      setTimeout(() => this.initMap(), 300);
      return;
    }

    const originLat = this.originLatitude;
    const originLng = this.originLongitude;
    const destLat = this.destinationLatitude;
    const destLng = this.destinationLongitude;

    const hasCoords = originLat !== 0 && destLat !== 0;
    const centerLat = hasCoords ? (originLat + destLat) / 2 : 9.935;
    const centerLng = hasCoords ? (originLng + destLng) / 2 : -84.090;

    this.map = L.map('family-tracking-map').setView([centerLat, centerLng], 14);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap',
    }).addTo(this.map);


    if (hasCoords) {
      this.originMarker = L.marker([originLat, originLng], {
        icon: this.createOriginIcon(),
      }).addTo(this.map).bindPopup('Origen');

      this.destinationMarker = L.marker([destLat, destLng], {
        icon: this.createDestinationIcon(),
      }).addTo(this.map).bindPopup('Destino');

      this.map.fitBounds(
        [
          [originLat, originLng],
          [destLat, destLng],
        ],
        { padding: [50, 50] }
      );
    }

    this.routePolyline = L.polyline([], {
      color: '#0d9488',
      weight: 4,
      opacity: 0.8,
    }).addTo(this.map);
  }


  // HELPERS
  private getCurrentTime(): string {
    return new Date().toLocaleTimeString('es-CR', {
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  goBack(): void {
    this.router.navigate(['/home']);
  }
}