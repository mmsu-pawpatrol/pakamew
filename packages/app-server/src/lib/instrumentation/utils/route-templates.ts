export interface RouteTemplateCandidate {
	method: string;
	template: string;
	name?: string;
}

export interface RouteTemplateMatch {
	method: string;
	template: string;
	name?: string;
}

interface RouteTemplateMatcherEntry extends RouteTemplateMatch {
	pattern: RegExp;
	score: number;
}

const TEMPLATE_PARAM_SEGMENT_PATTERN = /^(:[^/]+|\{[^/]+\})$/;

function escapeRegexSegment(segment: string): string {
	return segment.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function normalizeMethod(method: string): string {
	const normalized = method.trim().toUpperCase();
	return normalized || "*";
}

function trimTrailingSlash(pathname: string): string {
	if (pathname === "/") return pathname;
	return pathname.endsWith("/") ? pathname.slice(0, -1) : pathname;
}

/**
 * @internal
 * Normalizes a route template.
 * @param pathValue - The path value to normalize.
 * @returns The normalized route template.
 */
export function normalizeRouteTemplate(pathValue: string): string {
	const withoutQuery = pathValue.split(/[?#]/, 1)[0] ?? pathValue;
	const withLeadingSlash = withoutQuery.startsWith("/") ? withoutQuery : `/${withoutQuery}`;
	const collapsedSlashes = withLeadingSlash.replace(/\/+/g, "/");
	const normalized = trimTrailingSlash(collapsedSlashes);
	return normalized || "/";
}

/**
 * @internal
 * Joins two route templates.
 * @param prefix - The prefix to join.
 * @param template - The template to join.
 * @returns The joined route template.
 */
export function joinRouteTemplates(prefix: string, template: string): string {
	const normalizedPrefix = normalizeRouteTemplate(prefix);
	const normalizedTemplate = normalizeRouteTemplate(template);

	if (normalizedPrefix === "/") return normalizedTemplate;
	if (normalizedTemplate === "/") return normalizedPrefix;

	return normalizeRouteTemplate(`${normalizedPrefix}/${normalizedTemplate.slice(1)}`);
}

/**
 * @internal
 * Checks if a segment is a template parameter segment.
 * @param segment - The segment to check.
 * @returns True if the segment is a template parameter segment, false otherwise.
 */
function isTemplateParamSegment(segment: string): boolean {
	return TEMPLATE_PARAM_SEGMENT_PATTERN.test(segment);
}

/**
 * @internal
 * Converts a route template to a regular expression pattern.
 * @param template - The route template to convert.
 * @returns The regular expression pattern.
 */
function toTemplatePattern(template: string): RegExp {
	const normalized = normalizeRouteTemplate(template);
	if (normalized === "/") return /^\/?$/;

	const segments = normalized.slice(1).split("/");
	const pattern = segments
		.map((segment, index) => {
			if (segment === "**") return ".*";
			if (segment === "*" && index === segments.length - 1) return ".*";
			if (segment === "*") return "[^/]+";
			if (isTemplateParamSegment(segment)) return "[^/]+";
			return escapeRegexSegment(segment);
		})
		.join("/");

	return new RegExp(`^/${pattern}/?$`);
}

/**
 * @internal
 * Computes the specificity of a route template.
 * @param template - The route template to compute the specificity of.
 * @returns The specificity of the route template.
 */
function computeSpecificity(template: string): number {
	const normalized = normalizeRouteTemplate(template);
	if (normalized === "/") return 0;

	const segments = normalized.slice(1).split("/");
	return segments.reduce((score, segment) => {
		if (segment === "**") return score - 100;
		if (segment === "*") return score - 20;
		if (isTemplateParamSegment(segment)) return score + 2;
		return score + 20;
	}, 0);
}

/**
 * @internal
 * Creates a route template matcher from a list of candidates.
 * @param candidates - The candidates to create the route template matcher from.
 * @returns The route template matcher.
 */
export function createRouteTemplateMatcher(
	candidates: readonly RouteTemplateCandidate[],
): (method: string, pathname: string) => RouteTemplateMatch | undefined {
	const entries: RouteTemplateMatcherEntry[] = candidates.map((candidate) => {
		const method = normalizeMethod(candidate.method);
		const template = normalizeRouteTemplate(candidate.template);
		return {
			method,
			template,
			name: candidate.name,
			pattern: toTemplatePattern(template),
			score: computeSpecificity(template),
		};
	});

	entries.sort((left, right) => {
		const leftMethodPriority = left.method === "*" ? 0 : 1;
		const rightMethodPriority = right.method === "*" ? 0 : 1;
		if (leftMethodPriority !== rightMethodPriority) return rightMethodPriority - leftMethodPriority;
		if (left.score !== right.score) return right.score - left.score;
		return right.template.length - left.template.length;
	});

	/**
	 * @internal
	 * Matches a method and pathname to a route template.
	 * @param method - The method to match.
	 * @param pathname - The pathname to match.
	 * @returns The matched route template.
	 */
	return (method: string, pathname: string): RouteTemplateMatch | undefined => {
		const normalizedMethod = normalizeMethod(method);
		const normalizedPathname = normalizeRouteTemplate(pathname);

		for (const entry of entries) {
			if (entry.method !== "*" && entry.method !== normalizedMethod) continue;
			if (!entry.pattern.test(normalizedPathname)) continue;

			return {
				method: entry.method,
				template: entry.template,
				name: entry.name,
			};
		}

		return undefined;
	};
}

/**
 * @internal
 * Converts a method and route template to a span name.
 * @param method - The method to convert.
 * @param template - The route template to convert.
 * @returns The span name.
 */
export function toHttpSpanName(method: string, template: string): string {
	return `${normalizeMethod(method)} ${normalizeRouteTemplate(template)}`;
}

/**
 * @internal
 * The context key for the oRPC HTTP route template.
 */
export const ORPC_HTTP_ROUTE_TEMPLATE_CONTEXT_KEY = "orpc.http_route_template";

/**
 * @internal
 * Writes the request route template to the request context.
 * @param request - The request to write the route template to.
 * @param template - The route template to write.
 */
export function writeRequestRouteTemplate(request: Request, template: string): void {
	(request as unknown as Record<string, unknown>)[ORPC_HTTP_ROUTE_TEMPLATE_CONTEXT_KEY] = template;
}

/**
 * @internal
 * Reads the request route template from the request context.
 * @param request - The request to read the route template from.
 * @returns The request route template.
 */
export function readRequestRouteTemplate(request: Request): string | undefined {
	const value = (request as unknown as Record<string, unknown>)[ORPC_HTTP_ROUTE_TEMPLATE_CONTEXT_KEY];
	return typeof value === "string" && value.length > 0 ? value : undefined;
}

/**
 * @internal
 * Converts an oRPC HTTP route template to a normalized HTTP route template.
 * @param template - The oRPC HTTP route template to convert.
 * @param prefix - The prefix to add to the template.
 * @returns The normalized HTTP route template.
 */
export function toOrpcHttpRouteTemplate(template: string, prefix = "/api"): string {
	const normalizedTemplate = normalizeRouteTemplate(template);
	const normalizedPrefix = normalizeRouteTemplate(prefix);

	if (normalizedTemplate.startsWith(`${normalizedPrefix}/`) || normalizedTemplate === normalizedPrefix) {
		return normalizedTemplate;
	}

	return joinRouteTemplates(normalizedPrefix, normalizedTemplate);
}
