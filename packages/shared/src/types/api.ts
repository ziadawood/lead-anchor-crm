// API response types

/** Standard success response */
export interface IApiResponse<T> {
  data: T;
  meta?: IApiPaginationMeta;
}

/** Standard error response */
export interface IApiError {
  error: {
    code: ApiErrorCode;
    message: string;
    details?: IFieldError[];
  };
}

export interface IApiPaginationMeta {
  page: number;
  per_page: number;
  total: number;
  total_pages: number;
}

export interface IFieldError {
  field: string;
  message: string;
}

export type ApiErrorCode =
  | 'VALIDATION_ERROR'
  | 'NOT_FOUND'
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'CONFLICT'
  | 'RATE_LIMITED'
  | 'INTERNAL_ERROR';

/** Pagination query params */
export interface IPaginationParams {
  page?: number;
  per_page?: number;
  sort?: string;
  order?: 'asc' | 'desc';
  search?: string;
}
