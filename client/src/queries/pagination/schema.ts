import { PAGINATION } from "@/config/constants";
import { isNotEmpty } from "@/lib";
import { z } from "zod";
import { FilterOperator, FilterOperatorEnum } from "../v1/types";
const isValueString = (val?: any) => {
  if (val == null) {
    return false;
  }
  return typeof val == "string";
};
const isObjectLengthExist = (obj: any) => {
  if (obj == null) {
    return false;
  }
  if (typeof obj != "object") {
    return false;
  }
  return Object.keys(obj).length > 0;
};
export const createFilterConditionSchema = z
  .object({
    // Adjust these properties based on your actual FilterCondition type
    column: z.string().trim().min(2).describe("The column to filter on"),
    operator: z
      .enum(FilterOperatorEnum)
      .describe(
        "The filter operator (eq, gt, lt, etc.)"
      ) as z.ZodType<FilterOperator>,
    value: z.any().describe("The filter value"),
  })
  .array()
  .nullable();

export const createSortConfigSchema = z
  .object({
    // Adjust these properties based on your actual SortConfig type
    nulls: z.enum(["first", "last"]).optional(),
    column: z.string().min(2).describe("The column to sort by"),
    direction: z.enum(["asc", "desc"]).describe("Sort direction"),
  })
  .array()
  .nullable();

export const searchObjectConfigSchema = z
  .object({
    // Based on error: SearchConfig<T> has 'columns' and 'term' properties
    term: z.string().min(1).describe("The search term"),
    mode: z.enum(["any", "all", "phrase"]).optional(),
    columns: z
      .array(z.string())
      .default(["name"])
      .describe("Columns to search in"),
  })
  .nullable();

export const filterSchema = z
  .union([z.string(), z.null(), createFilterConditionSchema])
  .transform((val) => {
    if (val == null || val == "null") return null;
    if (!isNotEmpty(val)) {
      return null;
    }
    if (typeof val == "string") {
      try {
        const parsed = JSON.parse(val);
        const result = createFilterConditionSchema.safeParse(parsed);
        return result.success ? result.data : null;

        return null;
      } catch {
        return val;
      }
    }
    const filteredData = val.filter((f) => {
      const column = f.column;
      const value = f.value;
      if (!isNotEmpty(column) || !isNotEmpty(value)) {
        return false;
      }
      return true;
    });
    return filteredData.length > 0 ? filteredData : null;
  })
  .catch(null)
  .optional()
  .nullable()
  .default(null);
export const searchSchema = z
  .union([z.string(), z.null(), searchObjectConfigSchema])
  .transform((val) => {
    if (val == null) return null;
    if (val == "null") return val;
    const isString = isValueString(val);
    const isObject = typeof val == "object";
    const isEmpty = !isNotEmpty(val);
    if (isEmpty) {
      return null;
    }
    if (isString) {
      try {
        const parsed = JSON.parse(val as string);
        const isObjectLengthExi = isObjectLengthExist(parsed);
        if (isObjectLengthExi) {
          const result = searchObjectConfigSchema.safeParse(parsed);
          if (result.success) {
            if (result.data) {
              return result.data?.term?.trim() ? result.data : null;
            }
            return val;
          }
        }
        return parsed != null ? JSON.stringify(parsed) : null;
      } catch {
        return val;
      }
    }
    if (isObject) {
      const term = val?.term;
      if (term == null || term.trim() == "") {
        return null;
      }
    }
    return val;
  })
  .catch(null)
  .default(null);

export const sortSchema = z
  .union([z.string(), z.null(), createSortConfigSchema])
  .transform((val) => {
    if (val == null || val == "null") return null;
    if (!isNotEmpty(val)) {
      return null;
    }
    if (typeof val == "string") {
      try {
        const parsed = JSON.parse(val);
        const result = createSortConfigSchema.safeParse(parsed);
        return result.success ? result.data : null;
      } catch {
        return val;
      }
    }
    const filteredData = val.filter((f) => {
      const column = f.column;
      if (!isNotEmpty(column)) {
        return false;
      }
      return true;
    });
    return filteredData.length > 0 ? filteredData : null;
  })
  .catch(null)
  .optional()
  .default(null);

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
  .union([
    z.string().transform((val) => parseInt(val, 10)),
    z.number().int(),
    z.null(),
  ])
  .pipe(
    z
      .number()
      .int()
      .positive()
      .min(PAGINATION.MIN_PAGE_SIZE)
      .max(PAGINATION.MAX_PAGE_SIZE)
      .nullable()
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
