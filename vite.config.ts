import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'masked-icon.svg'],
      
      // Essa parte garante o funcionamento OFFLINE
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg}'] 
      },

      manifest: {
        name: 'BarberFlow Pro',
        short_name: 'BarberFlow',
        description: 'Gerenciamento de Barbearia',
        theme_color: '#ffffff',
        background_color: '#ffffff',
        display: 'standalone',
        icons: [
          {
            src: 'icon-192.png', // Corrigido
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'icon-512.png', // Corrigido
            sizes: '512x512',
            type: 'image/png'
          },
          {
            src: 'icon-512.png', // Ícone adaptável para Android
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      }
    })
  ],
})
