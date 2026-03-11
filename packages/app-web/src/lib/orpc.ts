import { env } from "@/env";
import { RPCLink } from "@orpc/client/fetch";
import type { createTanstackQueryUtils } from "@orpc/tanstack-query";
import type { RPCRouterClient } from "@pakamew/server/api";
import { createContext, use } from "react";

export const link = new RPCLink({
	url: `${env.VITE_API_URL}/api`,
});

export type ORPCTanstackQueryUtils = ReturnType<typeof createTanstackQueryUtils<RPCRouterClient>>;

export const ORPCClientContext = createContext<RPCRouterClient | null>(null);
export const ORPCTanstackQueryUtilsContext = createContext<ORPCTanstackQueryUtils | null>(null);

export function useORPCClient() {
	const client = use(ORPCClientContext);

	if (!client) {
		throw new Error("useORPCClient must be used within ORPCProvider.");
	}

	return client;
}

export function useORPCTanstackQueryUtils() {
	const utils = use(ORPCTanstackQueryUtilsContext);

	if (!utils) {
		throw new Error("useORPCTanstackQueryUtils must be used within ORPCProvider.");
	}

	return utils;
}
