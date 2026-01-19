# Response Handling

httx provides rich response information with full type safety.

## Response Structure

```typescript
interface HttxResponse<T = unknown> {
  // HTTP status code
  status: number

  // HTTP status text
  statusText: string

  // Response headers
  headers: Headers

  // Parsed response body
  data: T

  // Request timing information
  timings: {
    start: number    // Start timestamp
    end: number      // End timestamp
    duration: number // Duration in milliseconds
  }
}
```

## Accessing Response Data

### Basic Usage

```typescript
const result = await client.request<User>('/users/1', { method: 'GET' })

if (result.isOk) {
  const response = result.value

  // Status information
  console.log(response.status)     // 200
  console.log(response.statusText) // "OK"

  // Response data (typed as User)
  console.log(response.data.name)
  console.log(response.data.email)

  // Timing
  console.log(`Request took ${response.timings.duration}ms`)
}
```

### Type-Safe Responses

```typescript
interface ApiResponse<T> {
  data: T
  meta: {
    page: number
    total: number
  }
}

interface User {
  id: number
  name: string
}

const result = await client.request<ApiResponse<User[]>>('/users', {
  method: 'GET',
})

if (result.isOk) {
  const { data, meta } = result.value.data

  // data is User[]
  data.forEach(user => console.log(user.name))

  // meta is { page: number, total: number }
  console.log(`Page ${meta.page} of ${Math.ceil(meta.total / 10)}`)
}
```

## Working with Headers

### Reading Headers

```typescript
if (result.isOk) {
  const headers = result.value.headers

  // Get single header
  const contentType = headers.get('content-type')
  const cacheControl = headers.get('cache-control')

  // Check if header exists
  if (headers.has('x-rate-limit-remaining')) {
    console.log('Remaining:', headers.get('x-rate-limit-remaining'))
  }

  // Iterate all headers
  headers.forEach((value, key) => {
    console.log(`${key}: ${value}`)
  })

  // Convert to object
  const headerObj = Object.fromEntries(headers.entries())
}
```

### Common Header Patterns

```typescript
// Pagination headers
if (result.isOk) {
  const total = result.value.headers.get('x-total-count')
  const page = result.value.headers.get('x-page')
  const perPage = result.value.headers.get('x-per-page')
}

// Rate limiting
if (result.isOk) {
  const remaining = result.value.headers.get('x-rate-limit-remaining')
  const reset = result.value.headers.get('x-rate-limit-reset')

  if (Number(remaining) < 10) {
    console.warn(`Low rate limit: ${remaining} requests remaining`)
  }
}

// Caching
if (result.isOk) {
  const etag = result.value.headers.get('etag')
  const lastModified = result.value.headers.get('last-modified')

  // Store for conditional requests
  cache.set('users-etag', etag)
}
```

## Response Status Codes

### Checking Status

```typescript
if (result.isOk) {
  const { status } = result.value

  switch (status) {
    case 200:
      console.log('Success')
      break
    case 201:
      console.log('Created')
      break
    case 204:
      console.log('No Content')
      break
  }
}
```

### Status Categories

```typescript
if (result.isOk) {
  const { status } = result.value

  if (status >= 200 && status < 300) {
    // Success responses (2xx)
  }
}

if (result.isErr) {
  const error = result.error

  if (error instanceof HttxResponseError) {
    if (error.statusCode >= 400 && error.statusCode < 500) {
      // Client errors (4xx)
    } else if (error.statusCode >= 500) {
      // Server errors (5xx)
    }
  }
}
```

## Timing Information

### Basic Timing

```typescript
if (result.isOk) {
  const { timings } = result.value

  console.log(`Duration: ${timings.duration.toFixed(2)}ms`)
  console.log(`Started: ${new Date(timings.start).toISOString()}`)
  console.log(`Ended: ${new Date(timings.end).toISOString()}`)
}
```

### Performance Monitoring

```typescript
async function timedRequest<T>(
  client: HttxClient,
  url: string,
  options: RequestOptions
) {
  const result = await client.request<T>(url, options)

  if (result.isOk) {
    const { timings, status } = result.value

    // Log slow requests
    if (timings.duration > 1000) {
      console.warn(`Slow request: ${url} took ${timings.duration}ms`)
    }

    // Track metrics
    metrics.record('http_request_duration', timings.duration, {
      url,
      status: String(status),
    })
  }

  return result
}
```

## Content Type Handling

httx automatically parses responses based on Content-Type:

### JSON Responses

```typescript
// Automatically parsed as JSON when Content-Type is application/json
const result = await client.request<User>('/users/1', { method: 'GET' })

if (result.isOk) {
  // data is already parsed JSON
  console.log(result.value.data.name)
}
```

### Text Responses

```typescript
// Text content types are returned as strings
const result = await client.request<string>('/text', { method: 'GET' })

if (result.isOk) {
  // data is string
  console.log(result.value.data)
}
```

### Binary Responses

```typescript
// Binary content is returned as Blob
const result = await client.request<Blob>('/image.png', { method: 'GET' })

if (result.isOk) {
  const blob = result.value.data
  console.log(`Size: ${blob.size} bytes`)
  console.log(`Type: ${blob.type}`)

  // Save to file
  await Bun.write('./downloaded.png', blob)
}
```

## Streaming Responses

```typescript
const result = await client.request('/stream', {
  method: 'GET',
  stream: true,
})

if (result.isOk) {
  const stream = result.value.data as ReadableStream

  const reader = stream.getReader()
  const decoder = new TextDecoder()

  while (true) {
    const { done, value } = await reader.read()
    if (done) break

    const chunk = decoder.decode(value, { stream: true })
    console.log('Received:', chunk)
  }
}
```

## Response Transformers

### Custom Transform

```typescript
interface RawApiResponse {
  result: User
  _metadata: { version: string }
}

async function getUser(id: number): Promise<User | null> {
  const result = await client.request<RawApiResponse>(`/users/${id}`, {
    method: 'GET',
  })

  if (result.isOk) {
    // Transform response
    return result.value.data.result
  }

  return null
}
```

### Date Handling

```typescript
interface ApiUser {
  id: number
  name: string
  createdAt: string  // ISO string from API
}

interface User {
  id: number
  name: string
  createdAt: Date
}

async function getUser(id: number): Promise<User | null> {
  const result = await client.request<ApiUser>(`/users/${id}`, {
    method: 'GET',
  })

  if (result.isOk) {
    const raw = result.value.data
    return {
      ...raw,
      createdAt: new Date(raw.createdAt),
    }
  }

  return null
}
```

## Next Steps

- [Error Handling](/api/errors) - Handle response errors
- [Request Options](/api/request-options) - Configure requests
- [Streaming](/advanced/streaming) - Stream large responses
