import type { BetterAuthClientOptions } from "better-auth";
import { adminClient, anonymousClient, apiKeyClient } from "better-auth/client/plugins";

export const authOptions: BetterAuthClientOptions = {
	plugins: [adminClient(), anonymousClient(), apiKeyClient()],
};
