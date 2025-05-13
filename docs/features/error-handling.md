# Error Handling

Httx uses the `neverthrow` library to provide type-safe error handling. All requests return a `Result` type that can be either a success or an error.

## Basic Usage

```typescript
import { HttxClient } from 'httx'
import { err, ok } from 'neverthrow'

const client = new HttxClient()

const result = await client.request('/api/users', {
  method: 'GET'
})

// Type-safe error handling
if (result.isOk()) {
  const response = result.value
  console.log('Success:', response.data)
}
else {
  const error = result.error
  console.error('Error:', error.message)
}
```

## Error Types

Httx can return various types of errors:

- Network errors
- Timeout errors
- Parse errors
- HTTP errors (non-2xx responses)

## Example with Error Handling

```typescript
async function fetchUser(id: string) {
  const result = await client.request(`/api/users/${id}`, {
    method: 'GET',
    json: true
  })

  return result.match(
    (response) => {
      // Success case
      return response.data
    },
    (error) => {
      // Error case
      if (error instanceof TypeError) {
        // Network error
        return 'Network error occurred'
      }
      if (error instanceof DOMException && error.name === 'AbortError') {
        // Timeout error
        return 'Request timed out'
      }
      // Other errors
      return `Error: ${error.message}`
    }
  )
}
```

## Timeout Handling

```typescript
const result = await client.request('/api/slow', {
  method: 'GET',
  timeout: 5000 // 5 seconds timeout
})

if (result.isErr()) {
  const error = result.error
  if (error instanceof DOMException && error.name === 'AbortError') {
    console.error('Request timed out after 5 seconds')
  }
}
```

## Response Validation

```typescript
interface User {
  id: number
  name: string
  email: string
}

const result = await client.request<User>('/api/users/1', {
  method: 'GET',
  json: true
})

if (result.isOk()) {
  const user = result.value.data
  // TypeScript knows user is of type User
  console.log(user.name)
}
```
