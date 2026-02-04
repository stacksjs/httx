# Advanced Usage

This section covers advanced httx features and patterns.

## Topics

- [Retry Logic](/advanced/retry) - Automatic request retries
- [Streaming](/advanced/streaming) - Handle streaming responses
- [Timeouts](/advanced/timeouts) - Configure timeout behavior

## Advanced Patterns

### Request Interceptors

Create a wrapper to intercept all requests:

```typescript
import { HttxClient, type RequestOptions, type HttxResponse } from '@stacksjs/httx'

class InterceptedClient {
  private client: HttxClient

  constructor(config?: Partial<HttxConfig>) {
    this.client = new HttxClient(config)
  }

  async request<T>(url: string, options: RequestOptions) {
    // Before request
    console.log(`[Request] ${options.method} ${url}`)
    const start = performance.now()

    const result = await this.client.request<T>(url, options)

    // After request
    const duration = performance.now() - start
    if (result.isOk) {
      console.log(`[Response] ${result.value.status} in ${duration.toFixed(2)}ms`)
    } else {
      console.log(`[Error] ${result.error.message} in ${duration.toFixed(2)}ms`)
    }

    return result
  }
}
```

### Token Refresh

Automatically refresh expired tokens:

```typescript
class AuthenticatedClient {
  private client: HttxClient
  private accessToken: string
  private refreshToken: string

  constructor(accessToken: string, refreshToken: string) {
    this.accessToken = accessToken
    this.refreshToken = refreshToken
    this.client = new HttxClient({
      baseUrl: 'https://api.example.com',
    })
  }

  async request<T>(url: string, options: RequestOptions) {
    // Add auth header
    options.headers = {
      ...options.headers,
      'Authorization': `Bearer ${this.accessToken}`,
    }

    const result = await this.client.request<T>(url, options)

    // Check for auth error
    if (result.isErr && result.error instanceof HttxResponseError) {
      if (result.error.statusCode === 401) {
        // Try to refresh token
        const refreshed = await this.refreshAccessToken()
        if (refreshed) {
          // Retry with new token
          options.headers['Authorization'] = `Bearer ${this.accessToken}`
          return this.client.request<T>(url, options)
        }
      }
    }

    return result
  }

  private async refreshAccessToken(): Promise<boolean> {
    const result = await this.client.request<{ accessToken: string }>('/auth/refresh', {
      method: 'POST',
      json: true,
      body: { refreshToken: this.refreshToken },
    })

    if (result.isOk) {
      this.accessToken = result.value.data.accessToken
      return true
    }

    return false
  }
}
```

### Request Queue

Limit concurrent requests:

```typescript
class QueuedClient {
  private client: HttxClient
  private queue: Array<() => Promise<void>> = []
  private running = 0
  private maxConcurrent = 5

  constructor(config?: Partial<HttxConfig>) {
    this.client = new HttxClient(config)
  }

  async request<T>(url: string, options: RequestOptions) {
    return new Promise<Result<HttxResponse<T>, Error>>((resolve) => {
      const run = async () => {
        this.running++
        try {
          const result = await this.client.request<T>(url, options)
          resolve(result)
        } finally {
          this.running--
          this.processQueue()
        }
      }

      if (this.running < this.maxConcurrent) {
        run()
      } else {
        this.queue.push(run)
      }
    })
  }

  private processQueue() {
    while (this.running < this.maxConcurrent && this.queue.length > 0) {
      const next = this.queue.shift()
      if (next) next()
    }
  }
}
```

### Caching

Implement request caching:

```typescript
class CachedClient {
  private client: HttxClient
  private cache = new Map<string, { data: unknown; expires: number }>()

  constructor(config?: Partial<HttxConfig>) {
    this.client = new HttxClient(config)
  }

  async request<T>(url: string, options: RequestOptions & { cacheTTL?: number }) {
    // Only cache GET requests
    if (options.method === 'GET') {
      const cacheKey = this.getCacheKey(url, options)
      const cached = this.cache.get(cacheKey)

      if (cached && cached.expires > Date.now()) {
        return { isOk: true, value: { data: cached.data as T } }
      }
    }

    const result = await this.client.request<T>(url, options)

    // Cache successful GET responses
    if (result.isOk && options.method === 'GET' && options.cacheTTL) {
      const cacheKey = this.getCacheKey(url, options)
      this.cache.set(cacheKey, {
        data: result.value.data,
        expires: Date.now() + options.cacheTTL,
      })
    }

    return result
  }

  private getCacheKey(url: string, options: RequestOptions): string {
    const query = options.query ? JSON.stringify(options.query) : ''
    return `${url}:${query}`
  }

  clearCache() {
    this.cache.clear()
  }
}
```

### Request Batching

Batch multiple requests:

```typescript
interface BatchRequest<T> {
  url: string
  options: RequestOptions
  resolve: (result: Result<HttxResponse<T>, Error>) => void
}

class BatchedClient {
  private client: HttxClient
  private batch: BatchRequest<unknown>[] = []
  private batchTimer: Timer | null = null
  private batchDelay = 50 // ms

  constructor(config?: Partial<HttxConfig>) {
    this.client = new HttxClient(config)
  }

  async request<T>(url: string, options: RequestOptions) {
    return new Promise<Result<HttxResponse<T>, Error>>((resolve) => {
      this.batch.push({ url, options, resolve })

      if (!this.batchTimer) {
        this.batchTimer = setTimeout(() => this.executeBatch(), this.batchDelay)
      }
    })
  }

  private async executeBatch() {
    const requests = [...this.batch]
    this.batch = []
    this.batchTimer = null

    await Promise.all(
      requests.map(async ({ url, options, resolve }) => {
        const result = await this.client.request(url, options)
        resolve(result)
      })
    )
  }
}
```

## Performance Optimization

### Connection Pooling

Bun automatically manages connection pooling, but you can optimize:

```typescript
// Reuse client instances
const client = new HttxClient({
  baseUrl: 'https://api.example.com',
})

// Don't create new clients per request
async function fetchData() {
  // Good: reuse client
  return client.request('/data', { method: 'GET' })
}

// Bad: creates new client each time
async function fetchDataBad() {
  const newClient = new HttxClient()
  return newClient.request('/data', { method: 'GET' })
}
```

### Parallel Requests

```typescript
// Execute requests in parallel
const [users, posts, comments] = await Promise.all([
  client.request<User[]>('/users', { method: 'GET' }),
  client.request<Post[]>('/posts', { method: 'GET' }),
  client.request<Comment[]>('/comments', { method: 'GET' }),
])
```

### Request Deduplication

```typescript
class DedupedClient {
  private client: HttxClient
  private pending = new Map<string, Promise<Result<HttxResponse<unknown>, Error>>>()

  constructor(config?: Partial<HttxConfig>) {
    this.client = new HttxClient(config)
  }

  async request<T>(url: string, options: RequestOptions) {
    // Only dedupe GET requests
    if (options.method !== 'GET') {
      return this.client.request<T>(url, options)
    }

    const key = `${url}:${JSON.stringify(options.query || {})}`

    // Return pending request if exists
    if (this.pending.has(key)) {
      return this.pending.get(key) as Promise<Result<HttxResponse<T>, Error>>
    }

    // Create new request
    const promise = this.client.request<T>(url, options)
    this.pending.set(key, promise)

    promise.finally(() => {
      this.pending.delete(key)
    })

    return promise
  }
}
```

## Next Steps

- [Retry Logic](/advanced/retry) - Configure retries
- [Streaming](/advanced/streaming) - Stream responses
- [Timeouts](/advanced/timeouts) - Timeout patterns
