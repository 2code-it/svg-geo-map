import { defineConfig } from 'vite'
import dts from 'vite-plugin-dts'

export default defineConfig({
    build: {
        lib: {
            name: 'svggeomap',
            entry: './src/index.ts',
            formats: ['es', 'umd'],
            fileName: (format, entryName) => `${entryName}.${format}.js`

        },
        outDir: './dist',
        sourcemap: true,
        target: 'esnext'
    },
    plugins: [dts({ rollupTypes: true })]
});