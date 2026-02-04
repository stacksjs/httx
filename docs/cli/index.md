# CLI Overview

httx provides a powerful command-line interface for making HTTP requests. The syntax is designed to be intuitive and similar to httpie.

## Basic Syntax

```bash
httx [method] <url> [options] [data...]
```

- **method**: HTTP method (get, post, put, delete, patch, head, options)
- **url**: The target URL
- **options**: Request modifiers (headers, authentication, etc.)
- **data**: Request body data in key=value format

## Quick Examples

```bash
# GET request
httx get https://api.example.com/users

# POST with JSON body
httx post https://api.example.com/users name=John email=john@example.com -j

# PUT request
httx put https://api.example.com/users/1 name=Jane -j

# DELETE request
httx delete https://api.example.com/users/1

# PATCH request
httx patch https://api.example.com/users/1 status=active -j
```

## URL Shortcuts

httx supports URL shortcuts for convenience:

```bash
# Full URL
httx get https://api.example.com/users

# With scheme inference (defaults to https)
httx get api.example.com/users

# Localhost shorthand
httx get :3000/api/users  # Expands to http://localhost:3000/api/users
```

## Data Syntax

### Key-Value Pairs

```bash
# JSON object fields
httx post api.example.com/users name=John age:=25 active:=true -j

# String values (default)
name=John          # "name": "John"

# Non-string values (use :=)
age:=25            # "age": 25
active:=true       # "active": true
items:='["a","b"]' # "items": ["a", "b"]
```

### Nested Objects

```bash
httx post api.example.com/data \
  user[name]=John \
  user[email]=john@example.com \
  -j
```

Results in:

```json
{
  "user": {
    "name": "John",
    "email": "john@example.com"
  }
}
```

## Global Options

| Option | Short | Description |
|--------|-------|-------------|
| `--help` | `-h` | Show help information |
| `--version` | `-v` | Show version number |
| `--verbose` | | Enable verbose output |

## Request Options

| Option | Short | Description |
|--------|-------|-------------|
| `--json` | `-j` | Send as application/json |
| `--form` | `-f` | Send as application/x-www-form-urlencoded |
| `--multipart` | `-m` | Send as multipart/form-data |
| `--timeout` | `-t` | Request timeout in seconds |

## Header Options

| Option | Short | Description |
|--------|-------|-------------|
| `--header` | `-H` | Add custom header |
| `--auth` | `-a` | Basic authentication (user:pass) |
| `--bearer` | `-b` | Bearer token authentication |

## Output Options

| Option | Description |
|--------|-------------|
| `--print` | What to print (h=headers, b=body) |
| `--pretty` | Pretty print response |
| `--output` | Save response to file |

## Exit Codes

| Code | Meaning |
|------|---------|
| 0 | Success |
| 1 | Request error |
| 2 | Connection error |
| 3 | Timeout error |
| 4 | Invalid arguments |

## Configuration File

httx looks for configuration in:

1. `./httx.config.ts`
2. `./httx.config.js`
3. `~/.httx/config.ts`

Example config:

```typescript
export default {
  verbose: false,
  timeout: 30,
  defaultHeaders: {
    'User-Agent': 'httx/1.0',
  },
}
```

## Environment Variables

```bash
# Default timeout
export HTTX_TIMEOUT=30

# Verbose mode
export HTTX_VERBOSE=true

# Default base URL
export HTTX_BASE_URL=https://api.example.com
```

## Piping and Redirection

```bash
# Pipe JSON output
httx get api.example.com/users | jq '.[] | .name'

# Save to file
httx get api.example.com/users > users.json

# Read body from file
httx post api.example.com/import < data.json
```

## Next Steps

- [HTTP Methods](/cli/methods) - Detailed method documentation
- [Request Options](/cli/options) - All available options
- [Authentication](/cli/authentication) - Auth methods
- [File Uploads](/cli/file-uploads) - Uploading files
