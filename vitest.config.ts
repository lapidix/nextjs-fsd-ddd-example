import { defineConfig } from 'vitest/config'
import { resolve } from 'path'

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./test/setup.ts'],
    include: [
      'src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}',
      'src/**/tests/**/*.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'
    ],
    exclude: [
      'node_modules',
      'dist',
      '.next'
    ]
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
      '@/entities': resolve(__dirname, './src/entities'),
      '@/shared': resolve(__dirname, './src/shared')
    }
  }
})