export interface ProviderProfileCreateRequest {
  userId: number;
  providerTypeId: number;
  experienceDescription?: string;
  experienceYears?: number;
  providerState?: string;
  bio?: string;
  zone?: string;
  phone?: string;
  profileImage?: string;
  verified?: boolean;
  insuranceActive?: boolean;
}