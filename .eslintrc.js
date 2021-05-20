const OFF = 0
const WARN = 1
const ERROR = 2

module.exports = {
  env: {
    es6: true,
    node: true,
    mocha: true,
    browser: true,
  },
  extends: ['airbnb', 'prettier'],
  parser: '@babel/eslint-parser',
  parserOptions: {
    ecmaVersion: '2020',
    sourceType: 'module',
    babelOptions: {
      plugins: [
        '@babel/plugin-proposal-private-methods',
        '@babel/plugin-proposal-class-properties',
      ],
    },
  },
  plugins: ['import', 'prettier'],
  settings: {
    'import/resolver': {
      webpack: {
        config: 'webpack.common.js',
      },
    },
  },
  rules: {
    'prettier/prettier': [ERROR],
  },
}
