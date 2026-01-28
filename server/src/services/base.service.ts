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
import * as schema from "@/db/schema";
import { formatZodError, getSingularPlural, stringToNumber } from "@/utils";
import {
  buildPaginationMetaForOffset,
  buildSimplePaginationMetaCursor,
} from "@/utils/api";
import {
  AnyColumn,
  asc,
  desc,
  ExtractTablesWithRelations,
  getTableColumns,
  InferInsertModel,
  InferSelectModel,
  SQL,
  sql,
} from "drizzle-orm";
import {
  AnyPgTable,
  getTableConfig,
  IndexColumn,
  PgTable,
  PgTransaction,
} from "drizzle-orm/pg-core";
import { PostgresJsQueryResultHKT } from "drizzle-orm/postgres-js";
import { paginateCursor, paginateOffset } from "./pagination";
export type DB = typeof db;
export type DBQuery = keyof (typeof db)["query"];
export type ITransaction = PgTransaction<
  PostgresJsQueryResultHKT,
  typeof schema,
  ExtractTablesWithRelations<typeof schema>
>;

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
type ColumnKey<T> = Extract<keyof T, string>;
/**
 * Build a proxy object where each property access returns its **key name as a string literal**
 */
type KeyProxy<T> = {
  [K in ColumnKey<T>]: K;
};
type ColumnSelector<T> = (fields: KeyProxy<T>) => ColumnKey<T>;
export class BaseService<
  TTable extends AnyPgTable,
  TInsert extends InferInsertModel<TTable> = InferInsertModel<TTable>,
  TSelect extends InferSelectModel<TTable> = InferSelectModel<TTable>,
  TUpdate extends Partial<TInsert> = Partial<TInsert>,
> {
  // export class BaseService<
  //   TTable extends AnyPgTable,
  //   TInsert extends Record<string, any>,
  //   TSelect,
  //   TUpdate = Partial<TInsert> // Add update type
  // > {
  public readonly columns = getTableColumns(this.table);
  // ⭐ This is the type helper
  public readonly _types!: {
    PaginatedParams: IPaginatedParams & {
      cursorColumn?: (t: TTable) => AnyColumn;
      where?: (t: TTable) => SQL<unknown> | undefined;
    };
    OffsetPaginationConfig: OffsetPaginationConfig<TSelect>;
    CursorPaginationConfig: CursorPaginationConfig<TSelect>;
    PaginationsConfig: PaginationsConfig<TSelect>;
    coloumn: ColumnKey<TSelect> | ColumnSelector<TSelect>;
  };

  public transaction = db.transaction;
  public _singular!: string;
  public _plural!: string;

  constructor(public table: TTable) {
    if (!table) {
      throw new Error(`Provide a table`);
    }
    const config = getTableConfig(table);
    const names = getSingularPlural(config.name);
    this.singular = names.singular;
    this.plural = names.plural;
    this.queryName = config.name as DBQuery;
  }
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
  queryName: DBQuery;
  queryTable<K extends DBQuery>(
    dbb: DB,
    key: K,
  ): {
    findFirst: (params: {
      where: SQL<unknown> | undefined;
    }) => Promise<TSelect>;
    findMany: (params?: {
      where?: SQL<unknown> | undefined;
    }) => Promise<TSelect[]>;
  } {
    return dbb.query[key] as any; // We need to cast here because of Drizzle's complex types
  }

  getColumnObject() {
    const keys = Object.keys(this.columns) as Array<ColumnKey<TTable>>;
    const obj = {} as Record<ColumnKey<TTable>, ColumnKey<TTable>>;
    keys.forEach((key) => {
      obj[key] = key;
    });
    return obj as KeyProxy<TSelect>;
  }
  getTableColumn(field: ColumnKey<TSelect> | ColumnSelector<TSelect>) {
    const col =
      typeof field == "string" ? field : field(this.getColumnObject());
    return this.columns[col];
  }

  async withTransaction<T>(fn: (tx: ITransaction) => Promise<T>): Promise<T> {
    return db.transaction(async (tx) => {
      return fn(tx);
    });
  }
  async create(value: TInsert, tsx?: ITransaction) {
    try {
      const [record] = await (tsx ? tsx : db)
        .insert(this.table)
        .values(value)
        .returning();

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

  async createMany(values: TInsert[], tsx?: ITransaction) {
    try {
      const records = await (tsx ? tsx : db)
        .insert(this.table)
        .values(values)
        .returning();
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
      console.log(error, "createMany error");
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
  findOneQuery(where: (table: TTable) => SQL<unknown> | undefined) {
    return db
      .select()
      .from(this.table as PgTable)
      .where(where(this.table));
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
    values: T,
    tsx?: ITransaction,
  ) {
    try {
      const result = await (tsx ? tsx : db)
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

  async delete(
    where: (table: TTable) => SQL<unknown> | undefined,
    tsx?: ITransaction,
  ) {
    try {
      const result = await (tsx ? tsx : db)
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
    updateValues: Partial<TInsert>,
    tsx?: ITransaction,
  ) {
    try {
      const records = await (tsx ? tsx : db)
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
    set: Partial<TTable["$inferInsert"]>,
    tsx?: ITransaction,
  ) {
    try {
      const records = await (tsx ? tsx : db)
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
    options: PaginationCursortOptions<TCursorValue, TTable>,
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

  // async paginationOffsetRecords<TEntity = TSelect>(props: OffsetPaginationConfig<TTable>) {
  async paginationOffsetRecords(props: OffsetPaginationConfig<TSelect>) {
    const parseResult = this.validateOffsetPagination(props);
    if (parseResult.error) {
      return parseResult;
    }
    const result = await paginateOffset(db, this.table, parseResult.data);
    return result;
  }
  async paginationCursorRecords(props: CursorPaginationConfig<TSelect>) {
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
      search?: keyof TSelect;
      sort?: {
        column: keyof TSelect;
        direction?: "asc" | "desc";
      };
      filters?: (table: TTable) => FilterCondition<TSelect>[];
    } = { sort: { column: "updated_at", direction: "desc" } },
  ) {
    const { search, limit, filters, sorts, includeTotal, mode } = p;
    let toalInclude = false;
    if (includeTotal) {
      toalInclude =
        typeof includeTotal == "string" ? includeTotal == "true" : includeTotal;
    }
    const defaultSort = defaults.sort || {
      column: "updated_at",
      direction: "desc",
    };
    const limitnum = stringToNumber(limit);
    const limitNum = limitnum && limitnum > 0 ? limitnum : null;
    if (mode == "offset") {
      const { page } = p;

      return {
        page: stringToNumber(page) || 1,
        limit: limitNum,
        filters: this.preValidateFilterColumns(
          filters,
          defaults?.filters?.(this.table),
        ),
        search: this.preValidateSearchColumns(search, defaults.search),
        sorts: this.preValidateSortColumns(sorts, defaultSort),
        includeTotal: toalInclude,
        mode: "offset" as IPaginationType,
      } as typeof this._types.PaginationsConfig;
    }

    const { cursorColumn, cursor } = p;

    return {
      cursor: (cursor as string) || null,
      limit: limitNum,
      cursorColumn: (cursorColumn || "id") as keyof TSelect,
      filters: this.preValidateFilterColumns(
        filters,
        defaults.filters?.(this.table),
      ),
      search: this.preValidateSearchColumns(search, defaults.search),
      sorts: this.preValidateSortColumns(sorts, defaults.sort),
      includeTotal: toalInclude,
      mode: "cursor" as IPaginationType,
    } as typeof this._types.PaginationsConfig;
  }

  validateCursorPagination(props: CursorPaginationConfig<TSelect>) {
    if (props.includeTotal) {
      props.includeTotal =
        typeof props.includeTotal == "string"
          ? props.includeTotal == "true"
          : props.includeTotal;
    }
    const limitnum = stringToNumber(props.limit);
    const limit = limitnum && limitnum > 0 ? limitnum : null;
    const config = cursorPaginationConfigSchema.safeParse({
      cursor: (props.cursor as string) || null,
      limit,
      cursorColumn: (props.cursorColumn || "id") as keyof TSelect,
      cursorDirection: (props.cursorDirection as string) || "forward",
      filters: this.validateFilterColumns(
        this.parseIfExistAndString(props.filters),
      ),
      search: this.validateSearchColumns(props.search),
      sorts: this.validateSortColumns(props.sorts),
      includeTotal: props.includeTotal,
    });
    if (!config.success) {
      return {
        error: new ValidationException(
          "Pagination Invalid params",
          formatZodError(config.error),
        ),
        data: null,
      };
    }
    return {
      data: { ...config.data, mode: "cursor" as IPaginationType },
      error: null,
    };
  }
  validateOffsetPagination(params: OffsetPaginationConfig<TSelect>) {
    if (params.includeTotal) {
      params.includeTotal =
        typeof params.includeTotal == "string"
          ? params.includeTotal == "true"
          : params.includeTotal;
    }
    const limitnum = stringToNumber(params.limit);
    const limit = limitnum && limitnum > 0 ? limitnum : null;
    const config = offsetPaginationConfigSchema.safeParse({
      page: stringToNumber(params.page) || 1,
      limit,
      filters: this.validateFilterColumns(params.filters),
      search: this.validateSearchColumns(params.search),
      sorts: this.validateSortColumns(params.sorts),
      includeTotal: params.includeTotal,
    });
    if (!config.success) {
      return {
        error: new ValidationException(
          "Pagination Invalid params",
          formatZodError(config.error),
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
    filters: FilterCondition<TSelect>[] | string | undefined,
  ) {
    const s = filters;
    let parsedResult = this.parseIfExistAndString(
      s,
    ) as FilterCondition<TSelect>[];
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
      tableColumns.includes(col.column as string),
    );
  }
  validateSortColumns(sort: SortConfig<TSelect>[] | string | undefined) {
    const s = sort;
    let parsedResult = this.parseIfExistAndString(s) as SortConfig<TSelect>[];
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
      tableColumns.includes(col.column as string),
    );
  }
  validateSearchColumns(search: SearchConfig<TSelect> | string | undefined) {
    const s = search;
    let parsedResult = this.parseIfExistAndString(s);
    if (parsedResult == null) {
      return undefined;
    }
    if (typeof parsedResult == "string") {
      return undefined;
    }
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
        tableColumns.includes(col),
      ),
    };

    return result;
  }
  preValidateFilterColumns(
    filters: FilterCondition<TSelect>[] | string | undefined,
    defaultfilters: FilterCondition<TSelect>[] | undefined = [],
  ) {
    const s = filters;
    let parsedResult = this.parseIfExistAndString(
      s,
    ) as FilterCondition<TSelect>[];
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
      tableColumns.includes(col.column as string),
    );
  }
  preValidateSortColumns(
    sort: SortConfig<TSelect>[] | string | undefined,
    defaultColumn?: {
      column: keyof TSelect;
      direction?: "asc" | "desc";
    },
  ) {
    const s = sort;
    let parsedResult = this.parseIfExistAndString(s) as SortConfig<TSelect>[];
    if (parsedResult == null) {
      if (defaultColumn?.column) {
        return [
          {
            column: defaultColumn.column ? defaultColumn.column : undefined,
            direction: defaultColumn.direction || "desc",
          },
        ] as SortConfig<TSelect>[];
      }
      return undefined;
    }
    if (typeof parsedResult == "string") {
      if (["asc", "desc"].includes(parsedResult)) {
        return [
          {
            column: defaultColumn?.column ? defaultColumn.column : undefined,
            direction: parsedResult,
          },
        ] as SortConfig<TSelect>[];
      }

      return undefined;
    }
    if (!parsedResult.length) {
      return undefined;
    }
    const tableColumns = Object.keys(this.columns);

    return parsedResult?.filter((col) =>
      tableColumns.includes(col.column as string),
    );
  }
  preValidateSearchColumns(
    search: SearchConfig<TSelect> | string | undefined,
    defaultColumn?: keyof TSelect,
  ) {
    const s = search;
    let parsedResult = this.parseIfExistAndString(s);
    if (parsedResult == null) {
      return undefined;
    }
    if (typeof parsedResult == "string") {
      return defaultColumn
        ? ({
            columns: defaultColumn ? [defaultColumn] : [],
            term: parsedResult,
          } as SearchConfig<TSelect>)
        : null;
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
        tableColumns.includes(col),
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
