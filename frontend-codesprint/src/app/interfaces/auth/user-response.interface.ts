export interface UserResponse {
  id: number;
  userName: string;
  lastName: string;
  email: string;
  active?: boolean;
  createdAt?: string;
}