import { defineConfig } from '@hey-api/openapi-ts';

export default defineConfig({
  input: './deflock-router.yaml',
  output: {
    path: '../src/generated/deflock-router',
    format: 'prettier',
  },
  plugins: [
    '@hey-api/typescript',
    '@hey-api/client-fetch',
    '@hey-api/sdk',
  ],
});
