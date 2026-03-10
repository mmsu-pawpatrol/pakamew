import { toHttpPath } from "@orpc/client/standard";
import { joinRouteTemplates, normalizeRouteTemplate } from "../utils/route-templates";

/**
 * oRPC route metadata captured during request dispatch.
 */
export interface OrpcRouteMetadata {
	/**
	 * Route template used for HTTP metrics and span naming.
	 */
	httpRouteTemplate: string;
	/**
	 * Normalized oRPC procedure path.
	 */
	procedure: string;
	/**
	 * Stable operation identifier, usually from OpenAPI route metadata.
	 */
	operationId?: string;
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
 * Extracts route metadata from a procedure `~orpc` definition.
 * @param procedure - The procedure to extract the route definition from.
 * @returns Route path and operation ID when available.
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
 * Derives a fallback procedure path from a request pathname.
 * @param pathname - The pathname to derive the fallback procedure name from.
 * @returns The procedure path without `/api` prefix when present.
 */
export function getOrpcFallbackProcedure(pathname: string): string {
	return pathname.startsWith("/api") ? pathname.slice(4) || "/" : pathname;
}

/**
 * @internal
 * Creates fallback oRPC route metadata when procedure metadata is unavailable.
 * @param pathname - The pathname to create the fallback route metadata from.
 * @returns Route metadata derived from the request path.
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
 * Resolves route metadata from procedure internals and procedure path segments.
 * @param procedure - The procedure to resolve the route metadata from.
 * @param path - The path to resolve the route metadata from.
 * @returns Resolved route metadata for metrics/spans.
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
 * Converts oRPC route templates into normalized HTTP route templates.
 * @param template - The oRPC HTTP route template to convert.
 * @param prefix - The prefix to add to the template.
 * @returns Normalized route template with API prefix when needed.
 */
function toOrpcHttpRouteTemplate(template: string, prefix = "/api"): string {
	const normalizedTemplate = normalizeRouteTemplate(template);
	const normalizedPrefix = normalizeRouteTemplate(prefix);

	if (normalizedTemplate.startsWith(`${normalizedPrefix}/`) || normalizedTemplate === normalizedPrefix) {
		return normalizedTemplate;
	}

	return joinRouteTemplates(normalizedPrefix, normalizedTemplate);
}

/**
 * @internal
 * Resolves a normalized HTTP route template from oRPC route metadata.
 * @param routeMetadata - The route metadata to resolve the HTTP route template from.
 * @returns Normalized HTTP route template for span/metric labels.
 */
export function resolveOrpcHttpRouteTemplate(routeMetadata: OrpcRouteMetadata): string {
	return toOrpcHttpRouteTemplate(routeMetadata.httpRouteTemplate);
}
