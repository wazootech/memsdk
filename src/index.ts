export interface APIPromise<T> extends Promise<T> {
  asResponse?: () => Promise<Response>
  withResponse?: () => Promise<{ data: T; response: Response }>
}

export type HeadersLike =
  | Headers
  | Record<string, string | null | undefined>
  | Array<[string, string]>

export type RequestOptions = {
  method?: string
  path?: string
  query?: object | undefined | null
  body?: unknown
  headers?: HeadersLike
  maxRetries?: number
  stream?: boolean | undefined
  timeout?: number
  fetchOptions?: RequestInit
  signal?: AbortSignal | undefined | null
  idempotencyKey?: string
  defaultBaseURL?: string | undefined
  __binaryResponse?: boolean | undefined
}

type FsReadStream = AsyncIterable<Uint8Array> & {
  path: string | { toString(): string }
}

interface BunFile extends Blob {
  readonly name?: string | undefined
}

export type Uploadable = File | Response | FsReadStream | BunFile

export type Metadata = {
  [key: string]: string | number | boolean | Array<string>
}

export type QueryFilter = {
  key: string
  value: string
  filterType?: "metadata" | "numeric" | "array_contains" | "string_contains"
  ignoreCase?: boolean | "true" | "false"
  negate?: boolean | "true" | "false"
  numericOperator?: ">" | "<" | ">=" | "<=" | "="
}

export type QueryExpression =
  | QueryFilter
  | { OR: Array<QueryExpression> }
  | { AND: Array<QueryExpression> }

export interface AddParams {
  content: string
  containerTag?: string
  /** @deprecated */
  containerTags?: Array<string>
  customId?: string
  entityContext?: string
  filepath?: string
  metadata?: Metadata
  taskType?: "memory" | "superrag"
}

export interface AddResponse {
  id: string
  status: string
}

export interface ProfileParams {
  containerTag: string
  filters?: QueryExpression
  q?: string
  threshold?: number
}

export interface ProfileResponse {
  profile: {
    dynamic: Array<string>
    static: Array<string>
  }
  searchResults?: {
    results: Array<unknown>
    timing: number
    total: number
  }
}

export interface DocumentUpdateParams {
  containerTag?: string
  /** @deprecated */
  containerTags?: Array<string>
  content?: string
  customId?: string
  filepath?: string
  metadata?: Metadata
  taskType?: "memory" | "superrag"
}

export interface DocumentUpdateResponse {
  id: string
  status: string
}

export interface DocumentListParams {
  /** @deprecated */
  containerTags?: Array<string>
  filepath?: string
  filters?: QueryExpression
  includeContent?: boolean
  limit?: string | number
  order?: "asc" | "desc"
  page?: string | number
  sort?: "createdAt" | "updatedAt"
}

export interface DocumentListResponse {
  memories: Array<DocumentListMemory>
  pagination: {
    currentPage: number
    totalItems: number
    totalPages: number
    limit?: number
  }
}

export interface DocumentListMemory {
  id: string
  connectionId: string | null
  createdAt: string
  customId: string | null
  filepath: string | null
  metadata: string | number | boolean | Record<string, unknown> | Array<unknown> | null
  status:
    | "unknown"
    | "queued"
    | "extracting"
    | "chunking"
    | "embedding"
    | "indexing"
    | "done"
    | "failed"
  summary: string | null
  title: string | null
  type: DocumentType
  updatedAt: string
  /** @deprecated */
  containerTags?: Array<string>
  content?: string
  url?: string | null
}

export type DocumentType =
  | "text"
  | "pdf"
  | "tweet"
  | "google_doc"
  | "google_slide"
  | "google_sheet"
  | "image"
  | "video"
  | "audio"
  | "notion_doc"
  | "webpage"
  | "onedrive"
  | "github_markdown"

export interface DocumentAddParams extends AddParams {}

export interface DocumentAddResponse extends AddResponse {}

export interface DocumentBatchAddParams extends Omit<AddParams, "content"> {
  documents: Array<AddParams> | Array<string>
  content?: null
}

export interface DocumentBatchAddResponse {
  failed: number
  results: Array<{
    id: string
    status: string
    details?: string
    error?: string
  }>
  success: number
}

export interface DocumentDeleteBulkParams {
  ids?: Array<string>
  containerTags?: Array<string>
}

export interface DocumentDeleteBulkResponse {
  deletedCount: number
  success: boolean
  /** @deprecated */
  containerTags?: Array<string>
  errors?: Array<{ id: string; error: string }>
}

export interface DocumentGetResponse {
  id: string
  connectionId: string | null
  content: string | null
  createdAt: string
  customId: string | null
  filepath: string | null
  metadata: string | number | boolean | Record<string, unknown> | Array<unknown> | null
  ogImage: string | null
  raw: unknown
  source: string | null
  spatialPoint: unknown
  status:
    | "unknown"
    | "queued"
    | "extracting"
    | "chunking"
    | "embedding"
    | "indexing"
    | "done"
    | "failed"
  summary: string | null
  taskType: "memory" | "superrag"
  title: string | null
  type: DocumentType
  updatedAt: string
  /** @deprecated */
  containerTags?: Array<string>
  url?: string | null
}

export interface DocumentListProcessingResponse {
  documents: Array<DocumentListMemory>
  totalCount: number
}

export interface DocumentUploadFileParams {
  file: Uploadable
  containerTag?: string
  /** @deprecated */
  containerTags?: string
  filepath?: string
  fileType?: string
  metadata?: string
  mimeType?: string
  taskType?: "memory" | "superrag"
  /** @deprecated */
  useAdvancedProcessing?: string
}

export interface DocumentUploadFileResponse extends AddResponse {}

export interface SearchDocumentsParams {
  q: string
  /** @deprecated */
  categoriesFilter?: Array<string>
  chunkThreshold?: number
  containerTag?: string
  containerTags?: Array<string>
  docId?: string
  /** @deprecated */
  documentThreshold?: number
  filepath?: string
  filters?: QueryExpression
  includeFullDocs?: boolean
  includeSummary?: boolean
  limit?: number
  onlyMatchingChunks?: boolean
  rerank?: boolean
  rewriteQuery?: boolean
}

export interface SearchExecuteParams extends SearchDocumentsParams {}

export interface SearchDocumentsResponse {
  results: Array<SearchDocumentResult>
  timing: number
  total: number
}

export interface SearchExecuteResponse extends SearchDocumentsResponse {}

export interface SearchDocumentResult {
  chunks: Array<{ content: string; isRelevant: boolean; score: number }>
  createdAt: string
  documentId: string
  metadata: Record<string, unknown> | null
  score: number
  title: string | null
  type: string | null
  updatedAt: string
  content?: string | null
  summary?: string | null
}

export interface SearchMemoriesParams {
  q: string
  aggregate?: boolean
  containerTag?: string
  filepath?: string
  filters?: QueryExpression
  include?: {
    documents?: boolean
    summaries?: boolean
    relatedMemories?: boolean
    chunks?: boolean
  }
  limit?: number
  rerank?: boolean
  rewriteQuery?: boolean
  searchMode?: "memories" | "hybrid" | "documents"
  threshold?: number
}

export interface SearchMemoriesResponse {
  results: Array<SearchMemoryResult>
  timing: number
  total: number
}

export interface SearchMemoryResult {
  id: string
  metadata: Record<string, unknown> | null
  similarity: number
  updatedAt: string
  chunk?: string
  chunks?: Array<{
    content: string
    documentId: string
    position: number
    score: number
  }>
  context?: {
    children?: Array<SearchMemoryContext>
    parents?: Array<SearchMemoryContext>
    related?: Array<SearchMemoryRelatedContext>
  }
  documents?: Array<{
    id: string
    createdAt: string
    updatedAt: string
    metadata?: Record<string, unknown> | null
    summary?: string | null
    title?: string
    type?: string
  }>
  filepath?: string | null
  isAggregated?: boolean
  memory?: string
  version?: number | null
}

export interface SearchMemoryContext {
  memory: string
  relation: "updates" | "extends" | "derives"
  updatedAt: string
  metadata?: Record<string, unknown> | null
  version?: number | null
}

export interface SearchMemoryRelatedContext {
  memory: string
  relation: "extends" | "derives"
  updatedAt: string
  metadata?: Record<string, unknown> | null
}

export interface MemoryForgetParams {
  containerTag: string
  id?: string
  content?: string
  reason?: string
}

export interface MemoryForgetResponse {
  id: string
  forgotten: boolean
}

export interface MemoryUpdateMemoryParams {
  containerTag: string
  newContent: string
  id?: string
  content?: string
  forgetAfter?: string | null
  forgetReason?: string | null
  metadata?: Metadata
  temporalContext?: {
    documentDate?: string | null
    eventDate?: Array<string> | null
  }
}

export interface MemoryUpdateMemoryResponse {
  id: string
  createdAt: string
  forgetAfter: string | null
  forgetReason: string | null
  memory: string
  parentMemoryId: string | null
  rootMemoryId: string | null
  version: number
}

export interface SupermemoryDocumentsInterface {
  update(
    id: string,
    body: DocumentUpdateParams,
    options?: RequestOptions,
  ): APIPromise<DocumentUpdateResponse>
  list(
    body: DocumentListParams,
    options?: RequestOptions,
  ): APIPromise<DocumentListResponse>
  delete(id: string, options?: RequestOptions): APIPromise<void>
  add(
    body: DocumentAddParams,
    options?: RequestOptions,
  ): APIPromise<DocumentAddResponse>
  batchAdd(
    body: DocumentBatchAddParams,
    options?: RequestOptions,
  ): APIPromise<DocumentBatchAddResponse>
  deleteBulk(
    body: DocumentDeleteBulkParams,
    options?: RequestOptions,
  ): APIPromise<DocumentDeleteBulkResponse>
  get(id: string, options?: RequestOptions): APIPromise<DocumentGetResponse>
  listProcessing(options?: RequestOptions): APIPromise<DocumentListProcessingResponse>
  uploadFile(
    body: DocumentUploadFileParams,
    options?: RequestOptions,
  ): APIPromise<DocumentUploadFileResponse>
}

export interface SupermemorySearchInterface {
  documents(
    body: SearchDocumentsParams,
    options?: RequestOptions,
  ): APIPromise<SearchDocumentsResponse>
  execute(
    body: SearchExecuteParams,
    options?: RequestOptions,
  ): APIPromise<SearchExecuteResponse>
  memories(
    body: SearchMemoriesParams,
    options?: RequestOptions,
  ): APIPromise<SearchMemoriesResponse>
}

export interface SupermemoryMemoriesInterface {
  forget(
    body: MemoryForgetParams,
    options?: RequestOptions,
  ): APIPromise<MemoryForgetResponse>
  updateMemory(
    body: MemoryUpdateMemoryParams,
    options?: RequestOptions,
  ): APIPromise<MemoryUpdateMemoryResponse>
}

export interface SupermemoryInterface {
  add(body: AddParams, options?: RequestOptions): APIPromise<AddResponse>
  profile(
    body: ProfileParams,
    options?: RequestOptions,
  ): APIPromise<ProfileResponse>
  documents: SupermemoryDocumentsInterface
  search: SupermemorySearchInterface
  memories: SupermemoryMemoriesInterface
}

export const supermemoryCompatibility = {
  openapiSource: "https://api.supermemory.ai/v3/openapi",
  openapiVersion: "3.0.0",
  sdkPackage: "supermemory@4.24.12",
  sdkGitHead: "6cfb1ac4d06e7014a49c2a8f1882e6a7404c2b1f",
} as const
