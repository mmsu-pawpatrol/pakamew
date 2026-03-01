import { defineConfig } from "vite";
import { VitePluginNode } from "vite-plugin-node";
import { getEnv } from "./src/env";

const env = getEnv((env) => [env.HOST, env.PORT]);

export default defineConfig(({ command }) => ({
	appType: "custom",
	plugins: [
		...(command === "serve"
			? [
					...VitePluginNode({
						adapter: async ({ app, req, res, next }) => {
							// eslint-disable-next-line @typescript-eslint/no-unsafe-call
							await app(req, res, next);
						},
						appPath: "./src/main.vite.ts",
						exportName: "viteNodeApp",
					}),
				]
			: []),
	],
	server: {
		host: env.HOST,
		port: env.PORT,
	},
	build: {
		emptyOutDir: true,
		sourcemap: true,
		ssr: "./src/main.node.ts",
		target: "node22",
	},
}));
