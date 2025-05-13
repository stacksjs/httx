# Interfaces

The interfaces used throughout the Httx library.

## HttxConfig

```typescript
interface HttxConfig {
  verbose?: boolean | string[]
  defaultHeaders?: Record<string, string>
  baseUrl?: string
  timeout?: number
}
```

Configuration options for the HttxClient.

## RequestOptions

```typescript
interface RequestOptions {
  method: HttpMethod
  headers?: Record<string, string>
  body?: BodyInit | Record<string, string>
  query?: Record<string, string>
  timeout?: number
  json?: boolean
  form?: boolean
  multipart?: boolean
  verbose?: boolean
}
```

Options for individual requests.

## HttxResponse

```typescript
interface HttxResponse<T> {
  data: T
  status: number
  headers: Headers
  timing: {
    start: number
    end: number
    duration: number
  }
}
```

Response object containing the parsed data and metadata.

## Ok

```typescript
interface Ok<T> {
  isOk: () => true
  isErr: () => false
  value: T
}
```

Represents a successful result.

## Err

```typescript
interface Err<E> {
  isOk: () => false
  isErr: () => true
  error: E
}
```

Represents an error result.

## Examples

### Extending HttxConfig

```typescript
interface CustomConfig extends HttxConfig {
  retryCount: number
  retryDelay: number
}

class CustomClient extends HttxClient {
  constructor(config: CustomConfig) {
    super(config)
    this.retryCount = config.retryCount
    this.retryDelay = config.retryDelay
  }
}
```

### Custom Request Options

```typescript
interface CustomRequestOptions extends RequestOptions {
  retryOnError?: boolean
  cache?: boolean
}

class CustomClient extends HttxClient {
  async request<T>(url: string, options: CustomRequestOptions): Promise<Result<HttxResponse<T>, Error>> {
    if (options.retryOnError) {
      // Implement retry logic
    }
    if (options.cache) {
      // Implement caching logic
    }
    return super.request(url, options)
  }
}
```

### Custom Response Type

```typescript
interface CustomResponse<T> extends HttxResponse<T> {
  metadata: {
    cached: boolean
    retryCount: number
  }
}

class CustomClient extends HttxClient {
  async request<T>(url: string, options: RequestOptions): Promise<Result<CustomResponse<T>, Error>> {
    const result = await super.request<T>(url, options)
    if (result.isOk()) {
      return ok({
        ...result.value,
        metadata: {
          cached: false,
          retryCount: 0
        }
      })
    }
    return result
  }
}
```

### Type-Safe Error Handling

```typescript
interface ApiError extends Error {
  code: string
  status: number
}

interface CustomErr extends Err<ApiError> {
  isRetryable: () => boolean
}

class CustomClient extends HttxClient {
  async request<T>(url: string, options: RequestOptions): Promise<Result<HttxResponse<T>, ApiError>> {
    const result = await super.request<T>(url, options)
    if (result.isErr()) {
      const error = result.error as ApiError
      error.code = 'API_ERROR'
      error.status = 500
    }
    return result
  }
}
```
