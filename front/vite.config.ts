import { existsSync } from "node:fs";
import path from "node:path";
import { reactRouter } from "@react-router/dev/vite";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig, type Plugin } from "vite";

const appDir = path.resolve(import.meta.dirname, "app");
const extensions = [".ts", ".tsx", ".js", ".jsx", ".mjs", ".json"];

function tildeAlias(): Plugin {
  return {
    name: "tilde-alias",
    enforce: "pre",
    resolveId(source) {
      if (!source.startsWith("~/")) return null;

      const basePath = path.join(appDir, source.slice(2));

      for (const ext of extensions) {
        const fullPath = basePath + ext;
        if (existsSync(fullPath)) return fullPath;
      }

      for (const ext of extensions) {
        const indexPath = path.join(basePath, "index" + ext);
        if (existsSync(indexPath)) return indexPath;
      }

      return null;
    },
  };
}

export default defineConfig(({ isSsrBuild }) => ({
  build: {
    rollupOptions: isSsrBuild
      ? {
          input: "./server/app.ts",
        }
      : undefined,
  },
  plugins: [tildeAlias(), tailwindcss(), reactRouter()],
}));
