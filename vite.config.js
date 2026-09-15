import { defineConfig } from "vite";
import { blogEditorPlugin } from "./scripts/dev-blog-server.mjs";

export default defineConfig({ plugins: [blogEditorPlugin()] });
