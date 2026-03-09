import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [
    react({
      include: ["**/*.js", "**/*.jsx", "**/*.ts", "**/*.tsx"],
      fastRefresh: true,
    }),
    tailwindcss(),
  ],

  esbuild: {
    loader: "jsx",
    include: /src\/.*\.(js|jsx)$/,
    exclude: [],
  },
});
