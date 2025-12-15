// lib/server/parse-pagination-params.ts
import { PAGINATION } from "@/config/constants";
import { SearchParams } from "nuqs/server";
import "server-only";
import { createPaginationParams } from "../schema";

// Server-side compatible schemas (no client dependencies)

// Parse params from search params (Next.js)
export function parseServerPaginationParams<T extends Record<string, any>>(
  searchParams: SearchParams
) {
  const {
    filterConfigSchema,
    pageSchema,
    searchConfigSchema,
    sortConfigSchema,
    limitSchema,
    includeTotalSchema,
    cursorSchema,
    cursorDirectionSchema,
    paginationMode,
  } = createPaginationParams<T>();

  // const page =
  //   stringToNumber(searchParams.page as string) || PAGINATION.DEFAULT_PAGE;
  // const limit =
  //   stringToNumber(searchParams.limit as string) ||
  //   PAGINATION.DEFAULT_PAGE_SIZE;
  // const includeTotal = searchParams.includeTotal === "true";

  let filters;
  let sorts;
  let search;
  let page = PAGINATION.DEFAULT_PAGE;
  let limit: number | null = PAGINATION.DEFAULT_PAGE_SIZE;
  let includeTotal = false;
  let mode;

  /****Cursor based */
  let cursor;
  let cursorDirection;

  if (searchParams.mode) {
    const pageResult = paginationMode.safeParse(searchParams.mode);
    if (pageResult.success) mode = pageResult.data;
  }
  if (searchParams.cursorDirection) {
    const pageResult = cursorDirectionSchema.safeParse(
      searchParams.cursorDirection
    );
    if (pageResult.success) cursorDirection = pageResult.data;
  }
  if (searchParams.cursor) {
    const pageResult = cursorSchema.safeParse(searchParams.cursor);
    if (pageResult.success) cursor = pageResult.data;
    mode = mode || paginationMode.parse("cursor");
  }
  if (searchParams.page) {
    const pageResult = pageSchema.safeParse(searchParams.page);
    if (pageResult.success) page = pageResult.data;
    mode = mode || paginationMode.parse("offset");
  }

  if (searchParams.limit) {
    const result = limitSchema.safeParse(searchParams.limit);
    if (result.success) limit = result.data;
  }
  if (searchParams.includeTotal) {
    const result = includeTotalSchema.safeParse(searchParams.includeTotal);
    if (result.success) includeTotal = result.data;
  }
  try {
    if (searchParams.filters) {
      const result = filterConfigSchema.safeParse(searchParams.filters);
      if (result.success) filters = result.data;
    }

    if (searchParams.sorts) {
      const result = sortConfigSchema.safeParse(searchParams.sorts);
      if (result.success) sorts = result.data;
    }

    if (searchParams.search) {
      const result = searchConfigSchema.safeParse(searchParams.search);
      if (result.success) search = result.data;
    }
  } catch (error) {
    console.warn("Failed to parse pagination params:", error);
  }

  return {
    page,
    limit,
    filters,
    sorts,
    search,
    includeTotal,
    cursor,
    cursorDirection,
  };
}
