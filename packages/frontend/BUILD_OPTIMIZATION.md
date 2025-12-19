# Frontend Build Optimization Guide

This document describes the production build optimizations implemented for the frontend application.

## Overview

The frontend build has been optimized to reduce bundle size, improve load times, and enhance overall performance. These optimizations are automatically applied during production builds.

## Implemented Optimizations

### 1. Code Splitting

**Route-based code splitting** using React.lazy() and Suspense:
- Each page component is loaded only when needed
- Reduces initial bundle size
- Improves time to interactive (TTI)

**Vendor chunking** separates dependencies into logical groups:
- `vendor-react`: React core libraries
- `vendor-ui`: UI utility libraries (clsx, tailwind-merge, etc.)
- `vendor-forms`: Form libraries (react-hook-form, zod)
- `vendor-radix`: Radix UI components

### 2. Minification & Tree Shaking

**Terser minification** with aggressive settings:
- Removes console.log statements in production
- Strips comments and debugger statements
- Optimizes function calls and variable names
- Reduces JavaScript bundle size by ~40-50%

**Tree shaking** automatically removes unused code:
- Dead code elimination
- Unused imports removal
- Works with ES modules

### 3. Compression

**Gzip compression** for all static assets:
- Pre-compressed files generated during build
- Nginx serves .gz files directly (gzip_static)
- Reduces transfer size by ~60-70%

**Brotli compression** (optional):
- Better compression than gzip (~15-20% smaller)
- Requires nginx-module-brotli
- Currently disabled as nginx:alpine doesn't include it by default

### 4. Asset Optimization

**Organized asset structure:**
```
dist/
├── assets/
│   ├── js/        # JavaScript chunks with content hashes
│   ├── css/       # CSS files with content hashes
│   ├── images/    # Image assets
│   └── fonts/     # Font files
└── index.html
```

**Cache headers:**
- Static assets (JS, CSS, fonts): 1 year cache with immutable flag
- index.html: no-cache to ensure updates
- Content-based hashing prevents cache issues

### 5. CSS Optimization

**CSS code splitting:**
- Each route gets its own CSS file
- Critical CSS can be inlined (future enhancement)
- Reduces initial CSS payload

**PostCSS optimizations:**
- Autoprefixer for browser compatibility
- Tailwind CSS purge removes unused styles
- Minification and compression

## Build Scripts

### Standard Production Build
```bash
npm run build
```
Runs TypeScript compilation followed by optimized Vite build.

### Analyze Bundle Size
```bash
npm run build:analyze
```
Generates a visual bundle size report at `dist/stats.html`:
- Shows all chunks and their sizes
- Displays gzip and brotli compressed sizes
- Identifies large dependencies
- Helps find optimization opportunities

### Preview Production Build
```bash
npm run preview
```
Serves the production build locally for testing.

## Performance Metrics

### Expected Bundle Sizes

**Before optimization:**
- Initial bundle: ~800-1000 KB
- Largest chunk: ~400-500 KB
- Total transferred (uncompressed): ~1.5 MB

**After optimization:**
- Initial bundle: ~200-300 KB (gzipped: ~80-100 KB)
- Largest vendor chunk: ~150-200 KB (gzipped: ~50-70 KB)
- Total transferred (gzipped): ~300-400 KB
- **Reduction: ~70-75% in transfer size**

### Route-based Chunks

Each route creates a separate chunk:
- HomePage: ~30-50 KB
- AddItemPage: ~25-40 KB
- EditItemPage: ~25-40 KB
- LoginPage: ~20-30 KB
- ProfilePage: ~30-50 KB
- PublicProfilePage: ~30-50 KB
- SubscriptionsPage: ~30-50 KB

Only the current route's chunk is loaded initially.

## Nginx Configuration

The production nginx configuration includes:

1. **Pre-compressed file serving** (`gzip_static on`)
2. **Dynamic gzip compression** for non-pre-compressed files
3. **Aggressive caching** for static assets (1 year)
4. **No caching** for index.html (ensures updates)
5. **Security headers** (XSS protection, frame options, etc.)

## Monitoring Bundle Size

### Using the Bundle Analyzer

Run the analyzer to visualize your bundle:
```bash
cd packages/frontend
npm run build:analyze
```

This will:
1. Build the production bundle
2. Generate `dist/stats.html`
3. Open it in your browser

**What to look for:**
- Large dependencies (>100 KB)
- Duplicate code across chunks
- Opportunities for lazy loading
- Unused exports from libraries

### CI/CD Integration

The GitHub Actions workflow automatically builds optimized bundles for pull requests. To monitor size:

1. Check workflow logs for build output
2. Compare bundle sizes between PRs
3. Set up size budgets (future enhancement)

## Best Practices

### When Adding Dependencies

1. **Check bundle size impact** using the analyzer
2. **Consider alternatives** (smaller libraries)
3. **Use tree-shakeable imports**:
   ```tsx
   // Good
   import { debounce } from 'lodash-es'

   // Bad (imports entire library)
   import _ from 'lodash'
   ```

### When Adding Components

1. **Lazy load** large components not needed initially
2. **Code split** by route when possible
3. **Avoid bloat** in critical path (shared layouts, providers)

### When Using Icons

1. **Import only needed icons** (already done via custom icon components)
2. **Consider SVG sprites** for many icons (future enhancement)
3. **Optimize SVG files** before adding

## Optimization Checklist

- [x] Route-based code splitting
- [x] Vendor chunk separation
- [x] Console.log removal in production
- [x] Terser minification
- [x] Gzip compression
- [x] CSS code splitting
- [x] Asset optimization
- [x] Cache headers configuration
- [x] Bundle size analyzer
- [ ] Image optimization (future)
- [ ] Critical CSS inlining (future)
- [ ] Service worker for caching (future)
- [ ] Resource hints (preload, prefetch) (future)

## Troubleshooting

### Large Bundle Size After Changes

1. Run `npm run build:analyze`
2. Identify the large chunk
3. Check if new dependencies were added
4. Consider lazy loading or code splitting

### Build Fails with Terser Errors

1. Check for syntax errors in JavaScript
2. Ensure all imports are valid
3. Try building without minification: `vite build --minify false`

### Nginx Not Serving Compressed Files

1. Verify `.gz` files exist in `dist/assets/`
2. Check nginx logs for errors
3. Ensure `gzip_static on` in nginx.conf
4. Test locally: `curl -H "Accept-Encoding: gzip" http://localhost`

## Future Enhancements

1. **Brotli compression** with custom nginx image
2. **Image optimization** with sharp or imagemin
3. **Critical CSS inlining** for faster first paint
4. **Service worker** for offline support and caching
5. **Resource hints** (preload, prefetch) for faster navigation
6. **Bundle size budgets** in CI/CD
7. **Lighthouse CI** for performance monitoring
8. **Module federation** if scaling to micro-frontends

## Resources

- [Vite Build Optimizations](https://vitejs.dev/guide/build.html)
- [React Code Splitting](https://react.dev/reference/react/lazy)
- [Web.dev Performance](https://web.dev/performance/)
- [Bundle Analysis Best Practices](https://web.dev/reduce-javascript-payloads-with-code-splitting/)
