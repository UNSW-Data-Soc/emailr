import path from "path";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import ckeditor5 from "@ckeditor/vite-plugin-ckeditor5";

import { createRequire } from "node:module";
const require = createRequire(import.meta.url);

export default defineConfig({
  plugins: [react(), ckeditor5({ theme: require.resolve("@ckeditor/ckeditor5-theme-lark") })],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  optimizeDeps: {
    // include: ["nodemailer"],
    // exclude: ["nodemailer"],
  },
  build: {
    commonjsOptions: {
      include: [/@workspace\/ckeditor5-custom-build/, /node_modules/],
    },
  },
});
