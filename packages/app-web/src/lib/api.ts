import { createORPCClient } from "@orpc/client";
import { RPCLink } from "@orpc/client/fetch";
import type { ApiClient } from "@pakamew/server/api";
import { env } from "../env";

const link = new RPCLink({
	url: `${env.VITE_API_URL}/api`,
});

export const api: ApiClient = createORPCClient(link);
