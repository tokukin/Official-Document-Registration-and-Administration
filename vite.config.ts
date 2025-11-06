import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";

// 不使用vite-electron-plugin，而是使用更简单的配置方式

export default defineConfig({
  base: "./",
  plugins: [vue()],
  server: {
    port: 5173,
  },
  build: {
    outDir: "dist",
    emptyOutDir: true,
  },
  resolve: {
    alias: {
      "@": "/src",
    },
  },
});
