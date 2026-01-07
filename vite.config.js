import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    tailwindcss(),
    react()
  ],
  define: {
    "process.env.NODE_ENV": '"production"',
    "process.env": {},
  },
  build: {
    lib: {
      entry: "src/widget-element.jsx",
      name: "MyWidget",
      formats: ["iife"],
      fileName: () => "widget.js",
    },
  },
});
