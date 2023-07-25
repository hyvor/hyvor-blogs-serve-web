/// <reference types="vitest" />

import { defineConfig } from 'vite'

export default defineConfig({
    test: {
        root: 'tests',
        environment: 'edge-runtime'
    },
    build: {
        lib: {
            entry: 'src/index.ts',
            name: '@hyvor/hyvor-blogs-serve-web',
            fileName: 'index'
        }
    }
})