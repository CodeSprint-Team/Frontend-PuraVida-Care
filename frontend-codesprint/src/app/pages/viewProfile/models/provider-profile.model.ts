export interface CareServiceDTO {
  id: number;
  name: string;
  description: string;
  price: string;
  priceMode: string;
  category: string | null;
  publicationState: string;
}

export interface ReviewDTO {
  id: number;
  author: string;
  avatar: string | null;
  rating: number;
  comment: string;
  date: string;
}

export interface ProviderProfile {
  id: number;
  fullName: string;
  email: string;
  providerType: string | null;
  experienceDescription: string;
  experienceYears: number;
  averageRating: number;
  providerState: string;
  bio?: string;
  zone?: string;
  phone?: string;
  profileImage?: string;
  verified?: boolean;
  insuranceActive?: boolean;
  services?: CareServiceDTO[];
  totalReviews?: number;
  reviewsList?: ReviewDTO[];
  ratingDistribution?: { [key: number]: number };
}

export interface ProviderProfileUpdateDTO {
  userName: string;
  lastName: string;
  email: string;
  experienceDescription: string;
  experienceYears?: number;
  providerState?: string;
  bio?: string;
  zone?: string;
  phone?: string;
  profileImage?: string | null;
  verified?: boolean;
  insuranceActive?: boolean;
}