import tseslint from 'typescript-eslint';
import eslintConfigPrettier from 'eslint-config-prettier';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default tseslint.config(
  {
    ignores: [
      '**/dist/**',
      '**/node_modules/**',
      '**/*.cjs',
      '**/*.mjs',
      '*.js',        // root-level JS config files (eslint.config.js etc.)
      '*.ts',        // root-level TS config files (vitest.workspace.ts etc.)
      'packages/*/*.ts', // package-level config files (vitest.config.ts, tsup.config.ts)
    ],
  },
  ...tseslint.configs.recommendedTypeChecked,
  eslintConfigPrettier,
  {
    files: ['packages/*/src/**/*.ts', 'packages/*/tests/**/*.ts'],
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: __dirname,
      },
    },
    rules: {
      // ── Correctness ───────────────────────────────────────────────────────
      eqeqeq: ['error', 'always'],
      'no-shadow': 'off', // replaced by the TS-aware version below
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-floating-promises': 'error',
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
      '@typescript-eslint/no-shadow': 'error',
      // allowThrowingUnknown lets us re-throw caught `unknown` values from catch blocks
      '@typescript-eslint/only-throw-error': ['error', { allowThrowingUnknown: true }],
      // Require `return await` inside try/catch so rejections are catchable
      '@typescript-eslint/return-await': ['error', 'in-try-catch'],
      // Flag conditions that are always true/false based on types
      '@typescript-eslint/no-unnecessary-condition': 'error',
      // Require all switch branches to be handled (or have a default)
      '@typescript-eslint/switch-exhaustiveness-check': 'error',

      // ── Style / consistency ───────────────────────────────────────────────
      // allowExpressions lets inline callbacks (vi.fn, beforeEach, it) skip the annotation
      '@typescript-eslint/explicit-function-return-type': ['error', { allowExpressions: true }],
      '@typescript-eslint/consistent-type-imports': ['error', { prefer: 'type-imports' }],
      '@typescript-eslint/consistent-type-exports': 'error',
      '@typescript-eslint/prefer-nullish-coalescing': 'error',
      '@typescript-eslint/prefer-optional-chain': 'error',
      // Private class fields that are never reassigned should be readonly
      '@typescript-eslint/prefer-readonly': 'error',
    },
  },
  // Test files: relax rules that are too strict / noisy for test code
  {
    files: ['packages/*/tests/**/*.ts'],
    rules: {
      // vi.fn / spyOn types are intentionally loose
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/no-unsafe-call': 'off',
      '@typescript-eslint/no-unsafe-argument': 'off',
      // Mock factories are often `async` only for type compat with the function signature
      '@typescript-eslint/require-await': 'off',
      // expect(mock.method).toHaveBeenCalled() is idiomatic vitest — unbound-method is a false positive here
      '@typescript-eslint/unbound-method': 'off',
    },
  },
);
