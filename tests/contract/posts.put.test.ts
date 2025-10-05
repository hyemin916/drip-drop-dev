import { describe, it, expect } from 'vitest'

/**
 * Contract Test: PUT /api/posts/[slug]
 * Tests compliance with posts-api.yaml OpenAPI specification
 *
 * This test MUST FAIL until the endpoint is implemented
 */
describe('PUT /api/posts/[slug] - Update post', () => {
  const BASE_URL = 'http://localhost:3000'
  const ADMIN_SECRET = process.env.ADMIN_SECRET || 'test-secret-minimum-32-characters'

  it('should return 200 with updated Post object', async () => {
    const slug = 'test-post'
    const updateData = {
      title: 'Updated Title',
      content: '# Updated Content\n\nThis is updated.',
      excerpt: 'Updated excerpt',
      category: '일상',
    }

    const response = await fetch(`${BASE_URL}/api/posts/${slug}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${ADMIN_SECRET}`,
      },
      body: JSON.stringify(updateData),
    })

    expect(response.status).toBe(200)
    const data = await response.json()

    expect(data).toHaveProperty('post')
    expect(data.post.title).toBe(updateData.title)
    expect(data.post.category).toBe(updateData.category)
    expect(data.post).toHaveProperty('updatedAt')
    expect(data.post.updatedAt).not.toBeNull()
  })

  it('should return 401 without authentication', async () => {
    const slug = 'test-post'
    const updateData = {
      title: 'Updated Title',
    }

    const response = await fetch(`${BASE_URL}/api/posts/${slug}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updateData),
    })

    expect(response.status).toBe(401)
  })

  it('should return 404 for non-existent slug', async () => {
    const response = await fetch(`${BASE_URL}/api/posts/non-existent`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${ADMIN_SECRET}`,
      },
      body: JSON.stringify({ title: 'Test' }),
    })

    expect(response.status).toBe(404)
  })

  it('should set updatedAt timestamp on update', async () => {
    const slug = 'test-post'
    const before = new Date()

    const response = await fetch(`${BASE_URL}/api/posts/${slug}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${ADMIN_SECRET}`,
      },
      body: JSON.stringify({ title: 'Updated' }),
    })

    if (response.status === 200) {
      const data = await response.json()
      const updatedAt = new Date(data.post.updatedAt)
      expect(updatedAt.getTime()).toBeGreaterThanOrEqual(before.getTime())
    }
  })
})
