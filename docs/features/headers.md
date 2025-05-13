# Headers

Httx provides comprehensive header management capabilities for your HTTP requests.

## Basic Header Usage

```typescript
const response = await client.request('/api/users', {
  method: 'GET',
  headers: {
    'Accept': 'application/json',
    'Authorization': 'Bearer token123',
    'X-Custom-Header': 'value'
  }
})
```

## Common Headers

Here are some commonly used headers and their purposes:

```typescript
const response = await client.request('/api/data', {
  method: 'GET',
  headers: {
    // Content negotiation
    'Accept': 'application/json',
    'Accept-Language': 'en-US',
    'Accept-Encoding': 'gzip, deflate',

    // Authentication
    'Authorization': 'Bearer token123',

    // Caching
    'Cache-Control': 'no-cache',
    'If-Modified-Since': 'Wed, 21 Oct 2015 07:28:00 GMT',

    // Custom headers
    'X-API-Key': 'your-api-key',
    'X-Request-ID': 'unique-request-id'
  }
})
```

## Content-Type Headers

Httx automatically sets appropriate Content-Type headers based on your request options:

```typescript
// JSON request
const jsonResponse = await client.request('/api/users', {
  method: 'POST',
  json: true,
  body: { name: 'John' }
  // Content-Type: application/json is set automatically
})

// Form request
const formResponse = await client.request('/api/submit', {
  method: 'POST',
  form: true,
  body: { name: 'John' }
  // Content-Type: application/x-www-form-urlencoded is set automatically
})

// Multipart request
const multipartResponse = await client.request('/api/upload', {
  method: 'POST',
  multipart: true,
  body: formData
  // Content-Type is set automatically by the browser
})
```

## Default Headers

You can set default headers for all requests:

```typescript
const client = new HttxClient({
  defaultHeaders: {
    'Authorization': 'Bearer token123',
    'X-API-Key': 'your-api-key'
  }
})

// These headers will be included in all requests
const response = await client.request('/api/users', {
  method: 'GET'
})
```

## Header Merging

Headers are merged in the following order:

1. Default headers from client configuration
2. Content-Type headers based on request options
3. Per-request headers

```typescript
const client = new HttxClient({
  defaultHeaders: {
    Authorization: 'Bearer default-token'
  }
})

const response = await client.request('/api/users', {
  method: 'POST',
  json: true,
  headers: {
    'Authorization': 'Bearer override-token',
    'X-Custom': 'value'
  }
})

// Final headers:
// Authorization: Bearer override-token
// Content-Type: application/json
// X-Custom: value
```

## Header Validation

You can add validation for headers:

```typescript
class ValidatedClient extends HttxClient {
  protected buildHeaders(options: RequestOptions): Headers {
    const headers = super.buildHeaders(options)
    this.validateHeaders(headers)
    return headers
  }

  private validateHeaders(headers: Headers) {
    const auth = headers.get('Authorization')
    if (auth && !auth.startsWith('Bearer ')) {
      throw new Error('Authorization header must start with "Bearer "')
    }
  }
}
```
