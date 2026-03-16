import { existsSync } from "node:fs";
import path from "node:path";
import { reactRouter } from "@react-router/dev/vite";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";


export default defineConfig(() => ({
  plugins: [tailwindcss(), reactRouter()],
  base: '/maker-flow/', 
}));
