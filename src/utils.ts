import { config } from './config'
import { Logger} from '@stacksjs/clarity'

const logger = new Logger('httx', {
  showTags: false
})

export function debugLog(category: string, message: string, verbose?: boolean | string[]): void {
  if (verbose === false) {
    return
  }

  if (verbose === true || config.verbose === true) {
    logger.debug(`[httx:${category}] ${message}`)
  }

  if (Array.isArray(verbose)) {
    // Check if any of the verbose categories match the prefix
    const matches = verbose.some(prefix => category.startsWith(prefix))
    if (matches) {
      logger.debug(`[httx:${category}] ${message}`)
    }
  }

  if (Array.isArray(config.verbose)) {
    // Check if any of the verbose categories match the prefix
    const matches = config.verbose.some(prefix => category.startsWith(prefix))
    if (matches) {
      logger.debug(`[httx:${category}] ${message}`)
    }
  }
}
