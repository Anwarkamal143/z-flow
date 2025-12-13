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
      query.limit(limitNum).offset(offset);
    }

    // Execute query
    const items = (await query) as Result[];

    // Get total count
    const totalItems = await this.getTotalCount(whereClause);
    const totalPages = limitNum != null ? Math.ceil(totalItems / limitNum) : 1;
    const hasNextPage = config.page < totalPages;
    // const hasPreviousPage = config.page > 1;

    return {
      data: {
        items,
        pagination_meta: buildPaginationMetaForOffset({
          limit: limitNum != null ? limitNum : totalItems,
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
