import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";

const eslintConfig = defineConfig([
  ...nextVitals,
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Proyectos de referencia visual: no forman parte de esta app.
    "donaceci_v2/**",
    "costenisimos-web/**",
  ]),
]);

export default eslintConfig;
