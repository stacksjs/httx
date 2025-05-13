# Response Timing

Httx provides detailed timing information for each request, allowing you to monitor performance and identify bottlenecks.

## Timing Information

Each response includes a `timings` object with the following properties:

```typescript
interface HttxResponse<T> {
  // ... other properties
  timings: {
    start: number // Request start timestamp
    end: number // Response end timestamp
    duration: number // Total request duration in milliseconds
  }
}
```

## Usage

```typescript
const result = await client.request('/api/users', {
  method: 'GET'
})

if (result.isOk()) {
  const { timings } = result.value
  console.log(`Request took ${timings.duration}ms`)
  console.log(`Started at: ${new Date(timings.start).toISOString()}`)
  console.log(`Ended at: ${new Date(timings.end).toISOString()}`)
}
```

## Performance Monitoring

You can use the timing information to monitor API performance:

```typescript
async function monitorApiPerformance() {
  const results = await Promise.all([
    client.request('/api/endpoint1', { method: 'GET' }),
    client.request('/api/endpoint2', { method: 'GET' }),
    client.request('/api/endpoint3', { method: 'GET' })
  ])

  results.forEach((result, index) => {
    if (result.isOk()) {
      const { timings } = result.value
      console.log(`Endpoint ${index + 1} took ${timings.duration}ms`)
    }
  })
}
```

## Timing with Debug Logging

When debug logging is enabled, timing information is automatically included in the logs:

```typescript
const client = new HttxClient({
  verbose: true
})

const result = await client.request('/api/users', {
  method: 'GET'
})

// Log output will include timing information:
// [response] 200 OK (150ms)
```

## Custom Timing Analysis

You can extend the client to add custom timing analysis:

```typescript
class TimingClient extends HttxClient {
  private timings: number[] = []

  async request<T>(url: string, options: RequestOptions): Promise<Result<HttxResponse<T>, Error>> {
    const result = await super.request(url, options)

    if (result.isOk()) {
      this.timings.push(result.value.timings.duration)
      this.analyzeTimings()
    }

    return result
  }

  private analyzeTimings() {
    const avg = this.timings.reduce((a, b) => a + b, 0) / this.timings.length
    const max = Math.max(...this.timings)
    const min = Math.min(...this.timings)

    console.log(`Average request time: ${avg}ms`)
    console.log(`Fastest request: ${min}ms`)
    console.log(`Slowest request: ${max}ms`)
  }
}
```
