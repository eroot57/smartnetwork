module.exports = {
  root: true,
  env: {
    browser: true,
    node: true,
    es6: true,
    jest: true,
  },
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaVersion: 2021,
    sourceType: "module",
    ecmaFeatures: {
      jsx: true,
    },
    project: "./tsconfig.json",
  },
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:@typescript-eslint/recommended-requiring-type-checking",
    "plugin:react/recommended",
    "plugin:react-hooks/recommended",
    "plugin:jsx-a11y/recommended",
    "plugin:import/errors",
    "plugin:import/warnings",
    "plugin:import/typescript",
    "plugin:security/recommended",
    "plugin:sonarjs/recommended",
    "next/core-web-vitals",
    "prettier", // prettier must be last to override other configs
  ],
  plugins: [
    "@typescript-eslint",
    "react",
    "react-hooks",
    "jsx-a11y",
    "import",
    "security",
    "sonarjs",
    "unused-imports",
    "prettier",
  ],
  settings: {
    react: {
      version: "detect",
    },
    "import/resolver": {
      typescript: {},
      node: {
        extensions: [".js", ".jsx", ".ts", ".tsx"],
      },
    },
  },
  rules: {
    // Base ESLint rules
    "no-console": ["warn", { allow: ["warn", "error", "info"] }],
    "no-unused-vars": "off", // Handled by unused-imports
    
    // Solana specific BigInt literal rules
    "no-loss-of-precision": "error",
    "no-restricted-syntax": [
      "error",
      {
        selector: "BinaryExpression[operator='instanceof'][right.name='BigInt']",
        message: "Don't use instanceof with BigInt, use typeof instead",
      },
    ],

    // Prettier
    "prettier/prettier": ["error", {}, { usePrettierrc: true }],

    // React
    "react/prop-types": "off", // Not needed with TypeScript
    "react/react-in-jsx-scope": "off", // Not needed in Next.js
    "react/jsx-filename-extension": [1, { extensions: [".jsx", ".tsx"] }],
    "react/jsx-props-no-spreading": "off", // Allow JSX prop spreading
    "react/no-unescaped-entities": "off",

    // TypeScript
    "@typescript-eslint/explicit-module-boundary-types": "off",
    "@typescript-eslint/no-explicit-any": "warn",
    "@typescript-eslint/no-unused-vars": "off", // Handled by unused-imports
    "@typescript-eslint/ban-ts-comment": "warn",
    
    // Important for Solana/web3 apps
    "@typescript-eslint/no-misused-promises": [
      "error",
      {
        "checksVoidReturn": false
      }
    ],
    "@typescript-eslint/restrict-template-expressions": "off", // Often needed for Solana error handling
    "@typescript-eslint/unbound-method": [
      "error",
      {
        "ignoreStatic": true // For Solana SDK methods
      }
    ],

    // Import
    "import/prefer-default-export": "off",
    "import/no-default-export": "off", // Next.js often requires default exports
    "import/extensions": [
      "error",
      "ignorePackages",
      {
        js: "never",
        jsx: "never",
        ts: "never",
        tsx: "never",
      },
    ],
    "import/order": [
      "error",
      {
        groups: ["builtin", "external", "internal", "parent", "sibling", "index"],
        pathGroups: [
          {
            pattern: "@solana/**",
            group: "external",
            position: "before"
          },
          {
            pattern: "react",
            group: "external",
            position: "before"
          },
          {
            pattern: "next/**",
            group: "external",
            position: "before"
          }
        ],
        "newlines-between": "always",
        alphabetize: {
          order: "asc",
          caseInsensitive: true,
        },
      },
    ],

    // Unused imports
    "unused-imports/no-unused-imports": "error",
    "unused-imports/no-unused-vars": [
      "warn",
      {
        vars: "all",
        varsIgnorePattern: "^_",
        args: "after-used",
        argsIgnorePattern: "^_",
      },
    ],

    // Next.js
    "@next/next/no-html-link-for-pages": ["error", "src/pages/"],
    
    // Security (modified for blockchain apps)
    "security/detect-object-injection": "off", // Often needed for dynamic property access in blockchain apps
    "security/detect-non-literal-fs-filename": "off", // Often needed in Next.js API routes
  },
  overrides: [
    {
      files: ["*.js", "*.jsx", "*.ts", "*.tsx"],
      rules: {
        "simple-import-sort/imports": "error",
        "simple-import-sort/exports": "error",
      },
    },
    {
      // For Solana RPC calls that sometimes need looser typing
      files: ["**/api/**/*.ts", "**/api/**/*.js", "**/hooks/use*.ts", "**/hooks/use*.js"],
      rules: {
        "@typescript-eslint/no-explicit-any": "off",
        "@typescript-eslint/restrict-template-expressions": "off",
        "@typescript-eslint/no-unsafe-assignment": "warn",
        "@typescript-eslint/no-unsafe-member-access": "warn",
        "@typescript-eslint/no-unsafe-call": "warn",
        "@typescript-eslint/no-unsafe-return": "warn",
      }
    },
    {
      files: ["*.js", "*.jsx"],
      rules: {
        "@typescript-eslint/no-var-requires": "off",
      },
    },
    {
      files: ["*.test.js", "*.test.jsx", "*.test.ts", "*.test.tsx", "**/__tests__/**"],
      env: {
        jest: true,
      },
      rules: {
        "import/no-extraneous-dependencies": "off",
      },
    },
  ],
};
