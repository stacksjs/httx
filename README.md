<p align="center"><img src="https://github.com/stacksjs/httpsx/blob/main/.github/art/cover.jpg?raw=true" alt="Social Card of this repo"></p>

[![npm version][npm-version-src]][npm-version-href]
[![GitHub Actions][github-actions-src]][github-actions-href]
[![Commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg)](http://commitizen.github.io/cz-cli/)
<!-- [![npm downloads][npm-downloads-src]][npm-downloads-href] -->
<!-- [![Codecov][codecov-src]][codecov-href] -->

# httpsx

> httpsx is a simple, lightweight and user-friendly API client.

## Features

-

## Install

```bash
bun install -d httpsx
```

<!-- _Alternatively, you can install:_

```bash
brew install httpsx # wip
pkgx install httpsx # wip
``` -->

## Get Started

Making requests is simple. There are two ways of getting started: _as a library or as a CLI._

### Library

Given the npm package is installed:

```ts
import type { HttpsxConfig } from 'httpsx'
import { ... } from 'httpsx'

// ...
```

In case you are trying to start multiple proxies, you may use this configuration:

### CLI

```bash
httpsx ...
httpsx --help
httpsx --version
```

## Configuration

The Reverse Proxy can be configured using a `httpsx.config.ts` _(or `httpsx.config.js`)_ file and it will be automatically loaded when running the `reverse-proxy` command.

```ts
// httpsx.config.{ts,js}
import type { HttpsxOptions } from '@stacksjs/httpsx'
import os from 'node:os'
import path from 'node:path'

const config: HttpsxOptions = {
  verbose: false,
}

export default config
```

_Then run:_

```bash
./httpsx
```

To learn more, head over to the [documentation](https://httpsx.netlify.app/).

## Testing

```bash
bun test
```

## Changelog

Please see our [releases](https://github.com/stacksjs/stacks/releases) page for more information on what has changed recently.

## Contributing

Please review the [Contributing Guide](https://github.com/stacksjs/contributing) for details.

## Community

For help, discussion about best practices, or any other conversation that would benefit from being searchable:

[Discussions on GitHub](https://github.com/stacksjs/stacks/discussions)

For casual chit-chat with others using this package:

[Join the Stacks Discord Server](https://discord.gg/stacksjs)

## Postcardware

Two things are true: Stacks OSS will always stay open-source, and we do love to receive postcards from wherever Stacks is used! 🌍 _We also publish them on our website. And thank you, Spatie_

Our address: Stacks.js, 12665 Village Ln #2306, Playa Vista, CA 90094 🌎

## Sponsors

We would like to extend our thanks to the following sponsors for funding Stacks development. If you are interested in becoming a sponsor, please reach out to us.

- [JetBrains](https://www.jetbrains.com/)
- [The Solana Foundation](https://solana.com/)

## Credits

- [Chris Breuer](https://github.com/chrisbbreuer)
- [All Contributors](../../contributors)

## License

The MIT License (MIT). Please see [LICENSE](https://github.com/stacksjs/stacks/tree/main/LICENSE.md) for more information.

Made with 💙

<!-- Badges -->
[npm-version-src]: https://img.shields.io/npm/v/@stacksjs/httpsx?style=flat-square
[npm-version-href]: https://npmjs.com/package/@stacksjs/httpsx
[github-actions-src]: https://img.shields.io/github/actions/workflow/status/stacksjs/httpsx/ci.yml?style=flat-square&branch=main
[github-actions-href]: https://github.com/stacksjs/httpsx/actions?query=workflow%3Aci

<!-- [codecov-src]: https://img.shields.io/codecov/c/gh/stacksjs/httpsx/main?style=flat-square
[codecov-href]: https://codecov.io/gh/stacksjs/httpsx -->
