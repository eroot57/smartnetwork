module.exports = {
  root: true,
  env: {
    browser: true,
    node: true,
    es6: true,
  },
  parser: "@typescript-eslint/parser",
  parserOptions: {
    project: "./tsconfig.json",
    tsconfigRootDir: __dirname,
  },
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:react/recommended",
    "plugin:import/typescript",
    "next/core-web-vitals",
    "prettier",
  ],
  plugins: [
    "@typescript-eslint",
    "react",
    "unused-imports",
  ],
  settings: {
    react: {
      version: "detect",
    },
  },
  rules: {
    // Base rules
    "no-unused-vars": "off",
    
    // TypeScript rules
    "@typescript-eslint/no-explicit-any": "off",
    "@typescript-eslint/no-unused-vars": "off",
    "@typescript-eslint/restrict-template-expressions": "off",
    
    // Solana-specific rules
    "@typescript-eslint/no-misused-promises": [
      "error",
      {
        "checksVoidReturn": false
      }
    ],
    
    // React rules
    "react/prop-types": "off",
    "react/react-in-jsx-scope": "off",
    
    // Import/unused
    "unused-imports/no-unused-imports": "error",
    "unused-imports/no-unused-vars": "warn",
  },
  overrides: [
    {
      // For Solana RPC calls
      files: ["**/api/**/*.ts", "**/hooks/use*.ts"],
      rules: {
        "@typescript-eslint/no-unsafe-assignment": "off",
        "@typescript-eslint/no-unsafe-member-access": "off",
        "@typescript-eslint/no-unsafe-call": "off",
        "@typescript-eslint/no-unsafe-return": "off",
      }
    },
  ],
};
