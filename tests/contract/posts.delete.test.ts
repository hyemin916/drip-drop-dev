import { describe, it, expect } from 'vitest'

/**
 * Contract Test: DELETE /api/posts/[slug]
 * Tests compliance with posts-api.yaml OpenAPI specification
 *
 * This test MUST FAIL until the endpoint is implemented
 */
describe('DELETE /api/posts/[slug] - Delete post', () => {
  const BASE_URL = 'http://localhost:3000'
  const ADMIN_SECRET = process.env.ADMIN_SECRET || 'test-secret-minimum-32-characters'

  it('should return 204 on successful deletion', async () => {
    const slug = 'test-post-to-delete'

    const response = await fetch(`${BASE_URL}/api/posts/${slug}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${ADMIN_SECRET}`,
      },
    })

    expect(response.status).toBe(204)
    expect(response.headers.get('content-length')).toBe('0')
  })

  it('should return 401 without authentication', async () => {
    const slug = 'test-post'

    const response = await fetch(`${BASE_URL}/api/posts/${slug}`, {
      method: 'DELETE',
    })

    expect(response.status).toBe(401)
  })

  it('should return 404 for non-existent slug', async () => {
    const response = await fetch(`${BASE_URL}/api/posts/non-existent`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${ADMIN_SECRET}`,
      },
    })

    expect(response.status).toBe(404)
  })

  it('should actually delete the post file', async () => {
    const slug = 'test-post-to-delete'

    // Delete
    const deleteResponse = await fetch(`${BASE_URL}/api/posts/${slug}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${ADMIN_SECRET}`,
      },
    })

    expect(deleteResponse.status).toBe(204)

    // Verify it's gone
    const getResponse = await fetch(`${BASE_URL}/api/posts/${slug}`)
    expect(getResponse.status).toBe(404)
  })
})
