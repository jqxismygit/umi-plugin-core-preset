import { defineConfig } from 'umi';

export default defineConfig({
  dynamicImport: {},
  plugins: [require.resolve('../lib')],
});
