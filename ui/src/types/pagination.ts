export interface PaginatedResponse<T> {
  items: T[];
  page: number;
  size: number;
  totalElements: number;
  filteredTotalElements?: number;
  totalPages: number;
}
