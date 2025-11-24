import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'favicon.svg', 'robots.txt'],
      manifest: {
        name: 'Atmospherea Finance',
        short_name: 'Finance',
        description: 'Offline-first personal finance tracker',
        theme_color: '#0f172a',
        background_color: '#020617',
        display: 'standalone',
        start_url: '/',
        icons: [
          {
            src: '/icons/icon.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: '/icons/icon.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    })
  ]
})
