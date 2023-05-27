import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['./src/index.js'],
  format: ['cjs', 'esm'],
  clean: true,
  minify: true,
  dts: true,
  target: 'node14',
})
