import js from '@eslint/js'
import eslintReact from '@eslint-react/eslint-plugin'
import prettierConfig from 'eslint-config-prettier/flat'
import globals from 'globals'

export default [
  js.configs.recommended,
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    ...eslintReact.configs.recommended,
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
    rules: {
      ...eslintReact.configs.recommended.rules,
      'no-useless-escape': 0,
      'prefer-const': 2,
      'no-unused-vars': [
        2,
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_'
        }
      ]
    }
  },
  prettierConfig
]
