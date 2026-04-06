import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@reduxjs/toolkit': path.resolve(
        __dirname,
        'node_modules/@reduxjs/toolkit/dist/redux-toolkit.browser.mjs'
      ),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) {
            return undefined;
          }

          if (id.includes('firebase')) {
            return 'firebase';
          }

          if (id.includes('react') || id.includes('scheduler')) {
            return 'react-vendor';
          }

          if (id.includes('@reduxjs') || id.includes('redux')) {
            return 'redux-vendor';
          }

          if (id.includes('@tanstack')) {
            return 'query-vendor';
          }

          if (id.includes('react-router')) {
            return 'router-vendor';
          }

          if (id.includes('bootstrap')) {
            return 'bootstrap-vendor';
          }

          return 'vendor';
        },
      },
    },
  },
})
