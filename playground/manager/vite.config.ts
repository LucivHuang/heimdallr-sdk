import { join } from "path";
import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";

function resolve(dir: string) {
  // @ts-ignore
  return join(__dirname, dir);
}

// https://vitejs.dev/config/
export default defineConfig({
  resolve: {
    alias: {
      "@": resolve("./src"),
      components: resolve("./src/components"),
      helper: resolve("./src/helper"),
      config: resolve("./src/helper/config"),
    },
  },
  plugins: [
    vue(),
  ],
});
