import { CAC } from 'cac'
import { version } from '../package.json'
import { debugLog } from '../src/utils'

const cli = new CAC('httx')

cli
  .command('[method] [url] [...items]', 'Make an HTTP request')
  .option('-v, --verbose', 'Enable verbose output')
  .option('-j, --json', 'Send JSON data')
  .option('-f, --form', 'Send form-encoded data')
  .option('-m, --multipart', 'Send multipart form data')
  .action(async (method, url, items, options) => {
    debugLog('cli', `Executing ${method} ${url}`, options.verbose)
    // ...
  })

cli.command('version', 'Show the version of the Reverse Proxy CLI').action(() => {
  console.log(version)
})

cli.version(version)
cli.help()
cli.parse()
