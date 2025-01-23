// import type { HTTP_METHODS, RequestOptions } from './types'

const REQUEST_PATTERNS = {
  HEADER: /^([^:=@]+):(.+)$/,
  DATA: /^([^:=@]+)=(.+)$/,
  RAW_JSON: /^([^:=@]+):=(.+)$/,
  FILE_UPLOAD: /^([^:=@]+)@(.+)$/,
  QUERY: /^([^:=@]+)==(.+)$/,
} as const
