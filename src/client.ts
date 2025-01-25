import type { Result } from 'neverthrow'
import type { HttxConfig, HttxResponse, RequestOptions } from './types'
import { err, ok } from 'neverthrow'
import { debugLog } from './utils'

export class HttxClient {
  private config: Required<HttxConfig>

  constructor(config: Partial<HttxConfig> = {}) {
    this.config = {
      verbose: false,
      defaultHeaders: {},
      baseUrl: '',
      timeout: 30000,
      ...config,
    }
  }

  async request<T = unknown>(
    url: string,
    options: RequestOptions,
  ): Promise<Result<HttxResponse<T>, Error>> {
    const startTime = performance.now()

    try {
      const finalUrl = this.buildUrl(url, options.query)
      debugLog('request', `${options.method} ${finalUrl}`, this.config.verbose)

      const controller = new AbortController()
      const timeoutSignal = options.timeout || this.config.timeout
        ? AbortSignal.timeout(options.timeout || this.config.timeout)
        : undefined

      const requestInit: RequestInit = {
        ...options,
        headers: this.buildHeaders(options),
        signal: options.signal || timeoutSignal || controller.signal,
        body: await this.buildBody(options),
      }

      const response = await fetch(finalUrl, {
        ...requestInit,
        verbose: options.verbose || this.config.verbose !== false,
      })

      const data = await this.parseResponse<T>(response)
      const endTime = performance.now()

      const result: HttxResponse<T> = {
        status: response.status,
        statusText: response.statusText,
        headers: response.headers,
        data,
        timings: {
          start: startTime,
          end: endTime,
          duration: endTime - startTime,
        },
      }

      debugLog('response', `${result.status} ${result.statusText} (${result.timings.duration}ms)`, this.config.verbose,
      )

      return ok(result)
    }
    catch (error) {
      return err(error instanceof Error ? error : new Error(String(error)))
    }
  }

  private buildUrl(url: string, query?: Record<string, string>): string {
    const baseUrl = this.config.baseUrl ? new URL(this.config.baseUrl) : null
    const finalUrl = baseUrl ? new URL(url, baseUrl) : new URL(url)

    if (query) {
      Object.entries(query).forEach(([key, value]) => {
        finalUrl.searchParams.append(key, value)
      })
    }

    return finalUrl.toString()
  }

  private buildHeaders(options: RequestOptions): Headers {
    const headers = new Headers(this.config.defaultHeaders)

    if (options.headers) {
      const customHeaders = new Headers(options.headers)
      customHeaders.forEach((value, key) => headers.set(key, value))
    }

    if (options.json) {
      headers.set('Content-Type', 'application/json')
      headers.set('Accept', 'application/json')
    }
    else if (options.form) {
      headers.set('Content-Type', 'application/x-www-form-urlencoded')
    }
    else if (options.multipart) {
      // Content-Type is automatically set for FormData
      headers.delete('Content-Type')
    }

    return headers
  }

  private async buildBody(options: RequestOptions): Promise<BodyInit | undefined> {
    if (!options.body)
      return undefined

    if (options.json) {
      return JSON.stringify(options.body)
    }

    if (options.form && (typeof options.body === 'object' && !(options.body instanceof FormData) && !(options.body instanceof URLSearchParams))) {
      const formData: Record<string, string> = {}
      for (const [key, value] of Object.entries(options.body)) {
        formData[key] = String(value)
      }
      return new URLSearchParams(formData).toString()
    }

    if (options.body instanceof FormData || options.body instanceof URLSearchParams) {
      return options.body
    }

    if (typeof options.body === 'string') {
      return options.body
    }

    throw new Error('Invalid body type')
  }

  private async parseResponse<T>(response: Response): Promise<T> {
    const contentType = response.headers.get('content-type')

    if (contentType?.includes('application/json')) {
      return response.json()
    }

    if (contentType?.includes('text/')) {
      return response.text() as Promise<T>
    }

    return response.blob() as Promise<T>
  }
}
