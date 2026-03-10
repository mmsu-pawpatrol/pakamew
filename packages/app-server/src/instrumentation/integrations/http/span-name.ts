import { normalizeRouteTemplate } from "../utils/route-templates";

/**
 * Input used to derive a normalized root HTTP span name.
 */
export interface HttpSpanName {
	/**
	 * HTTP request method.
	 */
	method: string;
	/**
	 * Route template or path pattern associated with the request.
	 */
	template: string;
}

const HTTP_SPAN_NAME_OVERRIDE_CONTEXT_KEY = "http.instrumentation.span_name_override";

/**
 * @internal
 * Converts a method and route template to a span name.
 * @param method - The method to convert.
 * @param template - The route template to convert.
 * @returns The span name.
 */
function toHttpSpanName(method: string, template: string): string {
	const normalizedMethod = method.trim().toUpperCase() || "*";
	return `${normalizedMethod} ${normalizeRouteTemplate(template)}`;
}

/**
 * @internal
 * Writes a request-scoped root HTTP span name override.
 * @param request - The request to write the override to.
 * @param input - The method and route template used for the root span name.
 */
export function writeSpanNameOverride(request: Request, input: HttpSpanName) {
	(request as unknown as Record<string, unknown>)[HTTP_SPAN_NAME_OVERRIDE_CONTEXT_KEY] = {
		method: input.method,
		template: input.template,
	} satisfies HttpSpanName;
}

/**
 * @internal
 * Reads a request-scoped root HTTP span name override.
 * @param request - The request to read the override from.
 * @returns The override when present.
 */
export function readSpanNameOverride(request: Request): HttpSpanName | undefined {
	const rawValue = (request as unknown as Record<string, unknown>)[HTTP_SPAN_NAME_OVERRIDE_CONTEXT_KEY];
	if (!rawValue || typeof rawValue !== "object") return undefined;

	const value = rawValue as Record<string, unknown>;
	const method = value.method;
	const template = value.template;
	if (typeof method !== "string" || method.length === 0) return undefined;
	if (typeof template !== "string" || template.length === 0) return undefined;

	return { method, template };
}

/**
 * @internal
 * Resolves the request root HTTP span name.
 * @param request - The request that may hold an override.
 * @param fallback - The fallback method and template to use when no override exists.
 * @returns The normalized root HTTP span name.
 */
export function resolveSpanName(request: Request, fallback: HttpSpanName): string {
	const spanNameInput = readSpanNameOverride(request) ?? fallback;
	return toHttpSpanName(spanNameInput.method, spanNameInput.template);
}
