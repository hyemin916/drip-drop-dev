import { describe, it, expect, beforeAll } from 'vitest'

/**
 * Integration Test: Category Filtering
 * Tests filtering posts by category and counting
 *
 * This test MUST FAIL until services are implemented
 */
describe('Category Filtering Integration', () => {
  const BASE_URL = 'http://localhost:3000'
  const ADMIN_SECRET = process.env.ADMIN_SECRET || 'test-secret-minimum-32-characters'

  beforeAll(async () => {
    // Create test posts with different categories
    const posts = [
      { title: 'Dev Post 1', slug: 'dev-1', content: 'Dev content', excerpt: 'Dev', category: '개발' },
      { title: 'Dev Post 2', slug: 'dev-2', content: 'Dev content', excerpt: 'Dev', category: '개발' },
      { title: 'Daily Post 1', slug: 'daily-1', content: 'Daily content', excerpt: 'Daily', category: '일상' },
    ]

    for (const post of posts) {
      await fetch(`${BASE_URL}/api/posts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${ADMIN_SECRET}`,
        },
        body: JSON.stringify(post),
      })
    }
  })

  it('should filter posts by "개발" category', async () => {
    const response = await fetch(`${BASE_URL}/api/posts?category=개발`)

    expect(response.status).toBe(200)
    const data = await response.json()

    expect(Array.isArray(data.posts)).toBe(true)
    expect(data.posts.length).toBeGreaterThanOrEqual(2)

    data.posts.forEach((post: any) => {
      expect(post.category).toBe('개발')
    })
  })

  it('should filter posts by "일상" category', async () => {
    const response = await fetch(`${BASE_URL}/api/posts?category=일상`)

    expect(response.status).toBe(200)
    const data = await response.json()

    expect(Array.isArray(data.posts)).toBe(true)
    expect(data.posts.length).toBeGreaterThanOrEqual(1)

    data.posts.forEach((post: any) => {
      expect(post.category).toBe('일상')
    })
  })

  it('should return all posts when no category filter is applied', async () => {
    const response = await fetch(`${BASE_URL}/api/posts`)

    expect(response.status).toBe(200)
    const data = await response.json()

    expect(Array.isArray(data.posts)).toBe(true)
    expect(data.posts.length).toBeGreaterThanOrEqual(3)

    const categories = data.posts.map((p: any) => p.category)
    expect(categories).toContain('개발')
    expect(categories).toContain('일상')
  })

  it('should calculate category counts correctly', async () => {
    const response = await fetch(`${BASE_URL}/api/posts`)

    expect(response.status).toBe(200)
    const data = await response.json()

    const devCount = data.posts.filter((p: any) => p.category === '개발').length
    const dailyCount = data.posts.filter((p: any) => p.category === '일상').length

    expect(devCount).toBeGreaterThanOrEqual(2)
    expect(dailyCount).toBeGreaterThanOrEqual(1)
  })

  it('should return empty array for non-existent category', async () => {
    const response = await fetch(`${BASE_URL}/api/posts?category=invalid`)

    // Should either return 400 (invalid category) or empty array
    if (response.status === 200) {
      const data = await response.json()
      expect(data.posts).toEqual([])
    } else {
      expect(response.status).toBe(400)
    }
  })
})
