# Timeout Configuration

Httx provides flexible timeout configuration options for your HTTP requests.

## Basic Timeout

```typescript
const response = await client.request('/api/users', {
  method: 'GET',
  timeout: 5000 // 5 seconds timeout
})
```

## Global Timeout

You can set a default timeout for all requests:

```typescript
const client = new HttxClient({
  timeout: 10000 // 10 seconds default timeout
})

// All requests will use the 10-second timeout unless overridden
const response = await client.request('/api/users', {
  method: 'GET'
})
```

## Per-Request Timeout

Override the global timeout for specific requests:

```typescript
const client = new HttxClient({
  timeout: 10000 // 10 seconds default
})

// This request will timeout after 2 seconds
const response = await client.request('/api/slow', {
  method: 'GET',
  timeout: 2000
})
```

## Timeout Error Handling

```typescript
const result = await client.request('/api/slow', {
  method: 'GET',
  timeout: 5000
})

if (result.isErr()) {
  const error = result.error
  if (error instanceof DOMException && error.name === 'AbortError') {
    console.error('Request timed out after 5 seconds')
  }
}
```

## Custom Timeout Strategy

You can implement a custom timeout strategy:

```typescript
class AdaptiveTimeoutClient extends HttxClient {
  private requestCount = 0
  private readonly baseTimeout = 5000

  async request<T>(url: string, options: RequestOptions): Promise<Result<HttxResponse<T>, Error>> {
    this.requestCount++

    // Increase timeout for every 10 requests
    const timeout = this.baseTimeout + (Math.floor(this.requestCount / 10) * 1000)

    return super.request(url, {
      ...options,
      timeout
    })
  }
}
```

## Timeout with Retry

```typescript
class RetryClient extends HttxClient {
  async request<T>(url: string, options: RequestOptions): Promise<Result<HttxResponse<T>, Error>> {
    const maxRetries = 3
    let lastError: Error | null = null

    for (let i = 0; i < maxRetries; i++) {
      const result = await super.request(url, options)

      if (result.isOk()) {
        return result
      }

      lastError = result.error

      // Only retry on timeout errors
      if (!(lastError instanceof DOMException && lastError.name === 'AbortError')) {
        return result
      }

      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)))
    }

    return err(lastError!)
  }
}
```

## Timeout Monitoring

```typescript
class MonitoredClient extends HttxClient {
  private timeouts: number[] = []

  async request<T>(url: string, options: RequestOptions): Promise<Result<HttxResponse<T>, Error>> {
    const result = await super.request(url, options)

    if (result.isErr() && result.error instanceof DOMException && result.error.name === 'AbortError') {
      this.timeouts.push(options.timeout || this.config.timeout)
      this.analyzeTimeouts()
    }

    return result
  }

  private analyzeTimeouts() {
    const avgTimeout = this.timeouts.reduce((a, b) => a + b, 0) / this.timeouts.length
    console.log(`Average timeout: ${avgTimeout}ms`)
    console.log(`Total timeouts: ${this.timeouts.length}`)
  }
}
```
