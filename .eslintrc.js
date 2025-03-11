module.exports = {
  "extends": [
    "next/core-web-vitals",
    "plugin:@typescript-eslint/recommended"
  ],
  "plugins": [
    "@typescript-eslint",
    "react-hooks"
  ],
  "rules": {
    // Disable specific rules that are too strict for development
    "@typescript-eslint/no-explicit-any": "off",
    "@typescript-eslint/no-unused-vars": ["warn", {
      "argsIgnorePattern": "^_",
      "varsIgnorePattern": "^_",
      "caughtErrorsIgnorePattern": "^_"
    }],
    "@typescript-eslint/no-empty-interface": "off",
    "@typescript-eslint/ban-ts-comment": "off",
    "prefer-const": "warn",
    "@next/next/no-img-element": "off",
    "react-hooks/exhaustive-deps": "warn",
    "@typescript-eslint/ban-types": ["error", {
      "types": {
        "{}": false
      }
    }]

    // Enable strict mode after development
    // "@typescript-eslint/no-explicit-any": "error",
    // "react-hooks/exhaustive-deps": "error",
    // "@next/next/no-img-element": "error"
  }
}
