# Deployment Guide

This guide covers deploying Drip Drop Dev to production environments.

## Table of Contents

- [Vercel Deployment (Recommended)](#vercel-deployment-recommended)
- [Environment Variables](#environment-variables)
- [Custom Domain Setup](#custom-domain-setup)
- [Performance Monitoring](#performance-monitoring)
- [Troubleshooting](#troubleshooting)

---

## Vercel Deployment (Recommended)

Vercel is the recommended platform for deploying Next.js applications, offering zero-configuration deployment with automatic HTTPS, CDN, and edge caching.

### Prerequisites

- GitHub account with your blog repository
- Vercel account (sign up at [vercel.com](https://vercel.com))

### Step 1: Push Code to GitHub

```bash
# Initialize git (if not already done)
git init
git add .
git commit -m "Initial commit"

# Push to GitHub
git remote add origin https://github.com/yourusername/dripdrop-dev.git
git branch -M main
git push -u origin main
```

### Step 2: Import Project to Vercel

1. Go to [vercel.com/new](https://vercel.com/new)
2. Click **"Import Git Repository"**
3. Select your `dripdrop-dev` repository
4. Click **"Import"**

### Step 3: Configure Project Settings

Vercel will auto-detect Next.js. Verify the following settings:

- **Framework Preset**: Next.js
- **Build Command**: `npm run build`
- **Output Directory**: `.next`
- **Install Command**: `npm install`
- **Development Command**: `npm run dev`

### Step 4: Set Environment Variables

Click **"Environment Variables"** and add:

| Name | Value | Environment |
|------|-------|-------------|
| `ADMIN_SECRET` | Your admin secret (min 32 chars) | Production, Preview, Development |
| `OWNER_NAME` | Your display name | Production, Preview, Development |
| `OWNER_EMAIL` | your@email.com | Production, Preview, Development |
| `NEXT_PUBLIC_API_URL` | https://yourdomain.com | Production |

**Important**: Generate a strong `ADMIN_SECRET`:

```bash
# Generate a random 32-character secret
openssl rand -base64 32
```

### Step 5: Deploy

1. Click **"Deploy"**
2. Wait for deployment to complete (~2-3 minutes)
3. Visit your deployed site at `https://your-project.vercel.app`

---

## Environment Variables

### Required Variables

#### `ADMIN_SECRET`

**Purpose**: Authentication secret for admin routes

**Format**: String (minimum 32 characters)

**Example**:
```
ADMIN_SECRET=your-super-secret-key-at-least-32-characters-long
```

**Security Notes**:
- Never commit to version control
- Rotate periodically (monthly recommended)
- Use strong, randomly generated values
- Store securely in password manager

#### `OWNER_NAME`

**Purpose**: Display name for blog author

**Format**: String

**Example**:
```
OWNER_NAME="Drip Drop Dev"
```

#### `OWNER_EMAIL`

**Purpose**: Contact email (optional, displayed in About page)

**Format**: Email address

**Example**:
```
OWNER_EMAIL="hello@dripdrop.dev"
```

### Optional Variables

#### `NEXT_PUBLIC_API_URL`

**Purpose**: API base URL for client-side fetching

**Format**: Full URL (no trailing slash)

**Default**: `http://localhost:3000` (development)

**Production Example**:
```
NEXT_PUBLIC_API_URL=https://dripdrop.dev
```

---

## Custom Domain Setup

### Step 1: Add Domain in Vercel

1. Go to your project **Settings** → **Domains**
2. Click **"Add"**
3. Enter your domain (e.g., `dripdrop.dev`)
4. Click **"Add"**

### Step 2: Configure DNS

Vercel will provide DNS records. Add these to your domain registrar:

**For root domain (dripdrop.dev)**:
- Type: `A`
- Name: `@`
- Value: `76.76.21.21`

**For www subdomain (www.dripdrop.dev)**:
- Type: `CNAME`
- Name: `www`
- Value: `cname.vercel-dns.com`

### Step 3: Verify Domain

1. Wait for DNS propagation (5 minutes - 48 hours)
2. Vercel will automatically verify and provision SSL certificate
3. Your site will be accessible at `https://yourdomain.com`

### Step 4: Redirect www to Root (Optional)

In Vercel dashboard:

1. **Settings** → **Domains**
2. Find `www.yourdomain.com`
3. Click **"Edit"**
4. Select **"Redirect to yourdomain.com"**

---

## Performance Monitoring

### Vercel Analytics

Enable built-in analytics:

1. **Project Settings** → **Analytics**
2. Click **"Enable Analytics"**
3. Choose plan (Hobby is free)

Metrics tracked:
- Page views
- Unique visitors
- Top pages
- Countries
- Devices
- Web Vitals (FCP, LCP, CLS, FID, TTFB)

### Lighthouse CI

Monitor performance metrics in CI/CD:

#### 1. Install Lighthouse CI

```bash
npm install -D @lhci/cli
```

#### 2. Create Configuration

Create `.lighthouserc.json`:

```json
{
  "ci": {
    "collect": {
      "url": [
        "http://localhost:3000/",
        "http://localhost:3000/about",
        "http://localhost:3000/posts/sample-post"
      ],
      "numberOfRuns": 3
    },
    "assert": {
      "preset": "lighthouse:recommended",
      "assertions": {
        "categories:performance": ["error", {"minScore": 0.9}],
        "categories:accessibility": ["error", {"minScore": 0.95}],
        "first-contentful-paint": ["error", {"maxNumericValue": 1500}],
        "largest-contentful-paint": ["error", {"maxNumericValue": 2500}],
        "cumulative-layout-shift": ["error", {"maxNumericValue": 0.1}]
      }
    },
    "upload": {
      "target": "temporary-public-storage"
    }
  }
}
```

#### 3. Add GitHub Action

Create `.github/workflows/lighthouse.yml`:

```yaml
name: Lighthouse CI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  lighthouse:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'

      - name: Install dependencies
        run: npm ci

      - name: Build
        run: npm run build

      - name: Start server
        run: npm run start &
        env:
          ADMIN_SECRET: ${{ secrets.ADMIN_SECRET }}
          OWNER_NAME: "Test Owner"

      - name: Wait for server
        run: npx wait-on http://localhost:3000 -t 30000

      - name: Run Lighthouse CI
        run: npx @lhci/cli@0.12.x autorun
```

### Performance Budget

Monitor bundle sizes to prevent bloat:

```json
// next.config.js
module.exports = {
  webpack(config) {
    config.performance = {
      maxAssetSize: 200000, // 200KB
      maxEntrypointSize: 200000
    };
    return config;
  }
};
```

---

## Continuous Integration

### GitHub Actions for Testing

Create `.github/workflows/test.yml`:

```yaml
name: Test

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run linter
        run: npm run lint

      - name: Run type check
        run: npx tsc --noEmit

      - name: Run unit tests
        run: npm test -- --coverage

      - name: Run build
        run: npm run build
        env:
          ADMIN_SECRET: ${{ secrets.ADMIN_SECRET }}
```

---

## Troubleshooting

### Build Failures

**Problem**: Build fails with "Module not found"

**Solution**:
1. Verify all dependencies are in `package.json`
2. Clear `.next` and `node_modules`:
   ```bash
   rm -rf .next node_modules
   npm install
   npm run build
   ```

**Problem**: Environment variables not set

**Solution**: Check Vercel Environment Variables:
1. Go to **Project Settings** → **Environment Variables**
2. Ensure all required variables are set for Production
3. Re-deploy: **Deployments** → **...** → **Redeploy**

### Performance Issues

**Problem**: Slow page loads

**Solutions**:
1. Enable Vercel Edge Caching
2. Optimize images with Sharp
3. Check bundle size: `npm run build` and review output
4. Use `next/dynamic` for heavy components

**Problem**: High LCP (Largest Contentful Paint)

**Solutions**:
1. Optimize images (use WebP, appropriate sizes)
2. Reduce JavaScript bundle size
3. Preload critical resources
4. Use ISR for frequently accessed pages

### Authentication Issues

**Problem**: Cannot access admin routes

**Solutions**:
1. Verify `ADMIN_SECRET` environment variable is set
2. Check browser cookies (DevTools → Application → Cookies)
3. Ensure cookie is set correctly:
   ```javascript
   document.cookie = "admin_auth=YOUR_SECRET; path=/; secure; samesite=strict"
   ```

### Content Not Displaying

**Problem**: Posts not showing on homepage

**Solutions**:
1. Verify Markdown files are in `content/posts/`
2. Check frontmatter format matches schema
3. Ensure files follow naming convention: `YYYY-MM-DD-slug.md`
4. Check logs for parsing errors

---

## Post-Deployment Checklist

- [ ] Verify all pages load correctly
- [ ] Test authentication (admin routes)
- [ ] Create first blog post
- [ ] Update About Me page
- [ ] Set up custom domain (if applicable)
- [ ] Enable Vercel Analytics
- [ ] Configure Lighthouse CI
- [ ] Test on mobile devices
- [ ] Run accessibility audit
- [ ] Check performance metrics
- [ ] Set up monitoring alerts

---

## Additional Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Lighthouse CI Documentation](https://github.com/GoogleChrome/lighthouse-ci)
- [Web Vitals](https://web.dev/vitals/)

---

**Need help?** Open an issue on GitHub or contact support.
