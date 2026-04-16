import { apiKeyClient } from "@better-auth/api-key/client";
import type { BetterAuthClientOptions } from "better-auth";
import { adminClient, anonymousClient } from "better-auth/client/plugins";

export const authOptions = {
	plugins: [adminClient(), anonymousClient(), apiKeyClient()],
} satisfies BetterAuthClientOptions;
