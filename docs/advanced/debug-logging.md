# Debug Logging

Httx provides built-in debug logging capabilities to help you troubleshoot requests and responses. The logging system is configurable and can be enabled globally or per request.

## Basic Usage

```typescript
import { HttxClient } from 'httx'

// Enable logging for all requests
const client = new HttxClient({
  verbose: true
})

// Or enable logging for specific requests
const response = await client.request('/api/users', {
  method: 'GET',
  verbose: true
})
```

## Logging Levels

You can configure logging to show different levels of detail:

```typescript
// Log everything
const client = new HttxClient({
  verbose: true
})

// Log only requests
const client = new HttxClient({
  verbose: ['request']
})

// Log only responses
const client = new HttxClient({
  verbose: ['response']
})

// Log both requests and responses
const client = new HttxClient({
  verbose: ['request', 'response']
})
```

## Log Output

When logging is enabled, you'll see detailed information about:

- Request URL and method
- Request headers
- Request body (if any)
- Response status code
- Response headers
- Response body
- Request timing

Example output:

```
[request] GET https://api.example.com/users
[request] Request headers: {"Content-Type":"application/json"}
[request] Request body: {"name":"John"}
[response] 200 OK (150ms)
[response] Response data: {"id":1,"name":"John"}
```

## Custom Logging

You can implement your own logging by extending the client:

```typescript
class CustomClient extends HttxClient {
  protected debugLog(category: string, message: string, verbose: boolean | string[]) {
    if (this.shouldLog(category, verbose)) {
      // Implement your custom logging logic
      console.log(`[${category.toUpperCase()}] ${message}`)
    }
  }
}
```
