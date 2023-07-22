/// <reference types="vitest" />

import { defineConfig } from 'vite'

export default defineConfig({
    test: {
        root: 'tests',
        environment: 'happy-dom'
    },
})