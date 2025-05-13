# Configuration

The configuration options available for HttxClient.

## HttxConfig

```typescript
interface HttxConfig {
  verbose?: boolean | string[]
  defaultHeaders?: Record<string, string>
  baseUrl?: string
  timeout?: number
}
```

### Properties

#### verbose

```typescript
verbose?: boolean | string[]
```

Enable debug logging for the client.

- `boolean`: Enable/disable all debug logging
- `string[]`: Enable debug logging for specific categories

Example:

```typescript
const client = new HttxClient({
  verbose: ['request', 'response'] // Only log request and response details
})
```

#### defaultHeaders

```typescript
defaultHeaders?: Record<string, string>
```

Default headers to include in all requests.

Example:

```typescript
const client = new HttxClient({
  defaultHeaders: {
    'Authorization': 'Bearer token123',
    'X-API-Key': 'your-api-key'
  }
})
```

#### baseUrl

```typescript
baseUrl?: string
```

Base URL for all requests. Will be prepended to all request URLs unless the URL is absolute.

Example:

```typescript
const client = new HttxClient({
  baseUrl: 'https://api.example.com/v1'
})

// Request will go to https://api.example.com/v1/users
await client.request('/users', { method: 'GET' })
```

#### timeout

```typescript
timeout?: number
```

Default timeout in milliseconds for all requests. Can be overridden per request.

Example:

```typescript
const client = new HttxClient({
  timeout: 5000 // 5 seconds
})
```

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

### Properties

#### method

```typescript
method: HttpMethod
```

HTTP method to use for the request.

```typescript
type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'HEAD' | 'OPTIONS'
```

#### headers

```typescript
headers?: Record<string, string>
```

Request-specific headers. Will be merged with default headers.

#### body

```typescript
body?: BodyInit | Record<string, string>
```

Request body. Can be:

- `BodyInit`: Raw body data
- `Record<string, string>`: Object to be converted to form data or JSON

#### query

```typescript
query?: Record<string, string>
```

Query parameters to append to the URL.

#### timeout

```typescript
timeout?: number
```

Request-specific timeout in milliseconds. Overrides the default timeout.

#### json

```typescript
json?: boolean
```

Whether to send/receive JSON data. Sets appropriate Content-Type and Accept headers.

#### form

```typescript
form?: boolean
```

Whether to send form data. Sets appropriate Content-Type header.

#### multipart

```typescript
multipart?: boolean
```

Whether to send multipart form data. Sets appropriate Content-Type header.

#### verbose

```typescript
verbose?: boolean
```

Enable debug logging for this specific request.
