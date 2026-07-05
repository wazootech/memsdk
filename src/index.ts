import type { z } from "zod"
import type {
  BulkDeleteMemoriesResponseSchema,
  BulkDeleteMemoriesSchema,
  GetMemoryResponseSchema,
  ListMemoriesQuerySchema,
  ListMemoriesResponseSchema,
  MemoryAddSchema,
  MemoryResponseSchema,
  MemorySearchResponseSchema,
  MemoryUpdateSchema,
  SearchRequestSchema,
  SearchResponseSchema,
  Searchv4RequestSchema,
} from "./vendor/supermemory/api.js"

export type MemoryAddRequest = z.infer<typeof MemoryAddSchema>
export type MemoryUpdateRequest = z.infer<typeof MemoryUpdateSchema>
export type MemoryWriteResponse = z.infer<typeof MemoryResponseSchema>
export type MemoryRecord = z.infer<typeof GetMemoryResponseSchema>
export type ListMemoriesQuery = z.input<typeof ListMemoriesQuerySchema>
export type ListMemoriesResponse = z.infer<typeof ListMemoriesResponseSchema>
export type SearchRequest = z.input<typeof SearchRequestSchema>
export type SearchResponse = z.infer<typeof SearchResponseSchema>
export type MemorySearchRequest = z.input<typeof Searchv4RequestSchema>
export type MemorySearchResponse = z.infer<typeof MemorySearchResponseSchema>
export type BulkDeleteMemoriesRequest = z.infer<typeof BulkDeleteMemoriesSchema>
export type BulkDeleteMemoriesResponse = z.infer<
  typeof BulkDeleteMemoriesResponseSchema
>

export interface MemoryClient {
  add(request: MemoryAddRequest): Promise<MemoryWriteResponse>
  update(id: string, request: MemoryUpdateRequest): Promise<MemoryWriteResponse>
  get(id: string): Promise<MemoryRecord>
  list(query?: ListMemoriesQuery): Promise<ListMemoriesResponse>
  search(request: SearchRequest): Promise<SearchResponse>
  searchMemories(request: MemorySearchRequest): Promise<MemorySearchResponse>
  delete(id: string): Promise<{ success: boolean }>
  bulkDelete(
    request: BulkDeleteMemoriesRequest,
  ): Promise<BulkDeleteMemoriesResponse>
}

export const exampleMemoryAddRequest = {
  containerTags: ["user_123", "project_123"],
  content: "Dhravya prefers machine learning over traditional programming.",
  customId: "mem_abc123",
  entityContext: "This user is saving durable agent memory.",
  metadata: {
    confidence: 0.9,
    source: "conversation",
    userVisible: true,
  },
} satisfies MemoryAddRequest

export const exampleMemoryRecord = {
  chunkCount: 1,
  connectionId: null,
  containerTags: ["user_123", "project_123"],
  content: "Dhravya prefers machine learning over traditional programming.",
  createdAt: "2026-07-05T16:00:00.000Z",
  customId: "mem_abc123",
  id: "acxV5LHMEsG2hMSNb4umbn",
  metadata: {
    confidence: 0.9,
    source: "conversation",
    userVisible: true,
  },
  source: "conversation",
  status: "done",
  summary: "Dhravya prefers machine learning over traditional programming.",
  title: "Programming preference",
  type: "text",
  updatedAt: "2026-07-05T16:00:00.000Z",
  url: null,
} satisfies MemoryRecord

export const exampleSearchRequest = {
  containerTags: ["user_123"],
  filters: {
    source: "conversation",
  },
  includeSummary: true,
  limit: 10,
  q: "programming preference",
} satisfies SearchRequest

export const exampleMemorySearchRequest = {
  containerTag: "user_123",
  include: {
    documents: true,
    relatedMemories: true,
    summaries: true,
  },
  limit: 10,
  q: "programming preference",
} satisfies MemorySearchRequest
