# Timeouts

Configure timeout behavior for httx requests.

## Basic Configuration

### Client-Level Timeout

```typescript
const client = new HttxClient({
  timeout: 30000, // 30 seconds for all requests
})
```

### Request-Level Timeout

```typescript
// Override for specific request
await client.request('/slow-endpoint', {
  method: 'GET',
  timeout: 120000, // 2 minutes for this request
})
```

## Timeout Behavior

When a timeout occurs:

1. Request is aborted
2. `HttxTimeoutError` is returned in Result
3. No retry is attempted (by default)

```typescript
const result = await client.request('/api/data', {
  method: 'GET',
  timeout: 5000,
})

if (result.isErr && result.error instanceof HttxTimeoutError) {
  console.log(`Request timed out after ${result.error.timeout}ms`)
  console.log(`URL: ${result.error.url}`)
  console.log(`Method: ${result.error.method}`)
}
```

## Timeout Patterns

### Different Timeouts by Operation

```typescript
const client = new HttxClient({
  baseUrl: 'https://api.example.com',
  timeout: 30000, // Default 30 seconds
})

// Quick health check
await client.request('/health', {
  method: 'GET',
  timeout: 5000, // 5 seconds
})

// Large file upload
await client.request('/upload', {
  method: 'POST',
  body: largeFile,
  timeout: 300000, // 5 minutes
})

// Streaming response
await client.request('/stream', {
  method: 'GET',
  stream: true,
  timeout: 0, // No timeout for streaming
})
```

### Timeout with Retry

```typescript
// Each attempt has its own timeout
await client.request('/unreliable', {
  method: 'GET',
  timeout: 10000, // 10 seconds per attempt
  retry: {
    retries: 3,
    retryDelay: 1000,
    // By default, timeouts don't trigger retry
    shouldRetry: (error, attempt) => {
      // Optionally retry on timeout
      if (error instanceof HttxTimeoutError) {
        return attempt < 2 // Retry once on timeout
      }
      return true
    },
  },
})
```

### Timeout with Fallback

```typescript
async function fetchWithFallback<T>(urls: string[], timeout: number) {
  for (const url of urls) {
    const result = await client.request<T>(url, {
      method: 'GET',
      timeout,
    })

    if (result.isOk) {
      return result.value.data
    }

    if (!(result.error instanceof HttxTimeoutError)) {
      throw result.error // Non-timeout error, don't try fallbacks
    }

    console.log(`${url} timed out, trying next...`)
  }

  throw new Error('All endpoints timed out')
}

// Usage
const data = await fetchWithFallback([
  'https://primary.api.example.com/data',
  'https://secondary.api.example.com/data',
  'https://fallback.api.example.com/data',
], 5000)
```

## AbortController

Use AbortController for manual timeout control:

```typescript
async function requestWithCustomTimeout<T>(
  url: string,
  options: RequestOptions,
  timeout: number
) {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), timeout)

  try {
    return await client.request<T>(url, {
      ...options,
      signal: controller.signal,
    })
  } finally {
    clearTimeout(timeoutId)
  }
}
```

### Timeout with Cleanup

```typescript
async function fetchWithCleanup() {
  const controller = new AbortController()
  let timeoutId: Timer

  // Cleanup function
  const cleanup = () => {
    clearTimeout(timeoutId)
    controller.abort()
  }

  // Set timeout
  timeoutId = setTimeout(() => {
    console.log('Request timed out, aborting...')
    controller.abort()
  }, 10000)

  try {
    const result = await client.request('/data', {
      method: 'GET',
      signal: controller.signal,
    })

    return result
  } finally {
    cleanup()
  }
}
```

## Total Operation Timeout

Timeout for entire operation including retries:

```typescript
async function requestWithTotalTimeout<T>(
  url: string,
  options: RequestOptions,
  totalTimeout: number
) {
  const deadline = Date.now() + totalTimeout
  const controller = new AbortController()

  // Global timeout
  const timeoutId = setTimeout(() => controller.abort(), totalTimeout)

  const result = await client.request<T>(url, {
    ...options,
    signal: controller.signal,
    retry: {
      ...options.retry,
      shouldRetry: (error, attempt) => {
        // Check if we still have time for retry
        const remaining = deadline - Date.now()
        if (remaining < 1000) {
          return false // Less than 1s remaining, don't retry
        }
        return true
      },
    },
  })

  clearTimeout(timeoutId)
  return result
}
```

## Recommended Timeouts

| Operation | Recommended Timeout |
|-----------|---------------------|
| Health check | 5 seconds |
| Simple GET | 10-30 seconds |
| POST/PUT (small payload) | 30 seconds |
| File upload | 2-5 minutes |
| Streaming | 0 (no timeout) |
| Background job | 5-10 minutes |

## Environment-Based Timeouts

```typescript
const client = new HttxClient({
  timeout: process.env.NODE_ENV === 'development'
    ? 60000   // 60 seconds in dev (more lenient)
    : 30000,  // 30 seconds in production
})
```

## Timeout Monitoring

Track timeouts for monitoring:

```typescript
async function monitoredRequest<T>(url: string, options: RequestOptions) {
  const start = performance.now()

  const result = await client.request<T>(url, options)

  const duration = performance.now() - start

  if (result.isErr && result.error instanceof HttxTimeoutError) {
    // Log timeout
    metrics.increment('http.timeout', {
      url,
      method: options.method,
      configuredTimeout: String(options.timeout),
    })
  } else if (result.isOk) {
    // Track slow requests
    if (duration > (options.timeout || 30000) * 0.8) {
      console.warn(`Slow request: ${url} took ${duration}ms (80%+ of timeout)`)
    }
  }

  return result
}
```

## Best Practices

### 1. Set Appropriate Timeouts

```typescript
// Too short - may cause false timeouts
{ timeout: 1000 } // 1 second

// Too long - poor user experience
{ timeout: 300000 } // 5 minutes for a simple GET

// Just right - based on operation type
{ timeout: 30000 } // 30 seconds for typical API call
```

### 2. Consider Network Conditions

```typescript
// Adjust for mobile/slow networks
const isMobile = /mobile/i.test(navigator.userAgent)
const timeout = isMobile ? 60000 : 30000
```

### 3. Combine with Retry

```typescript
{
  timeout: 10000,  // 10 seconds per attempt
  retry: {
    retries: 3,    // Up to 4 total attempts
    retryDelay: 1000,
  },
}
// Total max time: ~50 seconds (10 + 11 + 12 + 13)
```

### 4. Handle Timeouts Gracefully

```typescript
if (result.isErr && result.error instanceof HttxTimeoutError) {
  // Show user-friendly message
  showToast('Request is taking longer than expected. Please try again.')

  // Log for debugging
  console.error('Timeout:', {
    url: result.error.url,
    timeout: result.error.timeout,
  })
}
```

## Next Steps

- [Retry Logic](/advanced/retry) - Retry timed out requests
- [Streaming](/advanced/streaming) - Timeouts for streams
- [Error Handling](/api/errors) - Handle timeout errors
