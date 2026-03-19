export interface SeniorProfileCreateRequest {
  userId: number;
  phone: string;
  age?: number;
  address?: string; 
  carePreference?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  emergencyRelation?: string;
  healthObservation?: string;
  mobilityNotes?: string;
  allergies?: string;
}