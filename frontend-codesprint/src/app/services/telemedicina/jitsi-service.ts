import { Injectable } from '@angular/core';

declare var JitsiMeetExternalAPI: any;

export interface JitsiConfig {
  roomName: string;
  parentElement: HTMLElement;
  userDisplayName: string;
  userEmail?: string;
  jwt?: string;          // ⬅ JWT de JaaS
  appId?: string;        // ⬅ App ID de JaaS
  domain?: string;
  startWithVideoMuted?: boolean;
  startWithAudioMuted?: boolean;
  height?: string;
  width?: string;
}

@Injectable({ providedIn: 'root' })
export class JitsiService {
  private api: any = null;

  initCall(config: JitsiConfig): void {
    if (typeof JitsiMeetExternalAPI === 'undefined') {
      console.error('[Jitsi] SDK no cargado. Verifica el script en index.html');
      return;
    }

    this.dispose();

    // ⬇ Usar 8x8.vc en vez de meet.jit.si
    const domain = config.domain || 'meet.jit.si';  // ⬅ volver a meet.jit.si

    // ⬇ El roomName debe incluir el appId como prefijo
    const fullRoomName = config.appId
      ? `${config.appId}/${config.roomName}`
      : config.roomName;

    const options: any = {
      roomName: fullRoomName,
      parentNode: config.parentElement,
      width: config.width || '100%',
      height: config.height || '100%',

      // ⬇ JWT para autenticación
      jwt: config.jwt,
        configOverwrite: {
          startWithAudioMuted: config.startWithAudioMuted || false,
          startWithVideoMuted: config.startWithVideoMuted || false,
          disableDeepLinking: true,

          // Desactivar lobby y prejoin
          prejoinPageEnabled: false,
          prejoinConfig: { enabled: false },
          lobby: { enabled: false, autoKnock: true },
          enableLobbyChat: false,
          hideLobbyButton: true,
          requireDisplayName: false,
          enableInsecureRoomNameWarning: false,

          // Mostrar tu propia cámara aunque estés solo
          filmstrip: {
            disableResizable: true,
            minParticipantCountForTopPanel: 1,
          },
          disableSelfView: false,
          disableSelfViewSettings: true,

          disableInviteFunctions: true,
          hideConferenceSubject: true,
          hideConferenceTimer: false,
          disableThirdPartyRequests: true,
          enableClosePage: false,
          disableAP: false,
          disableAEC: false,
          disableNS: false,
          disableAGC: false,
          disableHPF: false,
          resolution: 720,
          constraints: {
            video: { height: { ideal: 720, max: 720, min: 180 } },
          },
        },

        interfaceConfigOverwrite: {
          SHOW_JITSI_WATERMARK: false,
          SHOW_WATERMARK_FOR_GUESTS: false,
          SHOW_BRAND_WATERMARK: false,
          SHOW_POWERED_BY: false,
          DEFAULT_BACKGROUND: '#1a1a2e',
          DISABLE_JOIN_LEAVE_NOTIFICATIONS: true,
          MOBILE_APP_PROMO: false,
          HIDE_INVITE_MORE_HEADER: true,
          TOOLBAR_BUTTONS: [
            'microphone', 'camera', 'desktop',
            'fullscreen', 'chat', 'tileview', 'settings',
          ],
          TOOLBAR_ALWAYS_VISIBLE: true,
          FILM_STRIP_MAX_HEIGHT: 120,

        },
    };

    console.log('[Jitsi] Conectando a sala:', fullRoomName, 'en domain:', domain);
    this.api = new JitsiMeetExternalAPI(domain, options);

    this.api.executeCommand('displayName', config.userDisplayName);
    if (config.userEmail) {
      this.api.executeCommand('email', config.userEmail);
    }

    this.api.addListener('videoConferenceJoined', (data: any) => {
      console.log('[Jitsi] Conectado a la sala:', data.roomName);
    });
    this.api.addListener('videoConferenceLeft', () => {
      console.log('[Jitsi] Salió de la sala');
    });
    this.api.addListener('participantJoined', (data: any) => {
      console.log('[Jitsi] Participante se unió:', data.displayName);
    });
    this.api.addListener('participantLeft', (data: any) => {
      console.log('[Jitsi] Participante salió:', data);
    });
  }

  onParticipantJoined(callback: (data: any) => void): void {
    this.api?.addListener('participantJoined', callback);
  }

  onParticipantLeft(callback: (data: any) => void): void {
    this.api?.addListener('participantLeft', callback);
  }

  onCallEnded(callback: () => void): void {
    this.api?.addListener('readyToClose', callback);
  }

  toggleAudio(): void { this.api?.executeCommand('toggleAudio'); }
  toggleVideo(): void { this.api?.executeCommand('toggleVideo'); }
  hangup(): void { this.api?.executeCommand('hangup'); }

  getParticipantsCount(): number {
    return this.api?.getNumberOfParticipants() || 0;
  }

  isActive(): boolean { return this.api !== null; }

  dispose(): void {
    if (this.api) {
      this.api.dispose();
      this.api = null;
    }
  }
}