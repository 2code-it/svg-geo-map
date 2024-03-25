import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
    plugins: [vue()],
    build: {
        lib: {
            entry: './src/index.ts',
            name: 'svg-geo-map',
            fileName: 'svg-geo-map',
            formats: ['es']
        },
        outDir: './dist',
        sourcemap: true,
        target: 'esnext'
    }
});