import { fileURLToPath } from "node:url";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

const raiz = fileURLToPath(new URL("./", import.meta.url));

/**
 * Dois projetos de teste:
 *  - unit: regras, validações, formatação e componentes (não precisa de banco)
 *  - integration: chama o Supabase LOCAL pela API, como os usuários do seed
 *    (precisa de `npm run db:start` e banco recriado com `npm run db:reset`)
 */
export default defineConfig({
  plugins: [react()],
  resolve: { alias: { "@": raiz } },
  test: {
    projects: [
      {
        extends: true,
        test: {
          name: "unit",
          include: ["tests/unit/**/*.test.{ts,tsx}"],
          environment: "jsdom",
          setupFiles: ["tests/unit/setup.ts"],
        },
      },
      {
        extends: true,
        test: {
          name: "integration",
          include: ["tests/integration/**/*.test.ts"],
          environment: "node",
          // Os testes alteram o mesmo banco: rodam um arquivo por vez.
          fileParallelism: false,
          testTimeout: 20000,
        },
      },
    ],
  },
});
