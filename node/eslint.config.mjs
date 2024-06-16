import globals from "globals";
import pluginJs from "@eslint/js";

export default [
  pluginJs.configs.recommended,
  {
    rules: {
      "no-unused-vars": [
        "error",
        { argsIgnorePattern: "_", caughtErrorsIgnorePattern: "_" },
      ],
    },

    languageOptions: {
      globals: globals.node,
    },
  },
];
