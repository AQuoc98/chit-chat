import config from "@chit-chat/eslint-config/base";
import { defineConfig, globalIgnores } from "eslint/config";
import globals from "globals";

export default defineConfig([
  globalIgnores(["dist", "node_modules"]),
  ...config,
  {
    languageOptions: {
      globals: globals.node,
    },
  },
]);
