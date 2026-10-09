import { z } from "zod"

// Hand-ported from https://api.supermemory.ai/v5/openapi (OpenAPI 3.1.0, API 5.0.0).
// Only the request/response bodies memsdk exercises are vendored here.

export const NamespaceSchema = z
  .string()
  .max(100)
  .regex(/^[a-zA-Z0-9_:-]+$/)

export const MetadataSchema = z.record(
  z.union([z.string(), z.number(), z.boolean(), z.array(z.string())]),
)

const FilterFieldSchema = z
  .string()
  .min(1)
  .regex(/^[a-zA-Z0-9_.-]+$/)

export const FilterPredicateSchema = z.union([
  z
    .object({
      field: FilterFieldSchema,
      operator: z.enum(["eq", "neq"]),
      value: z.string(),
      caseSensitive: z.boolean().default(true),
    })
    .strict(),
  z
    .object({
      field: FilterFieldSchema,
      operator: z.enum(["eq", "neq"]),
      value: z.union([z.number(), z.boolean()]),
    })
    .strict(),
  z
    .object({
      field: FilterFieldSchema,
      operator: z.enum(["gt", "gte", "lt", "lte"]),
      value: z.number(),
    })
    .strict(),
  z
    .object({
      field: FilterFieldSchema,
      operator: z.enum(["contains", "notContains"]),
      value: z.string(),
      caseSensitive: z.boolean().default(true),
    })
    .strict(),
  z
    .object({
      field: FilterFieldSchema,
      operator: z.enum(["arrayContains", "arrayNotContains"]),
      value: z.string(),
    })
    .strict(),
])

type FilterExpressionInput =
  | z.input<typeof FilterPredicateSchema>
  | { operator: "and" | "or"; operands: Array<FilterExpressionInput> }

export const FilterExpressionSchema: z.ZodType<
  unknown,
  z.ZodTypeDef,
  FilterExpressionInput
> = z.lazy(() =>
  z.union([
    FilterPredicateSchema,
    z
      .object({
        operator: z.enum(["and", "or"]),
        operands: z.array(FilterExpressionSchema).min(1).max(200),
      })
      .strict(),
  ]),
)

const TaskTypeSchema = z.enum(["memory", "superrag"])
const DreamingSchema = z.enum(["dynamic", "instant"])

export const ProcessingStatusSchema = z.enum([
  "unknown",
  "queued",
  "extracting",
  "chunking",
  "embedding",
  "indexing",
  "done",
  "failed",
])

export const AddRequestSchema = z
  .object({
    content: z.string(),
    id: z.string().min(1).max(255).optional(),
    supportingContext: z.string().max(1500).optional(),
    metadata: MetadataSchema.optional(),
    group: MetadataSchema.optional(),
    date: z.string().optional(),
    taskType: TaskTypeSchema.optional(),
    dreaming: DreamingSchema.optional(),
  })
  .strict()

export const AddResponseSchema = z.object({
  id: z.string(),
  status: ProcessingStatusSchema,
})

export const SearchRequestSchema = z
  .object({
    query: z.string().min(1),
    filter: FilterExpressionSchema.optional(),
    searchMode: z.enum(["hybrid", "memories", "chunks"]).default("hybrid"),
    limit: z.number().int().min(1).max(100).default(10),
    include: z
      .object({
        documents: z.boolean().default(false),
        related: z.boolean().default(false),
        forgotten: z.boolean().default(false),
      })
      .strict()
      .default({ documents: false, related: false, forgotten: false }),
    threshold: z.number().min(0).max(1).default(0.3),
    rerank: z.enum(["none", "order", "aggregate"]).default("none"),
    rewriteQuery: z.boolean().default(false),
  })
  .strict()

const SystemTimestampsSchema = z.object({
  createdAt: z.string(),
  updatedAt: z.string(),
})

export const SearchResultSchema = z.object({
  id: z.string(),
  memory: z.string().optional(),
  chunk: z.string().optional(),
  metadata: z.record(z.unknown()),
  similarity: z.number(),
  isLatest: z.boolean(),
  isInference: z.boolean(),
  system: z.object({ updatedAt: z.string(), createdAt: z.string().optional() }),
  included: z.record(z.unknown()).optional(),
})

export const SearchResponseSchema = z.object({
  results: z.array(SearchResultSchema),
  searchTime: z.number(),
})

export const ProfileRequestSchema = z
  .object({
    filter: FilterExpressionSchema.optional(),
    buckets: z
      .array(
        z
          .string()
          .min(1)
          .max(64)
          .regex(/^[a-z0-9][a-z0-9_-]*$/),
      )
      .max(50)
      .optional(),
  })
  .strict()

const ProfileMemorySchema = z.object({ id: z.string(), memory: z.string() })

export const ProfileResponseSchema = z.object({
  profile: z.object({
    static: z.array(ProfileMemorySchema),
    dynamic: z.array(ProfileMemorySchema),
    buckets: z.record(z.array(ProfileMemorySchema)),
  }),
})

export const ListTypeSchema = z.enum(["documents", "chunks", "memories"])

/** `page`, `limit`, `sort`, and `order` travel as query parameters; the rest is the body. */
export const ListRequestSchema = z
  .object({
    page: z.number().int().min(1).default(1),
    limit: z.number().int().min(1).max(100).default(10),
    sort: z.enum(["createdAt", "updatedAt", "position"]).default("createdAt"),
    order: z.enum(["asc", "desc"]).default("desc"),
    filter: FilterExpressionSchema.optional(),
    include: z
      .object({ forgotten: z.boolean().default(false) })
      .strict()
      .default({ forgotten: false }),
  })
  .strict()

export const PaginationSchema = z.object({
  currentPage: z.number(),
  limit: z.number().optional(),
  totalItems: z.number(),
  totalPages: z.number(),
})

export const MemoryRecordSchema = z.object({
  id: z.string(),
  memory: z.string(),
  metadata: z.record(z.unknown()),
  isStatic: z.boolean(),
  isInference: z.boolean(),
  isLatest: z.boolean(),
  isForgotten: z.boolean(),
  version: z.number(),
  system: SystemTimestampsSchema,
})

const ChunkRecordSchema = z.object({
  id: z.string(),
  position: z.number(),
  content: z.string(),
  type: z.string(),
  metadata: z.record(z.unknown()),
  system: z.object({ createdAt: z.string() }),
})

export const ListResponseSchema = z.object({
  documents: z.array(
    z.object({
      id: z.string(),
      title: z.string().nullable(),
      type: z.string(),
      summary: z.string().nullable(),
      metadata: z.record(z.unknown()),
      url: z.string().nullable(),
      system: SystemTimestampsSchema.extend({ status: z.string() }),
    }),
  ),
  chunks: z.array(ChunkRecordSchema.extend({ documentId: z.string() })),
  memories: z.array(MemoryRecordSchema),
  pagination: PaginationSchema,
})

export const DocumentGetResponseSchema = z.object({
  id: z.string(),
  title: z.string().nullable(),
  type: z.string(),
  summary: z.string().nullable(),
  content: z.string().nullable(),
  metadata: z.record(z.unknown()),
  system: SystemTimestampsSchema.extend({ status: ProcessingStatusSchema }),
  chunks: z.array(ChunkRecordSchema).optional(),
  memories: z.array(MemoryRecordSchema).optional(),
})

export const DocumentDeleteRequestSchema = z
  .object({ ids: z.array(z.string().min(1).max(255)).min(1).max(100) })
  .strict()

export const MemoryForgetRequestSchema = z
  .object({ ids: z.array(z.string().min(1)).min(1).max(500) })
  .strict()

export const MemoryForgetMatchingRequestSchema = z
  .object({ query: z.string().min(1).max(2000), dryRun: z.boolean() })
  .strict()
