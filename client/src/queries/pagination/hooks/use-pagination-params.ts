import { PAGINATION } from "@/config/constants";
import {
  createParser,
  parseAsBoolean,
  parseAsFloat,
  parseAsJson,
  useQueryState,
} from "nuqs";
import z from "zod";
import {
  CursorPaginationConfig,
  FilterCondition,
  OffsetPaginationConfig,
  SearchConfig,
  SortConfig,
} from "../../v1";
import { createPaginationParams } from "../schema";

// Create a reusable parser for cursor values (string or number)
const cursorParser = createParser<string | number | null>({
  parse: (value: string | null): string | number | null => {
    if (value == null) return null;

    if (typeof value == "string" && value.trim() == "") return null;
    const trimmed = value.trim();
    const num = Number(trimmed);

    // Return number if it's a valid numeric string, otherwise string
    return !isNaN(num) && trimmed != "" ? num : trimmed;
  },
  serialize: (value: string | number | null): string => {
    return value == null ? "" : String(value);
  },
});

const cursorDirectionParser = createParser<"forward" | "backward" | null>({
  parse: (value: string | null): "forward" | "backward" | null => {
    if (value == null || value == "") return null;

    if (value === "forward" || value === "backward") {
      return value;
    }

    // Return null for invalid values
    return null;
  },
  serialize: (value: "forward" | "backward" | null): string => {
    return value == null ? "" : value;
  },
});

const uesPaginationParams = <T extends Record<string, any>>(
  paginationType: "offset" | "cursor" = "offset"
) => {
  const isCursor = paginationType == "cursor";
  /* ------------------------------
     SCHEMAS FOR THIS GENERIC INSTANCE
  ------------------------------ */
  const {
    filterConfigSchema,
    sortConfigSchema,
    searchConfigSchema,
    pageSchema,
    limitSchema,
    includeTotalSchema,
    cursorSchema,
  } = createPaginationParams<T>();

  /* ------------------------------
     PAGE (for offset pagination only)
  ------------------------------ */
  const [page, setPage] = useQueryState(
    "page",
    parseAsFloat
      .withOptions({
        history: "push",
        clearOnDefault: true,
      })
      .withDefault(pageSchema.parse(PAGINATION.DEFAULT_PAGE))
      // Only clear page if it's offset pagination
      .withOptions({ clearOnDefault: !isCursor })
  );

  /* ------------------------------
     CURSOR (for cursor pagination only)
  ------------------------------ */
  const [cursor, setCursor] = useQueryState(
    "cursor",
    cursorParser
      .withOptions({
        history: "push",
        clearOnDefault: true,
      })
      .withDefault("")
      // Only clear cursor if it's cursor pagination
      .withOptions({ clearOnDefault: isCursor })
  );

  /* ------------------------------
     CURSOR DIRECTION (for cursor pagination only)
  ------------------------------ */

  const [cursorDirection, setCursorDirection] = useQueryState(
    "cursorDirection",
    cursorDirectionParser
      .withOptions({
        history: "push",
        clearOnDefault: true,
      })
      .withDefault(null as any)
      .withOptions({ clearOnDefault: isCursor })
  );
  /* ------------------------------
     LIMIT (common for both)
  ------------------------------ */
  const [limit, setLimit] = useQueryState(
    "limit",
    parseAsFloat
      .withOptions({
        history: "push",
        clearOnDefault: true,
      })
      .withDefault(limitSchema.parse(PAGINATION.DEFAULT_PAGE_SIZE))
  );

  /* ------------------------------
     FILTERS (common for both)
  ------------------------------ */
  const [filters, setFilters] = useQueryState<FilterCondition<T>[] | null>(
    "filters",
    parseAsJson<FilterCondition<T>[] | null>((value) => {
      if (value === null || value === undefined) return null;

      const result = filterConfigSchema.safeParse(value);
      if (!result.success) {
        console.warn("Invalid filters in URL:", result.error.format());
        return null;
      }
      return result.data;
    })
      .withOptions({
        history: "push",
        clearOnDefault: true,
      })
      .withDefault(filterConfigSchema.parse(null) as any)
  );

  /* ------------------------------
     SORTS (common for both)
  ------------------------------ */
  const [sorts, setSorts] = useQueryState<SortConfig<T>[] | null>(
    "sorts",
    parseAsJson<SortConfig<T>[] | null>((value) => {
      if (value === null || value === undefined) return null;

      const result = sortConfigSchema.safeParse(value);
      if (!result.success) {
        console.warn("Invalid sorts in URL:", result.error.format());
        return null;
      }
      return result.data;
    })
      .withOptions({
        history: "push",
        clearOnDefault: true,
      })
      .withDefault(sortConfigSchema.parse(null) as any)
  );

  /* ------------------------------
     SEARCH (common for both)
  ------------------------------ */
  const [search, setSearch] = useQueryState<SearchConfig<T> | null>(
    "search",
    parseAsJson<SearchConfig<T> | null>((value) => {
      if (value === null || value === undefined) return null;

      const result = searchConfigSchema.safeParse(value);
      if (!result.success) {
        console.warn("Invalid search in URL:", result.error.format());
        return null;
      }
      return result.data;
    })
      .withOptions({
        history: "push",
        clearOnDefault: true,
      })
      .withDefault(searchConfigSchema.parse(null) as any)
  );

  /* ------------------------------
     INCLUDE TOTAL (common for both)
  ------------------------------ */
  const [includeTotal, setIncludeTotal] = useQueryState(
    "includeTotal",
    parseAsBoolean
      .withOptions({
        history: "push",
        clearOnDefault: true,
      })
      .withDefault(includeTotalSchema.parse(false))
  );

  /* ------------------------------
     CURSOR PARAMS OBJECT
  ------------------------------ */
  const cursorParams: CursorPaginationConfig<T> = {
    cursor: cursor as string | number | null,
    cursorDirection: cursorDirection as "forward" | "backward",
    limit: limit ?? PAGINATION.DEFAULT_PAGE_SIZE,
    filters,
    sorts,
    search,
    includeTotal,
    mode: "cursor",
  };

  /* ------------------------------
     OFFSET PARAMS OBJECT
  ------------------------------ */
  const offsetParams: OffsetPaginationConfig<T> = {
    page: page ?? PAGINATION.DEFAULT_PAGE,
    limit: limit ?? PAGINATION.DEFAULT_PAGE_SIZE,
    filters,
    sorts,
    search,
    includeTotal,
    mode: "offset",
  };

  /* ------------------------------
     SETTER FUNCTIONS
  ------------------------------ */
  const setCursorParams = (update: Partial<CursorPaginationConfig<T>>) => {
    if (update.cursor !== undefined) setCursor(update.cursor);
    if (update.cursorDirection !== undefined)
      setCursorDirection(update.cursorDirection);
    if (update.limit !== undefined) setLimit(update.limit);
    if (update.filters !== undefined) setFilters(update.filters);
    if (update.sorts !== undefined) setSorts(update.sorts);
    if (update.search !== undefined) setSearch(update.search);
    if (update.includeTotal !== undefined) setIncludeTotal(update.includeTotal);
  };

  const setOffsetParams = (update: Partial<OffsetPaginationConfig<T>>) => {
    if (update.page !== undefined) setPage(update.page);
    if (update.limit !== undefined) setLimit(update.limit);
    if (update.filters !== undefined) setFilters(update.filters);
    if (update.sorts !== undefined) setSorts(update.sorts);
    if (update.search !== undefined) setSearch(update.search);
    if (update.includeTotal !== undefined) setIncludeTotal(update.includeTotal);
  };

  /* ------------------------------
     RESET FUNCTIONS
  ------------------------------ */
  const resetCursorParams = () => {
    setCursor(null);
    setCursorDirection("forward");
    setLimit(PAGINATION.DEFAULT_PAGE_SIZE);
    setFilters(null);
    setSorts(null);
    setSearch(null);
    setIncludeTotal(false);
  };

  const resetOffsetParams = () => {
    setPage(PAGINATION.DEFAULT_PAGE);
    setLimit(PAGINATION.DEFAULT_PAGE_SIZE);
    setFilters(null);
    setSorts(null);
    setSearch(null);
    setIncludeTotal(false);
  };

  /* ------------------------------
     VALIDATION HELPER
  ------------------------------ */
  const validateParams = () => {
    const errors: {
      filters?: z.ZodError;
      sorts?: z.ZodError;
      search?: z.ZodError;
    } = {};

    if (filters !== null) {
      const result = filterConfigSchema.safeParse(filters);
      if (!result.success) errors.filters = result.error;
    }

    if (sorts !== null) {
      const result = sortConfigSchema.safeParse(sorts);
      if (!result.success) errors.sorts = result.error;
    }

    if (search !== null) {
      const result = searchConfigSchema.safeParse(search);
      if (!result.success) errors.search = result.error;
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors,
    };
  };

  /* ------------------------------
     RETURN BASED ON PAGINATION TYPE
  ------------------------------ */
  const common = {
    limit: limit ?? PAGINATION.DEFAULT_PAGE_SIZE,
    includeTotal,
    search,
    sorts,
    filters,
    setLimit,
    setIncludeTotal,
    setSearch,
    setSorts,
    setFilters,
    validateParams,
  };
  const cursorResp = {
    ...common,
    mode: "cursor" as const,
    cursor: cursor as string | number | null,
    cursorDirection: cursorDirection as "forward" | "backward",
    params: cursorParams,
    setCursor,
    setCursorDirection,
    setParams: setCursorParams,
    resetParams: resetCursorParams,
  };
  const offsetResp = {
    ...common,
    mode: "offset" as const,
    page: page,
    params: offsetParams,
    setPage,
    setParams: setOffsetParams,
    resetParams: resetOffsetParams,
  };
  return {
    ...common,
    cursorConfig: cursorResp,
    offsetConfig: offsetResp,
    mode: paginationType,
  };

  // if (isCursor) {
  //   return { ...cursorResp, offsetConfig: offsetResp };
  // } else return { ...offsetResp, cursorConfig: cursorResp };
};

export default uesPaginationParams;
// Offset-specific hook
export function useOffsetPagination<T extends Record<string, any>>() {
  const result = uesPaginationParams<T>("offset");

  // Type guard to ensure it's offset
  // if (result.mode != "offset") {
  //   throw new Error("Expected offset pagination");
  // }

  return result.offsetConfig;
}

// Cursor-specific hook
export function useCursorPagination<T extends Record<string, any>>() {
  const result = uesPaginationParams<T>("cursor");

  // if (result.mode != "cursor") {
  //   throw new Error("Expected cursor pagination");
  // }

  return result.cursorConfig;
}
