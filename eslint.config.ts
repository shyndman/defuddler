import js from '@eslint/js';
import stylisticJs from '@stylistic/eslint-plugin-js';
import tseslint, { ConfigArray, InfiniteDepthConfigWithExtends } from 'typescript-eslint';

const config: ConfigArray = tseslint.config(
  js.configs.recommended,
  tseslint.configs.recommended,
  {
    plugins: {
      '@stylistic/js': stylisticJs,
    },
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
    },
    rules: {
      '@stylistic/js/indent': ['warn', 2, { 'SwitchCase': 1 }],
      '@stylistic/js/max-len': ['warn', { 'code': 110, 'tabWidth': 2 }],
      'linebreak-style': ['error', 'unix'],
      'quotes': ['warn', 'single', { 'avoidEscape': true }],
      'semi': ['error', 'always'],
      "prettier/prettier": 2 // Means error
    }
  }
);

export default config;
