import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { getEnv } from "./src/env.server";

const env = getEnv((env) => [env.HOST, env.PORT]);

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export default defineConfig((_) => ({
	appType: "spa",
	envPrefix: ["VITE_"],
	build: {
		minify: "oxc",
		cssMinify: "lightningcss",
		cssCodeSplit: true,
		reportCompressedSize: true,
		sourcemap: "hidden",
		emptyOutDir: true,
	},
	server: {
		host: env.HOST,
		port: env.PORT,
	},
	plugins: [react()],
}));
