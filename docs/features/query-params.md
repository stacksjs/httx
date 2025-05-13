# Query Parameters

Httx provides a simple and type-safe way to handle query parameters in your requests.

## Basic Usage

```typescript
const response = await client.request('/api/users', {
  method: 'GET',
  query: {
    page: '1',
    limit: '10',
    sort: 'name',
    order: 'asc'
  }
})

// Results in: /api/users?page=1&limit=10&sort=name&order=asc
```

## Type-Safe Query Parameters

You can create type-safe query parameter objects:

```typescript
interface UserQueryParams {
  page: string
  limit: string
  sort?: 'name' | 'email' | 'created'
  order?: 'asc' | 'desc'
  search?: string
}

const params: UserQueryParams = {
  page: '1',
  limit: '10',
  sort: 'name',
  order: 'asc'
}

const response = await client.request('/api/users', {
  method: 'GET',
  query: params
})
```

## Array Parameters

Httx automatically handles array parameters:

```typescript
const response = await client.request('/api/users', {
  method: 'GET',
  query: {
    ids: ['1', '2', '3'],
    tags: ['admin', 'user']
  }
})

// Results in: /api/users?ids=1&ids=2&ids=3&tags=admin&tags=user
```

## URL Encoding

Query parameters are automatically URL encoded:

```typescript
const response = await client.request('/api/search', {
  method: 'GET',
  query: {
    q: 'hello world',
    filter: 'status:active'
  }
})

// Results in: /api/search?q=hello%20world&filter=status%3Aactive
```

## Dynamic Query Parameters

You can build query parameters dynamically:

```typescript
function buildUserQuery(filters: Record<string, string>) {
  return {
    page: '1',
    limit: '10',
    ...filters
  }
}

const response = await client.request('/api/users', {
  method: 'GET',
  query: buildUserQuery({
    status: 'active',
    role: 'admin'
  })
})
```

## Query Parameter Validation

You can add validation for query parameters:

```typescript
class ValidatedClient extends HttxClient {
  async request<T>(url: string, options: RequestOptions): Promise<Result<HttxResponse<T>, Error>> {
    if (options.query) {
      this.validateQueryParams(options.query)
    }
    return super.request(url, options)
  }

  private validateQueryParams(params: Record<string, string>) {
    if (params.page && isNaN(Number(params.page))) {
      throw new Error('Page must be a number')
    }
    if (params.limit && isNaN(Number(params.limit))) {
      throw new Error('Limit must be a number')
    }
  }
}
```
