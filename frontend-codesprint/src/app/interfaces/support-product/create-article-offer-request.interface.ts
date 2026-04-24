export interface CreateArticleOfferRequest {
  supportProductPostId: number;
  buyerUserId: number;
  amount: number;
  message?: string;
}