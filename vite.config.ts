import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import eslint from 'vite-plugin-eslint';
import { version } from './package.json';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    eslint({
      include: ['src/**/*.ts', 'src/**/*.tsx', 'src/**/*.js', 'src/**/*.jsx'],
      exclude: ['node_modules/**', 'dist/**'],
      failOnError: false,
      failOnWarning: false,
      cache: true,
      lintOnStart: true,
      overrideConfigFile: 'eslint.config.js'
    })
  ],
  build: {
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          quill: ['quill', 'quill-mention', 'quill-auto-detect-url'],
          components: [
            './src/components/common/ChannelChat/MessageContainer/index.tsx',
            './src/components/common/ChannelHeader/index.tsx',
            './src/components/common/ChannelChat/UserTextArea/UserTextArea.tsx',
            './src/components/common/Spinner/Spinner.tsx',
            './src/components/common/LeftSideBar/LeftSideBar.tsx',
            './src/components/common/FormError.tsx'
          ],
          contexts: [
            './src/contexts/dm-client-context.tsx',
            './src/contexts/network-client-context.tsx'
          ]
        }
      },
    }
  },
  server: {
    port: 3000, 
    open: true
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      'src': path.resolve(__dirname, './src'),
      '@contexts': path.resolve(__dirname, './src/contexts'),
      '@components': path.resolve(__dirname, './src/components'),
      '@assets': path.resolve(__dirname, './src/assets'),
      '@utils': path.resolve(__dirname, './src/utils'),
      buffer: 'buffer'
    }
  },
  define: {
    'import.meta.env.APP_VERSION': JSON.stringify(version),
    global: 'window',
  },
  optimizeDeps: {
    include: ['buffer', 'use-sound', 'howler']
  }
});
