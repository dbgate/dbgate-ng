import { resolve } from 'path';
import { defineConfig, externalizeDepsPlugin } from 'electron-vite';
import solid from 'vite-plugin-solid';
import tailwindcss from '@tailwindcss/vite';
export default defineConfig({
    main: {
        plugins: [externalizeDepsPlugin()]
    },
    preload: {
        plugins: [externalizeDepsPlugin()]
    },
    renderer: {
        resolve: {
            alias: {
                '@renderer': resolve('../packages/web/src')
            }
        },
        // resolve: {
        //   alias: {
        //     '@renderer': resolve('src/renderer/src')
        //   }
        // },
        plugins: [solid(), tailwindcss()],
        root: resolve(__dirname, '../packages/web'),
        build: {
            outDir: resolve(__dirname, '../dist/renderer'),
            rollupOptions: {
                input: {
                    index: resolve(__dirname, '../packages/web/index.html')
                }
            }
        }
    }
});
