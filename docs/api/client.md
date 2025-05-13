# HttxClient

The main client class for making HTTP requests.

## Constructor

```typescript
constructor(config?: Partial<HttxConfig>)
```

Creates a new HttxClient instance with optional configuration.

### Parameters

- `config` (optional): Partial configuration object
  - `verbose`: boolean | string[] - Enable debug logging
  - `defaultHeaders`: Record<string, string> - Default headers for all requests
  - `baseUrl`: string - Base URL for all requests
  - `timeout`: number - Default timeout in milliseconds

### Example

```typescript
const client = new HttxClient({
  verbose: true,
  defaultHeaders: {
    Authorization: 'Bearer token123'
  },
  baseUrl: 'https://api.example.com',
  timeout: 5000
})
```

## Methods

### request

```typescript
async request<T = unknown>(
  url: string,
  options: RequestOptions
): Promise<Result<HttxResponse<T>, Error>>
```

Makes an HTTP request and returns a Result type containing either the response or an error.

#### Parameters

- `url`: string - The URL to request
- `options`: RequestOptions - Request configuration
  - `method`: HttpMethod - HTTP method to use
  - `headers?`: Record<string, string> - Request headers
  - `body?`: BodyInit | Record<string, string> - Request body
  - `query?`: Record<string, string> - Query parameters
  - `timeout?`: number - Request timeout in milliseconds
  - `json?`: boolean - Whether to send/receive JSON
  - `form?`: boolean - Whether to send form data
  - `multipart?`: boolean - Whether to send multipart form data
  - `verbose?`: boolean - Enable debug logging for this request

#### Returns

- `Promise<Result<HttxResponse<T>, Error>>` - A Result type containing either:
  - `HttxResponse<T>`: The successful response
  - `Error`: The error that occurred

#### Example

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

## Protected Methods

### buildUrl

```typescript
protected buildUrl(url: string, query?: Record<string, string>): string
```

Builds the final URL by combining the base URL, path, and query parameters.

### buildHeaders

```typescript
protected buildHeaders(options: RequestOptions): Headers
```

Builds the request headers by merging default headers, content-type headers, and request-specific headers.

### buildBody

```typescript
protected async buildBody(options: RequestOptions): Promise<BodyInit | undefined>
```

Builds the request body based on the content type and body data.

### parseResponse

```typescript
protected async parseResponse<T>(response: Response): Promise<T>
```

Parses the response based on its content type.

### debugLog

```typescript
protected debugLog(category: string, message: string, verbose: boolean | string[]): void
```

Logs debug information if verbose mode is enabled.
