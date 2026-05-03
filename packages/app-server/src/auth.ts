import { apiKey } from "@better-auth/api-key";
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { admin, anonymous, openAPI } from "better-auth/plugins";
import { allowedOrigins } from "./cors";
import { getEnv } from "./env";
import { getPrisma } from "./prisma";

const env = getEnv((env) => [env.NODE_ENV, env.BETTER_AUTH_URL]);

export const auth = betterAuth({
	baseURL: env.BETTER_AUTH_URL,
	emailAndPassword: {
		enabled: true,
		autoSignIn: true,
		requireEmailVerification: env.NODE_ENV != "development",
	},
	plugins: [admin(), anonymous(), openAPI({ disableDefaultReference: true }), apiKey()],
	trustedOrigins: allowedOrigins,
	database: prismaAdapter(getPrisma(), {
		usePlural: true,
		transaction: true,
		provider: "postgresql",
		debugLogs: env.NODE_ENV == "development",
	}),
});

export type AppAuth = typeof auth;
