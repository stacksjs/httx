# Installation

httx can be installed globally for CLI usage or as a project dependency for library usage.

## Package Manager Installation

### Using Bun (Recommended)

```bash
# Global installation for CLI usage
bun install -g @stacksjs/httx

# Project dependency for library usage
bun add @stacksjs/httx
```

### Using npm

```bash
# Global installation
npm install -g @stacksjs/httx

# Project dependency
npm install @stacksjs/httx
```

### Using pnpm

```bash
# Global installation
pnpm add -g @stacksjs/httx

# Project dependency
pnpm add @stacksjs/httx
```

### Using Yarn

```bash
# Global installation
yarn global add @stacksjs/httx

# Project dependency
yarn add @stacksjs/httx
```

## Verify Installation

After installation, verify httx is working:

```bash
httx --version
```

You should see output like:

```
httx v0.1.5
```

## CLI Aliases

httx installs three command aliases:

- `httx` - The primary command
- `http` - Convenience alias for HTTP requests
- `https` - Convenience alias for HTTPS requests

All three commands work identically:

```bash
httx get example.com/api
http get example.com/api
https get example.com/api
```

## Development Installation

For contributing or development:

```bash
# Clone the repository
git clone https://github.com/stacksjs/httx.git
cd httx

# Install dependencies
bun install

# Build the project
bun run build

# Run locally
./httx get example.com
```

## Binary Releases

Pre-compiled binaries are available for multiple platforms:

- `httx-darwin-arm64` - macOS Apple Silicon
- `httx-darwin-x64` - macOS Intel
- `httx-linux-arm64` - Linux ARM64
- `httx-linux-x64` - Linux x64
- `httx-windows-x64.exe` - Windows x64

Download from [GitHub Releases](https://github.com/stacksjs/httx/releases).

## System Requirements

- **Node.js**: 18.0 or higher (for npm installation)
- **Bun**: 1.0 or higher (recommended)
- **Operating System**: macOS, Linux, or Windows

## TypeScript Configuration

If using httx as a library, ensure your `tsconfig.json` includes:

```json
{
  "compilerOptions": {
    "moduleResolution": "bundler",
    "target": "ES2022",
    "module": "ESNext"
  }
}
```

## Troubleshooting

### Command Not Found

If `httx` command is not found after global installation:

1. Ensure your package manager's bin directory is in PATH
2. For Bun: Add `~/.bun/bin` to your PATH
3. For npm: Run `npm bin -g` to find the global bin directory

### Permission Errors

On Unix systems, if you encounter permission errors:

```bash
# Using sudo (not recommended)
sudo npm install -g @stacksjs/httx

# Better: Fix npm permissions
mkdir ~/.npm-global
npm config set prefix '~/.npm-global'
export PATH=~/.npm-global/bin:$PATH
```

### TypeScript Import Errors

If TypeScript can't find httx types:

```bash
# Ensure types are installed
bun add -d @types/node

# Check moduleResolution in tsconfig.json
```

## Next Steps

- [Quick Start](/guide/quick-start) - Make your first request
- [CLI Overview](/cli) - Learn CLI commands
- [API Reference](/api) - Explore the library API
