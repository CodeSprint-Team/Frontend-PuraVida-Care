export interface SupportProductPostRequest {
  supportProductCatalogId: number;
  userId: number;
  title: string;
  description: string;
  condition: string;
  salePrice: number;
  originalPrice?: number;
  acceptsOffers: boolean;
  locationLat: number;
  locationLng: number;
  locationText?: string;
  usageTimeText?: string;
}