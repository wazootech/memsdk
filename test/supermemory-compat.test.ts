import { describe, expect, it } from "bun:test"
import type { APIPromise, SupermemoryInterface } from "../src/index.ts"
import { supermemoryCompatibility } from "../src/index.ts"
import {
  AddRequestSchema,
  AddResponseSchema,
  DocumentGetResponseSchema,
  FilterExpressionSchema,
  ListRequestSchema,
  MemoryForgetMatchingRequestSchema,
  NamespaceSchema,
  ProfileRequestSchema,
  SearchRequestSchema,
} from "../src/schemas/supermemory.ts"

function apiPromise<T>(value: T): APIPromise<T> {
  return Promise.resolve(value) as APIPromise<T>
}

const system = {
  createdAt: "2026-10-08T16:00:00.000Z",
  updatedAt: "2026-10-08T16:00:00.000Z",
}

describe("Supermemory-compatible TypeScript surface (synthetic / no server observed)", () => {
  it("exposes pinned upstream compatibility metadata", () => {
    expect(supermemoryCompatibility).toMatchObject({
      openapiSource: "https://api.supermemory.ai/v5/openapi",
      openapiVersion: "3.1.0",
      sdkPackage: "supermemory@5.0.1",
    })
  })

  it("accepts a synthetic mock implementation of the interface", async () => {
    const forgetResponse = { count: 0, errors: [], matches: [] }
    const client: SupermemoryInterface = {
      add: (_namespace, request) =>
        apiPromise({ id: request.id ?? "doc_1", status: "queued" }),
      search: () => apiPromise({ results: [], searchTime: 0 }),
      profile: () => apiPromise({ profile: { static: [], dynamic: [], buckets: {} } }),
      profileMarkdown: (namespace) => Promise.resolve(`# Profile: ${namespace}\n`),
      list: () =>
        apiPromise({
          documents: [],
          chunks: [],
          memories: [],
          pagination: { currentPage: 1, totalItems: 0, totalPages: 0 },
        }),
      documents: {
        get: (_namespace, id) =>
          apiPromise({
            id,
            title: null,
            type: "text",
            summary: null,
            content: "content",
            metadata: {},
            system: { ...system, status: "done" },
          }),
        update: (_namespace, id) => apiPromise({ id, status: "queued" }),
        delete: (_namespace, request) =>
          apiPromise({ count: request.ids.length, errors: [] }),
        batchAdd: () => apiPromise({ results: [], count: 0, failed: 0 }),
        uploadFile: () => apiPromise({ id: "file_1", status: "queued" }),
      },
      memories: {
        get: (_namespace, id) =>
          apiPromise({
            id,
            memory: "likes tea",
            metadata: {},
            isStatic: false,
            isInference: false,
            isLatest: true,
            isForgotten: false,
            version: 1,
            system,
          }),
        forget: () => apiPromise(forgetResponse),
        forgetMatching: () => apiPromise(forgetResponse),
      },
    }

    await expect(
      client.add("user_123", { content: "hello", id: "doc_9" }),
    ).resolves.toMatchObject({ id: "doc_9", status: "queued" })
    await expect(
      client.search("user_123", { query: "hello", searchMode: "hybrid" }),
    ).resolves.toMatchObject({ results: [] })
    await expect(client.profileMarkdown("user_123")).resolves.toContain("user_123")
    await expect(
      client.documents.delete("user_123", { ids: ["doc_1", "doc_2"] }),
    ).resolves.toMatchObject({ count: 2 })
  })
})

describe("vendored Supermemory v5 schema sanity checks (hand-written fixtures, not server-recorded)", () => {
  it("validates namespaces", () => {
    expect(NamespaceSchema.safeParse("user_123:project-a").success).toBe(true)
    expect(NamespaceSchema.safeParse("user 123").success).toBe(false)
  })

  it("parses add requests and rejects v4 field names", () => {
    const addRequest = {
      content: "Dhravya prefers machine learning over traditional programming.",
      id: "mem_abc123",
      supportingContext: "From an onboarding chat.",
      metadata: { confidence: 0.9 },
      dreaming: "instant",
    } as const
    expect(AddRequestSchema.parse(addRequest)).toEqual(addRequest)
    expect(
      AddRequestSchema.safeParse({ content: "hi", containerTag: "user_123" }).success,
    ).toBe(false)
    expect(AddRequestSchema.safeParse({ content: "hi", customId: "x" }).success).toBe(
      false,
    )
    expect(AddResponseSchema.parse({ id: "doc_1", status: "queued" })).toEqual({
      id: "doc_1",
      status: "queued",
    })
  })

  it("applies v5 search defaults", () => {
    expect(SearchRequestSchema.parse({ query: "programming preference" })).toEqual({
      query: "programming preference",
      searchMode: "hybrid",
      limit: 10,
      include: { documents: false, related: false, forgotten: false },
      threshold: 0.3,
      rerank: "none",
      rewriteQuery: false,
    })
    expect(SearchRequestSchema.safeParse({ q: "v4 field" }).success).toBe(false)
    expect(
      SearchRequestSchema.safeParse({ query: "x", searchMode: "documents" }).success,
    ).toBe(false)
  })

  it("parses nested typed filter expressions", () => {
    const filter = {
      operator: "and",
      operands: [
        { field: "source", operator: "eq", value: "chat" },
        {
          operator: "or",
          operands: [
            { field: "score", operator: "gte", value: 0.5 },
            { field: "tags", operator: "arrayContains", value: "pinned" },
          ],
        },
      ],
    } as const
    expect(FilterExpressionSchema.safeParse(filter).success).toBe(true)
    expect(
      FilterExpressionSchema.safeParse({ operator: "and", operands: [] }).success,
    ).toBe(false)
    expect(
      FilterExpressionSchema.safeParse({ field: "score", operator: "gt", value: "1" })
        .success,
    ).toBe(false)
  })

  it("parses profile, list, and forget requests", () => {
    expect(ProfileRequestSchema.safeParse({ buckets: ["work", "home"] }).success).toBe(
      true,
    )
    expect(ProfileRequestSchema.safeParse({ buckets: ["Work"] }).success).toBe(false)
    expect(ListRequestSchema.parse({})).toMatchObject({
      page: 1,
      limit: 10,
      sort: "createdAt",
      order: "desc",
    })
    expect(MemoryForgetMatchingRequestSchema.safeParse({ query: "tea" }).success).toBe(
      false,
    )
  })

  it("parses a document get response", () => {
    const document = {
      id: "acxV5LHMEsG2hMSNb4umbn",
      title: "Programming preference",
      type: "text",
      summary: null,
      content: "Prefers ML.",
      metadata: {},
      system: { ...system, status: "done" as const },
      chunks: [
        {
          id: "chunk_1",
          position: 0,
          content: "Prefers ML.",
          type: "text",
          metadata: {},
          system: { createdAt: system.createdAt },
        },
      ],
    }
    expect(DocumentGetResponseSchema.parse(document)).toEqual(document)
  })
})
