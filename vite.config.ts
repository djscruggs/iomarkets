import { defineConfig } from 'vite'
import { reactRouter } from '@react-router/dev/vite'
import tailwindcss from '@tailwindcss/postcss'

// https://vite.dev/config/
export default defineConfig({
  plugins: [reactRouter()],
  css: {
    postcss: {
      plugins: [tailwindcss()],
    },
  },
})
