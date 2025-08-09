import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
    build: {
        lib: {
            entry: resolve(__dirname, 'src/lib.js'),
            name: 'BlockmarkEditor',
            fileName: (format) => `blockmark.${format}.js`,
            formats: ['es', 'umd']
        },
        rollupOptions: {
            external: [],
            output: {
                globals: {},
                assetFileNames: (assetInfo) => {
                    if (assetInfo.name === 'style.css') {
                        return 'blockmark.css';
                    }
                    return assetInfo.name;
                }
            }
        },
        cssCodeSplit: false
    }
});
