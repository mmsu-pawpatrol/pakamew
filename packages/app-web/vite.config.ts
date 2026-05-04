import path from "path";
import { fileURLToPath } from "node:url";
import tailwindcss from "@tailwindcss/vite";
import { devtools } from "@tanstack/devtools-vite";
import { tanstackRouter } from "@tanstack/router-plugin/vite";
import react from "@vitejs/plugin-react";
import { orpcContractPlugin } from "../app-server/scripts/orpc-contract";
import { defineConfig } from "vite";
import { getEnv } from "./src/env.server";

const env = getEnv((env) => [env.HOST, env.PORT]);

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
	appType: "spa",
	envPrefix: ["VITE_"],
	build: {
		reportCompressedSize: true,
		sourcemap: "hidden",
		emptyOutDir: true,
	},
	server: {
		host: env.HOST,
		port: env.PORT,
	},
	plugins: [
		orpcContractPlugin(),
		devtools(),
		tailwindcss(),
		tanstackRouter({
			target: "react",
			autoCodeSplitting: true,
		}),
		react(),
	],
	resolve: {
		tsconfigPaths: true,
		alias: [
			{
				find: /^@\//,
				replacement: `${path.resolve(__dirname, "./src")}/`,
			},
		],
	},
});
