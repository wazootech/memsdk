import type Supermemory from "supermemory"
import type {
  AddParams,
  AddResponse,
  DocumentAddParams,
  DocumentAddResponse,
  DocumentBatchAddParams,
  DocumentBatchAddResponse,
  DocumentDeleteBulkParams,
  DocumentDeleteBulkResponse,
  DocumentGetResponse,
  DocumentListParams,
  DocumentListProcessingResponse,
  DocumentListResponse,
  DocumentUpdateParams,
  DocumentUpdateResponse,
  DocumentUploadFileParams,
  DocumentUploadFileResponse,
  MemoryForgetParams,
  MemoryForgetResponse,
  MemoryUpdateMemoryParams,
  MemoryUpdateMemoryResponse,
  ProfileParams,
  ProfileResponse,
  SearchDocumentsParams,
  SearchDocumentsResponse,
  SearchExecuteParams,
  SearchExecuteResponse,
  SearchMemoriesParams,
  SearchMemoriesResponse,
  SupermemoryInterface,
} from "../src/index.ts"

type Assert<T extends true> = T
type Extends<A, B> = [A] extends [B] ? true : false
type AwaitedReturn<T> = T extends (...args: never[]) => infer R ? Awaited<R> : never
type FirstArg<T> = T extends (arg: infer A, ...args: never[]) => unknown ? A : never
type SecondArg<T> = T extends (
  first: string,
  second: infer A,
  ...args: unknown[]
) => unknown
  ? A
  : never

type OfficialDocuments = Supermemory["documents"]
type OfficialSearch = Supermemory["search"]
type OfficialMemories = Supermemory["memories"]

type _TopLevel = [
  Assert<Extends<FirstArg<Supermemory["add"]>, AddParams>>,
  Assert<Extends<AddResponse, AwaitedReturn<Supermemory["add"]>>>,
  Assert<Extends<FirstArg<Supermemory["profile"]>, ProfileParams>>,
  Assert<Extends<ProfileResponse, AwaitedReturn<Supermemory["profile"]>>>,
]

type _Documents = [
  Assert<Extends<FirstArg<OfficialDocuments["add"]>, DocumentAddParams>>,
  Assert<Extends<DocumentAddResponse, AwaitedReturn<OfficialDocuments["add"]>>>,
  Assert<Extends<FirstArg<OfficialDocuments["batchAdd"]>, DocumentBatchAddParams>>,
  Assert<
    Extends<DocumentBatchAddResponse, AwaitedReturn<OfficialDocuments["batchAdd"]>>
  >,
  Assert<Extends<SecondArg<OfficialDocuments["update"]>, DocumentUpdateParams>>,
  Assert<Extends<DocumentUpdateResponse, AwaitedReturn<OfficialDocuments["update"]>>>,
  Assert<Extends<FirstArg<OfficialDocuments["list"]>, DocumentListParams>>,
  Assert<Extends<DocumentListResponse, AwaitedReturn<OfficialDocuments["list"]>>>,
  Assert<Extends<DocumentGetResponse, AwaitedReturn<OfficialDocuments["get"]>>>,
  Assert<
    Extends<
      DocumentListProcessingResponse,
      AwaitedReturn<OfficialDocuments["listProcessing"]>
    >
  >,
  Assert<Extends<FirstArg<OfficialDocuments["deleteBulk"]>, DocumentDeleteBulkParams>>,
  Assert<
    Extends<DocumentDeleteBulkResponse, AwaitedReturn<OfficialDocuments["deleteBulk"]>>
  >,
  Assert<Extends<FirstArg<OfficialDocuments["uploadFile"]>, DocumentUploadFileParams>>,
  Assert<
    Extends<DocumentUploadFileResponse, AwaitedReturn<OfficialDocuments["uploadFile"]>>
  >,
]

type _Search = [
  Assert<Extends<FirstArg<OfficialSearch["documents"]>, SearchDocumentsParams>>,
  Assert<Extends<SearchDocumentsResponse, AwaitedReturn<OfficialSearch["documents"]>>>,
  Assert<Extends<FirstArg<OfficialSearch["execute"]>, SearchExecuteParams>>,
  Assert<Extends<SearchExecuteResponse, AwaitedReturn<OfficialSearch["execute"]>>>,
  Assert<Extends<FirstArg<OfficialSearch["memories"]>, SearchMemoriesParams>>,
  Assert<Extends<SearchMemoriesResponse, AwaitedReturn<OfficialSearch["memories"]>>>,
]

type _Memories = [
  Assert<Extends<FirstArg<OfficialMemories["forget"]>, MemoryForgetParams>>,
  Assert<Extends<MemoryForgetResponse, AwaitedReturn<OfficialMemories["forget"]>>>,
  Assert<Extends<FirstArg<OfficialMemories["updateMemory"]>, MemoryUpdateMemoryParams>>,
  Assert<
    Extends<MemoryUpdateMemoryResponse, AwaitedReturn<OfficialMemories["updateMemory"]>>
  >,
]

declare const memsdkClient: SupermemoryInterface

await memsdkClient.add({ content: "hello" })
await memsdkClient.documents.add({ content: "hello" })
await memsdkClient.documents.uploadFile({ file: new File(["hello"], "hello.txt") })
await memsdkClient.search.documents({ q: "hello" })
await memsdkClient.search.execute({ q: "hello" })
await memsdkClient.search.memories({ q: "hello" })
await memsdkClient.memories.forget({ containerTag: "user_123", content: "hello" })
await memsdkClient.memories.updateMemory({
  containerTag: "user_123",
  content: "hello",
  newContent: "updated",
})
