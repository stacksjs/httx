import type { ProxyOption, StartOptions } from '../src/types'
import process from 'node:process'
import { CAC } from 'cac'
import { version } from '../package.json'
import { config } from '../src/config'

const cli = new CAC('httpsx')

// Define CLI options interface to match our core types
interface CLIOptions {
  from?: string
  to?: string
  keyPath?: string
  certPath?: string
  caCertPath?: string
  hostsCleanup?: boolean
  certsCleanup?: boolean
  startCommand?: string
  startCwd?: string
  startEnv?: string
  verbose?: boolean
}

cli
  .command('start', 'Start the Reverse Proxy Server')
  .option('--from <from>', 'The URL to proxy from')
  .option('--to <to>', 'The URL to proxy to')
  .option('--key-path <path>', 'Absolute path to the SSL key')
  .option('--cert-path <path>', 'Absolute path to the SSL certificate')
  .option('--ca-cert-path <path>', 'Absolute path to the SSL CA certificate')
  .option('--hosts-cleanup', 'Cleanup /etc/hosts on exit')
  .option('--certs-cleanup', 'Cleanup SSL certificates on exit')
  .option('--start-command <command>', 'Command to start the dev server')
  .option('--start-cwd <path>', 'Current working directory for the dev server')
  .option('--start-env <env>', 'Environment variables for the dev server')
  .option('--verbose', 'Enable verbose logging')
  .example('httpsx ...')
  .action(async (options?: CLIOptions) => {
    // ...
  })

cli.command('version', 'Show the version of the Reverse Proxy CLI').action(() => {
  console.log(version)
})

cli.version(version)
cli.help()
cli.parse()
