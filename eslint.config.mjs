import eslintReact from '@eslint-react/eslint-plugin'
import prettierConfig from 'eslint-config-prettier/flat'
import tseslint from 'typescript-eslint'

export default [
  {
    ignores: ['lib/**']
  },
  prettierConfig,
  ...tseslint.configs.recommended,
  {
    files: ['**/*.{ts,tsx}'],
    ...eslintReact.configs.recommended,
    languageOptions: {
      globals: {
        inkdrop: 'readonly'
      }
    },
    rules: {
      ...eslintReact.configs.recommended.rules,
      'no-useless-escape': 0,
      'prefer-const': 2,
      '@typescript-eslint/no-explicit-any': 0
    }
  }
]
