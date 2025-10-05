import { describe, it, expect } from 'vitest'

/**
 * Integration Test: Markdown Parsing with Images and Captions
 * Tests extracting images from Markdown using ![alt](url "caption") syntax
 *
 * This test MUST FAIL until MarkdownService is implemented
 */
describe('Markdown Parsing Integration', () => {
  const BASE_URL = 'http://localhost:3000'
  const ADMIN_SECRET = process.env.ADMIN_SECRET || 'test-secret-minimum-32-characters'

  it('should extract images from markdown content', async () => {
    const postData = {
      title: 'Post with Images',
      slug: 'markdown-images-test',
      content: `# Test Post

This post has multiple images.

![First Image](https://example.com/image1.jpg "First caption")

Some text between images.

![Second Image](https://example.com/image2.png "Second caption")

![Third Image](https://example.com/image3.webp)
`,
      excerpt: 'Test excerpt',
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

    // Verify images array was populated
    expect(Array.isArray(data.post.images)).toBe(true)
    expect(data.post.images.length).toBe(3)

    // Verify first image with caption
    expect(data.post.images[0].alt).toBe('First Image')
    expect(data.post.images[0].url).toBe('https://example.com/image1.jpg')
    expect(data.post.images[0].caption).toBe('First caption')

    // Verify second image with caption
    expect(data.post.images[1].alt).toBe('Second Image')
    expect(data.post.images[1].url).toBe('https://example.com/image2.png')
    expect(data.post.images[1].caption).toBe('Second caption')

    // Verify third image without caption
    expect(data.post.images[2].alt).toBe('Third Image')
    expect(data.post.images[2].url).toBe('https://example.com/image3.webp')
    expect(data.post.images[2].caption).toBeNull()
  })

  it('should handle markdown image syntax without caption', async () => {
    const postData = {
      title: 'Image No Caption',
      slug: 'image-no-caption',
      content: '![Alt text](https://example.com/image.jpg)',
      excerpt: 'Test',
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

      expect(data.post.images.length).toBe(1)
      expect(data.post.images[0].caption).toBeNull()
    }
  })

  it('should preserve markdown formatting when rendering', async () => {
    const postData = {
      title: 'Markdown Formatting Test',
      slug: 'markdown-formatting',
      content: `# Heading 1

## Heading 2

**Bold text** and *italic text*

- List item 1
- List item 2

\`\`\`javascript
const code = "example";
\`\`\`

[Link](https://example.com)
`,
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
      const readResponse = await fetch(`${BASE_URL}/api/posts/markdown-formatting`)

      expect(readResponse.status).toBe(200)
      const data = await readResponse.json()

      // Verify content was preserved
      expect(data.post.content).toContain('# Heading 1')
      expect(data.post.content).toContain('**Bold text**')
      expect(data.post.content).toContain('```javascript')
    }
  })

  it('should handle posts with no images gracefully', async () => {
    const postData = {
      title: 'No Images Post',
      slug: 'no-images-post',
      content: 'Just plain text, no images.',
      excerpt: 'Plain text',
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

      expect(data.post.images).toEqual([])
      expect(data.post.thumbnail?.url).toContain('placeholder')
    }
  })

  it('should extract caption from title attribute correctly', async () => {
    const postData = {
      title: 'Caption Test',
      slug: 'caption-test',
      content: '![Alt](https://example.com/img.jpg "This is a very long caption with multiple words and punctuation!")',
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

      expect(data.post.images[0].caption).toBe('This is a very long caption with multiple words and punctuation!')
    }
  })
})
