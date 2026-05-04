import { createORPCClient } from "@orpc/client";
import { createTanstackQueryUtils } from "@orpc/tanstack-query";
import { useMemo, type ReactNode } from "react";
import { link, ORPCClientContext, ORPCTanstackQueryUtilsContext, type ORPCClient } from "./orpc";

export interface ORPCProviderProps {
	children: ReactNode;
	client?: ORPCClient;
}

const defaultClient: ORPCClient = createORPCClient(link);

export function ORPCProvider({ children, client }: ORPCProviderProps) {
	const resolvedClient = client ?? defaultClient;
	const utils = useMemo(() => createTanstackQueryUtils(resolvedClient), [resolvedClient]);

	return (
		<ORPCClientContext value={resolvedClient}>
			<ORPCTanstackQueryUtilsContext value={utils}>{children}</ORPCTanstackQueryUtilsContext>
		</ORPCClientContext>
	);
}
