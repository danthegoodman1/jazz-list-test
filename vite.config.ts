import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"
import fs from "fs"

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    https: {
      key: fs.readFileSync(".ssl/localhost.key"),
      cert: fs.readFileSync(".ssl/localhost.crt"),
    },
    host: "0.0.0.0",
    port: 5173,
  },
  build: {
    sourcemap: true,
  },
  css: {
    devSourcemap: true,
  },
})
