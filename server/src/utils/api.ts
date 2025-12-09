import { IPaginationMeta } from "@/types/api";

export function calculateTotalPages(total: number = 0, limit?: number): number {
  if (total > 0) {
    return limit != null && limit > 0 ? Math.ceil(total / limit) : 1;
  }
  return 0;
}
export function buildPaginationMetaCursor({
  items,
  limit,
  total,
  cursor,
  hasMore,
  columnName,
}: {
  items: any[];
  limit?: number;
  total: number;
  cursor: number | string;
  hasMore: boolean;
  columnName: string;
}): IPaginationMeta {
  return {
    hasMore,
    totalRecords: total,
    isLast: !hasMore,
    next:
      columnName && items?.length > 0 && hasMore
        ? (items[items.length - 1][`${columnName}`] as string)
        : undefined,
    limit,
    totalPages: calculateTotalPages(total, limit),
    isFirst: cursor == null,
    current: cursor,
  };
}
export function buildPaginationMetaForOffset({
  limit,
  total,
  page,
  hasMore,
}: {
  limit?: number;
  total: number;
  page?: number;
  hasMore: boolean;
}): IPaginationMeta {
  // Page starts from 1
  return {
    hasMore,
    totalRecords: total,
    isLast: !hasMore,

    limit,
    totalPages: calculateTotalPages(total, limit),
    isFirst: page === 1,
    current: page,
    next: hasMore && page != null ? page + 1 : undefined,
    previous: page != null && page > 1 ? page - 1 : undefined,
  };
}
