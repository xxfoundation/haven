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
      overrideConfigFile: 'eslint.config.js'
    })
  ],
  build: {
    chunkSizeWarningLimit: 5000,
    minify: false,
    commonjsOptions: {
      include: [/node_modules/],
      transformMixedEsModules: true,
      requireReturnsDefault: 'auto',
      strictRequires: true
    },
    rollupOptions: {
      output: {
        format: 'es',
        manualChunks: {
          // Core vendor dependencies
          vendor: ['react', 'react-dom', 'react-router-dom'],

          // Editor related chunks
          editor: ['quill', 'quill-mention', 'quill-auto-detect-url'],

          'editor-ui': ['./src/components/common/ChannelChat/UserTextArea/UserTextArea.tsx'],

          // Chat UI components
          'chat-ui': [
            './src/components/common/ChannelChat/MessageContainer/index.tsx',
            './src/components/common/ChannelChat/ChatMessage/ChatMessage.tsx',
            './src/components/common/ChannelChat/MessagesContainer/index.tsx'
          ],

          // Channel management components
          'channel-ui': [
            './src/components/common/ChannelHeader/index.tsx',
            './src/components/common/ChannelBadges.tsx',
            './src/components/common/LeftSideBar/LeftSideBar.tsx'
          ],

          // Common UI components
          'common-ui': [
            './src/components/common/Button/index.tsx',
            './src/components/common/Badge.tsx',
            './src/components/common/Dropdown/index.tsx'
          ],

          // Modal components
          modals: [
            './src/components/modals/Modal.tsx',
            './src/components/modals/ModalTitle.tsx',
            './src/components/modals/UpdatesModal.tsx'
          ],

          // Emoji and reactions
          emoji: [
            './src/components/common/EmojiPortal.tsx',
            './src/components/common/ChannelChat/ChatReactions/index.tsx'
          ]
        }
      }
    },
    modulePreload: {
      polyfill: true
    },
    target: ['es2015', 'edge88', 'firefox78', 'chrome87', 'safari13']
  },
  server: {
    port: 3000,
    fs: {
      // Allow serving files from one level up from the package root
      allow: ['..'],
      strict: false
    },
    headers: {
      'Cross-Origin-Opener-Policy': 'same-origin',
      'Cross-Origin-Embedder-Policy': 'require-corp'
    },
    allowedHosts: [
      '3000-thisisommore-haven-teqe8xrq0zp.ws-eu118.gitpod.io',
      '3001-debug-thisisommore-haven-teqe8xrq0zp.ws-us118.gitpod.io',
      '3000-thisisommore-haven-teqe8xrq0zp.ws-us118.gitpod.io',
      '3000-thisisommore-haven-lgb7hujlja6.ws-us120.gitpod.io',
      '3000-thisisommore-haven-lgb7hujlja6.ws-eu120.gitpod.io'
    ]
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      src: path.resolve(__dirname, './src'),
      '@contexts': path.resolve(__dirname, './src/contexts'),
      '@components': path.resolve(__dirname, './src/components'),
      '@assets': path.resolve(__dirname, './src/assets'),
      '@utils': path.resolve(__dirname, './src/utils'),
      buffer: 'buffer'
    }
  },
  define: {
    'import.meta.env.APP_VERSION': JSON.stringify(version),
    global: 'window'
  },
  esbuild: {
    target: 'es2015',
    supported: {
      'async-await': true
    }
  },
  optimizeDeps: {
    include: ['buffer', 'use-sound', 'howler'],
    exclude: [],
    esbuildOptions: {
      target: 'es2015',
      supported: {
        'async-await': true
      }
    }
  }
});
