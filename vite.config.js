import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  // GitHub Pages serves a project site under /<repo-name>/. This matches the
  // target repo (ZJ808/MLB3D). Use '/' for a user/org root site or custom domain.
  base: '/MLB3D/',
})
