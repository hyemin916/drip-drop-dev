import { describe, it, expect } from 'vitest'

/**
 * Contract Test: GET /api/about
 * Tests compliance with about-api.yaml OpenAPI specification
 *
 * This test MUST FAIL until the endpoint is implemented
 */
describe('GET /api/about - Get About Me content', () => {
  const BASE_URL = 'http://localhost:3000'

  it('should return 200 with AboutMe object', async () => {
    const response = await fetch(`${BASE_URL}/api/about`)

    expect(response.status).toBe(200)
    const data = await response.json()

    expect(data).toHaveProperty('about')
    expect(data.about).toHaveProperty('id')
    expect(data.about.id).toBe('about-me')
    expect(data.about).toHaveProperty('content')
    expect(data.about).toHaveProperty('updatedAt')
    expect(data.about).toHaveProperty('author')
  })

  it('should return 404 if About Me content does not exist', async () => {
    // This assumes the about page might not exist initially
    const response = await fetch(`${BASE_URL}/api/about`)

    if (response.status === 404) {
      const data = await response.json()
      expect(data).toHaveProperty('error')
    }
  })

  it('should return markdown content as string', async () => {
    const response = await fetch(`${BASE_URL}/api/about`)

    if (response.status === 200) {
      const data = await response.json()
      expect(typeof data.about.content).toBe('string')
      expect(data.about.content.length).toBeGreaterThan(0)
    }
  })
})
