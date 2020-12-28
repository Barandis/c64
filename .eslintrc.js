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
  extends: ["eslint:recommended", "plugin:import/errors"],
  parser: "@babel/eslint-parser",
  parserOptions: {
    ecmaVersion: "2020",
    sourceType: "module",
    babelOptions: {
      plugins: [
        "@babel/plugin-proposal-private-methods",
        "@babel/plugin-proposal-class-properties"
      ],
    }
  },
  plugins: ["import"],
  settings: {
    "import/resolver": {
      webpack: {
        config: "webpack.common.js",
      }
    }
  },
  rules: {
    // Possible Errors
    "no-extra-parens": [ERROR, "all", { returnAssign: false }],
    "no-template-curly-in-string": [ERROR],
    "require-atomic-updates": [ERROR],

    // Best Practices
    "accessor-pairs": [ERROR],
    "complexity": [ERROR, 20],
    "consistent-return": [ERROR],
    "curly": [ERROR, "multi-line"],
    "default-param-last": [ERROR],
    "dot-location": [ERROR, "property"],
    "dot-notation": [ERROR],
    "eqeqeq": [ERROR, "smart"],
    "no-caller": [ERROR],
    "no-else-return": [ERROR],
    "no-extend-native": [ERROR],
    "no-extra-bind": [ERROR],
    "no-extra-label": [ERROR],
    "no-fallthrough": [ERROR, { commentPattern: "break[\\s\\w]*omitted" }],
    "no-floating-decimal": [ERROR],
    "no-implied-eval": [ERROR],
    "no-iterator": [ERROR],
    "no-lone-blocks": [ERROR],
    "no-multi-spaces": [ERROR],
    "no-multi-str": [ERROR],
    "no-new": [ERROR],
    "no-new-func": [ERROR],
    "no-new-wrappers": [ERROR],
    "no-octal-escape": [ERROR],
    "no-param-reassign": [ERROR],
    "no-proto": [ERROR],
    "no-return-assign": [ERROR],
    "no-self-compare": [ERROR],
    "no-throw-literal": [ERROR],
    "no-unmodified-loop-condition": [ERROR],
    "no-useless-call": [ERROR],
    "no-useless-concat": [ERROR],
    "no-useless-return": [ERROR],
    "require-await": [ERROR],
    "wrap-iife": [ERROR],
    "yoda": [ERROR],

    // Strict Mode
    "strict": [ERROR],

    // Variables
    "no-label-var": [ERROR],
    "no-undef-init": [ERROR],
    "no-unused-vars": [ERROR, { varsIgnorePattern: "^_" }],

    // Stylistic Issues
    "array-bracket-newline": [ERROR, "consistent"],
    "array-bracket-spacing": [ERROR],
    "block-spacing": [ERROR],
    "brace-style": [ERROR, "1tbs", { allowSingleLine: true }],
    "camelcase": [ERROR, { properties: "never" }],
    "comma-dangle": [ERROR, "always-multiline"],
    "comma-spacing": [ERROR],
    "comma-style": [ERROR],
    "computed-property-spacing": [ERROR],
    "consistent-this": [ERROR, "self"],
    "eol-last": [ERROR],
    "func-call-spacing": [ERROR],
    "func-name-matching": [ERROR],
    "function-paren-newline": [ERROR, "consistent"],
    "indent": [ERROR, 2, { SwitchCase: 1 }],
    "jsx-quotes": [ERROR],
    "key-spacing": [ERROR],
    "keyword-spacing": [ERROR],
    "max-len": [ERROR, { code: 80, comments: 72 }],
    "max-lines": [ERROR, {
      max: 300,
      skipBlankLines: true,
      skipComments: true,
    }],
    "new-parens": [ERROR],
    "newline-per-chained-call": [ERROR],
    "no-lonely-if": [ERROR],
    "no-multiple-empty-lines": [ERROR, { max: 1 }],
    "no-new-object": [ERROR],
    "no-tabs": [ERROR],
    "no-trailing-spaces": [ERROR],
    "no-unneeded-ternary": [ERROR],
    "no-whitespace-before-property": [ERROR],
    "nonblock-statement-body-position": [ERROR],
    "object-curly-newline": [ERROR],
    "object-curly-spacing": [ERROR, "always"],
    "object-property-newline": [OFF],
    "one-var": [ERROR, { initialized: "never" }],
    "one-var-declaration-per-line": [ERROR],
    "operator-linebreak": [ERROR, "before"],
    "prefer-object-spread": [ERROR],
    "quote-props": [ERROR, "consistent-as-needed"],
    "quotes": [ERROR, 'single'],
    "semi": [ERROR, "never"],
    "semi-spacing": [ERROR],
    "semi-style": [ERROR],
    "space-before-blocks": [ERROR],
    "space-before-function-paren": [ERROR, {
      "anonymous": "always",
      "named": "never",
      "asyncArrow": "always",
    }],
    "space-in-parens": [ERROR],
    "space-infix-ops": [ERROR],
    "space-unary-ops": [ERROR],
    "spaced-comment": [
      ERROR,
      "always",
      {
        line: {
          markers: ["/"],
          exceptions: ["-", "+", "/", "="],
        },
        block: {
          markers: ["!"],
          exceptions: ["*", "="],
          balanced: true,
        },
      },
    ],
    "switch-colon-spacing": [ERROR],
    "unicode-bom": [ERROR],

    // ECMAScript 6
    "arrow-body-style": [ERROR],
    "arrow-parens": [ERROR, "as-needed"],
    "arrow-spacing": [ERROR],
    "generator-star-spacing": [ERROR],
    "no-duplicate-imports": [ERROR],
    "no-useless-computed-key": [ERROR],
    "no-useless-rename": [ERROR],
    "no-var": [ERROR],
    "object-shorthand": [ERROR],
    "prefer-arrow-callback": [ERROR],
    "prefer-const": [ERROR],
    "prefer-numeric-literals": [ERROR],
    "prefer-rest-params": [ERROR],
    "prefer-spread": [ERROR],
    "rest-spread-spacing": [ERROR],
    "template-curly-spacing": [ERROR],
    "yield-star-spacing": [ERROR],

    // Import plugin
    "import/no-absolute-path": [ERROR],
    "import/no-webpack-loader-syntax": [ERROR],
    "import/no-self-import": [ERROR],
    "import/no-useless-path-segments": [ERROR],

    "import/no-named-as-default-member": [ERROR],

    "import/first": [ERROR],
    "import/no-duplicates": [ERROR],
    "import/no-namespace": [ERROR],
    "import/order": [ERROR, { "newlines-between": "always" }],
  },
}
