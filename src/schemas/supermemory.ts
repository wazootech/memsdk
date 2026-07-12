import { z } from "zod"

export const MetadataSchema = z.record(
  z.union([z.string(), z.number(), z.boolean(), z.array(z.string())]),
)

export const SearchFiltersSchema = z
  .object({
    AND: z.array(z.unknown()).optional(),
    OR: z.array(z.unknown()).optional(),
  })
  .or(z.record(z.unknown()))

const DocumentStatusSchema = z.string()
const DocumentTypeSchema = z.string()

export const MemorySchema = z.object({
  id: z.string(),
  customId: z.string().nullable().optional(),
  connectionId: z.string().nullable().optional(),
  content: z.string().nullable().optional(),
  metadata: MetadataSchema.nullable().optional(),
  source: z.string().nullable().optional(),
  status: DocumentStatusSchema,
  summary: z.string().nullable().optional(),
  title: z.string().nullable().optional(),
  type: DocumentTypeSchema,
  url: z.string().nullable().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
  containerTags: z.array(z.string()).optional().readonly(),
  chunkCount: z.number().default(0),
})

export const MemoryUpdateSchema = z.object({
  containerTags: z.array(z.string()).optional(),
  content: z.string().optional(),
  customId: z.string().optional(),
  entityContext: z.string().max(1500).optional(),
  metadata: MetadataSchema.optional(),
})

export const MemoryAddSchema = MemoryUpdateSchema

export const PaginationSchema = z.object({
  currentPage: z.number(),
  limit: z.number().max(1100).default(10),
  totalItems: z.number(),
  totalPages: z.number(),
})

export const GetMemoryResponseSchema = MemorySchema

export const ListMemoriesResponseSchema = z.object({
  memories: z.array(
    MemorySchema.pick({
      connectionId: true,
      containerTags: true,
      createdAt: true,
      customId: true,
      id: true,
      metadata: true,
      status: true,
      summary: true,
      title: true,
      type: true,
      updatedAt: true,
    }),
  ),
  pagination: PaginationSchema,
})

export const ListMemoriesQuerySchema = z.object({
  containerTags: z.array(z.string()).optional(),
  filters: z.string().optional(),
  limit: z
    .string()
    .regex(/^\d+$/)
    .or(z.number())
    .transform(Number)
    .refine((value) => value <= 1100, {
      message: "Limit cannot be greater than 1100",
    })
    .default("10"),
  order: z.enum(["asc", "desc"]).default("desc"),
  page: z.string().regex(/^\d+$/).or(z.number()).transform(Number).default("1"),
  sort: z.enum(["createdAt", "updatedAt"]).default("createdAt"),
})

export const MemoryResponseSchema = z.object({
  id: z.string(),
  status: z.string(),
})

export const SearchRequestSchema = z.object({
  categoriesFilter: z.array(z.string()).optional(),
  chunkThreshold: z
    .number()
    .optional()
    .default(0)
    .refine((value) => value === undefined || (value >= 0 && value <= 1), {
      message: "chunkThreshold must be between 0 and 1",
    })
    .transform(Number),
  containerTags: z.array(z.string()).optional(),
  docId: z.string().max(255).optional(),
  documentThreshold: z
    .number()
    .optional()
    .default(0)
    .refine((value) => value === undefined || (value >= 0 && value <= 1), {
      message: "documentThreshold must be between 0 and 1",
    })
    .transform(Number),
  filters: SearchFiltersSchema.optional(),
  includeFullDocs: z.boolean().optional().default(false),
  includeSummary: z.boolean().optional().default(false),
  limit: z
    .number()
    .int()
    .positive()
    .optional()
    .default(10)
    .refine((value) => value === undefined || (value > 0 && value <= 100), {
      message: "limit must be between 1 and 100",
    }),
  onlyMatchingChunks: z.boolean().optional().default(true),
  q: z.string().min(1),
  rerank: z.boolean().optional().default(false),
  rewriteQuery: z.boolean().optional().default(false),
})

export const Searchv4RequestSchema = z.object({
  containerTag: z.string().optional(),
  threshold: z
    .number()
    .optional()
    .default(0.6)
    .refine((value) => value === undefined || (value >= 0 && value <= 1), {
      message: "threshold must be between 0 and 1",
    })
    .transform(Number),
  filters: SearchFiltersSchema.optional(),
  include: z
    .object({
      chunks: z.boolean().default(false),
      documents: z.boolean().default(false),
      summaries: z.boolean().default(false),
      relatedMemories: z.boolean().default(false),
    })
    .optional()
    .default({
      chunks: false,
      documents: false,
      summaries: false,
      relatedMemories: false,
    }),
  limit: z
    .number()
    .int()
    .positive()
    .optional()
    .default(10)
    .refine((value) => value === undefined || (value > 0 && value <= 100), {
      message: "limit must be between 1 and 100",
    }),
  q: z.string().min(1),
  rerank: z.boolean().optional().default(false),
  rewriteQuery: z.boolean().optional().default(false),
})

export const SearchResultSchema = z.object({
  chunks: z.array(
    z.object({
      content: z.string(),
      isRelevant: z.boolean(),
      score: z.number(),
    }),
  ),
  createdAt: z.string(),
  documentId: z.string(),
  metadata: z.record(z.unknown()).nullable(),
  score: z.number(),
  summary: z.string().nullable().optional(),
  content: z.string().nullable().optional(),
  title: z.string().nullable(),
  updatedAt: z.string(),
  type: z.string().nullable(),
})

export const SearchResponseSchema = z.object({
  results: z.array(SearchResultSchema),
  timing: z.number(),
  total: z.number(),
})

export const MemorySearchDocumentSchema = z.object({
  id: z.string(),
  title: z.string(),
  type: z.string(),
  metadata: z.record(z.unknown()).nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
})

export const MemorySearchResult = z.object({
  id: z.string(),
  memory: z.string(),
  metadata: z.record(z.unknown()).nullable(),
  updatedAt: z.string(),
  similarity: z.number(),
  version: z.number().nullable().optional(),
  context: z
    .object({
      parents: z
        .array(
          z.object({
            relation: z.enum(["updates", "extends", "derives"]),
            version: z.number().nullable().optional(),
            memory: z.string(),
            metadata: z.record(z.unknown()).nullable().optional(),
            updatedAt: z.string(),
          }),
        )
        .optional(),
      children: z
        .array(
          z.object({
            relation: z.enum(["updates", "extends", "derives"]),
            version: z.number().nullable().optional(),
            memory: z.string(),
            metadata: z.record(z.unknown()).nullable().optional(),
            updatedAt: z.string(),
          }),
        )
        .optional(),
    })
    .optional(),
  documents: z.array(MemorySearchDocumentSchema).optional(),
})

export const MemorySearchResponseSchema = z.object({
  results: z.array(MemorySearchResult),
  timing: z.number(),
  total: z.number(),
})

export const BulkDeleteMemoriesSchema = z
  .object({
    ids: z.array(z.string()).min(1).max(100).optional(),
    containerTags: z.array(z.string()).min(1).optional(),
  })
  .refine((data) => !!data.ids?.length || !!data.containerTags?.length, {
    message: "Either 'ids' or 'containerTags' must be provided",
  })

export const BulkDeleteMemoriesResponseSchema = z.object({
  success: z.boolean(),
  deletedCount: z.number(),
  errors: z
    .array(
      z.object({
        id: z.string(),
        error: z.string(),
      }),
    )
    .optional(),
  containerTags: z.array(z.string()).optional(),
})
