import {
  CursorPaginationConfig,
  cursorPaginationConfigSchema,
  FilterCondition,
  IPaginationType,
  OffsetPaginationConfig,
  offsetPaginationConfigSchema,
  PaginationsConfig,
  SearchConfig,
  SortConfig,
  SortDirection,
} from "./pagination/types";
// services/base.service.ts
import { HTTPSTATUS } from "@/config/http.config";
import {
  BadRequestException,
  InternalServerException,
  ValidationException,
} from "@/utils/catch-errors";

import { db } from "@/db";
import { formatZodError, getSingularPlural, stringToNumber } from "@/utils";
import {
  buildPaginationMetaForOffset,
  buildSimplePaginationMetaCursor,
} from "@/utils/api";
import { AnyColumn, asc, desc, getTableColumns, SQL, sql } from "drizzle-orm";
import { AnyPgTable, getTableConfig, IndexColumn } from "drizzle-orm/pg-core";
import { paginateCursor, paginateOffset } from "./pagination";
export type Table = AnyPgTable;
export type IPaginatedParams =
  | {
      cursor?: number | string | null;
      limit?: number | string | null;
      mode?: "cursor";
      sort?: SortDirection;
    }
  | {
      page?: number | string | null;
      limit?: number | string | null;
      mode?: "offset";
      sort?: SortDirection;
    };

type PaginationOffsetOptions<TTable extends AnyPgTable> = {
  limit?: number | string | null;
  page?: number | string | null;
  where?: (t: TTable) => SQL<unknown> | undefined;
  sort?: SortDirection;
  cursorColumn?: (tableCols: TTable) => AnyColumn;
  search?: string;
  includeTotal?: boolean;
};
type PaginationCursortOptions<TCursorValue, TTable extends AnyPgTable> = {
  limit?: number | null | string;
  cursor?: TCursorValue;
  cursorColumn: (tableCols: TTable) => AnyColumn;
  direction?: "next" | "prev";
  sort?: SortDirection;
  where?: (t: TTable) => SQL<unknown> | undefined;
  search?: string;
  includeTotal?: boolean;
};

// Update the queryTable function to be more specific about the return type

export class BaseService<
  TTable extends AnyPgTable,
  TInsert extends Record<string, any>,
  TSelect,
  TUpdate = Partial<TInsert> // Add update type
> {
  // ⭐ This is the type helper
  public readonly _types!: {
    PaginatedParams: IPaginatedParams & {
      cursorColumn?: (t: TTable) => AnyColumn;
      where?: (t: TTable) => SQL<unknown> | undefined;
    };
    OffsetPaginationConfig: OffsetPaginationConfig<TTable>;
    CursorPaginationConfig: CursorPaginationConfig<TTable>;
    PaginationsConfig: PaginationsConfig<TTable>;
  };
  public readonly columns = getTableColumns(this.table);
  public _singular!: string;
  public _plural!: string;

  public set singular(name: string) {
    this._singular = name;
  }
  public get singular() {
    return this._singular;
  }
  public set plural(name: string) {
    this._plural = name;
  }
  public get plural() {
    return this._plural;
  }
  queryName: keyof typeof db.query;
  constructor(public table: TTable) {
    if (!table) {
      throw new Error(`Provide a table`);
    }
    const config = getTableConfig(table);
    const names = getSingularPlural(config.name);
    this.singular = names.singular;
    this.plural = names.plural;
    this.queryName = config.name as keyof typeof db.query;
  }
  queryTable<K extends keyof typeof db.query>(
    dbb: typeof db,
    key: K
  ): {
    findFirst: (params: {
      where: SQL<unknown> | undefined;
    }) => Promise<TTable["$inferSelect"]>;
    findMany: (params?: {
      where?: SQL<unknown> | undefined;
    }) => Promise<TTable["$inferSelect"][]>;
  } {
    return dbb.query[key] as any; // We need to cast here because of Drizzle's complex types
  }
  async create(value: TInsert) {
    try {
      const [record] = await db.insert(this.table).values(value).returning();
      if (!record) {
        return {
          error: new BadRequestException(`${this.singular} not created`),
          data: null,
          status: HTTPSTATUS.BAD_REQUEST,
        };
      }
      return {
        data: record as TSelect,
        status: HTTPSTATUS.CREATED,
      };
    } catch (error) {
      return {
        data: null,
        error: new InternalServerException(),
      };
    }
  }

  async createMany(values: TInsert[]) {
    try {
      const records = await db.insert(this.table).values(values).returning();
      if (records.length == 0) {
        return {
          error: new BadRequestException(`${this.plural} not created`),
          data: null,
          status: HTTPSTATUS.BAD_REQUEST,
        };
      }
      return {
        data: records,
        status: HTTPSTATUS.CREATED,
      };
    } catch (error) {
      return {
        data: null,
        error: new InternalServerException(),
      };
    }
  }

  async findOne(where: (table: TTable) => SQL<unknown> | undefined) {
    try {
      const record = await this.queryTable(db, this.queryName).findFirst({
        where: where(this.table),
      });

      return {
        data: record,
        status: HTTPSTATUS.OK,
      };
    } catch (error) {
      return {
        data: null,
        error: new InternalServerException(),
      };
    }
  }

  async findMany(where?: (table: TTable) => SQL<unknown> | undefined) {
    try {
      const records = await this.queryTable(db, this.queryName).findMany({
        where: where?.(this.table),
      });
      return {
        data: records,
        status: HTTPSTATUS.OK,
      };
    } catch (error) {
      return {
        data: null,
        error: new InternalServerException(),
      };
    }
  }

  async update<T = TUpdate>(
    where: (table: TTable) => SQL<unknown> | undefined,
    values: T
  ) {
    try {
      const result = await db
        .update(this.table)
        .set(values)
        .where(where(this.table))
        .returning();
      if (result.length == 0) {
        return {
          error: new BadRequestException(`${this.singular} not updated`),
          data: null,
          status: HTTPSTATUS.BAD_REQUEST,
        };
      }
      return {
        data: result,
        status: HTTPSTATUS.OK,
      };
    } catch (error) {
      return {
        data: null,
        error: new InternalServerException(),
      };
    }
  }

  async delete(where: (table: TTable) => SQL<unknown> | undefined) {
    try {
      const result = await db
        .delete(this.table)
        .where(where(this.table))
        .returning();
      // if (result.length == 0) {
      //   return {
      //     error: new BadRequestException(`${this.singular} not deleted`),
      //     data: null,
      //     status: HTTPSTATUS.BAD_REQUEST,
      //   };
      // }
      return {
        data: result,
        status: HTTPSTATUS.OK,
      };
    } catch (error) {
      return {
        data: null,
        error: new InternalServerException(),
      };
    }
  }

  /**
   * Upsert: insert or update if conflict
   * Example: pass conflictTarget = ['user_id'], updateValues = { updated_at: new Date() }
   */
  async upsert(
    values: TInsert[],
    conflictTarget: IndexColumn | IndexColumn[],
    updateValues: Partial<TInsert>
  ) {
    try {
      const records = await db
        .insert(this.table)
        .values(values)
        .onConflictDoUpdate({
          target: conflictTarget,
          set: updateValues,
        })
        .returning();
      if (records.length == 0) {
        return {
          error: new BadRequestException("Operation failed"),
          data: null,
          status: HTTPSTATUS.BAD_REQUEST,
        };
      }
      return {
        data: records,
        status: HTTPSTATUS.OK,
      };
    } catch (error) {
      return {
        data: null,
        error: new InternalServerException(),
      };
    }
  }

  /**
   * Soft delete by setting deleted_at timestamp
   * Requires `deleted_at` column in your schema
   */
  async softDelete(
    where: (tableCols: TTable) => SQL<unknown>,
    set: Partial<TTable["$inferInsert"]>
  ) {
    try {
      const records = await db
        .update(this.table)
        .set(set)
        .where(where(this.table))
        .returning();
      if (records.length == 0) {
        return {
          error: new BadRequestException(`${this.singular} not deleted`),
          data: null,
          status: HTTPSTATUS.BAD_REQUEST,
        };
      }
      return {
        data: records,
        status: HTTPSTATUS.OK,
      };
    } catch (error) {
      return {
        data: null,
        error: new InternalServerException(),
      };
    }
  }

  /**
   * Handles offset-based pagination.
   */
  async paginateOffset(options: PaginationOffsetOptions<TTable>) {
    const {
      limit,
      where,
      page,
      cursorColumn = (table: any) => table.id as AnyColumn,
      sort = "asc",
      includeTotal,
    } = options;
    // Page starts from 1
    // Convert values
    const limitNum = limit != null ? stringToNumber(limit) : undefined;
    const pageNum = page != null ? stringToNumber(page) : undefined;
    const offset =
      limitNum != undefined && pageNum != undefined
        ? pageNum == 0
          ? 0
          : (pageNum - 1) * limitNum
        : undefined;
    // Validation
    if (
      limitNum != undefined &&
      (!Number.isFinite(limitNum) || limitNum <= 0)
    ) {
      return {
        data: null,
        error: new BadRequestException("Limit must be greater than zero"),
      };
    }

    const cursorCol = cursorColumn(this.table);
    try {
      const limitPlusOne = limitNum != undefined ? limitNum + 1 : undefined;

      // const offset = page * limit;

      const query = db
        .select()
        .from(this.table as AnyPgTable)
        .where(where?.(this.table) ?? sql`true`)
        .orderBy(sort === "asc" ? asc(cursorCol) : desc(cursorCol));
      // .limit(limitPlusOne)
      // .offset(offset);
      if (limitPlusOne) {
        query.limit(limitPlusOne);
      }
      if (offset) {
        query.offset(offset);
      }
      const result = await query;

      let total = result.length;
      if (includeTotal) {
        total = await db.$count(this.table, where?.(this.table) || sql`true`);
      }
      const items = limitNum
        ? (result.slice(0, limitNum) as TSelect[])
        : result;
      const hasMore = limitNum ? result.length > limitNum : false;

      return {
        data: items as TSelect[],
        pagination_meta: buildPaginationMetaForOffset({
          limit: limitNum,
          total,
          page: pageNum,
          hasMore,
        }),
        status: HTTPSTATUS.OK,
      };
    } catch (err) {
      console.error("Offset pagination error:", err);
      return {
        data: null,
        error: new InternalServerException(),
      };
    }
  }

  /**
   * Handles cursor-based pagination.
   */
  async paginateCursor<TCursorValue = unknown>(
    options: PaginationCursortOptions<TCursorValue, TTable>
  ) {
    const {
      limit,
      cursor,
      cursorColumn = (table: any) => table.id as AnyColumn,
      direction = "next",
      sort = "asc",
      where,
      includeTotal,
    } = options;
    const limitNum = limit != null ? stringToNumber(limit) : undefined;

    if (limitNum != null && (!Number.isFinite(limitNum) || limitNum <= 0)) {
      return {
        data: null,
        error: new BadRequestException("Limit must be greater than zero"),
      };
    }
    const cursorCol = cursorColumn(this.table);
    const isAsc = sort === "asc";
    const limitPlusOne = limitNum != null ? limitNum + 1 : undefined;
    try {
      const comparator = cursor
        ? direction === "next"
          ? isAsc
            ? sql`${cursorCol} > ${sql.param(cursor)}`
            : sql`${cursorCol} < ${sql.param(cursor)}`
          : isAsc
          ? sql`${cursorCol} < ${sql.param(cursor)}`
          : sql`${cursorCol} > ${sql.param(cursor)}`
        : undefined;

      const whereCondition =
        where && comparator
          ? sql`${comparator} AND ${where(this.table)}`
          : comparator || where?.(this.table);

      const query = db
        .select()
        .from(this.table as AnyPgTable)
        .where(whereCondition ?? sql`true`)
        .orderBy(sort === "asc" ? asc(cursorCol) : desc(cursorCol));

      if (limitPlusOne != null) {
        query.limit(limitPlusOne);
      }
      const result = await query;
      let total = result.length;
      if (includeTotal) {
        total = await db.$count(this.table, where?.(this.table) || sql`true`);
      }
      const items = limitNum
        ? (result.slice(0, limitNum) as TSelect[])
        : result;
      const hasMore = limitNum ? result.length > limitNum : false;
      return {
        data: items as TSelect[],
        pagination_meta: {
          ...buildSimplePaginationMetaCursor({
            items,
            limit: limitNum,
            total,
            cursor: cursor as string,
            hasMore,
            columnName: cursorCol?.name,
          }),
          direction,
        },
        status: HTTPSTATUS.OK,
      };
    } catch (error) {
      return {
        data: null,
        error: new InternalServerException(),
      };
    }
  }

  async paginationOffsetRecords(props: OffsetPaginationConfig<TTable>) {
    const parseResult = this.validateOffsetPagination(props);
    if (parseResult.error) {
      return parseResult;
    }
    const result = await paginateOffset(db, this.table, parseResult.data);
    return result;
  }
  async paginationCursorRecords(props: CursorPaginationConfig<TTable>) {
    const parseResult = this.validateCursorPagination(props);
    if (parseResult.error) {
      return parseResult;
    }
    const result = await paginateCursor(db, this.table, parseResult.data);

    return result;
  }
  validateQuery(
    p: typeof this._types.PaginationsConfig,
    defaults: {
      search: keyof TTable["$inferSelect"];
      sort: keyof TTable["$inferSelect"];
      filters?: (table: TTable) => FilterCondition<TTable>[];
    }
  ) {
    const { search, limit, filters, sorts, includeTotal, mode } = p;
    let toalInclude = false;
    if (includeTotal) {
      toalInclude =
        typeof includeTotal == "string" ? includeTotal == "true" : includeTotal;
    }
    if (mode == "offset") {
      const { page } = p;

      return {
        page: stringToNumber(page) || 1,
        limit: stringToNumber(limit),
        filters: this.preValidateFilterColumns(
          filters,
          defaults?.filters?.(this.table)
        ),
        search: this.preValidateSearchColumns(search, defaults.search),
        sorts: this.preValidateSortColumns(sorts, defaults.sort),
        includeTotal: toalInclude,
        mode: "offset" as IPaginationType,
      } as typeof this._types.PaginationsConfig;
    }

    const { cursorColumn, cursor } = p;

    return {
      cursor: (cursor as string) || null,
      limit: stringToNumber(limit),
      cursorColumn: (cursorColumn || "id") as keyof TTable["$inferSelect"],
      filters: this.preValidateFilterColumns(
        filters,
        defaults.filters?.(this.table)
      ),
      search: this.preValidateSearchColumns(search, defaults.search),
      sorts: this.preValidateSortColumns(sorts, defaults.sort),
      includeTotal: toalInclude,
      mode: "cursor" as IPaginationType,
    } as typeof this._types.PaginationsConfig;
  }

  validateCursorPagination(props: CursorPaginationConfig<TTable>) {
    if (props.includeTotal) {
      props.includeTotal =
        typeof props.includeTotal == "string"
          ? props.includeTotal == "true"
          : props.includeTotal;
    }
    const config = cursorPaginationConfigSchema.safeParse({
      cursor: (props.cursor as string) || null,
      limit: stringToNumber(props.limit),
      cursorColumn: (props.cursorColumn ||
        "id") as keyof TTable["$inferSelect"],
      cursorDirection: (props.cursorDirection as string) || "forward",
      filters: this.validateFilterColumns(
        this.parseIfExistAndString(props.filters)
      ),
      search: this.validateSearchColumns(props.search),
      sorts: this.validateSortColumns(props.sorts),
      includeTotal: props.includeTotal,
    });
    if (!config.success) {
      return {
        error: new ValidationException(
          "Pagination Invalid params",
          formatZodError(config.error)
        ),
        data: null,
      };
    }
    return {
      data: { ...config.data, mode: "cursor" as IPaginationType },
      error: null,
    };
  }
  validateOffsetPagination(params: OffsetPaginationConfig<TTable>) {
    if (params.includeTotal) {
      params.includeTotal =
        typeof params.includeTotal == "string"
          ? params.includeTotal == "true"
          : params.includeTotal;
    }
    const config = offsetPaginationConfigSchema.safeParse({
      page: stringToNumber(params.page) || 1,
      limit: stringToNumber(params.limit),
      filters: this.validateFilterColumns(params.filters),
      search: this.validateSearchColumns(params.search),
      sorts: this.validateSortColumns(params.sorts),
      includeTotal: params.includeTotal,
    });
    if (!config.success) {
      return {
        error: new ValidationException(
          "Pagination Invalid params",
          formatZodError(config.error)
        ),
        data: null,
      };
    }
    return {
      data: { ...config.data, mode: "offset" as IPaginationType },
      error: null,
    };
  }
  validateFilterColumns(
    filters: FilterCondition<TTable>[] | string | undefined
  ) {
    const s = filters;
    let parsedResult = this.parseIfExistAndString(
      s
    ) as FilterCondition<TTable>[];
    if (parsedResult == null) {
      return undefined;
    }
    if (typeof parsedResult == "string") {
      return undefined;
    }
    if (!parsedResult.length) {
      return undefined;
    }
    const tableColumns = Object.keys(this.columns);

    return parsedResult?.filter((col) =>
      tableColumns.includes(col.column as string)
    );
  }
  validateSortColumns(sort: SortConfig<TTable>[] | string | undefined) {
    const s = sort;
    let parsedResult = this.parseIfExistAndString(s) as SortConfig<TTable>[];
    if (parsedResult == null) {
      return undefined;
    }
    if (typeof parsedResult == "string") {
      return undefined;
    }
    if (!parsedResult.length) {
      return undefined;
    }
    const tableColumns = Object.keys(this.columns);

    return parsedResult?.filter((col) =>
      tableColumns.includes(col.column as string)
    );
  }
  validateSearchColumns(search: SearchConfig<TTable> | string | undefined) {
    const s = search;
    let parsedResult = this.parseIfExistAndString(s);
    if (parsedResult == null) {
      return undefined;
    }
    if (typeof parsedResult == "string") {
      return undefined;
    }
    console.log(
      parsedResult,
      (parsedResult?.term || "")?.trim(),
      "validateSearchColumns"
    );
    if ((parsedResult?.term || "")?.trim() == "") {
      return undefined;
    }
    if (!parsedResult?.columns?.length) {
      return undefined;
    }
    const tableColumns = Object.keys(this.columns);
    const result = {
      ...parsedResult,
      columns: parsedResult?.columns?.filter((col) =>
        tableColumns.includes(col)
      ),
    };

    return result;
  }
  preValidateFilterColumns(
    filters: FilterCondition<TTable>[] | string | undefined,
    defaultfilters: FilterCondition<TTable>[] | undefined = []
  ) {
    const s = filters;
    let parsedResult = this.parseIfExistAndString(
      s
    ) as FilterCondition<TTable>[];
    if (parsedResult == null) {
      if (defaultfilters.length > 0) {
        return defaultfilters;
      }
      return undefined;
    }
    if (typeof parsedResult == "string") {
      if (defaultfilters.length > 0) {
        return defaultfilters;
      }
      return undefined;
    }
    if (!parsedResult.length) {
      if (defaultfilters.length > 0) {
        return defaultfilters;
      }
      return undefined;
    }
    const tableColumns = Object.keys(getTableColumns(this.table));
    const newResultedArray =
      defaultfilters.length > 0
        ? [...defaultfilters, ...parsedResult]
        : parsedResult;
    return newResultedArray?.filter((col) =>
      tableColumns.includes(col.column as string)
    );
  }
  preValidateSortColumns(
    sort: SortConfig<TTable>[] | string | undefined,
    defaultColumn: keyof TTable["$inferSelect"] = "created_at"
  ) {
    const s = sort;
    let parsedResult = this.parseIfExistAndString(s) as SortConfig<TTable>[];
    if (parsedResult == null) {
      return undefined;
    }
    if (typeof parsedResult == "string") {
      if (["asc", "desc"].includes(parsedResult)) {
        return [
          {
            column: defaultColumn ? defaultColumn : undefined,
            direction: parsedResult,
          },
        ] as SortConfig<TTable>[];
      }
      return undefined;
    }
    if (!parsedResult.length) {
      return undefined;
    }
    const tableColumns = Object.keys(this.columns);

    return parsedResult?.filter((col) =>
      tableColumns.includes(col.column as string)
    );
  }
  preValidateSearchColumns(
    search: SearchConfig<TTable> | string | undefined,
    defaultColumn: keyof TTable["$inferSelect"]
  ) {
    const s = search;
    let parsedResult = this.parseIfExistAndString(s);
    if (parsedResult == null) {
      return undefined;
    }
    if (typeof parsedResult == "string") {
      return {
        columns: defaultColumn ? [defaultColumn] : [],
        term: parsedResult,
      } as SearchConfig<TTable>;
    }
    if ((parsedResult?.term || "")?.trim() == "") {
      return undefined;
    }
    if (!parsedResult?.columns?.length) {
      parsedResult.columns.push(defaultColumn);
    }
    const tableColumns = Object.keys(this.columns);

    return {
      ...parsedResult,
      columns: parsedResult?.columns?.filter((col) =>
        tableColumns.includes(col)
      ),
    };
  }
  parseIfExistAndString(value: any) {
    if (value == null) {
      return undefined;
    }
    if (typeof value == "object") {
      return value;
    }
    if (typeof value == "string" && value.trim() == "") {
      return undefined;
    }
    try {
      return JSON.parse(value);
    } catch (error) {
      return value;
    }
  }
  /*******************************************************Advanced pagination ****************************************************** */
}
