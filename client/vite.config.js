import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// Dynamically generate a unique build timestamp for every production build
const BUILD_VERSION = `build_${Date.now()}`;

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    tailwindcss(),
    react()
  ],
  define: {
    __APP_BUILD_VERSION__: JSON.stringify(BUILD_VERSION)
  }
})
