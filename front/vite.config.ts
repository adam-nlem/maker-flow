import { reactRouter } from "@react-router/dev/vite";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig, type Plugin } from "vite";

function tildeAlias(): Plugin {
  return {
    name: "tilde-alias",
    resolveId(source, importer) {
      if (source.startsWith("~/")) {
        return this.resolve(
          source.replace("~/", `${import.meta.dirname}/app/`),
          importer,
          { skipSelf: true },
        );
      }
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
