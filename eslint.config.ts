import prettierPluginRecommended from 'eslint-plugin-prettier/recommended';

// @ts-check

import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  eslint.configs.recommended,
  tseslint.configs.recommended,
  prettierPluginRecommended
);
