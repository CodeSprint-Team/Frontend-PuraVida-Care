export interface FavoriteProviderDTO {
  favoriteId: number;
  providerProfileId: number;
  fullName: string;
  providerType: string | null;
  averageRating: number;
  providerState: string;
}

export interface SeniorProfile {
  id: number;

  // User
  fullName: string;
  email: string;

  // Personal
  age?: number;
  address?: string;
  phone?: string;
  profileImage?: string;

  // Familiar responsable
  familyMember?: string;
  familyRelation?: string;
  familyPhone?: string;

  // Emergencia
  emergencyContactName: string;
  emergencyContactPhone: string;
  emergencyRelation?: string;

  // Notas médicas
  mobilityNotes?: string;
  carePreference?: string;
  healthObservation?: string;
  allergies?: string;

  // Proveedores favoritos
  favoriteProviders?: FavoriteProviderDTO[];
}

export interface SeniorProfileUpdateDTO {
  userName: string;
  lastName: string;
  email: string;
  age?: number;
  address?: string;
  phone?: string;
  profileImage?: string | null;
  familyMember?: string;
  familyRelation?: string;
  familyPhone?: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  emergencyRelation?: string;
  mobilityNotes?: string;
  carePreference?: string;
  healthObservation?: string;
  allergies?: string;
}