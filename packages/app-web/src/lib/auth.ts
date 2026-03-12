import { env } from "@/env";
import { authOptions } from "@pakamew/shared/lib/auth";
import { createAuthClient } from "better-auth/react";

export function createBetterAuthClient(baseURL: string) {
	return createAuthClient({
		...authOptions,
		baseURL,
	});
}

export const auth = createBetterAuthClient(env.VITE_API_URL);
