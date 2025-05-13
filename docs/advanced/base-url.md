# Base URL Configuration

Httx allows you to configure a base URL for all requests, making it easier to work with APIs.

## Basic Usage

```typescript
const client = new HttxClient({
  baseUrl: 'https://api.example.com'
})

// This request will go to https://api.example.com/users
const response = await client.request('/users', {
  method: 'GET'
})
```

## URL Resolution

Httx properly resolves URLs based on the base URL:

```typescript
const client = new HttxClient({
  baseUrl: 'https://api.example.com/v1'
})

// These requests will be properly resolved:
await client.request('users', { method: 'GET' })
// https://api.example.com/v1/users

await client.request('/users', { method: 'GET' })
// https://api.example.com/v1/users

await client.request('https://other-api.com/users', { method: 'GET' })
// https://other-api.com/users (absolute URLs are not modified)
```

## Environment-Specific Base URLs

```typescript
function getBaseUrl() {
  switch (process.env.NODE_ENV) {
    case 'development':
      return 'http://localhost:3000'
    case 'staging':
      return 'https://staging-api.example.com'
    case 'production':
      return 'https://api.example.com'
    default:
      return 'http://localhost:3000'
  }
}

const client = new HttxClient({
  baseUrl: getBaseUrl()
})
```

## Dynamic Base URL

```typescript
class DynamicBaseUrlClient extends HttxClient {
  private currentBaseUrl: string

  constructor(baseUrl: string) {
    super({ baseUrl })
    this.currentBaseUrl = baseUrl
  }

  setBaseUrl(newBaseUrl: string) {
    this.currentBaseUrl = newBaseUrl
  }

  protected buildUrl(url: string, query?: Record<string, string>): string {
    const baseUrl = this.currentBaseUrl ? new URL(this.currentBaseUrl) : null
    const finalUrl = baseUrl ? new URL(url, baseUrl) : new URL(url)

    if (query) {
      Object.entries(query).forEach(([key, value]) => {
        finalUrl.searchParams.append(key, value)
      })
    }

    return finalUrl.toString()
  }
}
```

## Base URL with Path Prefix

```typescript
class PrefixedClient extends HttxClient {
  constructor(baseUrl: string, private prefix: string) {
    super({ baseUrl })
  }

  protected buildUrl(url: string, query?: Record<string, string>): string {
    const prefixedUrl = url.startsWith('/') ? `${this.prefix}${url}` : `${this.prefix}/${url}`
    return super.buildUrl(prefixedUrl, query)
  }
}

const client = new PrefixedClient('https://api.example.com', '/v1')
// All requests will be prefixed with /v1
```

## Base URL Validation

```typescript
class ValidatedBaseUrlClient extends HttxClient {
  constructor(config: Partial<HttxConfig>) {
    if (config.baseUrl) {
      this.validateBaseUrl(config.baseUrl)
    }
    super(config)
  }

  private validateBaseUrl(url: string) {
    try {
      new URL(url)
    }
    catch (error) {
      throw new Error(`Invalid base URL: ${url}`)
    }
  }
}
```
