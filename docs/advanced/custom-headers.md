# Custom Headers

Httx provides flexible header management through both global configuration and per-request options.

## Global Headers

You can set default headers for all requests:

```typescript
const client = new HttxClient({
  defaultHeaders: {
    'Authorization': 'Bearer token123',
    'X-API-Key': 'your-api-key',
    'Accept-Language': 'en-US'
  }
})
```

## Per-Request Headers

Override or add headers for specific requests:

```typescript
const response = await client.request('/api/users', {
  method: 'GET',
  headers: {
    'Authorization': 'Bearer different-token',
    'X-Custom-Header': 'custom-value'
  }
})
```

## Header Merging

Httx merges headers in the following order:

1. Default headers from client configuration
2. Content-Type headers based on request options (json, form, multipart)
3. Per-request headers

```typescript
const client = new HttxClient({
  defaultHeaders: {
    Authorization: 'Bearer token123'
  }
})

const response = await client.request('/api/users', {
  method: 'POST',
  json: true, // Adds Content-Type: application/json
  headers: {
    'Authorization': 'Bearer new-token', // Overrides default
    'X-Custom': 'value' // Adds new header
  }
})

// Final headers:
// Authorization: Bearer new-token
// Content-Type: application/json
// X-Custom: value
```

## Header Management

### Removing Headers

```typescript
const response = await client.request('/api/users', {
  method: 'GET',
  headers: {
    Authorization: null // Removes the header
  }
})
```

### Conditional Headers

```typescript
const response = await client.request('/api/users', {
  method: 'GET',
  headers: {
    Authorization: isAuthenticated ? `Bearer ${token}` : null
  }
})
```

## Custom Header Transformations

You can extend the client to add custom header transformations:

```typescript
class CustomHeaderClient extends HttxClient {
  protected buildHeaders(options: RequestOptions): Headers {
    const headers = super.buildHeaders(options)

    // Add custom header transformation
    if (options.headers?.['X-Custom']) {
      headers.set('X-Transformed', this.transformHeader(options.headers['X-Custom']))
    }

    return headers
  }

  private transformHeader(value: string): string {
    // Implement your custom transformation
    return value.toUpperCase()
  }
}
```

## Security Headers

Example of setting security-related headers:

```typescript
const client = new HttxClient({
  defaultHeaders: {
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains'
  }
})
```
