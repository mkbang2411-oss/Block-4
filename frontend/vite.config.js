import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// The React app runs on :5173 and forwards /api/* to the Express server on :4000
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: { "/api": "http://127.0.0.1:4000" },
  },
});
