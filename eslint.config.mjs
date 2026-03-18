import { defineConfig } from "eslint/config";
import nextCoreWebVitals from "eslint-config-next/core-web-vitals";
import tseslint from "typescript-eslint";

export default defineConfig([
  ...nextCoreWebVitals,
  ...tseslint.configs.recommended,
  { ignores: ["e2e/**"] },
]);
