export interface SupportProductPostResponse {
  id: number;
  userId: number;
  supportProductCatalogId: number;
  supportProductCategory?: string;
  supportProductBaseName?: string;
  title: string;
  description: string;
  condition: string;
  salePrice: number;
  originalPrice: number;
  acceptsOffers: boolean;
  publicationState: string;
  locationLat: number;
  locationLng: number;
  locationText?: string;
  usageTimeText?: string;
  imageUrl?: string;
  imagePath?: string;
  created?: string;
  updated?: string;
}