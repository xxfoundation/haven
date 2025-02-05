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
    chunkSizeWarningLimit: 2000,
    rollupOptions: {
      output: {
        manualChunks: {
          // Core vendor dependencies
          vendor: ['react', 'react-dom', 'react-router-dom'],
          
          // Editor related chunks
          'editor': ['quill', 'quill-mention', 'quill-auto-detect-url'],

          'editor-ui': [
            './src/components/common/ChannelChat/UserTextArea/UserTextArea.tsx',
          ],
          
          // Chat UI components
          'chat-ui': [
            './src/components/common/ChannelChat/MessageContainer/index.tsx',
            './src/components/common/ChannelChat/ChatMessage/ChatMessage.tsx',
            './src/components/common/ChannelChat/MessagesContainer/index.tsx',
          ],

          // Channel management components
          'channel-ui': [
            './src/components/common/ChannelHeader/index.tsx',
            './src/components/common/ChannelBadges.tsx',
            './src/components/common/LeftSideBar/LeftSideBar.tsx',
          ],

          // Common UI components
          'common-ui': [
            './src/components/common/Button/index.tsx',
            './src/components/common/Badge.tsx',
            './src/components/common/Dropdown/index.tsx',
          ],

          // Modal components
          'modals': [
            './src/components/modals/Modal.tsx',
            './src/components/modals/ModalTitle.tsx',
            './src/components/modals/UpdatesModal.tsx',
          ],

          // Context providers
          'contexts': [
            './src/contexts/dm-client-context.tsx',
            './src/contexts/network-client-context.tsx',
            './src/contexts/ui-context.tsx'
          ],

          // Emoji and reactions
          'emoji': [
            './src/components/common/EmojiPortal.tsx',
            './src/components/common/ChannelChat/ChatReactions/index.tsx',
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
