import { config } from './config'
import { Logger } from '@stacksjs/clarity'

const logger = new Logger('httx', {
  showTags: false,
})

function shouldLog(category: string, verbose?: boolean | string[]): boolean {
  if (verbose === false) {
    return false
  }

  if (verbose === true || config.verbose === true) {
    return true
  }

  // Check both verbose parameter and config for array matching
  const verboseArrays = [verbose, config.verbose].filter(v => Array.isArray(v)) as string[][]

  for (const verboseArray of verboseArrays) {
    if (verboseArray.some(prefix => category.startsWith(prefix))) {
      return true
    }
  }

  return false
}

export function debugLog(category: string, message: string | (() => string), verbose?: boolean | string[]): void {
  if (!shouldLog(category, verbose)) {
    return
  }

  // Lazy evaluation: only compute message if logging will occur
  const actualMessage = typeof message === 'function' ? message() : message
  logger.debug(`[httx:${category}] ${actualMessage}`)
}

export async function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}
