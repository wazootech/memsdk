export type RawResponse = {
  readonly headers: Headers
  readonly redirected: boolean
  readonly status: number
  readonly statusText: string
  readonly type: ResponseType
  readonly url: string
}

export interface WithRawResponse<T> {
  readonly data: T
  readonly rawResponse: RawResponse
}

export interface APIPromise<T> extends Promise<T> {
  withRawResponse?: () => Promise<WithRawResponse<T>>
}

export type Supplier<T> = T | Promise<T> | (() => T | Promise<T>)

export type RequestOptions = {
  timeoutInSeconds?: number
  maxRetries?: number
  abortSignal?: AbortSignal
  queryParams?: Record<string, unknown>
  additionalBodyParameters?: Record<string, unknown>
  headers?: Record<
    string,
    string | Supplier<string | null | undefined> | null | undefined
  >
  stream?: {
    reconnectionEnabled?: boolean
    maxReconnectionAttempts?: number
  }
}

export type UploadableFileLike =
  | ArrayBuffer
  | ArrayBufferLike
  | ArrayBufferView
  | Uint8Array
  | Blob
  | File
  | ReadableStream

export type Uploadable =
  | UploadableFileLike
  | {
      path: string
      filename?: string
      contentType?: string
      contentLength?: number
    }
  | {
      data: UploadableFileLike
      filename?: string
      contentType?: string
      contentLength?: number
    }

export type MetadataValue = string | number | boolean | Array<string>

export type Metadata = Record<string, MetadataValue>

export type TaskType = "memory" | "superrag"

export type Dreaming = "dynamic" | "instant"

export type FileType = "text" | "pdf" | "image" | "video" | "audio"

export type ProcessingStatus =
  | "unknown"
  | "queued"
  | "extracting"
  | "chunking"
  | "embedding"
  | "indexing"
  | "done"
  | "failed"

export type FilterPredicate =
  | {
      field: string
      operator: "eq" | "neq"
      value: string
      caseSensitive?: boolean | undefined
    }
  | { field: string; operator: "eq" | "neq"; value: number | boolean }
  | { field: string; operator: "gt" | "gte" | "lt" | "lte"; value: number }
  | {
      field: string
      operator: "contains" | "notContains"
      value: string
      caseSensitive?: boolean | undefined
    }
  | { field: string; operator: "arrayContains" | "arrayNotContains"; value: string }

export type FilterExpression =
  | FilterPredicate
  | { operator: "and"; operands: Array<FilterExpression> }
  | { operator: "or"; operands: Array<FilterExpression> }

export type SystemTimestamps = {
  createdAt: string
  updatedAt: string
}

export type MemoryRelation = "updates" | "extends" | "derives"

export interface IncludedDocument {
  id: string
  title: string | null
  type: string | null
  metadata: Record<string, unknown>
  summary: string | null
  system: SystemTimestamps
}

export interface RelatedMemory {
  id: string
  relation: MemoryRelation
  version?: number | null | undefined
  memory: string
  metadata: Record<string, unknown>
  system: { updatedAt: string }
}

export interface IncludedContext<TRelated> {
  related?:
    | {
        parents: Array<TRelated>
        children: Array<TRelated>
        siblings: Array<TRelated>
      }
    | undefined
  document?: IncludedDocument | undefined
}

export interface MemoryRecord {
  id: string
  memory: string
  metadata: Record<string, unknown>
  isStatic: boolean
  isInference: boolean
  isLatest: boolean
  isForgotten: boolean
  version: number
  system: SystemTimestamps
}

export interface ChunkRecord {
  id: string
  position: number
  content: string
  type: string
  metadata: Record<string, unknown>
  system: { createdAt: string }
}

export interface Pagination {
  currentPage: number
  limit?: number | undefined
  totalItems: number
  totalPages: number
}

export interface AddParams {
  content: string
  id?: string
  supportingContext?: string
  metadata?: Metadata
  group?: Record<string, MetadataValue>
  date?: string
  taskType?: TaskType
  dreaming?: Dreaming
}

export interface AddResponse {
  id: string
  status: ProcessingStatus
}

export type SearchMode = "hybrid" | "memories" | "chunks"

export type Rerank = "none" | "order" | "aggregate"

export interface SearchParams {
  query: string
  filter?: FilterExpression
  searchMode?: SearchMode
  limit?: number
  include?: {
    documents?: boolean | undefined
    related?: boolean | undefined
    forgotten?: boolean | undefined
  }
  threshold?: number
  rerank?: Rerank
  rewriteQuery?: boolean
}

export interface SearchResult {
  id: string
  memory?: string | undefined
  chunk?: string | undefined
  metadata: Record<string, unknown>
  similarity: number
  isLatest: boolean
  isInference: boolean
  system: { updatedAt: string; createdAt?: string | undefined }
  included?: IncludedContext<RelatedMemory> | undefined
}

export interface SearchResponse {
  results: Array<SearchResult>
  searchTime: number
}

export interface ProfileParams {
  filter?: FilterExpression
  buckets?: Array<string>
}

export interface ProfileMemory {
  id: string
  memory: string
}

export interface ProfileResponse {
  profile: {
    static: Array<ProfileMemory>
    dynamic: Array<ProfileMemory>
    buckets: Record<string, Array<ProfileMemory>>
  }
}

export type ListType = "documents" | "chunks" | "memories"

export interface ListParams {
  page?: number
  limit?: number
  sort?: "createdAt" | "updatedAt" | "position"
  order?: "asc" | "desc"
  filter?: FilterExpression
  include?: { forgotten?: boolean | undefined }
}

export interface ListDocument {
  id: string
  title: string | null
  type: string
  summary: string | null
  metadata: Record<string, unknown>
  url: string | null
  system: SystemTimestamps & { status: string }
}

export interface ListChunk extends ChunkRecord {
  documentId: string
}

export interface ListResponse {
  documents: Array<ListDocument>
  chunks: Array<ListChunk>
  memories: Array<MemoryRecord>
  pagination: Pagination
}

export interface DocumentGetParams {
  include?: DocumentInclude | Array<DocumentInclude>
}

export type DocumentInclude = "chunks" | "memories"

export interface DocumentGetResponse {
  id: string
  title: string | null
  type: string
  summary: string | null
  content: string | null
  metadata: Record<string, unknown>
  system: SystemTimestamps & { status: ProcessingStatus }
  chunks?: Array<ChunkRecord> | undefined
  memories?: Array<MemoryRecord> | undefined
}

export interface DocumentUpdateParams {
  content?: string
  supportingContext?: string
  metadata?: Metadata
  group?: Record<string, MetadataValue>
  date?: string
  taskType?: TaskType
  dreaming?: Dreaming
}

export interface DocumentUpdateResponse {
  id: string
  status: ProcessingStatus
}

export interface DocumentDeleteParams {
  ids: Array<string>
}

export interface DocumentDeleteResponse {
  count: number
  errors: Array<{ id: string; error: string }>
}

export interface DocumentBatchAddParams {
  documents: Array<{
    content: string
    id?: string | undefined
    supportingContext?: string | undefined
    metadata?: Metadata | undefined
    group?: Record<string, MetadataValue> | undefined
    date?: string | undefined
  }>
  taskType?: TaskType
  dreaming?: Dreaming
}

export interface DocumentBatchAddResponse {
  results: Array<{
    id: string
    status: ProcessingStatus | "error"
    error?: string | undefined
    details?: string | undefined
    url?: string | undefined
  }>
  count: number
  failed: number
}

/** Multipart form fields: `metadata` and `group` are JSON-encoded strings. */
export interface DocumentFileParams {
  supportingContext?: string
  metadata?: string
  group?: string
  date?: string
  taskType?: TaskType
  dreaming?: Dreaming
  fileType?: FileType
  mimeType?: string
}

export interface DocumentUploadFileParams extends DocumentFileParams {
  file: Uploadable
}

export interface DocumentReplaceWithFileParams extends DocumentFileParams {
  file: Uploadable
}

export interface DocumentUpdateFileParams extends DocumentFileParams {
  file?: Uploadable | undefined
}

export interface DocumentFileResponse {
  id: string
  status: ProcessingStatus
}

export type MemoryInclude = "related" | "documents"

export interface MemoryGetParams {
  include?: MemoryInclude | Array<MemoryInclude>
  relatedLimit?: number
}

export interface MemoryGetResponse extends MemoryRecord {
  included?:
    | IncludedContext<RelatedMemory & { document?: IncludedDocument | undefined }>
    | undefined
}

export interface MemoryForgetParams {
  ids: Array<string>
}

export interface MemoryForgetMatchingParams {
  query: string
  dryRun: boolean
}

export interface MemoryForgetResponse {
  count: number
  errors: Array<{ id: string; error: string }>
  matches: Array<ProfileMemory>
}

export interface ProfileBucketsResponse {
  buckets: Record<string, string>
}

export interface NamespaceListParams {
  page?: number
  limit?: number
}

export interface NamespaceListResponse {
  namespaces: Array<{
    id: string
    namespace: string
    documentCount: number
    memoryCount: number
    description: string | null
    system: SystemTimestamps
  }>
  pagination: Pagination
}

export interface NamespaceResponse {
  namespace: string
  supportingContext: string | null
  system: SystemTimestamps
}

export interface NamespaceUpdateParams {
  supportingContext?: string | null
}

export interface NamespaceDeleteParams {
  moveTo?: string
}

export type NamespaceDeleteResponse =
  | {
      status: "deleted"
      namespace: string
      deletedDocumentsCount: number
      deletedMemoriesCount: number
    }
  | { status: "queued"; operationId: string; namespace: string; moveTo: string }

export interface SupermemoryDocumentsInterface {
  get(
    namespace: string,
    id: string,
    request?: DocumentGetParams,
    options?: RequestOptions,
  ): APIPromise<DocumentGetResponse>
  update(
    namespace: string,
    id: string,
    request?: DocumentUpdateParams,
    options?: RequestOptions,
  ): APIPromise<DocumentUpdateResponse>
  delete(
    namespace: string,
    request: DocumentDeleteParams,
    options?: RequestOptions,
  ): APIPromise<DocumentDeleteResponse>
  batchAdd(
    namespace: string,
    request: DocumentBatchAddParams,
    options?: RequestOptions,
  ): APIPromise<DocumentBatchAddResponse>
  uploadFile(
    namespace: string,
    request: DocumentUploadFileParams,
    options?: RequestOptions,
  ): APIPromise<DocumentFileResponse>
}

/** Optional: file replacement on existing documents. Not required by `SupermemoryInterface`. */
export interface SupermemoryDocumentFilesInterface {
  replaceWithFile(
    namespace: string,
    id: string,
    request: DocumentReplaceWithFileParams,
    options?: RequestOptions,
  ): APIPromise<DocumentFileResponse>
  updateFile(
    namespace: string,
    id: string,
    request: DocumentUpdateFileParams,
    options?: RequestOptions,
  ): APIPromise<DocumentFileResponse>
}

export interface SupermemoryMemoriesInterface {
  get(
    namespace: string,
    id: string,
    request?: MemoryGetParams,
    options?: RequestOptions,
  ): APIPromise<MemoryGetResponse>
  forget(
    namespace: string,
    request: MemoryForgetParams,
    options?: RequestOptions,
  ): APIPromise<MemoryForgetResponse>
  forgetMatching(
    namespace: string,
    request: MemoryForgetMatchingParams,
    options?: RequestOptions,
  ): APIPromise<MemoryForgetResponse>
}

/** Optional: profile bucket configuration. Not required by `SupermemoryInterface`. */
export interface SupermemoryProfilesInterface {
  getBuckets(
    namespace: string,
    request?: Record<string, never>,
    options?: RequestOptions,
  ): APIPromise<ProfileBucketsResponse>
  setBuckets(
    namespace: string,
    request: { buckets: Record<string, string> },
    options?: RequestOptions,
  ): APIPromise<ProfileBucketsResponse>
  deleteBuckets(
    namespace: string,
    request: { buckets: Array<string> },
    options?: RequestOptions,
  ): APIPromise<ProfileBucketsResponse>
}

/** Optional: namespace administration. Not required by `SupermemoryInterface`. */
export interface SupermemoryNamespacesInterface {
  list(
    request?: NamespaceListParams,
    options?: RequestOptions,
  ): APIPromise<NamespaceListResponse>
  get(
    namespace: string,
    request?: Record<string, never>,
    options?: RequestOptions,
  ): APIPromise<NamespaceResponse>
  update(
    namespace: string,
    request?: NamespaceUpdateParams,
    options?: RequestOptions,
  ): APIPromise<NamespaceResponse>
  delete(
    namespace: string,
    request?: NamespaceDeleteParams,
    options?: RequestOptions,
  ): APIPromise<NamespaceDeleteResponse>
}

export interface SupermemoryInterface {
  add(
    namespace: string,
    request: AddParams,
    options?: RequestOptions,
  ): APIPromise<AddResponse>
  search(
    namespace: string,
    request: SearchParams,
    options?: RequestOptions,
  ): APIPromise<SearchResponse>
  profile(
    namespace: string,
    request?: ProfileParams,
    options?: RequestOptions,
  ): APIPromise<ProfileResponse>
  /** The profile as a markdown document (`Accept: text/markdown`). */
  profileMarkdown(
    namespace: string,
    request?: ProfileParams,
    options?: RequestOptions,
  ): Promise<string>
  list(
    namespace: string,
    type: ListType,
    request?: ListParams,
    options?: RequestOptions,
  ): APIPromise<ListResponse>
  documents: SupermemoryDocumentsInterface
  memories: SupermemoryMemoriesInterface
}

export const supermemoryCompatibility = {
  openapiSource: "https://api.supermemory.ai/v5/openapi",
  openapiVersion: "3.1.0",
  sdkPackage: "supermemory@5.0.1",
  sdkGitHead: "0ec1ac77e0d35a0b9440a08b2d2331f43fcc56ba",
} as const
