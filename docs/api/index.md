# API Overview

httx provides a powerful TypeScript library for making HTTP requests with type safety and result-based error handling.

## Installation

```bash
bun add @stacksjs/httx
```

## Basic Usage

```typescript
import { HttxClient } from '@stacksjs/httx'

const client = new HttxClient({
  baseUrl: 'https://api.example.com',
})

const result = await client.request<User[]>('/users', {
  method: 'GET',
})

if (result.isOk) {
  console.log(result.value.data)
} else {
  console.error(result.error)
}
```

## Key Features

### Type-Safe Requests

```typescript
interface User {
  id: number
  name: string
  email: string
}

// Response is typed as User[]
const result = await client.request<User[]>('/users', {
  method: 'GET',
})

if (result.isOk) {
  // result.value.data is User[]
  result.value.data.forEach(user => {
    console.log(user.name) // TypeScript knows this is string
  })
}
```

### Result-Based Error Handling

No try/catch needed - errors are explicit:

```typescript
const result = await client.request('/users', { method: 'GET' })

if (result.isOk) {
  // Handle success
  const data = result.value.data
} else {
  // Handle error
  const error = result.error
}
```

### Rich Response Information

```typescript
if (result.isOk) {
  const response = result.value

  console.log(response.status)      // 200
  console.log(response.statusText)  // "OK"
  console.log(response.headers)     // Headers object
  console.log(response.data)        // Parsed response body
  console.log(response.timings)     // { start, end, duration }
}
```

## Core Exports

```typescript
import {
  // Main client
  HttxClient,

  // Error types
  HttxNetworkError,
  HttxResponseError,
  HttxTimeoutError,

  // Types
  type HttxConfig,
  type HttxOptions,
  type HttxResponse,
  type RequestOptions,
  type RetryOptions,
  type HttpMethod,
} from '@stacksjs/httx'
```

## API Reference

### HttxClient

The main client class for making requests.

```typescript
const client = new HttxClient(config?: Partial<HttxConfig>)
```

#### Methods

- `request<T>(url, options)` - Make an HTTP request

### Request Methods

```typescript
// GET
await client.request('/users', { method: 'GET' })

// POST
await client.request('/users', {
  method: 'POST',
  json: true,
  body: { name: 'John' },
})

// PUT
await client.request('/users/1', {
  method: 'PUT',
  json: true,
  body: { name: 'Jane' },
})

// PATCH
await client.request('/users/1', {
  method: 'PATCH',
  json: true,
  body: { name: 'Janet' },
})

// DELETE
await client.request('/users/1', { method: 'DELETE' })

// HEAD
await client.request('/users', { method: 'HEAD' })

// OPTIONS
await client.request('/users', { method: 'OPTIONS' })
```

## Configuration

```typescript
const client = new HttxClient({
  // Base URL for all requests
  baseUrl: 'https://api.example.com',

  // Default request timeout (ms)
  timeout: 30000,

  // Enable verbose logging
  verbose: false,

  // Default headers
  defaultHeaders: {
    'Authorization': 'Bearer token',
  },

  // Retry configuration
  retry: {
    retries: 3,
    retryDelay: 1000,
    retryOn: [500, 502, 503],
  },
})
```

## Error Types

### HttxResponseError

HTTP error response (4xx, 5xx):

```typescript
if (error instanceof HttxResponseError) {
  console.log(error.statusCode)  // 404
  console.log(error.statusText)  // "Not Found"
  console.log(error.body)        // Response body
  console.log(error.method)      // "GET"
  console.log(error.url)         // Request URL
}
```

### HttxTimeoutError

Request exceeded timeout:

```typescript
if (error instanceof HttxTimeoutError) {
  console.log(error.timeout)  // Timeout value in ms
  console.log(error.method)   // HTTP method
  console.log(error.url)      // Request URL
}
```

### HttxNetworkError

Network-level failure:

```typescript
if (error instanceof HttxNetworkError) {
  console.log(error.message)  // Error description
  console.log(error.cause)    // Original error
}
```

## Next Steps

- [HttxClient](/api/client) - Full client documentation
- [Request Options](/api/request-options) - All request options
- [Response Handling](/api/response) - Working with responses
- [Error Handling](/api/errors) - Error handling patterns
