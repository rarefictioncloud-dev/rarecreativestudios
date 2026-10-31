import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],

  // GitHub Pages deployment base path
  base: "/rarecreativestudios/",

  // Local development proxy for Cloudflare R2 FBX
  server: {
    proxy: {
      "/__rcs_fbx__": {
        target: "https://pub-c068270ff2f94b2691bb54438e646383.r2.dev",
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/__rcs_fbx__/, ""),
      },
    },
  },
});