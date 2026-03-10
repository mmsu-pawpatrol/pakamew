/**
 * Candidate entry used to build method-aware route template matchers.
 */
export interface RouteTemplateCandidate {
	/**
	 * HTTP method to match. Use `*` for wildcard.
	 */
	method: string;
	/**
	 * Route template or pattern.
	 */
	template: string;
	/**
	 * Optional identifier associated with the template.
	 */
	name?: string;
}

/**
 * Matched route template result returned by a matcher.
 */
export interface RouteTemplateMatch {
	/**
	 * Normalized HTTP method for the matched template.
	 */
	method: string;
	/**
	 * Normalized matched route template.
	 */
	template: string;
	/**
	 * Optional identifier associated with the matched template.
	 */
	name?: string;
}

interface RouteTemplateMatcherEntry extends RouteTemplateMatch {
	pattern: RegExp;
	score: number;
}

const TEMPLATE_PARAM_SEGMENT_PATTERN = /^(:[^/]+|\{[^/]+\})$/;

/**
 * Escapes a route segment for safe RegExp construction.
 * @param segment - Raw route segment.
 * @returns Escaped segment.
 */
function escapeRegexSegment(segment: string): string {
	return segment.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Normalizes HTTP method labels for matching.
 * @param method - HTTP method candidate.
 * @returns Uppercase method or wildcard.
 */
function normalizeMethod(method: string): string {
	const normalized = method.trim().toUpperCase();
	return normalized || "*";
}

/**
 * Removes trailing slash except for root (`/`).
 * @param pathname - Pathname candidate.
 * @returns Pathname without trailing slash.
 */
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
