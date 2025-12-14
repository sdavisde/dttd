import { defineConfig, globalIgnores } from 'eslint/config'
import nextVitals from 'eslint-config-next/core-web-vitals'
import prettier from 'eslint-config-prettier/flat'
import tsParser from '@typescript-eslint/parser'
import tseslint from 'typescript-eslint'

const eslintConfig = defineConfig([
  ...nextVitals,
  prettier,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    '.next/**',
    'out/**',
    'build/**',
    'next-env.d.ts',
  ]),
  {
    files: ['**/*.ts', '**/*.tsx'],
    rules: {
      ...tseslint.configs.recommendedTypeChecked.rules,
      '@typescript-eslint/prefer-nullish-coalescing': 'error',
    },
    languageOptions: {
      parserOptions: {
        projectService: true,
      },
    },
  },
  {
    files: ['**/actions/**/*.{ts,tsx}', '**/services/**/*.ts'],
    languageOptions: {
      parser: tsParser,
    },
    rules: {
      'no-restricted-syntax': [
        'error',
        {
          selector:
            "TSTypeReference[typeName.name='Result'] > TSTypeParameterInstantiation > TSTypeReference[typeName.name='Error']",
          message:
            'Do not use Result<Error, ...> in Server Actions. Error objects are not serializable to the client. Use Result<string, ...> instead.',
        },
      ],
    },
  },
])

export default eslintConfig
