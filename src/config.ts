import type { HttxConfig } from './types'
import { resolve } from 'node:path'
import { loadConfig } from 'bunfig'

export const defaultConfig: HttxConfig = {
  verbose: true,
}

// eslint-disable-next-line antfu/no-top-level-await
export const config: HttxConfig = await loadConfig({
  name: 'httx',
  cwd: resolve(__dirname, '..'),
  defaultConfig,
})
