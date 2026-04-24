export interface ServiceCard {
  id: string;
  emoji: string;
  title: string;
  subtitle: string;
  providerName: string;
  date: string;
  time: string;
  location: string;
  status: 'Programado' | 'Hoy' | 'Completado' | 'Cancelado';
  price?: string;
  isHistory?: boolean;
  historyDate?: string;

  appointmentType?: string;
  telemedSessionId?: number | null;
}