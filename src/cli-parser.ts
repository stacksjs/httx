import type { HttpMethod, RequestOptions } from './types'
import { HTTP_METHODS } from './types'
import { debugLog } from './utils'

const REQUEST_PATTERNS = {
  HEADER: /^([^:=@]+):(.+)$/,
  DATA: /^([^:=@]+)=(.+)$/,
  RAW_JSON: /^([^:=@]+):=(.+)$/,
  FILE_UPLOAD: /^([^:=@]+)@(.+)$/,
  QUERY: /^([^:=@]+)==(.+)$/,
} as const

interface ParsedArgs {
  url: string
  method: HttpMethod
  options: RequestOptions
}

function isHttpMethod(method: string): method is HttpMethod {
  return Object.values(HTTP_METHODS).includes(method as any)
}

export function parseCliArgs(args: string[]): ParsedArgs {
  let method: HttpMethod = 'GET'
  let url = ''
  const options: RequestOptions = {
    method: 'GET',
    headers: {} as Record<string, string>,
    query: {},
    body: undefined,
  }

  for (let i = 0; i < args.length; i++) {
    const arg = args[i]

    if (i === 0 && isHttpMethod(arg.toUpperCase())) {
      method = arg.toUpperCase() as HttpMethod
      options.method = method
      continue
    }

    if (i === 0 || (i === 1 && method === arg)) {
      try {
        // Handle URLs with or without protocol
        url = arg.includes('://') ? arg : `http://${arg}`
        new URL(url) // Validate URL
        continue
      }
      catch (e) {
        debugLog('parser', `Invalid URL: ${arg}`)
      }
    }

    // Parse request items
    let matched = false
    for (const [type, regex] of Object.entries(REQUEST_PATTERNS)) {
      const match = arg.match(regex)
      if (!match)
        continue

      const [, key, value] = match
      matched = true

      switch (type) {
        case 'HEADER': {
          const headers = options.headers as Record<string, string>
          headers[key.trim()] = value.trim()
          break
        }

        case 'DATA': {
          if (!options.body)
            options.body = {}
          if (options.body instanceof FormData) {
            options.body.append(key.trim(), value.trim())
          }
          else if (typeof options.body === 'object') {
            (options.body as Record<string, string>)[key.trim()] = value.trim()
          }
          break
        }

        case 'RAW_JSON': {
          if (!options.body || typeof options.body !== 'object' || options.body instanceof FormData) {
            options.body = {}
          }
          try {
            (options.body as Record<string, unknown>)[key.trim()] = JSON.parse(value.trim())
          }
          catch {
            (options.body as Record<string, string>)[key.trim()] = value.trim()
          }
          options.json = true
          break
        }

        case 'QUERY': {
          options.query![key.trim()] = value.trim()
          break
        }

        case 'FILE_UPLOAD': {
          if (!options.body || !(options.body instanceof FormData)) {
            options.body = new FormData()
            options.multipart = true
          }
          (options.body as FormData).append(key.trim(), value.trim())
          break
        }
      }
      break
    }

    if (!matched) {
      debugLog('parser', `Unmatched argument: ${arg}`)
    }
  }

  if (!url) {
    throw new Error('No URL provided')
  }

  return { url, method, options }
}
