import { createORPCClient } from "@orpc/client";
import { RPCLink } from "@orpc/client/fetch";
import type { RPCRouterClient } from "@pakamew/server/api";
import { env } from "../env";

const link = new RPCLink({
	url: `${env.VITE_API_URL}/api`,
});

export const api: RPCRouterClient = createORPCClient(link);
