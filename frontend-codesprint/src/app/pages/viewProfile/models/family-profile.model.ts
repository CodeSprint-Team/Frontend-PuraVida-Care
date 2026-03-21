import { BaseProfile } from './profile.model';

export interface FamilyProfile extends BaseProfile {
  // Campos que ya tenías
  relationToSenior:  string;
  emergencyName:     string;
  emergencyRelation: string;
  emergencyPhone:    string;
  importantNotes?:   string;
  emergencyContactName?:     string;
  emergencyContactRelation?: string;
  emergencyContactPhone?:    string;
  notes?:                    string;
}