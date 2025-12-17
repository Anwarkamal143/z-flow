import { stringToNumber } from "@/utils";
import { buildPaginationMetaForOffset } from "@/utils/api";
import { AnyPgTable } from "drizzle-orm/pg-core";
import { BasePagination } from "./base";
import { OffsetPaginationConfig, OffsetPaginationResult } from "./types";

export class OffsetPagination<T extends AnyPgTable> extends BasePagination<T> {
  async paginate<Result = T["$inferSelect"]>(
    config: OffsetPaginationConfig<T>
  ): Promise<OffsetPaginationResult<Result>> {
    const whereClause = this.builder.buildWhereClause(
      config.filters,
      config.search
    );
    const orderByClause = this.builder.buildOrderByClause(config.sorts);

    // Calculate offset

    // Build query
    const query = this.db.select().from(this.table as AnyPgTable);

    // Apply where clause
    if (whereClause) {
      query.where(whereClause);
    }

    // Apply order by
    if (orderByClause) {
      query.orderBy(orderByClause);
    }
    const limitNum =
      config.limit != null ? stringToNumber(config.limit) : undefined;
    if (limitNum != null) {
      // Apply pagination
      const offset = (config.page - 1) * limitNum;
      const limitPlusOne = limitNum + 1;
      query.limit(limitPlusOne).offset(offset);
    }

    // Execute query
    const items = (await query) as Result[];

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
    const hasNextPage =
      config.page < totalPages || items.length > (limitNum || 0);
    // const hasPreviousPage = config.page > 1;
    const newItems =
      limitNum && items.length > limitNum ? items.slice(0, -1) : items;
    return {
      data: {
        items: newItems,
        pagination_meta: buildPaginationMetaForOffset({
          limit: limitNum,
          total: totalItems,
          page: config.page,
          hasMore: hasNextPage,
        }),
      },
      error: null,
    };
    // return {
    //   items,
    //   pagination_meta: {
    //     currentPage: config.page,
    //     totalPages,
    //     totalItems,
    //     hasNextPage,
    //     hasPreviousPage,
    //     itemsPerPage: limitNum != null ? limitNum : totalItems,
    //   },
    // };
  }
}
