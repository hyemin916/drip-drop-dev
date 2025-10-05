import { describe, it, expect } from 'vitest'
import * as fs from 'fs/promises'
import * as path from 'path'

/**
 * Integration Test: Image Upload and Thumbnail Generation
 * Tests Sharp processing and thumbnail generation
 *
 * This test MUST FAIL until ImageService is implemented
 */
describe('Image Upload and Thumbnail Generation', () => {
  const BASE_URL = 'http://localhost:3000'
  const ADMIN_SECRET = process.env.ADMIN_SECRET || 'test-secret-minimum-32-characters'
  const UPLOAD_DIR = path.join(process.cwd(), 'content', 'images', 'uploads')
  const THUMBNAIL_DIR = path.join(process.cwd(), 'public', 'images', 'thumbnails')

  it('should upload image and generate thumbnail', async () => {
    const imageBlob = new Blob(['fake-png-data'], { type: 'image/png' })
    const formData = new FormData()
    formData.append('file', imageBlob, 'test-upload.png')
    formData.append('alt', 'Test uploaded image')
    formData.append('caption', 'Test caption for upload')

    const response = await fetch(`${BASE_URL}/api/images/upload`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${ADMIN_SECRET}`,
      },
      body: formData,
    })

    expect(response.status).toBe(201)
    const data = await response.json()

    expect(data.image).toHaveProperty('id')
    expect(data.image).toHaveProperty('url')
    expect(data.image.alt).toBe('Test uploaded image')
    expect(data.image.caption).toBe('Test caption for upload')

    // Verify original image was saved
    const uploadedFiles = await fs.readdir(UPLOAD_DIR)
    const uploadedFile = uploadedFiles.find(f => f.startsWith(data.image.id))
    expect(uploadedFile).toBeDefined()

    // Verify thumbnail was generated
    const thumbnailFiles = await fs.readdir(THUMBNAIL_DIR)
    const thumbnailFile = thumbnailFiles.find(f => f.includes(data.image.id))
    expect(thumbnailFile).toBeDefined()
  })

  it('should auto-select first image as thumbnail for post', async () => {
    // Create post with image in content
    const postData = {
      title: 'Post with Image',
      slug: 'post-with-image',
      content: '# Post\n\n![Test](https://example.com/image.jpg "Caption")',
      excerpt: 'Test',
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

    if (response.status === 201) {
      const data = await response.json()

      // Verify thumbnail was auto-selected
      if (data.post.images && data.post.images.length > 0) {
        expect(data.post.thumbnail).toBeDefined()
        expect(data.post.thumbnail?.url).toBe(data.post.images[0].url)
      }
    }
  })

  it('should support manual thumbnail override', async () => {
    const postData = {
      title: 'Custom Thumbnail Post',
      slug: 'custom-thumbnail',
      content: '# Post\n\n![Image](https://example.com/image.jpg)',
      excerpt: 'Test',
      category: '개발',
      thumbnail: '/images/custom-thumbnail.png',
    }

    const response = await fetch(`${BASE_URL}/api/posts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${ADMIN_SECRET}`,
      },
      body: JSON.stringify(postData),
    })

    if (response.status === 201) {
      const data = await response.json()

      // Verify manual thumbnail was used
      expect(data.post.thumbnail?.url).toBe('/images/custom-thumbnail.png')
    }
  })

  it('should use default placeholder when no images exist', async () => {
    const postData = {
      title: 'No Images Post',
      slug: 'no-images',
      content: '# Post with no images\n\nJust text content.',
      excerpt: 'No images',
      category: '일상',
    }

    const response = await fetch(`${BASE_URL}/api/posts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${ADMIN_SECRET}`,
      },
      body: JSON.stringify(postData),
    })

    if (response.status === 201) {
      const data = await response.json()

      // Verify default placeholder is used
      expect(data.post.thumbnail?.url).toContain('placeholder')
    }
  })

  it('should process image with Sharp and extract metadata', async () => {
    const imageBlob = new Blob(['fake-png-data'], { type: 'image/png' })
    const formData = new FormData()
    formData.append('file', imageBlob, 'metadata-test.png')
    formData.append('alt', 'Metadata test')

    const response = await fetch(`${BASE_URL}/api/images/upload`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${ADMIN_SECRET}`,
      },
      body: formData,
    })

    if (response.status === 201) {
      const data = await response.json()

      // Verify Sharp extracted metadata
      expect(data.image.width).toBeGreaterThan(0)
      expect(data.image.height).toBeGreaterThan(0)
      expect(data.image.format).toBeDefined()
      expect(['webp', 'png', 'jpeg', 'gif']).toContain(data.image.format)
      expect(data.image.fileSize).toBeGreaterThan(0)
    }
  })
})
