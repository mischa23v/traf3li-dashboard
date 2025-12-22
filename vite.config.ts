import path from 'path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import tailwindcss from '@tailwindcss/vite'
import { tanstackRouter } from '@tanstack/router-plugin/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    tanstackRouter({
      target: 'react',
      autoCodeSplitting: true,
    }),
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    headers: {
      // HSTS - Force HTTPS (disabled in dev since we use HTTP)
      // 'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',

      // Prevent clickjacking
      'X-Frame-Options': 'DENY',

      // Prevent MIME-sniffing
      'X-Content-Type-Options': 'nosniff',

      // Enable XSS filter (legacy browsers)
      'X-XSS-Protection': '1; mode=block',

      // Control referrer information
      'Referrer-Policy': 'strict-origin-when-cross-origin',

      // Restrict browser features
      'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), payment=(), usb=(), interest-cohort=()',

      // Content Security Policy (dev version with HMR support)
      'Content-Security-Policy': [
        "default-src 'self'",
        "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net",
        "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
        "font-src 'self' data: https://fonts.gstatic.com",
        "img-src 'self' data: https: blob:",
        "connect-src 'self' https://api.traf3li.com wss://api.traf3li.com https://*.sentry.io https://*.workers.dev ws://localhost:* http://localhost:*",
        "frame-ancestors 'none'",
        "form-action 'self'",
        "base-uri 'self'",
      ].join('; '),
    },
  },
  build: {
    sourcemap: 'hidden', // Hidden source maps for Sentry (not exposed in browser)
    rollupOptions: {
      output: {
        manualChunks: {
          // Core vendor dependencies
          'vendor-react': ['react', 'react-dom', 'react-hook-form'],
          'vendor-router': ['@tanstack/react-router', '@tanstack/react-query'],

          // UI Libraries - Core components used across most pages
          'vendor-ui': [
            '@radix-ui/react-dialog',
            '@radix-ui/react-dropdown-menu',
            '@radix-ui/react-select',
            '@radix-ui/react-tooltip',
            '@radix-ui/react-tabs',
          ],
          // UI Libraries - Less common, lazy-loaded with specific features
          'vendor-ui-forms': [
            '@radix-ui/react-popover',
            '@radix-ui/react-collapsible',
            '@radix-ui/react-scroll-area',
            '@radix-ui/react-accordion',
          ],

          // Heavy Chart Libraries (lazy loaded)
          'vendor-charts': ['recharts'],
          'vendor-charts-trading': ['@mathieuc/tradingview'],

          // Calendar Libraries (lazy loaded)
          'vendor-calendar': [
            '@fullcalendar/core',
            '@fullcalendar/react',
            '@fullcalendar/daygrid',
            '@fullcalendar/timegrid',
            '@fullcalendar/list',
            '@fullcalendar/interaction',
          ],
          'vendor-gantt': ['dhtmlx-gantt'],

          // Rich Text Editor (lazy loaded) - Using TipTap only
          'vendor-editor-tiptap': [
            '@tiptap/react',
            '@tiptap/core',
            '@tiptap/starter-kit',
            '@tiptap/extension-link',
            '@tiptap/extension-image',
            '@tiptap/extension-table',
            '@tiptap/extension-table-row',
            '@tiptap/extension-table-cell',
            '@tiptap/extension-table-header',
          ],

          // Map Libraries (lazy loaded)
          'vendor-maps': ['leaflet', 'react-leaflet'],

          // Table Libraries
          'vendor-table': ['@tanstack/react-table'],

          // Icons
          'vendor-icons': ['lucide-react', '@tabler/icons-react', '@radix-ui/react-icons'],

          // Date/Time utilities
          'vendor-date': ['date-fns', 'date-fns-tz'],

          // Core Utilities - needed immediately on all pages
          'vendor-utils': [
            'axios',
            'clsx',
            'tailwind-merge',
            'class-variance-authority',
            'zustand',
            'i18next',
            'react-i18next',
          ],
          // Form validation - loaded with forms only
          'vendor-forms': [
            'zod',
            '@hookform/resolvers',
          ],
        },
      },
    },
    // Increase chunk size warning limit for better performance
    chunkSizeWarningLimit: 1000,
  },
})
