import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  // Relative asset paths so the built app works when copied to a device and
  // opened from any directory, not just a server root. See SPEC.md §2.
  base: './',
  server: {
    // Reachable from phones/tablets on the shop network during development.
    host: true,
  },
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts', 'src/**/*.test.tsx'],
  },
})
