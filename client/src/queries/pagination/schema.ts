import { PAGINATION } from "@/config/constants";
import z from "zod";
import { FilterOperator, FilterOperatorEnum } from "../v1";

export const createFilterConditionSchema = <T extends Record<string, any>>() =>
  z
    .object({
      // Adjust these properties based on your actual FilterCondition type
      column: z.string().describe("The column to filter on") as z.ZodType<
        keyof T
      >,
      operator: z
        .enum(FilterOperatorEnum)
        .describe(
          "The filter operator (eq, gt, lt, etc.)"
        ) as z.ZodType<FilterOperator>,
      value: z.any().describe("The filter value"),
    })
    .array()
    .nullable();

export const createSortConfigSchema = <T extends Record<string, any>>() =>
  z
    .object({
      // Adjust these properties based on your actual SortConfig type
      nulls: z.enum(["first", "last"]).optional(),
      column: z.string().describe("The column to sort by") as z.ZodType<
        keyof T
      >,
      direction: z.enum(["asc", "desc"]).describe("Sort direction"),
    })
    .array()
    .nullable();

export const createSearchConfigSchema = <T extends Record<string, any>>() =>
  z
    .object({
      // Based on error: SearchConfig<T> has 'columns' and 'term' properties
      term: z.string().describe("The search term"),
      mode: z.enum(["any", "all", "phrase"]).optional(),
      columns: z
        .array(z.string())
        .describe("Columns to search in") as z.ZodType<(keyof T)[]>,
    })
    .nullable();
// Helper schemas for individual components
export const pageSchema = z
  .union([z.string().transform((val) => parseInt(val, 10)), z.number().int()])
  .pipe(z.number().int().positive().min(PAGINATION.MIN_PAGE))
  .catch(PAGINATION.DEFAULT_PAGE)
  .describe("The page number (1-indexed)")
  .default(PAGINATION.DEFAULT_PAGE);
export const cursorSchema = z
  .union([z.number().int().positive(), z.string().trim().min(1), z.null()])
  .transform((val) => {
    if (val == null) return null;

    // Convert numeric strings → number
    if (typeof val === "string") {
      const num = Number(val);
      if (!Number.isNaN(num)) return num;
      return val;
    }

    return val;
  })
  .catch(null)
  .default(null)
  .describe("The cursor for pagination");
export const cursorDirectionSchema = z
  .union([z.enum(["forward", "backward"]), z.string().trim().min(7), z.null()])
  .transform((val) => {
    if (val == null) return null;
    return ["forward", "backward"].includes(val) ? val : null;
  })
  .catch(null)
  .default(null)
  .describe("The cursor Direction for pagination");
export const paginationMode = z
  .union([z.enum(["cursor", "offset"]), z.string().trim().min(6), z.null()])
  .transform((val) => {
    if (val == null) return null;
    return ["cursor", "offset"].includes(val) ? val : null;
  })
  .catch(null)
  .default(null)
  .describe("The Pagination mode");

export const limitSchema = z
  .union([z.string().transform((val) => parseInt(val, 10)), z.number().int()])
  .pipe(
    z
      .number()
      .int()
      .positive()
      .min(PAGINATION.MIN_PAGE_SIZE)
      .max(PAGINATION.MAX_PAGE_SIZE)
  )
  .catch(PAGINATION.DEFAULT_PAGE_SIZE)

  .describe("The number of items per page")
  .default(PAGINATION.DEFAULT_PAGE_SIZE);
export const includeTotalSchema = z
  .union([
    z.boolean(),
    z.enum(["true", "false"]).transform((val) => val === "true"),
  ])
  .catch(false)
  .optional()
  .default(false);
export const createPaginationParams = <T extends Record<string, any>>() => {
  const pagesSchema = pageSchema;

  const pageSizeSchema = limitSchema;

  const includeTotalCountSchema = includeTotalSchema;

  const filterSchema = z
    .union([z.string(), z.null(), createFilterConditionSchema<T>()])
    .transform((val) => {
      if (val == null || val == "null") return null;
      if (typeof val == "string") {
        try {
          const parsed = JSON.parse(val);
          const result = createFilterConditionSchema<T>().safeParse(parsed);
          return result.success ? result.data : null;
        } catch {
          return null;
        }
      }
      return val;
    })
    .catch(null)
    .optional()
    .nullable()
    .default(null);
  const searchSchema = z
    .union([z.string(), z.null(), createSearchConfigSchema<T>()])
    .transform((val) => {
      if (val == null || val == "null") return null;
      if (typeof val == "string") {
        try {
          const parsed = JSON.parse(val);
          const result = createSearchConfigSchema<T>().safeParse(parsed);
          return result.success ? result.data : null;
        } catch {
          return null;
        }
      }
      return val;
    })
    .catch(null)
    .optional()
    .nullable()
    .default(null);
  const sortSchema = z
    .union([z.string(), z.null(), createSortConfigSchema<T>()])
    .transform((val) => {
      if (val == null || val == "null") return null;
      if (typeof val == "string") {
        try {
          const parsed = JSON.parse(val);
          const result = createSortConfigSchema<T>().safeParse(parsed);
          return result.success ? result.data : null;
        } catch {
          return null;
        }
      }
      return val;
    })
    .catch(null)
    .optional()
    .nullable()
    .default(null);

  return {
    pageSchema: pagesSchema,
    limitSchema: pageSizeSchema,
    sortConfigSchema: sortSchema,
    filterConfigSchema: filterSchema,
    searchConfigSchema: searchSchema,
    includeTotalSchema: includeTotalCountSchema,
    cursorSchema,
    cursorDirectionSchema,
    paginationMode,
  };
};
