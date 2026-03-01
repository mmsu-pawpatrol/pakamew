import {
	createRouteTemplateMatcher,
	joinRouteTemplates,
	type RouteTemplateCandidate,
	type RouteTemplateMatch,
} from "../../../lib/instrumentation/utils/route-templates";

export interface AuthRouteTemplateMatch {
	template: string;
	endpointKey?: string;
}

interface AuthApiEndpointOptions {
	method?: string | string[];
}

interface AuthApiEndpointLike {
	path?: unknown;
	options?: AuthApiEndpointOptions;
}

interface AuthLike {
	api: Record<string, unknown>;
	options?: Record<string, unknown>;
}

/**
 * @internal
 * Cache for auth route template matchers.
 */
const authRouteTemplateMatcherCache = new WeakMap<
	AuthLike,
	(method: string, pathname: string) => RouteTemplateMatch | undefined
>();

/**
 * @internal
 * Gets the path for an auth API endpoint.
 * @param endpoint - The API endpoint to get the path for.
 * @returns The path.
 */
function getAuthApiEndpointPath(endpoint: unknown): string | undefined {
	if (typeof endpoint !== "function") return undefined;
	const maybePath = (endpoint as AuthApiEndpointLike).path;
	return typeof maybePath === "string" ? maybePath : undefined;
}

/**
 * @internal
 * Gets the methods for an auth API endpoint.
 * @param endpoint - The API endpoint to get the methods for.
 * @returns The methods.
 */
function getAuthApiEndpointMethods(endpoint: unknown): string[] {
	if (typeof endpoint !== "function") return ["*"];

	const method = (endpoint as AuthApiEndpointLike).options?.method;
	if (typeof method === "string") return [method];
	if (Array.isArray(method)) return method.filter((value): value is string => typeof value === "string");
	return ["*"];
}

/**
 * @internal
 * Gets the base path for an auth instance.
 * @param auth - The auth instance to get the base path for.
 * @returns The base path.
 */
export function getAuthRouteBasePath(auth: AuthLike): string {
	return typeof auth.options?.basePath === "string" ? auth.options.basePath : "/api/auth";
}

/**
 * @internal
 * Builds a route template matcher for an auth instance.
 * @param auth - The auth instance to build the route template matcher for.
 * @returns The route template matcher.
 */
export function buildAuthRouteTemplateMatcher(
	auth: AuthLike,
): (method: string, pathname: string) => RouteTemplateMatch | undefined {
	const candidates: RouteTemplateCandidate[] = [];
	const basePath = getAuthRouteBasePath(auth);

	for (const [endpointKey, endpoint] of Object.entries(auth.api)) {
		const path = getAuthApiEndpointPath(endpoint);
		if (!path) continue;

		const template = joinRouteTemplates(basePath, path);
		for (const method of getAuthApiEndpointMethods(endpoint)) {
			candidates.push({
				method,
				template,
				name: endpointKey,
			});
		}
	}

	return createRouteTemplateMatcher(candidates);
}

/**
 * @internal
 * Gets the route template matcher for an auth instance.
 * @param auth - The auth instance to get the route template matcher for.
 * @returns The route template matcher.
 */
function getAuthRouteTemplateMatcher(
	auth: AuthLike,
): (method: string, pathname: string) => RouteTemplateMatch | undefined {
	const cachedMatcher = authRouteTemplateMatcherCache.get(auth);
	if (cachedMatcher) return cachedMatcher;

	const matcher = buildAuthRouteTemplateMatcher(auth);
	authRouteTemplateMatcherCache.set(auth, matcher);
	return matcher;
}

/**
 * @internal
 * Gets the wildcard route template for an auth instance.
 * @param auth - The auth instance to get the wildcard route template for.
 * @returns The wildcard route template.
 */
export function getAuthWildcardRouteTemplate(auth: AuthLike): string {
	return joinRouteTemplates(getAuthRouteBasePath(auth), "*");
}

/**
 * @internal
 * Matches an HTTP route template to an auth endpoint.
 * @param auth - The auth instance to match the route template to.
 * @param method - The HTTP method to match the route template to.
 * @param pathname - The pathname to match the route template to.
 * @returns The matched route template and endpoint key.
 */
export function matchAuthRouteTemplate(
	auth: AuthLike,
	method: string,
	pathname: string,
): AuthRouteTemplateMatch | undefined {
	const match = getAuthRouteTemplateMatcher(auth)(method, pathname);
	if (!match) return undefined;

	return {
		template: match.template,
		endpointKey: match.name,
	};
}
