import type { HttpsxConfig } from './types'
import { resolve } from 'node:path'
import { loadConfig } from 'bunfig'

export const defaultConfig: HttpsxConfig = {
  verbose: true,
}

// eslint-disable-next-line antfu/no-top-level-await
export const config: HttpsxConfig = await loadConfig({
  name: 'httpsx',
  cwd: resolve(__dirname, '..'),
  defaultConfig,
})
