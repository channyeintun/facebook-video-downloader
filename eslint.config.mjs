import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import baselinePlugin from "eslint-plugin-baseline-js";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
  // Add baseline plugin to enforce JavaScript baseline compatibility
  {
    plugins: {
      "baseline-js": baselinePlugin,
    },
    rules: {
      // Enforce widely supported JavaScript features (ES2020)
      // Note: We intentionally use Atomics.waitAsync for multi-threading support
      // This is detected at runtime with fallback to single-threaded mode
      "baseline-js/use-baseline": [
        "warn",
        {
          baseline: "widely", // Use widely supported features
          includeWebApis: true, // Also check Web APIs
          includeJsBuiltins: true, // Check JavaScript built-ins
          ignoreFeatures: ["atomics-wait-async"], // We handle this with runtime detection
        },
      ],
    },
  },
]);

export default eslintConfig;
