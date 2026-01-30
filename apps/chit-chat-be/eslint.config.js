import config from '@chit-chat/eslint-config/base';
import { defineConfig, globalIgnores } from 'eslint/config';

export default defineConfig([
  globalIgnores(['dist', 'node_modules']),
  ...config,
]);
