/** @type {import("eslint").Linter.Config} */
const config = {
  parser: "@typescript-eslint/parser",
  parserOptions: {
    project: true,
  },
  plugins: ["@typescript-eslint"],
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:unicorn/recommended",
    "next/core-web-vitals", // Already includes next, react, react-hooks, jsx-a11y recommended rulesets so no need to include those OR install any of the ESlint plugins.
    "prettier",
  ],
  rules: {
    "@typescript-eslint/ban-ts-ignore": 0,
    "import/no-cycle": 0,
    "import/no-extraneous-dependencies": 0,
    "unicorn/prevent-abbreviations": 0,
    "@typescript-eslint/no-empty-interface": 0,
    "@typescript-eslint/no-explicit-any": 0,
    "@typescript-eslint/no-empty-function": 0,
    "@typescript-eslint/explicit-function-return-type": [
      "error",
      { allowExpressions: true },
    ],
    "react-hooks/exhaustive-deps": 0,
    "arrow-body-style": 0,
    "unicorn/no-null": 0,
    "unicorn/no-array-reduce": 0,
    "react/jsx-props-no-spreading": 0,
    "react/no-array-index-key": 0,
    "no-restricted-exports": 0,
    "no-underscore-dangle": 0,
    "@typescript-eslint/naming-convention": [
      "error",
      {
        selector: "variable",
        leadingUnderscore: "allowSingleOrDouble",
        format: ["camelCase", "PascalCase", "UPPER_CASE"],
      },
    ],
    "@typescript-eslint/no-use-before-define": 0,
    // By using the index.ts for every component, export as default is prefered. If the rule is turned on, this cannot happen.
    "import/prefer-default-export": 0,
    // By using the size prop in the icon.tsx, linter thinks we try to access the length of an array even though this prop isn't an array.
    "unicorn/explicit-length-check": 0,
    // Interferes with the typescript rules that disallow iterating of iterators
    "unicorn/prefer-spread": 0,
    // Eslint prefers for of loops over Array.prototype.forEach but then starts to complain about the iterators.
    "no-restricted-syntax": ["error", "ForInStatement"],
    // With React useState a value must be provided, even if it's undefined.
    "unicorn/no-useless-undefined": 0,
    "react/require-default-props": 0,
    "react/function-component-definition": [
      2,
      { namedComponents: "arrow-function" },
    ],
    "react/jsx-no-useless-fragment": 0,
    "react/no-unstable-nested-components": [2, { allowAsProps: true }],
    "unicorn/prefer-ternary": 0,
    "@typescript-eslint/default-param-last": 0,
    "react/no-unused-prop-types": 0,
    "react/destructuring-assignment": 0,
    "@typescript-eslint/no-unused-vars": ["error", { argsIgnorePattern: "^_" }],
    "unicorn/consistent-destructuring": 0,
    "unicorn/no-await-expression-member": 0,
    "unicorn/switch-case-braces": 0,
    "class-methods-use-this": 0,
    "no-console": 1,
  },
};

module.exports = config;
