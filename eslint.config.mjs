import js from '@eslint/js'
import react from 'eslint-plugin-react'
import prettierConfig from 'eslint-config-prettier'
import globals from 'globals'

export default [
  js.configs.recommended,
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      parserOptions: {
        ecmaFeatures: {
          jsx: true
        }
      },
      globals: {
        ...globals.browser,
        ...globals.es6,
        ...globals.node,
        inkdrop: 'readonly'
      }
    },
    plugins: {
      react
    },
    rules: {
      'no-useless-escape': 0,
      'prefer-const': 2,
      'no-unused-vars': [
        2,
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_'
        }
      ],
      // React rules
      ...react.configs.recommended.rules,
      'react/display-name': 0,
      'react/prop-types': 0
    },
    settings: {
      react: {
        version: '18'
      }
    }
  },
  prettierConfig
]
