# Streaming

httx supports streaming responses for handling large data or real-time updates.

## Enabling Streaming

Use the `stream: true` option:

```typescript
const result = await client.request('/stream', {
  method: 'GET',
  stream: true,
})

if (result.isOk) {
  // data is ReadableStream
  const stream = result.value.data as ReadableStream
}
```

## Reading Streams

### Text Streams

```typescript
const result = await client.request('/api/stream', {
  method: 'GET',
  stream: true,
})

if (result.isOk) {
  const reader = (result.value.data as ReadableStream).getReader()
  const decoder = new TextDecoder()

  while (true) {
    const { done, value } = await reader.read()
    if (done) break

    const text = decoder.decode(value, { stream: true })
    console.log('Received:', text)
  }
}
```

### Binary Streams

```typescript
const result = await client.request('/download/large-file', {
  method: 'GET',
  stream: true,
})

if (result.isOk) {
  const chunks: Uint8Array[] = []
  const reader = (result.value.data as ReadableStream).getReader()

  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    chunks.push(value)
  }

  // Combine chunks
  const totalLength = chunks.reduce((sum, chunk) => sum + chunk.length, 0)
  const combined = new Uint8Array(totalLength)
  let offset = 0
  for (const chunk of chunks) {
    combined.set(chunk, offset)
    offset += chunk.length
  }
}
```

## Server-Sent Events (SSE)

Parse SSE streams:

```typescript
async function* parseSSE(stream: ReadableStream): AsyncGenerator<{ event?: string; data: string }> {
  const reader = stream.getReader()
  const decoder = new TextDecoder()
  let buffer = ''

  while (true) {
    const { done, value } = await reader.read()
    if (done) break

    buffer += decoder.decode(value, { stream: true })
    const lines = buffer.split('\n\n')
    buffer = lines.pop() || ''

    for (const message of lines) {
      const event: { event?: string; data: string } = { data: '' }

      for (const line of message.split('\n')) {
        if (line.startsWith('event:')) {
          event.event = line.slice(6).trim()
        } else if (line.startsWith('data:')) {
          event.data += line.slice(5).trim()
        }
      }

      if (event.data) {
        yield event
      }
    }
  }
}

// Usage
const result = await client.request('/events', {
  method: 'GET',
  stream: true,
  headers: {
    'Accept': 'text/event-stream',
  },
})

if (result.isOk) {
  for await (const event of parseSSE(result.value.data as ReadableStream)) {
    console.log(`Event: ${event.event}`, JSON.parse(event.data))
  }
}
```

## JSON Lines (NDJSON)

Parse newline-delimited JSON:

```typescript
async function* parseNDJSON<T>(stream: ReadableStream): AsyncGenerator<T> {
  const reader = stream.getReader()
  const decoder = new TextDecoder()
  let buffer = ''

  while (true) {
    const { done, value } = await reader.read()
    if (done) break

    buffer += decoder.decode(value, { stream: true })
    const lines = buffer.split('\n')
    buffer = lines.pop() || ''

    for (const line of lines) {
      if (line.trim()) {
        yield JSON.parse(line) as T
      }
    }
  }

  // Handle remaining buffer
  if (buffer.trim()) {
    yield JSON.parse(buffer) as T
  }
}

// Usage
const result = await client.request('/logs', {
  method: 'GET',
  stream: true,
})

if (result.isOk) {
  for await (const log of parseNDJSON<LogEntry>(result.value.data as ReadableStream)) {
    console.log(log.timestamp, log.message)
  }
}
```

## Progress Tracking

Track download progress:

```typescript
async function downloadWithProgress(url: string, onProgress: (percent: number) => void) {
  const result = await client.request(url, {
    method: 'GET',
    stream: true,
  })

  if (result.isErr) {
    throw result.error
  }

  const contentLength = result.value.headers.get('content-length')
  const total = contentLength ? parseInt(contentLength, 10) : 0

  const reader = (result.value.data as ReadableStream).getReader()
  const chunks: Uint8Array[] = []
  let received = 0

  while (true) {
    const { done, value } = await reader.read()
    if (done) break

    chunks.push(value)
    received += value.length

    if (total > 0) {
      onProgress((received / total) * 100)
    }
  }

  // Combine chunks into final result
  const combined = new Uint8Array(received)
  let offset = 0
  for (const chunk of chunks) {
    combined.set(chunk, offset)
    offset += chunk.length
  }

  return combined
}

// Usage
const data = await downloadWithProgress('/large-file.zip', (percent) => {
  console.log(`Downloaded: ${percent.toFixed(1)}%`)
})
```

## Streaming to File

Stream directly to file (Bun):

```typescript
const result = await client.request('/download/large-file.zip', {
  method: 'GET',
  stream: true,
})

if (result.isOk) {
  const stream = result.value.data as ReadableStream
  const file = Bun.file('./downloaded.zip')
  const writer = file.writer()

  const reader = stream.getReader()

  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    writer.write(value)
  }

  await writer.end()
  console.log('Download complete')
}
```

## Canceling Streams

Use AbortController to cancel:

```typescript
const controller = new AbortController()

// Cancel after 10 seconds
const timeout = setTimeout(() => controller.abort(), 10000)

try {
  const result = await client.request('/long-stream', {
    method: 'GET',
    stream: true,
    signal: controller.signal,
  })

  if (result.isOk) {
    const reader = (result.value.data as ReadableStream).getReader()

    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      // Process chunk...

      // Cancel early if needed
      if (shouldStop) {
        await reader.cancel()
        break
      }
    }
  }
} finally {
  clearTimeout(timeout)
}
```

## Transforming Streams

Create transform streams:

```typescript
function createJSONTransformStream<T>(): TransformStream<Uint8Array, T> {
  const decoder = new TextDecoder()
  let buffer = ''

  return new TransformStream({
    transform(chunk, controller) {
      buffer += decoder.decode(chunk, { stream: true })
      const lines = buffer.split('\n')
      buffer = lines.pop() || ''

      for (const line of lines) {
        if (line.trim()) {
          controller.enqueue(JSON.parse(line) as T)
        }
      }
    },
    flush(controller) {
      if (buffer.trim()) {
        controller.enqueue(JSON.parse(buffer) as T)
      }
    },
  })
}

// Usage
const result = await client.request('/ndjson', {
  method: 'GET',
  stream: true,
})

if (result.isOk) {
  const stream = (result.value.data as ReadableStream)
    .pipeThrough(createJSONTransformStream<LogEntry>())

  const reader = stream.getReader()

  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    console.log('Parsed entry:', value)
  }
}
```

## Best Practices

### 1. Always Handle Backpressure

```typescript
// Use streams properly to avoid memory issues
const reader = stream.getReader()
while (true) {
  const { done, value } = await reader.read()
  if (done) break

  // Process immediately, don't accumulate in memory
  await processChunk(value)
}
```

### 2. Clean Up Resources

```typescript
const reader = stream.getReader()
try {
  // ... read stream
} finally {
  await reader.cancel()
}
```

### 3. Set Appropriate Timeouts

```typescript
{
  stream: true,
  timeout: 0,  // Disable timeout for long-running streams
}
```

## Next Steps

- [Retry Logic](/advanced/retry) - Retry on stream errors
- [Timeouts](/advanced/timeouts) - Configure stream timeouts
- [Response Handling](/api/response) - Non-streaming responses
