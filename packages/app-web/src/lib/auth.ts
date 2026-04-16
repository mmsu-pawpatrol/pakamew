import { env } from "@/env";
import { authOptions } from "@pakamew/shared/lib/auth";
import { createAuthClient } from "better-auth/react";

/**
 * Better Auth's inferred React client type expands through internal declaration
 * paths, which triggers TS2742/TS4058 when exported from this module. Naming the
 * return type locally keeps the public type portable while preserving inference
 * for the configured plugins.
 */
type AppAuthClient = ReturnType<
	typeof createAuthClient<
		typeof authOptions & {
			baseURL: string;
		}
	>
>;

export const auth: AppAuthClient = createAuthClient({
	...authOptions,
	baseURL: env.VITE_API_URL,
});
