export interface SystemStats {
  totalUsers: number;
  totalProviders: number;
  activeServices: number;
  totalReviews: number;
}

export interface AdminProfile {
  id: number;
  fullName: string;
  email: string;
  role: string;
  photoUrl?: string;
  createdAt: string;
  systemStats: SystemStats;
}

export interface AdminProfileUpdateDTO {
  userName: string;
  lastName: string;
  email: string;
  photoUrl?: string;
  currentPassword?: string;
  newPassword?: string;
}