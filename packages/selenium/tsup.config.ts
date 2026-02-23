import { defineConfig } from 'tsup';

const entries = {
  index: 'src/index.ts',
  'adapters/jest': 'src/adapters/jest.ts',
  'adapters/vitest': 'src/adapters/vitest.ts',
  'adapters/mocha': 'src/adapters/mocha.ts',
};

export default defineConfig([
  // ESM build
  {
    entry: entries,
    format: ['esm'],
    outDir: 'dist/esm',
    dts: false,
    sourcemap: true,
    clean: true,
    tsconfig: 'tsconfig.build.json',
    splitting: false,
    shims: true,
    platform: 'node',
    target: 'node18',
  },
  // CJS build
  {
    entry: entries,
    format: ['cjs'],
    outDir: 'dist/cjs',
    outExtension: () => ({ js: '.cjs' }),
    dts: false,
    sourcemap: true,
    clean: false,
    tsconfig: 'tsconfig.build.json',
    platform: 'node',
    target: 'node18',
  },
  // Type declarations only
  {
    entry: entries,
    format: ['esm'],
    outDir: 'dist/types',
    dts: { only: true },
    clean: false,
    tsconfig: 'tsconfig.build.json',
  },
]);
