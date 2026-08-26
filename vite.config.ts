import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  // Relative asset paths so the built app works when copied to a device and
  // opened from any directory, not just a server root. See SPEC.md §2.
  base: './',
  // `tauri dev` wraps this server and prints its own progress underneath.
  clearScreen: false,
  server: {
    // Reachable from phones/tablets on the shop network during development.
    host: true,
    // src-tauri/tauri.conf.json names this port as `devUrl`. Failing loudly on a
    // clash beats Vite silently moving to 5174 and the desktop window opening
    // on whatever was already on 5173.
    port: 5173,
    strictPort: true,
  },
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts', 'src/**/*.test.tsx'],
  },
})
