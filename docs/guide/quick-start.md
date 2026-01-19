# Quick Start

Get up and running with httx in minutes. This guide covers the essential operations for both CLI and library usage.

## CLI Quick Start

### Making GET Requests

The simplest httx command:

```bash
httx get https://api.github.com/users/stacksjs
```

Output:

```json
{
  "login": "stacksjs",
  "id": 123456,
  "type": "Organization"
}
```

### POST Request with JSON

Send JSON data using key=value syntax:

```bash
httx post https://api.example.com/users \
  name=John \
  email=john@example.com \
  -j
```

The `-j` flag ensures the request is sent as `application/json`.

### Form Data

Send form-urlencoded data:

```bash
httx post https://api.example.com/login \
  username=john \
  password=secret \
  --form
```

### Headers

Add custom headers:

```bash
httx get https://api.example.com/data \
  -H "Authorization: Bearer token123" \
  -H "X-Custom-Header: value"
```

### Query Parameters

Add query parameters to the URL:

```bash
httx get "https://api.example.com/search?q=term&limit=10"
```

## Library Quick Start

### Basic Setup

```typescript
import { HttxClient } from '@stacksjs/httx'

// Create a client instance
const client = new HttxClient({
  baseUrl: 'https://api.example.com',
  timeout: 30000,
  defaultHeaders: {
    'Content-Type': 'application/json',
  },
})
```

### GET Request

```typescript
const result = await client.request<User[]>('/users', {
  method: 'GET',
})

if (result.isOk) {
  const users = result.value.data
  console.log(`Found ${users.length} users`)
} else {
  console.error('Request failed:', result.error.message)
}
```

### POST Request

```typescript
interface CreateUserPayload {
  name: string
  email: string
}

interface User {
  id: number
  name: string
  email: string
}

const result = await client.request<User>('/users', {
  method: 'POST',
  json: true,
  body: {
    name: 'John Doe',
    email: 'john@example.com',
  } satisfies CreateUserPayload,
})

if (result.isOk) {
  console.log('Created user:', result.value.data.id)
}
```

### Error Handling

httx uses Result types for explicit error handling:

```typescript
import { HttxClient, HttxResponseError, HttxTimeoutError } from '@stacksjs/httx'

const result = await client.request('/api/data', { method: 'GET' })

if (result.isErr) {
  const error = result.error

  if (error instanceof HttxResponseError) {
    console.error(`HTTP ${error.statusCode}: ${error.message}`)
    console.error('Response body:', error.body)
  } else if (error instanceof HttxTimeoutError) {
    console.error('Request timed out')
  } else {
    console.error('Network error:', error.message)
  }
}
```

### Response Details

Access complete response information:

```typescript
const result = await client.request('/users', { method: 'GET' })

if (result.isOk) {
  const response = result.value

  console.log('Status:', response.status)
  console.log('Status Text:', response.statusText)
  console.log('Headers:', Object.fromEntries(response.headers))
  console.log('Duration:', response.timings.duration, 'ms')
  console.log('Data:', response.data)
}
```

## Common Patterns

### API Client Factory

```typescript
import { HttxClient } from '@stacksjs/httx'

function createApiClient(token: string) {
  return new HttxClient({
    baseUrl: 'https://api.example.com/v1',
    defaultHeaders: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    retry: {
      retries: 3,
      retryDelay: 1000,
    },
  })
}

// Usage
const api = createApiClient('my-token')
const users = await api.request('/users', { method: 'GET' })
```

### Type-Safe API Wrapper

```typescript
import { HttxClient } from '@stacksjs/httx'

class UserApi {
  private client: HttxClient

  constructor(baseUrl: string) {
    this.client = new HttxClient({ baseUrl })
  }

  async getUser(id: number) {
    return this.client.request<User>(`/users/${id}`, { method: 'GET' })
  }

  async createUser(data: CreateUserInput) {
    return this.client.request<User>('/users', {
      method: 'POST',
      json: true,
      body: data,
    })
  }

  async updateUser(id: number, data: Partial<CreateUserInput>) {
    return this.client.request<User>(`/users/${id}`, {
      method: 'PATCH',
      json: true,
      body: data,
    })
  }

  async deleteUser(id: number) {
    return this.client.request(`/users/${id}`, { method: 'DELETE' })
  }
}
```

## Next Steps

- [Configuration](/guide/configuration) - Customize httx
- [CLI Reference](/cli) - Complete CLI documentation
- [API Reference](/api) - Full API documentation
