import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import turbo from 'eslint-plugin-turbo';

export default tseslint.config(
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    plugins: {
      turbo,
    },
    rules: {
      'turbo/no-undeclared-env-vars': 'error',
    },
  },
);
