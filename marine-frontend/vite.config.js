import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),

    VitePWA({
      registerType: 'autoUpdate',

      manifest: {
        name: 'Samudra Marine Intelligence',
        short_name: 'Samudra',
        description: 'Marine intelligence and safety assistant',
        theme_color: '#0f766e',
        background_color: '#f4fbfa',
        display: 'standalone',
        start_url: '/',
        scope: '/',
        icons: [],
      },

      workbox: {
        cleanupOutdatedCaches: true,
        navigateFallback: '/index.html',
      },

      devOptions: {
        enabled: true,
      },
    }),
  ],
})