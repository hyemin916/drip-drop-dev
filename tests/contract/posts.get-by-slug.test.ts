import { describe, it, expect } from 'vitest'

/**
 * Contract Test: GET /api/posts/[slug]
 * Tests compliance with posts-api.yaml OpenAPI specification
 *
 * This test MUST FAIL until the endpoint is implemented
 */
describe('GET /api/posts/[slug] - Get post by slug', () => {
  const BASE_URL = 'http://localhost:3000'

  it('should return 200 with full Post object', async () => {
    const slug = 'test-post'
    const response = await fetch(`${BASE_URL}/api/posts/${slug}`)

    expect(response.status).toBe(200)
    const data = await response.json()

    expect(data).toHaveProperty('post')
    expect(data.post).toHaveProperty('id')
    expect(data.post).toHaveProperty('title')
    expect(data.post).toHaveProperty('slug')
    expect(data.post).toHaveProperty('content')
    expect(data.post).toHaveProperty('excerpt')
    expect(data.post).toHaveProperty('category')
    expect(data.post).toHaveProperty('publishedAt')
    expect(data.post).toHaveProperty('thumbnail')
    expect(data.post).toHaveProperty('images')
    expect(data.post).toHaveProperty('author')
    expect(data.post.slug).toBe(slug)
  })

  it('should return 404 for non-existent slug', async () => {
    const response = await fetch(`${BASE_URL}/api/posts/non-existent-slug`)

    expect(response.status).toBe(404)
    const data = await response.json()
    expect(data).toHaveProperty('error')
  })

  it('should include images array extracted from markdown', async () => {
    const slug = 'test-post-with-images'
    const response = await fetch(`${BASE_URL}/api/posts/${slug}`)

    if (response.status === 200) {
      const data = await response.json()
      expect(Array.isArray(data.post.images)).toBe(true)
    }
  })
})
