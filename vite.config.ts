/// <reference types="vitest" />

import { defineConfig } from 'vite'

export default defineConfig({
    test: {
        root: 'tests',
        environment: 'happy-dom'
    },
    build: {
        lib: {
            entry: 'src/index.ts',
            name: 'hyvor-blogs-ts',
            fileName: (format) => `hyvor-blogs-ts.${format}.js`
        }
    }
})