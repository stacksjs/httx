import { describe, expect, it } from 'bun:test'
import { execSync } from 'node:child_process'

describe('httx CLI', () => {
  const cli = 'bun ./bin/cli.ts'

  describe('GET requests', () => {
    it('should fetch todos', async () => {
      const output = execSync(`${cli} get https://dummyjson.com/todos/1`).toString()
      const response = JSON.parse(output)
      expect(response.id).toBe(1)
      expect(response.todo).toBeDefined()
      expect(response.completed).toBeDefined()
    })

    it('should handle query parameters', async () => {
      const output = execSync(`${cli} get https://dummyjson.com/todos/search?q=clean`).toString()
      const response = JSON.parse(output)
      expect(response.todos.length).toBeGreaterThan(0)
    })

    // it('should follow redirects', async () => {
    //   const output = execSync(`${cli} -F get https://dummyjson.com/http/200/status/301`).toString()
    //   expect(output).toContain('200')
    // })
  })

  describe('POST requests', () => {
    it('should create new post with JSON data', async () => {
      const output = execSync(
        `${cli} -j post https://dummyjson.com/users/add name=John age:=30`,
      ).toString()
      const response = JSON.parse(output)
      expect(response.name).toBe('John')
      expect(response.age).toBe(30)
    })

    it('should handle form data', async () => {
      const output = execSync(
        `${cli} -f post https://dummyjson.com/products/add name='Test Product' price=99.99`,
      ).toString()
      const response = JSON.parse(output)
      expect(response.name).toBe('Test Product')
    })
  })

  describe('PUT requests', () => {
    it('should update existing post', async () => {
      const output = execSync(
        `${cli} put https://dummyjson.com/posts/1 title='Updated Title'`,
      ).toString()
      const response = JSON.parse(output)
      expect(response.title).toBe('Updated Title')
      expect(response.id).toBe(1)
    })
  })

  describe('DELETE requests', () => {
    it('should delete post', async () => {
      const output = execSync(`${cli} delete https://dummyjson.com/posts/1`).toString()
      const response = JSON.parse(output)
      expect(response.isDeleted).toBe(true)
      expect(response.deletedOn).toBeDefined()
    })
  })

  describe('Authentication', () => {
    it('should handle basic auth', async () => {
      const output = execSync(
        `${cli} -a 'atuny0:9uQFF1Lh' get https://dummyjson.com/auth/login`,
      ).toString()
      const response = JSON.parse(output)
      expect(response.token).toBeDefined()
    })
  })

  describe('Headers', () => {
    it('should send custom headers', async () => {
      const output = execSync(
        `${cli} get https://dummyjson.com/products/1 X-Custom-Header:test`,
      ).toString()
      const response = JSON.parse(output)
      expect(response.id).toBe(1)
    })
  })

  describe('Error handling', () => {
    it('should handle invalid URLs', async () => {
      let threw = false
      try {
        execSync(`${cli} get not-a-url`)
      }
      catch (error: any) {
        threw = true
        expect(error.stderr.toString()).toContain('Invalid URL')
      }
      expect(threw).toBe(true)
    })

    it('should handle network errors', async () => {
      let threw = false
      try {
        execSync(`${cli} get https://nonexistent.example.com`)
      }
      catch (error: any) {
        threw = true
      }
      expect(threw).toBe(true)
    })
  })

  describe('Verbose output', () => {
    it('should show headers and timing in verbose mode', async () => {
      const output = execSync(`${cli} -v get https://dummyjson.com/todos/1`).toString()
      expect(output).toContain('Response Headers')
      expect(output).toMatch(/Request completed in \d+\.\d+ms/)
    })
  })
})
