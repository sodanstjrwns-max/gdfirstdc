// Cloudflare 바인딩 최소 타입 선언 (workers-types 미설치 환경 대응)
export interface D1Result<T = unknown> {
  results: T[]
  success: boolean
  meta: { last_row_id: number; changes: number }
}
export interface D1PreparedStatement {
  bind(...values: unknown[]): D1PreparedStatement
  first<T = unknown>(colName?: string): Promise<T | null>
  run<T = unknown>(): Promise<D1Result<T>>
  all<T = unknown>(): Promise<D1Result<T>>
}
export interface D1Database {
  prepare(query: string): D1PreparedStatement
  batch(statements: D1PreparedStatement[]): Promise<D1Result[]>
  exec(query: string): Promise<unknown>
}
export interface R2ObjectBody {
  body: ReadableStream
  httpMetadata?: { contentType?: string }
  writeHttpMetadata(headers: Headers): void
}
export interface R2Bucket {
  get(key: string): Promise<R2ObjectBody | null>
  put(key: string, value: ArrayBuffer | ReadableStream | string, options?: { httpMetadata?: { contentType?: string } }): Promise<unknown>
  delete(key: string): Promise<void>
}

export type Bindings = {
  DB: D1Database
  R2: R2Bucket
}

export type Variables = {
  user: { uid: number; name: string } | null
  isAdmin: boolean
}

export type AppEnv = { Bindings: Bindings; Variables: Variables }
