# Content Types

Httx provides built-in support for different content types through simple configuration options. The supported content types are:

- JSON
- Form Data
- Multipart Form Data
- Plain Text
- Binary Data

## JSON Requests

```typescript
const response = await client.request('/api/users', {
  method: 'POST',
  json: true, // Automatically sets Content-Type and Accept headers
  body: {
    name: 'John Doe',
    email: 'john@example.com'
  }
})
```

## Form Data

```typescript
const response = await client.request('/api/submit', {
  method: 'POST',
  form: true, // Sets Content-Type: application/x-www-form-urlencoded
  body: {
    username: 'johndoe',
    password: 'secret123'
  }
})
```

## Multipart Form Data

```typescript
const formData = new FormData()
formData.append('file', fileBlob)
formData.append('name', 'document.pdf')

const response = await client.request('/api/upload', {
  method: 'POST',
  multipart: true, // Removes Content-Type header to let browser set it
  body: formData
})
```

## Response Parsing

Httx automatically parses responses based on the Content-Type header:

```typescript
// JSON response
const jsonResponse = await client.request('/api/data', {
  method: 'GET'
}) // Automatically parsed as JSON

// Text response
const textResponse = await client.request('/api/text', {
  method: 'GET'
}) // Automatically parsed as text

// Binary response
const binaryResponse = await client.request('/api/file', {
  method: 'GET'
}) // Automatically parsed as Blob
```

## Custom Content Types

You can also set custom content types using the headers option:

```typescript
const response = await client.request('/api/custom', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/xml'
  },
  body: '<xml>...</xml>'
})
```
