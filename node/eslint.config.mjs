import globals from "globals";
import pluginJs from "@eslint/js";

export default [
  pluginJs.configs.recommended,
  {
    rules: {
      "no-unused-vars": ["error", { argsIgnorePattern: "_" }],
    },

    languageOptions: {
      globals: globals.node,
    },
  },
];
