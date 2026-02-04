# Configuration

httx can be configured through configuration files, environment variables, and programmatic options.

## Configuration File

Create an `httx.config.ts` (or `httx.config.js`) file in your project root:

```typescript
// httx.config.ts
import type { HttxOptions } from '@stacksjs/httx'

const config: HttxOptions = {
  // Enable verbose logging
  verbose: false,

  // Default timeout in milliseconds
  timeout: 30000,

  // Base URL for all requests
  baseUrl: 'https://api.example.com',

  // Default headers for all requests
  defaultHeaders: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },

  // Retry configuration
  retry: {
    retries: 3,
    retryDelay: 1000,
    retryOn: [408, 429, 500, 502, 503, 504],
  },
}

export default config
```

## Configuration Options

### Core Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `verbose` | `boolean \| string[]` | `false` | Enable verbose logging |
| `timeout` | `number` | `30000` | Request timeout in milliseconds |
| `baseUrl` | `string` | `''` | Base URL prepended to all requests |
| `defaultHeaders` | `Record<string, string>` | `{}` | Headers sent with every request |

### Retry Options

```typescript
interface RetryOptions {
  // Number of retry attempts
  retries?: number

  // Delay between retries in milliseconds
  retryDelay?: number

  // HTTP status codes that trigger a retry
  retryOn?: number[]

  // Custom function to determine if retry should occur
  shouldRetry?: (error: Error, attempt: number) => boolean
}
```

### Example Retry Configuration

```typescript
const config: HttxOptions = {
  retry: {
    // Retry up to 3 times
    retries: 3,

    // Start with 1 second delay (exponential backoff applied)
    retryDelay: 1000,

    // Retry on these status codes
    retryOn: [408, 429, 500, 502, 503, 504],

    // Custom retry logic
    shouldRetry: (error, attempt) => {
      // Don't retry client errors
      if (error instanceof HttxResponseError) {
        if (error.statusCode >= 400 && error.statusCode < 500) {
          return false
        }
      }
      return attempt < 3
    },
  },
}
```

## Programmatic Configuration

### Client Configuration

```typescript
import { HttxClient } from '@stacksjs/httx'

const client = new HttxClient({
  baseUrl: 'https://api.example.com',
  timeout: 60000,
  verbose: true,
  defaultHeaders: {
    'Authorization': 'Bearer token123',
  },
  retry: {
    retries: 2,
    retryDelay: 500,
  },
})
```

### Per-Request Configuration

Override configuration for individual requests:

```typescript
// Override timeout for this request
const result = await client.request('/slow-endpoint', {
  method: 'GET',
  timeout: 120000, // 2 minutes for this request only
})

// Override retry for this request
const result = await client.request('/critical-endpoint', {
  method: 'POST',
  body: data,
  retry: {
    retries: 5,
    retryDelay: 2000,
  },
})
```

## Verbose Logging

Enable verbose logging to debug requests:

```typescript
const client = new HttxClient({
  verbose: true, // Log all requests
})

// Or enable for specific areas
const client = new HttxClient({
  verbose: ['request', 'response', 'retry'], // Selective logging
})
```

Verbose output includes:

- Request method and URL
- Request headers
- Request body
- Response status
- Response headers
- Response body (truncated for large responses)
- Timing information
- Retry attempts

## Environment Variables

httx respects the following environment variables:

```bash
# Set default timeout
HTTX_TIMEOUT=60000

# Enable verbose mode
HTTX_VERBOSE=true

# Set default base URL
HTTX_BASE_URL=https://api.example.com

# Set proxy (coming soon)
HTTP_PROXY=http://proxy.example.com:8080
HTTPS_PROXY=https://proxy.example.com:8080
```

## Configuration Precedence

Configuration is applied in this order (later overrides earlier):

1. Built-in defaults
2. Configuration file (`httx.config.ts`)
3. Environment variables
4. Client constructor options
5. Per-request options

## TypeScript Configuration

For optimal TypeScript support:

```json
// tsconfig.json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "esModuleInterop": true
  }
}
```

## Best Practices

### Development vs Production

```typescript
import type { HttxOptions } from '@stacksjs/httx'

const isDev = process.env.NODE_ENV === 'development'

const config: HttxOptions = {
  verbose: isDev,
  timeout: isDev ? 60000 : 30000,
  retry: {
    retries: isDev ? 0 : 3,
  },
}
```

### API-Specific Configurations

```typescript
// Separate configs for different APIs
const publicApiClient = new HttxClient({
  baseUrl: 'https://api.public.com',
  timeout: 10000,
})

const internalApiClient = new HttxClient({
  baseUrl: 'https://internal.company.com',
  timeout: 30000,
  defaultHeaders: {
    'X-Internal-Key': process.env.INTERNAL_API_KEY,
  },
})
```

## Next Steps

- [CLI Options](/cli/options) - Command-line configuration
- [Error Handling](/api/errors) - Configure error behavior
- [Retry Logic](/advanced/retry) - Advanced retry configuration
