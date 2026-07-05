import { describe, expect, it } from "vitest"
import {
  exampleMemoryAddRequest,
  exampleMemoryRecord,
  exampleMemorySearchRequest,
  exampleSearchRequest,
} from "../src/index.ts"
import {
  BulkDeleteMemoriesResponseSchema,
  BulkDeleteMemoriesSchema,
  GetMemoryResponseSchema,
  ListMemoriesQuerySchema,
  ListMemoriesResponseSchema,
  MemoryAddSchema,
  MemoryResponseSchema,
  MemorySearchResponseSchema,
  SearchRequestSchema,
  SearchResponseSchema,
  Searchv4RequestSchema,
} from "../src/vendor/supermemory/api.ts"

describe("Supermemory-compatible memsdk fixtures", () => {
  it("validates memory add requests", () => {
    expect(MemoryAddSchema.parse(exampleMemoryAddRequest)).toMatchObject({
      content: exampleMemoryAddRequest.content,
      customId: exampleMemoryAddRequest.customId,
    })
  })

  it("validates memory write responses", () => {
    expect(
      MemoryResponseSchema.parse({
        id: exampleMemoryRecord.id,
        status: "queued",
      }),
    ).toEqual({
      id: exampleMemoryRecord.id,
      status: "queued",
    })
  })

  it("validates memory records", () => {
    expect(GetMemoryResponseSchema.parse(exampleMemoryRecord)).toMatchObject({
      id: exampleMemoryRecord.id,
      status: "done",
      type: "text",
    })
  })

  it("validates list memory query and response shapes", () => {
    expect(
      ListMemoriesQuerySchema.parse({
        containerTags: ["user_123"],
        limit: "10",
        page: "1",
      }),
    ).toMatchObject({ limit: 10, page: 1 })

    expect(
      ListMemoriesResponseSchema.parse({
        memories: [exampleMemoryRecord],
        pagination: {
          currentPage: 1,
          limit: 10,
          totalItems: 1,
          totalPages: 1,
        },
      }),
    ).toMatchObject({ pagination: { totalItems: 1 } })
  })

  it("validates v3 document search request and response shapes", () => {
    expect(SearchRequestSchema.parse(exampleSearchRequest)).toMatchObject({
      includeSummary: true,
      limit: 10,
      q: "programming preference",
    })

    expect(
      SearchResponseSchema.parse({
        results: [
          {
            chunks: [
              {
                content: exampleMemoryRecord.content,
                isRelevant: true,
                score: 0.91,
              },
            ],
            createdAt: exampleMemoryRecord.createdAt,
            documentId: exampleMemoryRecord.id,
            metadata: exampleMemoryRecord.metadata,
            score: 0.91,
            summary: exampleMemoryRecord.summary,
            title: exampleMemoryRecord.title,
            type: exampleMemoryRecord.type,
            updatedAt: exampleMemoryRecord.updatedAt,
          },
        ],
        timing: 12,
        total: 1,
      }),
    ).toMatchObject({ total: 1 })
  })

  it("validates v4 memory search request and response shapes", () => {
    expect(Searchv4RequestSchema.parse(exampleMemorySearchRequest)).toMatchObject({
      limit: 10,
      q: "programming preference",
    })

    expect(
      MemorySearchResponseSchema.parse({
        results: [
          {
            documents: [
              {
                createdAt: exampleMemoryRecord.createdAt,
                id: exampleMemoryRecord.id,
                metadata: exampleMemoryRecord.metadata,
                title: exampleMemoryRecord.title,
                type: exampleMemoryRecord.type,
                updatedAt: exampleMemoryRecord.updatedAt,
              },
            ],
            id: exampleMemoryRecord.id,
            memory: exampleMemoryRecord.content,
            metadata: exampleMemoryRecord.metadata,
            similarity: 0.91,
            updatedAt: exampleMemoryRecord.updatedAt,
            version: 1,
          },
        ],
        timing: 12,
        total: 1,
      }),
    ).toMatchObject({ total: 1 })
  })

  it("validates bulk delete request and response shapes", () => {
    expect(
      BulkDeleteMemoriesSchema.parse({ ids: [exampleMemoryRecord.id] }),
    ).toEqual({ ids: [exampleMemoryRecord.id] })

    expect(
      BulkDeleteMemoriesResponseSchema.parse({
        deletedCount: 1,
        success: true,
      }),
    ).toEqual({ deletedCount: 1, success: true })
  })
})
