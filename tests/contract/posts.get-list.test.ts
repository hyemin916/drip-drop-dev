import { describe, it, expect } from 'vitest'

/**
 * Contract Test: GET /api/posts
 * Tests compliance with posts-api.yaml OpenAPI specification
 *
 * This test MUST FAIL until the endpoint is implemented
 */
describe('GET /api/posts - List all posts', () => {
  const BASE_URL = 'http://localhost:3000'

  it('should return 200 with array of PostSummary objects', async () => {
    const response = await fetch(`${BASE_URL}/api/posts`)

    expect(response.status).toBe(200)
    expect(response.headers.get('content-type')).toContain(
      'application/json'
    )

    const data = await response.json()
    expect(data).toHaveProperty('posts')
    expect(Array.isArray(data.posts)).toBe(true)

    if (data.posts.length > 0) {
      const post = data.posts[0]
      expect(post).toHaveProperty('id')
      expect(post).toHaveProperty('title')
      expect(post).toHaveProperty('slug')
      expect(post).toHaveProperty('excerpt')
      expect(post).toHaveProperty('category')
      expect(post).toHaveProperty('publishedAt')
      expect(post).toHaveProperty('thumbnail')
      expect(['일상', '개발']).toContain(post.category)
    }
  })

  it('should support pagination with page and limit query params', async () => {
    const response = await fetch(`${BASE_URL}/api/posts?page=1&limit=5`)

    expect(response.status).toBe(200)
    const data = await response.json()

    expect(data).toHaveProperty('posts')
    expect(data).toHaveProperty('pagination')
    expect(data.pagination).toHaveProperty('page')
    expect(data.pagination).toHaveProperty('limit')
    expect(data.pagination).toHaveProperty('total')
    expect(data.pagination.page).toBe(1)
    expect(data.pagination.limit).toBe(5)
  })

  it('should filter by category query parameter', async () => {
    const response = await fetch(`${BASE_URL}/api/posts?category=개발`)

    expect(response.status).toBe(200)
    const data = await response.json()

    expect(Array.isArray(data.posts)).toBe(true)
    data.posts.forEach((post: any) => {
      expect(post.category).toBe('개발')
    })
  })

  it('should return posts sorted by newest first', async () => {
    const response = await fetch(`${BASE_URL}/api/posts`)

    expect(response.status).toBe(200)
    const data = await response.json()

    if (data.posts.length > 1) {
      const dates = data.posts.map((p: any) => new Date(p.publishedAt).getTime())
      const sortedDates = [...dates].sort((a, b) => b - a)
      expect(dates).toEqual(sortedDates)
    }
  })
})
