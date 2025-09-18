import js from "@eslint/js";
import tseslint from "@typescript-eslint/eslint-plugin";
import tsparser from "@typescript-eslint/parser";
import prettier from "eslint-config-prettier";

export default [
  js.configs.recommended,
  {
    files: ["**/*.ts"],
    languageOptions: {
      parser: tsparser,
      parserOptions: {
        project: "./tsconfig.json",
        tsconfigRootDir: process.cwd(),
        sourceType: "module",
      },
      globals: {
        console: "readonly",
        process: "readonly",
        Buffer: "readonly",
        __dirname: "readonly",
        __filename: "readonly",
        global: "readonly",
        module: "readonly",
        require: "readonly",
        exports: "readonly",
      },
    },
    plugins: {
      "@typescript-eslint": tseslint,
    },
    rules: {
      // TypeScript specific rules
      "@typescript-eslint/interface-name-prefix": "off",
      "@typescript-eslint/explicit-function-return-type": "off",
      "@typescript-eslint/explicit-module-boundary-types": "off",
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-unused-vars": ["error", { argsIgnorePattern: "^_" }],
      "@typescript-eslint/no-empty-function": "off",
      "@typescript-eslint/ban-ts-comment": "warn",

      // NestJS specific rules
      "@typescript-eslint/no-inferrable-types": "off",
      "@typescript-eslint/prefer-nullish-coalescing": "error",
      "@typescript-eslint/prefer-optional-chain": "error",

      // General rules
      "no-console": "warn",
      "no-debugger": "error",
      "prefer-const": "error",
      "no-var": "error",
      "object-shorthand": "error",
      "prefer-arrow-callback": "error",
      "prefer-template": "error",
      "no-duplicate-imports": "error",
      "no-unused-expressions": "error",
      eqeqeq: ["error", "always"],
      curly: ["error", "all"],

      // Code style (handled by Prettier, but some logical rules)
      "max-len": ["warn", { code: 120, ignoreUrls: true, ignoreStrings: true }],
      complexity: ["warn", 10],
      "max-depth": ["warn", 4],
      "max-params": ["warn", 5],
    },
  },
  {
    files: ["**/*.spec.ts", "**/*.test.ts", "**/test/**/*.ts"],
    rules: {
      // Relax rules for test files
      "@typescript-eslint/no-explicit-any": "off",
      "no-console": "off",
      "max-len": "off",
    },
  },
  {
    files: ["scripts/**/*.ts"],
    rules: {
      // Relax rules for scripts
      "no-console": "off",
      "@typescript-eslint/no-explicit-any": "off",
    },
  },
  {
    ignores: ["dist/**", "node_modules/**", "coverage/**", "*.js", "*.mjs", ".env*", "README.md"],
  },
  prettier, // Must be last to override other configs
];
s;
