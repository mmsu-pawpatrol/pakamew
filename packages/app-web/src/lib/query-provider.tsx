import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";

export interface QueryProviderProps {
	children: ReactNode;
	queryClient?: QueryClient;
}

const defaultQueryClient = new QueryClient();

export function QueryProvider({ children, queryClient }: QueryProviderProps) {
	const resolvedQueryClient = queryClient ?? defaultQueryClient;

	return <QueryClientProvider client={resolvedQueryClient}>{children}</QueryClientProvider>;
}
