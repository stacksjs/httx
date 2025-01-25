import { Buffer } from 'node:buffer'
import process from 'node:process'
import { CAC } from 'cac'
import { version } from '../package.json'
import { parseCliArgs } from '../src/cli-parser'
import { HttxClient } from '../src/client'
import { config } from '../src/config'

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
  .action(async (method, url, items, flags) => {
    try {
      const parsedArgs = parseCliArgs([method, url, ...items].filter(Boolean))

      // Create client with merged config
      const client = new HttxClient({
        ...config,
        verbose: flags.verbose,
        timeout: flags.timeout ? Number.parseInt(flags.timeout) : undefined,
      })

      // Merge CLI flags with parsed options
      const options = {
        ...parsedArgs.options,
        json: flags.json || parsedArgs.options.json,
        form: flags.form,
        multipart: flags.multipart,
        downloadProgress: flags.download
          ? (progress: number) => {
              process.stdout.write(`\rDownloading... ${(progress * 100).toFixed(1)}%`)
            }
          : undefined,
      }

      if (flags.auth) {
        const [username, password] = flags.auth.split(':')
        options.headers = {
          ...options.headers,
          Authorization: `Basic ${Buffer.from(`${username}:${password || ''}`).toString('base64')}`,
        }
      }

      const result = await client.request(parsedArgs.url, options)

      result.match(
        (response) => {
          if (flags.download) {
            process.stdout.write('\n')
          }

          if (flags.verbose) {
            console.log('\nResponse Headers:')
            for (const [key, value] of response.headers.entries()) {
              console.log(`${key}: ${value}`)
            }
            console.log('\nResponse Body:')
          }

          if (typeof response.data === 'string' || Buffer.isBuffer(response.data)) {
            process.stdout.write(response.data)
          }
          else {
            console.log(JSON.stringify(response.data, null, 2))
          }

          if (flags.verbose) {
            console.log(`\nRequest completed in ${response.timings.duration.toFixed(2)}ms`)
          }

          process.exit(0)
        },
        (error) => {
          console.error('Error:', error.message)
          process.exit(1)
        },
      )
    }
    catch (error) {
      console.error('Error:', error instanceof Error ? error.message : String(error))
      process.exit(1)
    }
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
