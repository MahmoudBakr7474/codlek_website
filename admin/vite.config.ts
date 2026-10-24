import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

/*
 * The dashboard is served by the API under /admin (same origin, so its sign-in
 * cookie just works). In development the Vite server proxies /api to the API.
 * The build goes straight into the API's wwwroot/admin.
 */
export default defineConfig({
    base: '/admin/',
    plugins: [react()],
    server: {
        port: 5173,
        proxy: {
            '/api': 'http://localhost:5080',
            '/uploads': 'http://localhost:5080',
        },
    },
    build: {
        outDir: '../api/src/Codlek.Api/wwwroot/admin',
        emptyOutDir: true,
        chunkSizeWarningLimit: 1500,
        rolldownOptions: {
            output: {
                codeSplitting: {
                    groups: [
                        // Lucide's shared code (Icon, createLucideIcon) in a chunk of its own. The ~1,900
                        // icon chunks of the icon picker import it; left in the app's entry chunk, its
                        // name changed with every app change and each deploy re-uploaded all of them.
                        { name: 'lucide', test: /[\\/]node_modules[\\/]lucide-react[\\/](?!dist[\\/]esm[\\/]icons[\\/])/ },
                    ],
                },
            },
        },
    },
});
