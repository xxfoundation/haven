import typescriptPlugin from '@typescript-eslint/eslint-plugin';
import typescriptParser from '@typescript-eslint/parser';
import reactPlugin from 'eslint-plugin-react';
import reactHooksPlugin from 'eslint-plugin-react-hooks';

export default [{
  files: ['src/**/*.{js,jsx,ts,tsx}'],
  ignores: [
    'node_modules/**',
    'dist/**',
    'build/**',
    'coverage/**',
    '.vite/**',
    '*.config.js',
    '*.config.ts',
    'public/**',
    'tailwind.config.js',
    'react-draft-wysiwyg/**',
    'cypress.config.ts',
    'src/pages/api/__coverage__.js',
    'next.config.js',
    'src/declarations/app/**',
    '.dfx/**'
  ],
  languageOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    parser: typescriptParser,
    parserOptions: {
      ecmaFeatures: {
        jsx: true
      }
    },
    globals: {
      document: 'readonly',
      navigator: 'readonly',
      window: 'readonly'
    }
  },
  plugins: {
    '@typescript-eslint': typescriptPlugin,
    'react': reactPlugin,
    'react-hooks': reactHooksPlugin
  },
  settings: {
    react: {
      version: 'detect'
    }
  },
  rules: {
    'react/react-in-jsx-scope': 'off',
    'react/prop-types': 'off'
  }
}];