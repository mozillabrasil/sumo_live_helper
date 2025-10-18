import js from "@eslint/js";
import globals from "globals";
import css from "@eslint/css";
import { defineConfig, globalIgnores } from "eslint/config";
import eslintConfigPrettier from "eslint-config-prettier/flat";

export default defineConfig([
  globalIgnores(["bin/*", "src/vendor/*"]),
  {
    files: ["src/**/*.{js,mjs,cjs}"],
    plugins: { js },
    languageOptions: {
      globals: {
        ...globals.browser,
        browser: "readonly",
      },
    },
    rules: {
      "no-unused-vars": "warn",
    },
    extends: ["js/recommended"],
  },
  {
    files: ["src/**/*.css"],
    plugins: { css },
    language: "css/css",
    rules: {
      "css/use-baseline": "off",
    },
    extends: ["css/recommended"],
  },
  eslintConfigPrettier,
]);
