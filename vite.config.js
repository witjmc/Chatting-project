import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { fileURLToPath, URL } from 'node:url';
import path from 'path';

//  https://vitejs.dev/config/
export default defineConfig({
    plugins: [vue()],
    resolve: {
        alias: {
            '@': fileURLToPath(new URL('./src', import.meta.url)),
        },
    },
    build: {
        outDir: 'dist',
        rollupOptions: {
            commonjsOptions: {
                include: ['node_modules/**'],
            },
        },
        minify: 'esbuild',
        chunkSizeWarningLimit: 500,
    },
    optimizeDeps: {
        include: ['socket.io-client'],
    },
    server: {
        proxy: {
            '/api': 'http://localhost:5000',
            '/signup': {
                target: 'http://localhost:5000',
                changeOrigin: true,
            },
            '/login': {
                target: 'http://localhost:5000',
                changeOrigin: true,
            },
        },
    },
});
