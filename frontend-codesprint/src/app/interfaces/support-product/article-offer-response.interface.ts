export interface ArticleOfferResponse {
  id: number;
  supportProductPostId: number;
  supportProductTitle: string;
  supportProductImageUrl?: string;
  sellerUserId: number;
  sellerName?: string;
  buyerUserId: number;
  buyerName?: string;
  amount: number;
  message: string;
  offerState: 'PENDING' | 'ACCEPTED' | 'REJECTED';
  created?: string;
}