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
      'Content-Security-Policy': [
        "default-src 'self'",
        "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net",
        "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
        "font-src 'self' https://fonts.gstatic.com",
        "img-src 'self' data: https: blob:",
        "connect-src 'self' https://api.traf3li.com https://api-aws.traf3li.com wss://api.traf3li.com wss://api-aws.traf3li.com https://*.sentry.io ws://localhost:* http://localhost:*",
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

          // UI Libraries
          'vendor-ui': [
            '@radix-ui/react-dialog',
            '@radix-ui/react-dropdown-menu',
            '@radix-ui/react-popover',
            '@radix-ui/react-select',
            '@radix-ui/react-tooltip',
            '@radix-ui/react-tabs',
            '@radix-ui/react-accordion',
            '@radix-ui/react-collapsible',
            '@radix-ui/react-scroll-area',
          ],

          // Heavy Chart Libraries (lazy loaded)
          'vendor-charts': ['recharts'],
          'vendor-charts-nivo': ['@nivo/core', '@nivo/line', '@nivo/pie'],
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

          // Rich Text Editors (lazy loaded)
          'vendor-editor-ckeditor': [
            '@ckeditor/ckeditor5-react',
            '@ckeditor/ckeditor5-build-classic',
          ],
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

          // Flow/Diagram Libraries (lazy loaded)
          'vendor-flow': ['reactflow'],

          // Table Libraries
          'vendor-table': ['@tanstack/react-table'],

          // Icons
          'vendor-icons': ['lucide-react', '@tabler/icons-react', '@radix-ui/react-icons'],

          // Date/Time utilities
          'vendor-date': ['date-fns', 'date-fns-tz'],

          // Utilities
          'vendor-utils': [
            'axios',
            'zod',
            'clsx',
            'tailwind-merge',
            'class-variance-authority',
            'zustand',
            'i18next',
            'react-i18next',
          ],
        },
      },
    },
    // Increase chunk size warning limit for better performance
    chunkSizeWarningLimit: 1000,
  },
})
