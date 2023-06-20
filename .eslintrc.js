module.exports = {
  extends: ['prettier'],
  parser: '@babel/eslint-parser',
  parserOptions: {
    ecmaVersion: 2022,
    sourceType: 'module',
    requireConfigFile: false,
    babelOptions: {
      presets: ['@babel/preset-env'],
    },
  },
  plugins: ['babel'],
  rules: {
    'babel/object-curly-spacing': ['error', 'always'],
  },
};
