import config from "@chit-chat/eslint-config/react";
import { defineConfig, globalIgnores } from "eslint/config";

export default defineConfig([globalIgnores(["dist"]), ...config]);
