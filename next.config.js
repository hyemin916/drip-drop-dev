/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
  performance: {
    maxAssetSize: 200000, // 200KB budget for JS bundles
    maxEntrypointSize: 200000,
  },
}

module.exports = nextConfig
