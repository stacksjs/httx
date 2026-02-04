# Error Handling

httx uses Result types for explicit error handling without exceptions.

## Result Type

All requests return a `Result` type:

```typescript
type Result<T, E> = Ok<T> | Err<E>

interface Ok<T> {
  isOk: true
  isErr: false
  value: T
}

interface Err<E> {
  isOk: false
  isErr: true
  error: E
}
```

## Basic Error Handling

```typescript
const result = await client.request('/users', { method: 'GET' })

if (result.isOk) {
  // Handle success
  console.log(result.value.data)
} else {
  // Handle error
  console.error(result.error.message)
}
```

## Error Types

### HttxResponseError

Thrown for HTTP error responses (4xx, 5xx):

```typescript
import { HttxResponseError } from '@stacksjs/httx'

if (result.isErr) {
  const error = result.error

  if (error instanceof HttxResponseError) {
    console.log('Status:', error.statusCode)
    console.log('Status Text:', error.statusText)
    console.log('Method:', error.method)
    console.log('URL:', error.url)
    console.log('Response Body:', error.body)
  }
}
```

#### Properties

| Property | Type | Description |
|----------|------|-------------|
| `statusCode` | `number` | HTTP status code |
| `statusText` | `string` | HTTP status text |
| `method` | `string` | Request method |
| `url` | `string` | Request URL |
| `body` | `unknown` | Response body |
| `message` | `string` | Error message |

### HttxTimeoutError

Thrown when request exceeds timeout:

```typescript
import { HttxTimeoutError } from '@stacksjs/httx'

if (result.isErr) {
  const error = result.error

  if (error instanceof HttxTimeoutError) {
    console.log('Timeout:', error.timeout, 'ms')
    console.log('Method:', error.method)
    console.log('URL:', error.url)
  }
}
```

#### Properties

| Property | Type | Description |
|----------|------|-------------|
| `timeout` | `number` | Timeout value in ms |
| `method` | `string` | Request method |
| `url` | `string` | Request URL |
| `message` | `string` | Error message |

### HttxNetworkError

Thrown for network-level failures:

```typescript
import { HttxNetworkError } from '@stacksjs/httx'

if (result.isErr) {
  const error = result.error

  if (error instanceof HttxNetworkError) {
    console.log('Message:', error.message)
    console.log('Method:', error.method)
    console.log('URL:', error.url)
    console.log('Cause:', error.cause)
  }
}
```

#### Properties

| Property | Type | Description |
|----------|------|-------------|
| `message` | `string` | Error description |
| `method` | `string` | Request method |
| `url` | `string` | Request URL |
| `cause` | `Error` | Original error |

## Comprehensive Error Handling

```typescript
import {
  HttxClient,
  HttxNetworkError,
  HttxResponseError,
  HttxTimeoutError,
} from '@stacksjs/httx'

async function fetchData() {
  const result = await client.request('/api/data', { method: 'GET' })

  if (result.isErr) {
    const error = result.error

    if (error instanceof HttxResponseError) {
      // HTTP error response
      switch (error.statusCode) {
        case 400:
          console.error('Bad request:', error.body)
          break
        case 401:
          console.error('Unauthorized - please login')
          // Redirect to login
          break
        case 403:
          console.error('Forbidden - access denied')
          break
        case 404:
          console.error('Resource not found')
          break
        case 422:
          console.error('Validation error:', error.body)
          break
        case 429:
          console.error('Rate limited - try again later')
          break
        case 500:
          console.error('Server error')
          break
        default:
          console.error(`HTTP ${error.statusCode}:`, error.message)
      }
    } else if (error instanceof HttxTimeoutError) {
      // Request timeout
      console.error(`Request timed out after ${error.timeout}ms`)
    } else if (error instanceof HttxNetworkError) {
      // Network failure
      console.error('Network error:', error.message)
      // Check connectivity, retry, etc.
    } else {
      // Unknown error
      console.error('Unexpected error:', error)
    }

    return null
  }

  return result.value.data
}
```

## Error Handling Patterns

### Retry on Specific Errors

```typescript
async function fetchWithRetry<T>(
  url: string,
  maxRetries = 3
): Promise<T | null> {
  let lastError: Error | undefined

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    const result = await client.request<T>(url, { method: 'GET' })

    if (result.isOk) {
      return result.value.data
    }

    lastError = result.error

    // Only retry on specific errors
    if (result.error instanceof HttxResponseError) {
      const retryable = [408, 429, 500, 502, 503, 504]
      if (!retryable.includes(result.error.statusCode)) {
        break // Don't retry client errors
      }
    }

    // Wait before retry (exponential backoff)
    await new Promise(r => setTimeout(r, 1000 * Math.pow(2, attempt)))
  }

  console.error('All retries failed:', lastError)
  return null
}
```

### Typed Error Responses

```typescript
interface ApiError {
  code: string
  message: string
  details?: Record<string, string[]>
}

interface ValidationError extends ApiError {
  code: 'VALIDATION_ERROR'
  details: Record<string, string[]>
}

async function createUser(data: CreateUserInput) {
  const result = await client.request<User>('/users', {
    method: 'POST',
    json: true,
    body: data,
  })

  if (result.isErr && result.error instanceof HttxResponseError) {
    const apiError = result.error.body as ApiError

    if (apiError.code === 'VALIDATION_ERROR') {
      const validationError = apiError as ValidationError
      // Handle field-level validation errors
      for (const [field, errors] of Object.entries(validationError.details)) {
        console.error(`${field}: ${errors.join(', ')}`)
      }
    }
  }

  return result
}
```

### Error Aggregation

```typescript
async function batchFetch(urls: string[]) {
  const results = await Promise.all(
    urls.map(url => client.request(url, { method: 'GET' }))
  )

  const successes = results.filter(r => r.isOk)
  const failures = results.filter(r => r.isErr)

  if (failures.length > 0) {
    console.warn(`${failures.length} requests failed:`)
    failures.forEach(f => {
      if (f.isErr) {
        console.warn('-', f.error.message)
      }
    })
  }

  return successes.map(r => r.isOk ? r.value.data : null).filter(Boolean)
}
```

### Custom Error Handler

```typescript
type ErrorHandler = (error: Error) => void | Promise<void>

function createClientWithErrorHandler(handler: ErrorHandler) {
  const client = new HttxClient()

  return {
    async request<T>(url: string, options: RequestOptions) {
      const result = await client.request<T>(url, options)

      if (result.isErr) {
        await handler(result.error)
      }

      return result
    },
  }
}

// Usage
const client = createClientWithErrorHandler(async (error) => {
  // Log to monitoring service
  await logError(error)

  // Show notification
  if (error instanceof HttxNetworkError) {
    showToast('Network error - please check your connection')
  }
})
```

## Logging Errors

```typescript
function logError(error: Error, context?: Record<string, unknown>) {
  const errorInfo = {
    name: error.name,
    message: error.message,
    stack: error.stack,
    ...context,
  }

  if (error instanceof HttxResponseError) {
    Object.assign(errorInfo, {
      statusCode: error.statusCode,
      statusText: error.statusText,
      method: error.method,
      url: error.url,
      body: error.body,
    })
  } else if (error instanceof HttxTimeoutError) {
    Object.assign(errorInfo, {
      timeout: error.timeout,
      method: error.method,
      url: error.url,
    })
  }

  console.error('HTTP Error:', errorInfo)
}
```

## Next Steps

- [Response Handling](/api/response) - Handle successful responses
- [Retry Logic](/advanced/retry) - Configure automatic retries
- [Timeouts](/advanced/timeouts) - Configure timeout behavior
