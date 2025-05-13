# Request Methods

Httx supports all standard HTTP methods through a type-safe interface. The supported methods are:

- GET
- POST
- PUT
- DELETE
- PATCH
- HEAD
- OPTIONS

## Usage

```typescript
import { HttxClient } from 'httx'

const client = new HttxClient()

// GET request
const getResponse = await client.request('/api/users', {
  method: 'GET',
  query: { page: '1' }
})

// POST request
const postResponse = await client.request('/api/users', {
  method: 'POST',
  json: true,
  body: {
    name: 'John Doe',
    email: 'john@example.com'
  }
})

// PUT request
const putResponse = await client.request('/api/users/1', {
  method: 'PUT',
  json: true,
  body: {
    name: 'John Updated'
  }
})

// DELETE request
const deleteResponse = await client.request('/api/users/1', {
  method: 'DELETE'
})
```

## Type Safety

All request methods are type-safe through the `HttpMethod` type:

```typescript
type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'HEAD' | 'OPTIONS'
```

This ensures you can only use valid HTTP methods in your requests.
