import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import electron from 'vite-plugin-electron/simple'
import { join } from 'path'

export default defineConfig({
    plugins: [
        react(),
        electron({
            main: {
                entry: join(__dirname, 'src/main/index.ts'),
                vite: {
                    build: {
                        outDir: '../../dist-electron',
                        rollupOptions: {
                            // Externalize Node dependencies to avoid bundling them
                            external: ['rcon-client', 'electron-store', '@supabase/supabase-js'],
                            output: {
                                entryFileNames: 'main.js',
                            },
                        }
                    }
                }
            },
            preload: {
                input: join(__dirname, 'src/preload/index.ts'),
                vite: {
                    build: {
                        outDir: '../../dist-electron',
                        rollupOptions: {
                            output: {
                                entryFileNames: 'preload.js',
                            },
                        },
                    }
                }
            },
            renderer: {},
        }),
    ],
    resolve: {
        alias: {
            '@': join(__dirname, 'src/renderer/src'),
        },
    },
    // We keep the root here but point the server to Renderer
    // Actually, standard practice with this plugin is often to keep root as default
    // and manage index.html in the root or specifying it.
    // But let's set root to src/renderer to keep it clean, 
    // ensuring index.html is in src/renderer
    root: 'src/renderer',
    base: './', // Important for Electron to load assets
    build: {
        outDir: '../../dist',
        emptyOutDir: true,
    }
})
