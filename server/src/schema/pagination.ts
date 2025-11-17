import { z } from "zod";

const paginatedQuerySchema = z.object({
  cursor: z.string().optional().nullable().default(null),
  page: z.string().optional().nullable().default(null),
  limit: z.string().optional().nullable().default(null),
  mode: z.enum(["cursor", "offset"]).default("offset"),
  sort: z.enum(["asc", "desc"]).default("asc"),
});
export { paginatedQuerySchema };
export type IPaginatedQuery = z.infer<typeof paginatedQuerySchema>;
