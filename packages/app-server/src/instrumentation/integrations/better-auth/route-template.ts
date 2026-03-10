import {
	createRouteTemplateMatcher,
	joinRouteTemplates,
	type RouteTemplateCandidate,
	type RouteTemplateMatch,
} from "../utils/route-templates";

export interface AuthRouteTemplateMatch {
	/**
	 * Normalized HTTP route template mapped to the matched Better Auth endpoint.
	 */
	template: string;
	/**
	 * Better Auth endpoint key from `auth.api`, when available.
	 */
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
 * Reads the HTTP path template for a Better Auth API endpoint.
 * @param endpoint - The API endpoint to get the path for.
 * @returns The endpoint path template when present.
 */
function getAuthApiEndpointPath(endpoint: unknown): string | undefined {
	if (typeof endpoint !== "function") return undefined;
	const maybePath = (endpoint as AuthApiEndpointLike).path;
	return typeof maybePath === "string" ? maybePath : undefined;
}

/**
 * @internal
 * Reads allowed HTTP methods for a Better Auth endpoint.
 * @param endpoint - The API endpoint to get the methods for.
 * @returns Supported methods, or wildcard when method metadata is absent.
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
 * Resolves the Better Auth base path used to prefix endpoint templates.
 * @param auth - The auth instance to get the base path for.
 * @returns The configured base path, defaulting to `/api/auth`.
 */
export function getAuthRouteBasePath(auth: AuthLike): string {
	return typeof auth.options?.basePath === "string" ? auth.options.basePath : "/api/auth";
}

/**
 * @internal
 * Builds a method-aware matcher from Better Auth endpoint definitions.
 * @param auth - The auth instance to build the route template matcher for.
 * @returns A function that maps request method and pathname to a matched template.
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
 * Gets a cached route matcher for a Better Auth instance.
 * @param auth - The auth instance to get the route template matcher for.
 * @returns The cached matcher, or a newly built matcher.
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
 * Matches an incoming request against Better Auth endpoint route templates.
 * @param auth - The auth instance to match the route template to.
 * @param method - The HTTP method to match the route template to.
 * @param pathname - The pathname to match the route template to.
 * @returns Matched route metadata, if any endpoint matches.
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
