export interface ClientProfileCreateRequest {
  userId: number;
  phone: string;
  notes?: string;
  relationToSenior?: string;
  emergencyContactName?: string;
  emergencyContactRelation?: string;
  emergencyContactPhone?: string;
  importantNotes?: string;
}