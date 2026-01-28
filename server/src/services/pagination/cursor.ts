import { stringToNumber } from "@/utils";
import { buildPaginationMetaCursor } from "@/utils/api";
import { BadRequestException } from "@/utils/catch-errors";
import { asc, desc, gt, InferSelectModel, lt } from "drizzle-orm";
import { AnyPgTable, PgColumn } from "drizzle-orm/pg-core";
import { BasePagination } from "./base";
import { CursorPaginationConfig, CursorPaginationResult } from "./types";

export class CursorPagination<T extends AnyPgTable> extends BasePagination<T> {
  async paginate<Result = InferSelectModel<T>>(
    config: CursorPaginationConfig<InferSelectModel<T>>,
  ): Promise<CursorPaginationResult<Result>> {
    // Validate cursor column exists
    if (!this.builder.validateColumns([config.cursorColumn as string])) {
      return {
        error: new BadRequestException(
          `Invalid cursor column: ${config.cursorColumn.toString()}`,
        ),
        data: null,
      };
    }

    const cursorColumn = this.table[config.cursorColumn as string] as PgColumn;
    const whereClause = this.builder.buildWhereClause(
      config.filters,
      config.search,
    );
    const orderByClause = this.builder.buildOrderByClause(config.sorts);

    // Build base query
    const query = this.db.select().from(this.table as AnyPgTable);

    // Apply where clause
    if (whereClause) {
      query.where(whereClause);
    }

    // Apply cursor condition
    if (config.cursor) {
      const cursorValue = this.decodeCursor(config.cursor);
      const cursorOperator =
        config.cursorDirection == "backward"
          ? config.sorts?.[0]?.direction == "desc"
            ? gt
            : lt
          : config.sorts?.[0]?.direction == "desc"
            ? lt
            : gt;

      query.where(cursorOperator(cursorColumn, cursorValue));
    }

    // Apply order by
    if (orderByClause) {
      query.orderBy(orderByClause);
    } else {
      // Default ordering by cursor column
      query.orderBy(
        config.cursorDirection == "backward"
          ? desc(cursorColumn)
          : asc(cursorColumn),
      );
    }

    // Apply limit (plus one to check if there are more items)
    // const limitWithExtra = config.limit + 1;

    const numLimit =
      config.limit != null ? stringToNumber(config.limit) : undefined;
    const limitNum = numLimit && numLimit > 0 ? numLimit : undefined;
    if (limitNum != null) {
      // Apply pagination
      query.limit(limitNum + 1);
    }

    // Execute query
    const cursorItems = (await query) as Result[];

    // Check if we have extra item
    const hasExtra = limitNum != null ? cursorItems?.length > limitNum : false;
    const items = hasExtra ? cursorItems?.slice(0, -1) : cursorItems;

    // Determine next/previous cursors
    let nextCursor: string | null = null;
    let previousCursor: string | null = null;

    if (items.length > 0) {
      const lastItem = items[items.length - 1];
      const firstItem = items[0];

      if (config.cursorDirection === "forward") {
        nextCursor = hasExtra
          ? this.encodeCursor((lastItem as any)[config.cursorColumn])
          : null;
        previousCursor = config.cursor
          ? this.encodeCursor((firstItem as any)[config.cursorColumn])
          : null;
      } else {
        previousCursor = hasExtra
          ? this.encodeCursor((lastItem as any)[config.cursorColumn])
          : null;
        nextCursor = config.cursor
          ? this.encodeCursor((firstItem as any)[config.cursorColumn])
          : null;
      }
    }

    // Get total count if requested
    // let totalPages: number = 0;

    // Get total count
    let totalItems = config.includeTotal
      ? await this.getTotalCount(whereClause)
      : undefined;
    if (limitNum == null && !config.includeTotal) {
      totalItems = items.length;
    }
    let totalPages = items.length > 0 ? 1 : 0;
    if (limitNum != null && totalItems) {
      totalPages = Math.ceil(totalItems / limitNum);
    }

    // return {
    //   items,
    //   meta: {
    //     next: nextCursor,
    //     previousCursor,
    //     hasNextPage: !!nextCursor,
    //     hasPreviousPage: !!previousCursor,
    //     totalItems,
    //     totalPages,

    //   },
    // };
    return {
      data: {
        items,
        pagination_meta: {
          ...buildPaginationMetaCursor({
            limit: limitNum as unknown as number,
            total: totalItems,
            next: nextCursor as string,
            cursor: config.cursor as string,
            hasMore: !!nextCursor,
            previous: previousCursor,
          }),
          direction: config.cursorDirection || "forward",
        },
      },
      error: null,
    };
  }

  private encodeCursor(value: any): string {
    return Buffer.from(JSON.stringify(value)).toString("base64");
  }

  private decodeCursor(cursor: string): any {
    return JSON.parse(Buffer.from(cursor, "base64").toString());
  }
}
