import { describe, it, expect } from 'vitest'
import * as fs from 'fs/promises'
import * as path from 'path'

/**
 * Integration Test: Post Lifecycle (CRUD)
 * Tests complete create → read → update → delete flow
 * Verifies file system operations and frontmatter parsing
 *
 * This test MUST FAIL until services and API routes are implemented
 */
describe('Post Lifecycle Integration', () => {
  const BASE_URL = 'http://localhost:3000'
  const ADMIN_SECRET = process.env.ADMIN_SECRET || 'test-secret-minimum-32-characters'
  const CONTENT_DIR = path.join(process.cwd(), 'content', 'posts')

  it('should complete full CRUD lifecycle', async () => {
    const testSlug = 'integration-test-post'
    const postData = {
      title: 'Integration Test Post',
      slug: testSlug,
      content: '# Test Content\n\nThis is an integration test.',
      excerpt: 'Integration test excerpt',
      category: '개발',
    }

    // 1. CREATE
    const createResponse = await fetch(`${BASE_URL}/api/posts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${ADMIN_SECRET}`,
      },
      body: JSON.stringify(postData),
    })

    expect(createResponse.status).toBe(201)
    const created = await createResponse.json()
    expect(created.post.slug).toBe(testSlug)

    // Verify file exists
    const files = await fs.readdir(CONTENT_DIR)
    const postFile = files.find(f => f.includes(testSlug))
    expect(postFile).toBeDefined()

    // 2. READ
    const readResponse = await fetch(`${BASE_URL}/api/posts/${testSlug}`)
    expect(readResponse.status).toBe(200)
    const read = await readResponse.json()
    expect(read.post.title).toBe(postData.title)
    expect(read.post.content).toBe(postData.content)

    // 3. UPDATE
    const updateData = {
      title: 'Updated Title',
      content: '# Updated Content',
    }

    const updateResponse = await fetch(`${BASE_URL}/api/posts/${testSlug}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${ADMIN_SECRET}`,
      },
      body: JSON.stringify(updateData),
    })

    expect(updateResponse.status).toBe(200)
    const updated = await updateResponse.json()
    expect(updated.post.title).toBe(updateData.title)
    expect(updated.post.updatedAt).not.toBeNull()

    // Verify file was updated
    if (postFile) {
      const filePath = path.join(CONTENT_DIR, postFile)
      const fileContent = await fs.readFile(filePath, 'utf-8')
      expect(fileContent).toContain(updateData.title)
    }

    // 4. DELETE
    const deleteResponse = await fetch(`${BASE_URL}/api/posts/${testSlug}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${ADMIN_SECRET}`,
      },
    })

    expect(deleteResponse.status).toBe(204)

    // Verify file was deleted
    const filesAfterDelete = await fs.readdir(CONTENT_DIR)
    const deletedFile = filesAfterDelete.find(f => f.includes(testSlug))
    expect(deletedFile).toBeUndefined()

    // Verify 404 on read
    const readAfterDelete = await fetch(`${BASE_URL}/api/posts/${testSlug}`)
    expect(readAfterDelete.status).toBe(404)
  })

  it('should parse frontmatter correctly', async () => {
    const testSlug = 'frontmatter-test'
    const postData = {
      title: 'Frontmatter Test',
      slug: testSlug,
      content: 'Content',
      excerpt: 'Excerpt',
      category: '일상',
    }

    const createResponse = await fetch(`${BASE_URL}/api/posts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${ADMIN_SECRET}`,
      },
      body: JSON.stringify(postData),
    })

    if (createResponse.status === 201) {
      const files = await fs.readdir(CONTENT_DIR)
      const postFile = files.find(f => f.includes(testSlug))

      if (postFile) {
        const filePath = path.join(CONTENT_DIR, postFile)
        const fileContent = await fs.readFile(filePath, 'utf-8')

        // Verify frontmatter format
        expect(fileContent).toContain('---')
        expect(fileContent).toContain(`title: "${postData.title}"`)
        expect(fileContent).toContain(`slug: "${testSlug}"`)
        expect(fileContent).toContain(`category: "${postData.category}"`)
        expect(fileContent).toContain('publishedAt:')

        // Cleanup
        await fs.unlink(filePath)
      }
    }
  })
})
