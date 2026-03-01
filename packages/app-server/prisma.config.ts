import { defineConfig } from "prisma/config";
import { getEnv } from "./src/env";

const env = getEnv((env) => [env.DATABASE_URL.optional()]);

export default defineConfig({
	schema: "prisma/schema.prisma",
	migrations: {
		path: "prisma/migrations",
	},
	datasource: {
		url: env.DATABASE_URL,
	},
});
