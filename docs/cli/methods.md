# HTTP Methods

httx supports all standard HTTP methods with intuitive syntax.

## GET

Retrieve resources from a server.

```bash
# Simple GET
httx get https://api.example.com/users

# With query parameters
httx get "https://api.example.com/users?page=1&limit=10"

# Alternative query syntax
httx get https://api.example.com/users page==1 limit==10
```

### Common GET Patterns

```bash
# Get single resource
httx get https://api.example.com/users/123

# Search with filters
httx get https://api.example.com/products \
  category==electronics \
  min_price==100 \
  max_price==500

# Get with custom headers
httx get https://api.example.com/data \
  -H "Accept: application/xml" \
  -H "X-API-Key: secret"
```

## POST

Create new resources.

```bash
# JSON body (recommended)
httx post https://api.example.com/users \
  name=John \
  email=john@example.com \
  -j

# Form data
httx post https://api.example.com/login \
  username=john \
  password=secret \
  --form

# Raw JSON
httx post https://api.example.com/data \
  -H "Content-Type: application/json" \
  --body '{"key": "value"}'
```

### Complex POST Examples

```bash
# Nested objects
httx post https://api.example.com/orders \
  customer[name]=John \
  customer[email]=john@example.com \
  items:='[{"id": 1, "qty": 2}]' \
  -j

# File upload with metadata
httx post https://api.example.com/documents \
  file@./report.pdf \
  title="Annual Report" \
  category=reports \
  -m
```

## PUT

Replace entire resources.

```bash
# Update user
httx put https://api.example.com/users/123 \
  name=Jane \
  email=jane@example.com \
  role=admin \
  -j
```

### PUT vs PATCH

```bash
# PUT replaces the entire resource
httx put https://api.example.com/users/123 \
  name=Jane \
  email=jane@example.com \
  role=user \
  status=active \
  -j

# PATCH updates only specified fields
httx patch https://api.example.com/users/123 \
  role=admin \
  -j
```

## PATCH

Partial resource updates.

```bash
# Update specific fields
httx patch https://api.example.com/users/123 \
  status=inactive \
  -j

# Update nested fields
httx patch https://api.example.com/settings/123 \
  notifications[email]:=true \
  notifications[sms]:=false \
  -j
```

## DELETE

Remove resources.

```bash
# Simple delete
httx delete https://api.example.com/users/123

# Delete with confirmation body
httx delete https://api.example.com/users/123 \
  confirm:=true \
  -j

# Bulk delete
httx delete https://api.example.com/users \
  ids:='[1, 2, 3]' \
  -j
```

## HEAD

Get headers without body.

```bash
# Check if resource exists
httx head https://api.example.com/users/123

# Check content length
httx head https://cdn.example.com/large-file.zip

# Check cache headers
httx head https://api.example.com/data \
  -H "If-None-Match: abc123"
```

### HEAD Use Cases

```bash
# Check API availability
httx head https://api.example.com/health

# Verify file before download
httx head https://files.example.com/image.jpg
# Check Content-Length, Content-Type headers
```

## OPTIONS

Query allowed methods and CORS.

```bash
# Check allowed methods
httx options https://api.example.com/users

# CORS preflight check
httx options https://api.example.com/data \
  -H "Origin: https://myapp.com" \
  -H "Access-Control-Request-Method: POST"
```

## Method Shortcuts

```bash
# Method can be lowercase
httx get ...
httx GET ...

# When method is omitted, GET is default
httx https://api.example.com/users
# Same as: httx get https://api.example.com/users
```

## Content Type Inference

httx automatically sets Content-Type based on flags:

| Flag | Content-Type |
|------|--------------|
| `-j` / `--json` | `application/json` |
| `-f` / `--form` | `application/x-www-form-urlencoded` |
| `-m` / `--multipart` | `multipart/form-data` |

## Response Handling

```bash
# Print only response body
httx get https://api.example.com/users --print b

# Print only headers
httx get https://api.example.com/users --print h

# Print both headers and body
httx get https://api.example.com/users --print hb

# Pretty print JSON
httx get https://api.example.com/users --pretty
```

## Next Steps

- [Request Options](/cli/options) - Additional request modifiers
- [Authentication](/cli/authentication) - Auth methods
- [File Uploads](/cli/file-uploads) - Uploading files
