export interface ProviderSearchResult {
  id:                 number;
  fullName:           string;
  profileImage:       string | null;
  providerType:       string | null;
  zone:               string | null;
  averageRating:      number;
  totalReviews:       number;
  verified:           boolean;
  insuranceActive:    boolean;
  bio:                string | null;
  providerState:      string;
  startingPrice:      number | null;
  startingPriceMode:  string | null;
  serviceCategories:  string[];
}

export interface ProviderSearchFilters {
  name:          string;
  zone:          string;
  minPrice:      string;
  maxPrice:      string;
  minRating:     string;
  category:      string;
  verifiedOnly:  boolean;
}

export const EMPTY_FILTERS: ProviderSearchFilters = {
  name:         '',
  zone:         '',
  minPrice:     '',
  maxPrice:     '',
  minRating:    '',
  category:     '',
  verifiedOnly: false,
};