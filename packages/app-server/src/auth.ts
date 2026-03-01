import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { admin, anonymous, apiKey, openAPI } from "better-auth/plugins";
import { getEnv } from "./env";
import { getPrisma } from "./lib/prisma";

const env = getEnv((env) => [env.NODE_ENV]);

export const auth = betterAuth({
	emailAndPassword: {
		enabled: true,
		autoSignIn: true,
		requireEmailVerification: env.NODE_ENV != "development",
	},
	plugins: [admin(), anonymous(), openAPI({ disableDefaultReference: true }), apiKey()],
	database: prismaAdapter(getPrisma(), {
		usePlural: true,
		transaction: true,
		provider: "postgresql",
		debugLogs: env.NODE_ENV == "development",
	}),
});
