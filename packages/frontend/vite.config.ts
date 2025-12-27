import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { compression } from 'vite-plugin-compression2';
import { visualizer } from 'rollup-plugin-visualizer';

export default defineConfig({
  plugins: [
    react(),
    // Gzip compression
    compression({
      algorithm: 'gzip',
      exclude: [/\.(br)$/, /\.(gz)$/],
    }),
    // Brotli compression
    compression({
      algorithm: 'brotliCompress',
      exclude: [/\.(br)$/, /\.(gz)$/],
    }),
    // Bundle analyzer (only in analyze mode)
    process.env.ANALYZE &&
      visualizer({
        open: true,
        filename: 'dist/stats.html',
        gzipSize: true,
        brotliSize: true,
      }),
  ],
  resolve: {
    alias: {
      '@wishlist/shared': path.resolve(__dirname, '../shared/dist'),
      src: path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 3000,
    allowedHosts: true,
    proxy: {
      '/api': {
        target: 'http://localhost:3002',
        changeOrigin: true,
      },
    },
  },
  build: {
    // Output directory
    outDir: 'dist',

    // Generate sourcemaps for production debugging (optional, remove to reduce size)
    sourcemap: false,

    // Minification
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true, // Remove console.logs in production
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.info', 'console.debug'],
      },
      format: {
        comments: false, // Remove comments
      },
    },

    // Chunk size warning limit (500kb)
    chunkSizeWarningLimit: 500,

    // Rollup options for better code splitting
    rollupOptions: {
      output: {
        // Manual chunking strategy
        manualChunks: {
          // Vendor chunk - React and related libraries
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],

          // UI components chunk
          'vendor-ui': [
            'class-variance-authority',
            'clsx',
            'tailwind-merge',
            'next-themes',
            'sonner',
          ],

          // Form libraries chunk
          'vendor-forms': ['react-hook-form', '@hookform/resolvers', 'zod'],

          // Radix UI components (separate chunk as they can be large)
          'vendor-radix': ['radix-ui'],
        },

        // Asset file naming
        assetFileNames: (assetInfo) => {
          const info = assetInfo.name.split('.');
          let extType = info[info.length - 1];
          if (/\.(png|jpe?g|svg|gif|tiff|bmp|ico)$/i.test(assetInfo.name)) {
            extType = 'images';
          } else if (/\.(woff2?|eot|ttf|otf)$/i.test(assetInfo.name)) {
            extType = 'fonts';
          }
          return `assets/${extType}/[name]-[hash][extname]`;
        },

        // Chunk file naming
        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js',
      },
    },

    // CSS code splitting
    cssCodeSplit: true,

    // Optimize dependencies
    commonjsOptions: {
      include: [/node_modules/],
      transformMixedEsModules: true,
    },
  },

  // Optimize dependency pre-bundling
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      'react-hook-form',
      '@hookform/resolvers',
      'zod',
    ],
    exclude: ['@wishlist/shared'],
  },
});
