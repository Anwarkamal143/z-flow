// services/base.service.ts
import { HTTPSTATUS } from "@/config/http.config";
import {
  BadRequestException,
  InternalServerException,
} from "@/utils/catch-errors";

import { db } from "@/db";
import { getSingularPlural, stringToNumber } from "@/utils";
import {
  buildPaginationMetaCursor,
  buildPaginationMetaForOffset,
} from "@/utils/api";
import { AnyColumn, asc, desc, SQL, sql } from "drizzle-orm";
import { AnyPgTable, getTableConfig, IndexColumn } from "drizzle-orm/pg-core";

export type IPaginationOrder = "asc" | "desc";
export type IPaginationModes = "cursor" | "offset";
export type IPaginatedParams =
  | {
      cursor?: number | string | null;
      limit?: number | string | null;
      mode?: "cursor";
      sort?: IPaginationOrder;
    }
  | {
      page?: number | string | null;
      limit?: number | string | null;
      mode?: "offset";
      sort?: IPaginationOrder;
    };
type PaginationOffsetOptions<TTable extends AnyPgTable> = {
  limit?: number | string | null;
  page?: number | string | null;
  where?: (t: TTable) => SQL<unknown> | undefined;
  sort?: IPaginationOrder;
  cursorColumn?: (tableCols: TTable) => AnyColumn;
};
type PaginationCursortOptions<TCursorValue, TTable extends AnyPgTable> = {
  limit?: number | null | string;
  cursor?: TCursorValue;
  cursorColumn: (tableCols: TTable) => AnyColumn;
  direction?: "next" | "prev";
  sort?: IPaginationOrder;
  where?: (t: TTable) => SQL<unknown> | undefined;
};

// Update the queryTable function to be more specific about the return type

export class BaseService<
  TTable extends AnyPgTable,
  TInsert extends Record<string, any>,
  TSelect
> {
  // ⭐ This is the type helper
  public readonly _types!: {
    PaginatedParams: IPaginatedParams & {
      cursorColumn?: (t: TTable) => AnyColumn;
      where?: (t: TTable) => SQL<unknown> | undefined;
    };
  };
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

  async update<T = Partial<TInsert>>(
    where: (table: TTable) => SQL<unknown> | undefined,
    values: T
  ) {
    console.log(values, "update");
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
      const total = await db.$count(
        this.table,
        where?.(this.table) || sql`true`
      );
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
            ? sql`${cursorCol} > ${cursor}`
            : sql`${cursorCol} < ${cursor}`
          : isAsc
          ? sql`${cursorCol} < ${cursor}`
          : sql`${cursorCol} > ${cursor}`
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
      const total = await db.$count(
        this.table,
        where?.(this.table) || sql`true`
      );
      const items = limitNum
        ? (result.slice(0, limitNum) as TSelect[])
        : result;
      const hasMore = limitNum ? result.length > limitNum : false;
      return {
        data: items as TSelect[],
        pagination_meta: {
          ...buildPaginationMetaCursor({
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
}
