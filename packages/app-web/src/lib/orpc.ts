import { env } from "@/env";
import type { AnyContractRouter } from "@orpc/contract";
import type { JsonifiedClient } from "@orpc/openapi-client";
import { OpenAPILink } from "@orpc/openapi-client/fetch";
import type { createTanstackQueryUtils } from "@orpc/tanstack-query";
import type { RPCRouterClient } from "@pakamew/server/api";
import { createContext, use } from "react";
import contract from "./orpc-contract.generated.json";

const contractRouter = contract as AnyContractRouter;

export const link = new OpenAPILink(contractRouter, {
	url: `${env.VITE_API_URL}/api`,
	fetch: (input, init) => fetch(input, { ...init, credentials: "include" }),
});

export type ORPCClient = JsonifiedClient<RPCRouterClient>;
export type ORPCTanstackQueryUtils = ReturnType<typeof createTanstackQueryUtils<ORPCClient>>;

export const ORPCClientContext = createContext<ORPCClient | null>(null);
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
