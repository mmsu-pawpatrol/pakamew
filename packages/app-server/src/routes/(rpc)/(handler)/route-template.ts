import { toHttpPath } from "@orpc/client/standard";
import { toOrpcHttpRouteTemplate } from "../../../lib/instrumentation/utils/route-templates";

export interface OrpcRouteMetadata {
	httpRouteTemplate: string;
	procedure: string;
	operationId?: string;
}

export interface OrpcRouteMetadataCarrier {
	orpcRouteMetadata?: OrpcRouteMetadata;
}

interface OrpcProcedureRouteDefinition {
	path?: unknown;
	operationId?: unknown;
}

interface OrpcProcedureDefinitionLike {
	route?: OrpcProcedureRouteDefinition;
}

/**
 * @internal
 * Extracts the route definition from a procedure.
 * @param procedure - The procedure to extract the route definition from.
 * @returns The route definition.
 */
function extractProcedureRouteDefinition(procedure: unknown): {
	path?: string;
	operationId?: string;
} {
	if (!procedure || typeof procedure !== "object") return {};

	const definition = (procedure as { "~orpc"?: OrpcProcedureDefinitionLike })["~orpc"];
	if (!definition || typeof definition !== "object") return {};

	return {
		path: typeof definition.route?.path === "string" ? definition.route.path : undefined,
		operationId: typeof definition.route?.operationId === "string" ? definition.route.operationId : undefined,
	};
}

/**
 * @internal
 * Derives a fallback procedure name from a pathname.
 * @param pathname - The pathname to derive the fallback procedure name from.
 * @returns The fallback procedure name.
 */
export function getOrpcFallbackProcedure(pathname: string): string {
	return pathname.startsWith("/api") ? pathname.slice(4) || "/" : pathname;
}

/**
 * @internal
 * Creates a fallback route metadata from a pathname.
 * @param pathname - The pathname to create the fallback route metadata from.
 * @returns The fallback route metadata.
 */
export function createOrpcFallbackRouteMetadata(pathname: string): OrpcRouteMetadata {
	const fallbackProcedure = getOrpcFallbackProcedure(pathname);
	return {
		httpRouteTemplate: fallbackProcedure,
		procedure: fallbackProcedure,
	};
}

/**
 * @internal
 * Resolves the route metadata from a procedure and path.
 * @param procedure - The procedure to resolve the route metadata from.
 * @param path - The path to resolve the route metadata from.
 * @returns The resolved route metadata.
 */
export function resolveOrpcRouteMetadata(procedure: unknown, path: readonly string[]): OrpcRouteMetadata {
	const procedurePath = toHttpPath(path);
	const routeDefinition = extractProcedureRouteDefinition(procedure);
	return {
		httpRouteTemplate: routeDefinition.path ?? procedurePath,
		procedure: procedurePath,
		operationId: routeDefinition.operationId ?? path.join("."),
	};
}

/**
 * @internal
 * Applies the route metadata to a carrier.
 * @param carrier - The carrier to apply the route metadata to.
 * @param procedure - The procedure to apply the route metadata to.
 * @param path - The path to apply the route metadata to.
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

/**
 * @internal
 * Resolves the HTTP route template from a route metadata.
 * @param routeMetadata - The route metadata to resolve the HTTP route template from.
 * @returns The resolved HTTP route template.
 */
export function resolveOrpcHttpRouteTemplate(routeMetadata: OrpcRouteMetadata): string {
	return toOrpcHttpRouteTemplate(routeMetadata.httpRouteTemplate);
}
