import type Supermemory from "supermemory"
import type {
  RequestOptions as OfficialRequestOptions,
  Uploadable as OfficialUploadable,
} from "supermemory"
import type {
  APIPromise,
  AddParams,
  AddResponse,
  DocumentBatchAddParams,
  DocumentBatchAddResponse,
  DocumentDeleteParams,
  DocumentDeleteResponse,
  DocumentFileResponse,
  DocumentGetParams,
  DocumentGetResponse,
  DocumentReplaceWithFileParams,
  DocumentUpdateFileParams,
  DocumentUpdateParams,
  DocumentUpdateResponse,
  DocumentUploadFileParams,
  FilterExpression,
  ListParams,
  ListResponse,
  ListType,
  MemoryForgetMatchingParams,
  MemoryForgetParams,
  MemoryForgetResponse,
  MemoryGetParams,
  MemoryGetResponse,
  NamespaceDeleteParams,
  NamespaceDeleteResponse,
  NamespaceListParams,
  NamespaceListResponse,
  NamespaceResponse,
  NamespaceUpdateParams,
  ProfileBucketsResponse,
  ProfileParams,
  ProfileResponse,
  RequestOptions,
  SearchParams,
  SearchResponse,
  SupermemoryDocumentFilesInterface,
  SupermemoryInterface,
  SupermemoryNamespacesInterface,
  SupermemoryProfilesInterface,
  Uploadable,
} from "../src/index.ts"

// Drift guard: every request and response type must be mutually assignable with the
// official SDK's, so a change on either side fails `bun run typecheck`.

type Assert<T extends true> = T
type Extends<A, B> = [A] extends [B] ? true : false
type Assignable<A, B> = [A] extends [B] ? ([B] extends [A] ? true : false) : false
// Mutual assignability alone lets a renamed optional field through, so key sets must
// also match at every depth.
type Depth = [never, 0, 1, 2, 3, 4, 5]
type KeysMatch<A, B, D extends number = 6> = [D] extends [never]
  ? true
  : [A] extends [readonly (infer EA)[]]
    ? [B] extends [readonly (infer EB)[]]
      ? KeysMatch<EA, EB, Depth[D]>
      : false
    : [A] extends [object]
      ? Assignable<keyof A, keyof B> extends true
        ? false extends {
            [K in keyof A & keyof B]: KeysMatch<
              NonNullable<A[K]>,
              NonNullable<B[K]>,
              Depth[D]
            >
          }[keyof A & keyof B]
          ? false
          : true
        : false
      : true
type Equal<A, B> = Assignable<A, B> extends true ? KeysMatch<A, B> : false
type Arg<T, I extends number> = T extends (...args: infer P) => unknown
  ? NonNullable<P[I]>
  : never
type Res<T> = T extends (...args: never[]) => infer R ? Awaited<R> : never
type WithoutFile<T> = Omit<T, "file">

type Docs = Supermemory["documents"]
type Mems = Supermemory["memories"]
type Profiles = Supermemory["profiles"]
type Namespaces = Supermemory["namespaces"]

type _Shared = [
  Assert<Equal<RequestOptions, OfficialRequestOptions>>,
  Assert<Equal<FilterExpression, Arg<Supermemory["search"], 1>["filter"] & {}>>,
  // Every value memsdk accepts is accepted by the official SDK. The SDK also accepts
  // Node-only stream and Buffer types that memsdk omits to stay free of @types/node.
  Assert<Extends<Uploadable, OfficialUploadable>>,
]

type _TopLevel = [
  Assert<Equal<Arg<Supermemory["add"], 1>, AddParams>>,
  Assert<Equal<Res<Supermemory["add"]>, AddResponse>>,
  Assert<Equal<Arg<Supermemory["search"], 1>, SearchParams>>,
  Assert<Equal<Res<Supermemory["search"]>, SearchResponse>>,
  Assert<Equal<Arg<Supermemory["profile"], 1>, ProfileParams>>,
  Assert<Equal<Res<Supermemory["profile"]>, ProfileResponse>>,
  Assert<Equal<Arg<Supermemory["profileMarkdown"], 1>, ProfileParams>>,
  Assert<Equal<Res<Supermemory["profileMarkdown"]>, string>>,
  Assert<Equal<Arg<Supermemory["list"], 1>, ListType>>,
  Assert<Equal<Arg<Supermemory["list"], 2>, ListParams>>,
  Assert<Equal<Res<Supermemory["list"]>, ListResponse>>,
]

type _Documents = [
  Assert<Equal<Arg<Docs["get"], 2>, DocumentGetParams>>,
  Assert<Equal<Res<Docs["get"]>, DocumentGetResponse>>,
  Assert<Equal<Arg<Docs["update"], 2>, DocumentUpdateParams>>,
  Assert<Equal<Res<Docs["update"]>, DocumentUpdateResponse>>,
  Assert<Equal<Arg<Docs["delete"], 1>, DocumentDeleteParams>>,
  Assert<Equal<Res<Docs["delete"]>, DocumentDeleteResponse>>,
  Assert<Equal<Arg<Docs["batchAdd"], 1>, DocumentBatchAddParams>>,
  Assert<Equal<Res<Docs["batchAdd"]>, DocumentBatchAddResponse>>,
  Assert<
    Equal<
      WithoutFile<Arg<Docs["uploadFile"], 1>>,
      WithoutFile<DocumentUploadFileParams>
    >
  >,
  Assert<Equal<Res<Docs["uploadFile"]>, DocumentFileResponse>>,
  Assert<
    Equal<
      WithoutFile<Arg<Docs["replaceWithFile"], 2>>,
      WithoutFile<DocumentReplaceWithFileParams>
    >
  >,
  Assert<Equal<Res<Docs["replaceWithFile"]>, DocumentFileResponse>>,
  Assert<
    Equal<
      WithoutFile<Arg<Docs["updateFile"], 2>>,
      WithoutFile<DocumentUpdateFileParams>
    >
  >,
  Assert<Equal<Res<Docs["updateFile"]>, DocumentFileResponse>>,
]

type _Memories = [
  Assert<Equal<Arg<Mems["get"], 2>, MemoryGetParams>>,
  Assert<Equal<Res<Mems["get"]>, MemoryGetResponse>>,
  Assert<Equal<Arg<Mems["forget"], 1>, MemoryForgetParams>>,
  Assert<Equal<Res<Mems["forget"]>, MemoryForgetResponse>>,
  Assert<Equal<Arg<Mems["forgetMatching"], 1>, MemoryForgetMatchingParams>>,
  Assert<Equal<Res<Mems["forgetMatching"]>, MemoryForgetResponse>>,
]

type _Profiles = [
  Assert<Equal<Arg<Profiles["setBuckets"], 1>["buckets"], Record<string, string>>>,
  Assert<Equal<Arg<Profiles["deleteBuckets"], 1>["buckets"], Array<string>>>,
  Assert<Equal<Res<Profiles["getBuckets"]>, ProfileBucketsResponse>>,
  Assert<Equal<Res<Profiles["setBuckets"]>, ProfileBucketsResponse>>,
  Assert<Equal<Res<Profiles["deleteBuckets"]>, ProfileBucketsResponse>>,
]

type _Namespaces = [
  Assert<Equal<Arg<Namespaces["list"], 0>, NamespaceListParams>>,
  Assert<Equal<Res<Namespaces["list"]>, NamespaceListResponse>>,
  Assert<Equal<Res<Namespaces["get"]>, NamespaceResponse>>,
  Assert<Equal<Arg<Namespaces["update"], 1>, NamespaceUpdateParams>>,
  Assert<Equal<Res<Namespaces["update"]>, NamespaceResponse>>,
  Assert<Equal<Arg<Namespaces["delete"], 1>, NamespaceDeleteParams>>,
  Assert<Equal<Res<Namespaces["delete"]>, NamespaceDeleteResponse>>,
]

// The official client is itself a valid memsdk implementation, including the optional
// resource interfaces.
declare const official: Supermemory
export const _client: SupermemoryInterface = official
export const _files: SupermemoryDocumentFilesInterface = official.documents
export const _profiles: SupermemoryProfilesInterface = official.profiles
export const _namespaces: SupermemoryNamespacesInterface = official.namespaces

type _Promise = [Assert<Extends<APIPromise<AddResponse>, Promise<AddResponse>>>]

declare const memsdkClient: SupermemoryInterface

await memsdkClient.add("user_123", { content: "hello", dreaming: "instant" })
await memsdkClient.search("user_123", { query: "hello", searchMode: "hybrid" })
await memsdkClient.profile("user_123")
await memsdkClient.profileMarkdown("user_123")
await memsdkClient.list("user_123", "documents", {
  filter: { field: "source", operator: "eq", value: "chat" },
})
await memsdkClient.documents.get("user_123", "doc_1", { include: ["chunks"] })
await memsdkClient.documents.uploadFile("user_123", {
  file: new File(["hello"], "hello.txt"),
})
await memsdkClient.documents.delete("user_123", { ids: ["doc_1"] })
await memsdkClient.memories.forget("user_123", { ids: ["mem_1"] })
await memsdkClient.memories.forgetMatching("user_123", { query: "hello", dryRun: true })
