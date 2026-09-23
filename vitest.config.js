// vitest.config.js — Pruebas unitarias (ARQ-016 / §8 Calidad).
// Uso: npm run test:unit (entorno node: sin DOM; el código bajo prueba
// protege los accesos a `document`).
import path from 'node:path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src'),
            '@store': path.resolve(__dirname, './src/store'),
            '@router': path.resolve(__dirname, './src/router'),
            '@utils': path.resolve(__dirname, './src/utils'),
            '@services': path.resolve(__dirname, './src/services'),
            '@components': path.resolve(__dirname, './src/components'),
            '@features': path.resolve(__dirname, './src/features'),
            '@pages': path.resolve(__dirname, './src/pages'),
            '@assets': path.resolve(__dirname, './src/assets'),
        },
    },
    test: {
        environment: 'node',
        include: ['src/**/*.test.js'],
    },
});
