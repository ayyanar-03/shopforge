export interface PagedResponse<T> {
  data: T[];
  total: number;
  page: number;
  totalPages: number;
}

export interface ApiError {
  message: string | string[];
  statusCode?: number;
}
