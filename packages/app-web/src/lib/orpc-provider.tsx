import { createORPCClient } from "@orpc/client";
import { createTanstackQueryUtils } from "@orpc/tanstack-query";
import type { RPCRouterClient } from "@pakamew/server/api";
import { useMemo, type ReactNode } from "react";
import { link, ORPCClientContext, ORPCTanstackQueryUtilsContext } from "./orpc";

export interface ORPCProviderProps {
	children: ReactNode;
	client?: RPCRouterClient;
}

const defaultClient: RPCRouterClient = createORPCClient(link);

export function ORPCProvider({ children, client }: ORPCProviderProps) {
	const resolvedClient = client ?? defaultClient;
	const utils = useMemo(() => createTanstackQueryUtils(resolvedClient), [resolvedClient]);

	return (
		<ORPCClientContext value={resolvedClient}>
			<ORPCTanstackQueryUtilsContext value={utils}>{children}</ORPCTanstackQueryUtilsContext>
		</ORPCClientContext>
	);
}
