# Types

The core types used throughout the Httx library.

## HttpMethod

```typescript
type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'HEAD' | 'OPTIONS'
```

Supported HTTP methods for requests.

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

### Properties

#### data

```typescript
data: T
```

The parsed response data. Type `T` is determined by the generic type parameter of the request.

#### status

```typescript
status: number
```

The HTTP status code of the response.

#### headers

```typescript
headers: Headers
```

The response headers.

#### timing

```typescript
timing: {
  start: number
  end: number
  duration: number
}
```

Timing information for the request:

- `start`: Timestamp when the request started
- `end`: Timestamp when the request completed
- `duration`: Total duration in milliseconds

## Result

```typescript
type Result<T, E> = Ok<T> | Err<E>
```

A type representing either a successful result (`Ok`) or an error (`Err`).

### Ok

```typescript
interface Ok<T> {
  isOk: () => true
  isErr: () => false
  value: T
}
```

Represents a successful result.

### Err

```typescript
interface Err<E> {
  isOk: () => false
  isErr: () => true
  error: E
}
```

Represents an error result.

## ContentType

```typescript
type ContentType = 'json' | 'form' | 'multipart'
```

Supported content types for requests.

## DebugCategory

```typescript
type DebugCategory = 'request' | 'response' | 'error' | 'timing'
```

Categories for debug logging.

## Examples

### Using Result Type

```typescript
const result = await client.request<User>('/api/users/1', {
  method: 'GET',
  json: true
})

if (result.isOk()) {
  const user = result.value.data
  console.log(user.name)
}
else {
  console.error(result.error.message)
}
```

### Using HttxResponse

```typescript
const result = await client.request<User>('/api/users/1', {
  method: 'GET',
  json: true
})

if (result.isOk()) {
  const response = result.value
  console.log('Status:', response.status)
  console.log('User:', response.data)
  console.log('Request duration:', response.timing.duration, 'ms')
}
```

### Type Inference

```typescript
// TypeScript will infer User as the response data type
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
  // TypeScript knows this is a User
  const user = result.value.data
  console.log(user.name) // OK
  console.log(user.unknown) // TypeScript error
}
```
