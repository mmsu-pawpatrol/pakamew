import { resolveOrpcRouteMetadata, type OrpcRouteMetadata } from "./route-template";

/**
 * Mutable context carrier used by oRPC interceptors for route metadata handoff.
 */
export interface OrpcRouteMetadataCarrier {
	/**
	 * Metadata object mutated in place as route details are resolved.
	 */
	orpcRouteMetadata?: OrpcRouteMetadata;
}

/**
 * Applies resolved oRPC route metadata into a mutable carrier.
 * @param carrier - Context carrier that may hold route metadata.
 * @param procedure - Procedure instance currently being invoked.
 * @param path - Procedure path segments for the current invocation.
 */
export function applyOrpcRouteMetadata(
	carrier: OrpcRouteMetadataCarrier | undefined,
	procedure: unknown,
	path: readonly string[],
): void {
	const routeMetadata = carrier?.orpcRouteMetadata;
	if (!routeMetadata) return;

	const resolved = resolveOrpcRouteMetadata(procedure, path);
	routeMetadata.httpRouteTemplate = resolved.httpRouteTemplate;
	routeMetadata.procedure = resolved.procedure;
	routeMetadata.operationId = resolved.operationId;
}
