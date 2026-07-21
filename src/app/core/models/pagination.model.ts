export interface CursorPage<T> {
  items: T[];
  nextCursor?: string | null;
}

export interface OffsetQuery {
  limit?: number;
  offset?: number;
}

export interface PageQuery {
  page?: number;
  limit?: number;
}
