export interface MonthlyViewsResponse {
  country: string;
  pageviewsPerMonth: { [key: string]: number };
}
