/* global process */
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  // For GitHub Pages you must set this to "/<repo>/".
  // In CI we pass it via env `BASE_PATH`, locally it's "/".
  base: process.env.BASE_PATH || '/',
  plugins: [react(), tailwindcss()],
})
