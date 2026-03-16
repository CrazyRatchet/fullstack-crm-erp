// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');
const prettier = require('eslint-config-prettier');
const prettierPlugin = require('eslint-plugin-prettier');

module.exports = defineConfig([
  expoConfig,
  prettier,
  {
    plugins: {
      prettier: prettierPlugin,
    },
    rules: {
      //Prettier formatting issues will show as ESLint errors
      'prettier/prettier': 'error',
    },
    ignores: ['dist/*'],
  },
]);
