import { describe, it, expect } from 'vitest'

/**
 * Contract Test: POST /api/posts
 * Tests compliance with posts-api.yaml OpenAPI specification
 *
 * This test MUST FAIL until the endpoint is implemented
 */
describe('POST /api/posts - Create new post', () => {
  const BASE_URL = 'http://localhost:3000'
  const ADMIN_SECRET = process.env.ADMIN_SECRET || 'test-secret-minimum-32-characters'

  it('should return 201 with created Post object', async () => {
    const postData = {
      title: 'Test Post',
      slug: 'test-post',
      content: '# Test Content\n\nThis is a test post.',
      excerpt: 'Test post excerpt',
      category: '개발',
    }

    const response = await fetch(`${BASE_URL}/api/posts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${ADMIN_SECRET}`,
      },
      body: JSON.stringify(postData),
    })

    expect(response.status).toBe(201)
    const data = await response.json()

    expect(data).toHaveProperty('post')
    expect(data.post.title).toBe(postData.title)
    expect(data.post.slug).toBe(postData.slug)
    expect(data.post.category).toBe(postData.category)
    expect(data.post).toHaveProperty('id')
    expect(data.post).toHaveProperty('publishedAt')
  })

  it('should return 401 without authentication', async () => {
    const postData = {
      title: 'Test Post',
      slug: 'test-post',
      content: 'Test content',
      excerpt: 'Test excerpt',
      category: '개발',
    }

    const response = await fetch(`${BASE_URL}/api/posts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(postData),
    })

    expect(response.status).toBe(401)
    const data = await response.json()
    expect(data).toHaveProperty('error')
  })

  it('should return 400 for invalid data', async () => {
    const invalidData = {
      title: '',
      category: 'invalid',
    }

    const response = await fetch(`${BASE_URL}/api/posts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${ADMIN_SECRET}`,
      },
      body: JSON.stringify(invalidData),
    })

    expect(response.status).toBe(400)
    const data = await response.json()
    expect(data).toHaveProperty('error')
  })

  it('should validate slug format (lowercase alphanumeric with hyphens)', async () => {
    const invalidSlug = {
      title: 'Test',
      slug: 'Invalid Slug!',
      content: 'Test',
      excerpt: 'Test',
      category: '개발',
    }

    const response = await fetch(`${BASE_URL}/api/posts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${ADMIN_SECRET}`,
      },
      body: JSON.stringify(invalidSlug),
    })

    expect(response.status).toBe(400)
  })
})
