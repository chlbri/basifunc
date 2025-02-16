import { globSync } from 'glob';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'rollup';
import { circularDependencies } from 'rollup-plugin-circular-dependencies';
import { nodeExternals } from 'rollup-plugin-node-externals';

import tscAlias from 'rollup-plugin-tsc-alias';
import typescript from 'rollup-plugin-typescript2';

const exclude = [
  '**/*.test.ts',
  '**/*.test-d.ts',
  './src/types.ts',
  '**/*.fixtures.ts',
  'src/config/**/*.ts',
  'src/fixtures/**/*.ts',
  '**/*.fixture.ts',
  'src/tests/**/*',
  'src/config/**/*',
];

const ignore = [...exclude, '**/*.types.ts', '**/types.ts'];

const input = Object.fromEntries(
  globSync('src/**/*.ts', {
    ignore,
  }).map(file => [
    // This remove `src/` as well as the file extension from each
    // file, so e.g. src/nested/foo.js becomes nested/foo
    path.relative(
      'src',
      file.slice(0, file.length - path.extname(file).length),
    ),
    // This expands the relative paths to absolute paths, so e.g.
    // src/nested/foo becomes /project/src/nested/foo.js
    fileURLToPath(new URL(file, import.meta.url)),
  ]),
);

export default defineConfig({
  input,

  plugins: [
    tscAlias(),
    typescript({
      tsconfigOverride: {
        exclude,
      },
    }),

    circularDependencies({
      exclude: [
        '**/types.ts',
        '**/type.ts',
        '**/*.types.ts',
        '**/*.type.ts',
      ],
    }),

    nodeExternals({
      optDeps: false,
      builtinsPrefix: 'strip',
    }),
  ],
  external: ['node:path'],
  output: [
    {
      format: 'cjs',
      sourcemap: true,
      dir: `lib`,
      preserveModulesRoot: 'src',
      preserveModules: true,

      entryFileNames: '[name].cjs',
    },
    {
      format: 'es',
      sourcemap: true,
      dir: `lib`,
      preserveModulesRoot: 'src',
      preserveModules: true,
      entryFileNames: '[name].js',
    },
  ],
});
