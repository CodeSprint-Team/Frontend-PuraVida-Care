export interface BaseProfile {
  id: string;
  fullName: string;
  phone: string;
  email?: string;
  profileImage?: string | null;
  address?: string;
  memberSince: string;
}