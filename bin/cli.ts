import { CAC } from 'cac'
import { version } from '../package.json'
import { debugLog } from '../src/utils'

const cli = new CAC('httx')

cli
  .command('[method] [url] [...items]', 'Make an HTTP request')
  .option('-j, --json', 'Send JSON data')
  .option('-f, --form', 'Send form-encoded data')
  .option('-m, --multipart', 'Send multipart form data')
  .option('-d, --download', 'Download mode')
  .option('-F, --follow', 'Follow redirects', { default: true })
  .option('-a, --auth <auth>', 'Authentication (username:password)')
  .option('-t, --timeout <timeout>', 'Request timeout in milliseconds')
  .option('-v, --verbose', 'Enable verbose output')
  .action(async (method, url, items, options) => {
    debugLog('cli', `Executing ${method} ${url}`, options.verbose)
    // ...
  })

cli
  .command('completion', 'Generate shell completion script')
  .action(() => {
    // TODO: Implement shell completion generation
    console.log('Shell completion not implemented yet')
  })

cli.command('version', 'Show the version of the Reverse Proxy CLI').action(() => {
  console.log(version)
})

cli.version(version)
cli.help()
cli.parse()
