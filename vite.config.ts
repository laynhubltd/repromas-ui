import react from "@vitejs/plugin-react";
import svgr from "vite-plugin-svgr";
import path from "path";
import { defineConfig } from "vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), svgr()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("node_modules")) {
            if (
              id.includes("react") ||
              id.includes("react-dom") ||
              id.includes("react-router") ||
              id.includes("@reduxjs")
            ) {
              return "vendor-core";
            }
            if (id.includes("antd") || id.includes("@ant-design")) {
              return "vendor-antd";
            }
            if (id.includes("pdfjs-dist") || id.includes("react-pdf")) {
              return "vendor-pdf";
            }
            if (id.includes("dayjs") || id.includes("rc-")) {
              return "vendor-ui-helpers";
            }
          }
        },
      },
    },
  },
  // @ts-expect-error — vitest config lives here
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: ["./src/__tests__/setup.ts"],
    alias: {
      "@": path.resolve(__dirname, "./src"),
      // Redirect broken import paths in unfixed code so tests can render components
      // and assert the correct behavior (Bug 3 / Bug 3b exploration tests)
      [path.resolve(__dirname, "src/features/settings/components/mock-session-config")]:
        path.resolve(__dirname, "src/features/settings/utils/mock-session-config.ts"),
      [path.resolve(__dirname, "src/features/academic-structure/components/mock-data")]:
        path.resolve(__dirname, "src/features/academic-structure/utils/mock-data.ts"),
    },
  },
});
