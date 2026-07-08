import { describe, expect, expectTypeOf, it } from "vitest"
import type {
  AddParams,
  AddResponse,
  APIPromise,
  DocumentAddParams,
  DocumentGetResponse,
  SearchMemoriesParams,
  SupermemoryInterface,
} from "../src/index.ts"
import { supermemoryCompatibility } from "../src/index.ts"
import {
  GetMemoryResponseSchema,
  MemoryAddSchema,
  MemoryResponseSchema,
  Searchv4RequestSchema,
} from "../src/schemas/supermemory.ts"

function apiPromise<T>(value: T): APIPromise<T> {
  return Promise.resolve(value) as APIPromise<T>
}

describe("Supermemory-compatible TypeScript surface (synthetic / no server observed)", () => {
  it("exposes pinned upstream compatibility metadata", () => {
    expect(supermemoryCompatibility).toMatchObject({
      openapiSource: "https://api.supermemory.ai/v3/openapi",
      sdkPackage: "supermemory@4.24.12",
    })
  })

  it("accepts a synthetic mock implementation of the interface", async () => {
    const client: SupermemoryInterface = {
      add: (body) => apiPromise({ id: body.customId ?? "doc_1", status: "queued" }),
      profile: () => apiPromise({ profile: { dynamic: [], static: [] } }),
      documents: {
        update: (id) => apiPromise({ id, status: "queued" }),
        list: () => apiPromise({
          memories: [],
          pagination: { currentPage: 1, totalItems: 0, totalPages: 0 },
        }),
        delete: () => apiPromise(undefined),
        add: (body) => apiPromise({ id: body.customId ?? "doc_1", status: "queued" }),
        batchAdd: () => apiPromise({ failed: 0, results: [], success: 0 }),
        deleteBulk: () => apiPromise({ deletedCount: 0, success: true }),
        get: (id) => apiPromise({
          connectionId: null,
          content: "content",
          createdAt: "2026-07-05T16:00:00.000Z",
          customId: null,
          filepath: null,
          id,
          metadata: null,
          ogImage: null,
          raw: null,
          source: null,
          spatialPoint: null,
          status: "done",
          summary: null,
          taskType: "memory",
          title: null,
          type: "text",
          updatedAt: "2026-07-05T16:00:00.000Z",
        }),
        listProcessing: () => apiPromise({ documents: [], totalCount: 0 }),
        uploadFile: () => apiPromise({ id: "file_1", status: "queued" }),
      },
      search: {
        documents: () => apiPromise({ results: [], timing: 0, total: 0 }),
        execute: () => apiPromise({ results: [], timing: 0, total: 0 }),
        memories: () => apiPromise({ results: [], timing: 0, total: 0 }),
      },
      memories: {
        forget: () => apiPromise({ forgotten: true, id: "mem_1" }),
        updateMemory: () => apiPromise({
          createdAt: "2026-07-05T16:00:00.000Z",
          forgetAfter: null,
          forgetReason: null,
          id: "mem_2",
          memory: "new content",
          parentMemoryId: "mem_1",
          rootMemoryId: "mem_1",
          version: 2,
        }),
      },
    }

    await expect(client.add({ content: "hello" })).resolves.toMatchObject({
      status: "queued",
    })
    await expect(client.search.memories({ q: "hello" })).resolves.toMatchObject({
      total: 0,
    })
  })

  it("keeps SDK-compatible public type names", () => {
    expectTypeOf<AddParams>().toMatchTypeOf<DocumentAddParams>()
    expectTypeOf<APIPromise<AddResponse>>().toMatchTypeOf<Promise<AddResponse>>()
    expectTypeOf<SearchMemoriesParams>().toHaveProperty("q").toEqualTypeOf<string>()
    expectTypeOf<DocumentGetResponse>().toHaveProperty("id").toEqualTypeOf<string>()
  })
})

describe("vendored Supermemory schema sanity checks (hand-written fixtures, not server-recorded)", () => {
  it("parses hand-written add/write/get/search fixtures", () => {
    const addRequest = {
      containerTags: ["user_123"],
      content: "Dhravya prefers machine learning over traditional programming.",
      customId: "mem_abc123",
      metadata: { confidence: 0.9 },
    }

    const memoryRecord = {
      chunkCount: 1,
      connectionId: null,
      containerTags: ["user_123"],
      content: addRequest.content,
      createdAt: "2026-07-05T16:00:00.000Z",
      customId: addRequest.customId,
      id: "acxV5LHMEsG2hMSNb4umbn",
      metadata: addRequest.metadata,
      source: "conversation",
      status: "done",
      summary: addRequest.content,
      title: "Programming preference",
      type: "text",
      updatedAt: "2026-07-05T16:00:00.000Z",
      url: null,
    }

    expect(MemoryAddSchema.parse(addRequest)).toMatchObject({
      content: addRequest.content,
    })
    expect(MemoryResponseSchema.parse({ id: memoryRecord.id, status: "queued" })).toEqual({
      id: memoryRecord.id,
      status: "queued",
    })
    expect(GetMemoryResponseSchema.parse(memoryRecord)).toMatchObject({
      id: memoryRecord.id,
    })
    expect(Searchv4RequestSchema.parse({ q: "programming preference" })).toMatchObject({
      q: "programming preference",
    })
  })
})
