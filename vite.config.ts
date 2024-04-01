import { defineConfig } from 'vite'
import dts from 'vite-plugin-dts'

export default defineConfig({
    build: {
        lib: {
            entry: './src/index.ts',
            fileName: 'index',
            formats: ['es']
        },
        outDir: './dist',
        sourcemap: true,
        target: 'esnext'
    },
    plugins: [dts({ rollupTypes: true })]
});