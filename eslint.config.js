import js from '@eslint/js'
import globals from 'globals'
import tseslint from 'typescript-eslint'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import prettier from 'eslint-config-prettier/flat'

// Flat config. Lints JS/TS only — Markdown and CSS are handled by Prettier.
export default tseslint.config(
  { ignores: ['dist/', 'node_modules/', 'coverage/'] },

  // Type-aware linting for the application source.
  {
    files: ['src/**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommendedTypeChecked,
      reactHooks.configs.flat['recommended-latest'],
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 2022,
      globals: globals.browser,
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
    },
  },

  // Config files at the repo root and the build scripts run in Node and sit
  // outside tsconfig, so they get plain (non type-aware) linting.
  {
    files: ['*.{js,ts}', 'scripts/**/*.js'],
    extends: [js.configs.recommended, tseslint.configs.recommended],
    languageOptions: {
      ecmaVersion: 2022,
      globals: globals.node,
    },
  },

  // Must come last: turns off stylistic rules that conflict with Prettier.
  prettier,
)
