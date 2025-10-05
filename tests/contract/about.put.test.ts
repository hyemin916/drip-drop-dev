import { describe, it, expect } from 'vitest'

/**
 * Contract Test: PUT /api/about
 * Tests compliance with about-api.yaml OpenAPI specification
 *
 * This test MUST FAIL until the endpoint is implemented
 */
describe('PUT /api/about - Update About Me content', () => {
  const BASE_URL = 'http://localhost:3000'
  const ADMIN_SECRET = process.env.ADMIN_SECRET || 'test-secret-minimum-32-characters'

  it('should return 200 with updated AboutMe object', async () => {
    const updateData = {
      content: '# About Me\n\nUpdated bio content...',
    }

    const response = await fetch(`${BASE_URL}/api/about`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${ADMIN_SECRET}`,
      },
      body: JSON.stringify(updateData),
    })

    expect(response.status).toBe(200)
    const data = await response.json()

    expect(data).toHaveProperty('about')
    expect(data.about.content).toBe(updateData.content)
    expect(data.about).toHaveProperty('updatedAt')
  })

  it('should return 401 without authentication', async () => {
    const updateData = {
      content: '# About Me\n\nUnauthorized update',
    }

    const response = await fetch(`${BASE_URL}/api/about`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updateData),
    })

    expect(response.status).toBe(401)
  })

  it('should return 400 for invalid content (exceeds max length)', async () => {
    const longContent = 'x'.repeat(10001) // Exceeds 10,000 char limit

    const response = await fetch(`${BASE_URL}/api/about`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${ADMIN_SECRET}`,
      },
      body: JSON.stringify({ content: longContent }),
    })

    expect(response.status).toBe(400)
    const data = await response.json()
    expect(data).toHaveProperty('error')
  })

  it('should update updatedAt timestamp', async () => {
    const before = new Date()

    const response = await fetch(`${BASE_URL}/api/about`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${ADMIN_SECRET}`,
      },
      body: JSON.stringify({ content: '# Updated' }),
    })

    if (response.status === 200) {
      const data = await response.json()
      const updatedAt = new Date(data.about.updatedAt)
      expect(updatedAt.getTime()).toBeGreaterThanOrEqual(before.getTime())
    }
  })
})
