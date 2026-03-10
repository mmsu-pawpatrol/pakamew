import { config } from "../config";
import { OBS_METRICS_DETAIL_LEVEL_WEIGHTS } from "../enums";
import { addAttribute, type MetricAttributes } from "./core";

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/**
 * Normalize a path segment by replacing common patterns with placeholders in order to reduce cardinality.
 *
 * @param segment - The path segment to normalize.
 * @returns The normalized path segment.
 */
function normalizePathSegment(segment: string): string {
	if (!segment || segment === "*" || segment.startsWith(":")) return segment;
	if (/^\d+$/.test(segment)) return ":id";
	if (UUID_PATTERN.test(segment)) return ":uuid";
	if (/^[0-9a-f]{24}$/i.test(segment)) return ":oid";
	if (/^[0-9a-f]{16,}$/i.test(segment)) return ":hex";
	if (/^[A-Za-z0-9_-]{20,}$/.test(segment)) return ":token";
	if (/^[^/]+@[^/]+\.[^/]+$/.test(segment)) return ":email";
	return segment;
}

/**
 * Sanitize a path value by removing query parameters and normalizing path segments in order to reduce cardinality.
 *
 * @param pathValue - The path value to sanitize.
 * @returns The sanitized path value.
 */
export function sanitizePathValue(pathValue: string): string {
	const valueWithoutQuery = pathValue.split(/[?#]/, 1)[0] ?? pathValue;
	const normalizedValue = valueWithoutQuery
		.split("/")
		.map((segment) => normalizePathSegment(segment.trim()))
		.join("/");

	if (!normalizedValue) return "/";
	return normalizedValue.startsWith("/") ? normalizedValue : `/${normalizedValue}`;
}

/**
 * Sanitize a database target by replacing common patterns with placeholders in order to reduce cardinality.
 *
 * @param target - The database target to sanitize.
 * @returns The sanitized database target.
 */
export function sanitizeDbTarget(target: string): string {
	return target
		.replace(/[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}/gi, ":uuid")
		.replace(/\b\d+\b/g, ":id")
		.replace(/[A-Za-z0-9_-]{24,}/g, ":token");
}

/**
 * Convert a status code to a status class in order to reduce cardinality
 *
 * @param statusCode - The status code to convert.
 * @returns The status class.
 */
export function toStatusClass(statusCode: number): string {
	if (!Number.isFinite(statusCode) || statusCode < 100) return "unknown";
	return `${Math.floor(statusCode / 100)}xx`;
}

export function addPathAttribute(attributes: MetricAttributes, key: string, pathValue: string | undefined): void {
	if (!pathValue) return;
	const a = OBS_METRICS_DETAIL_LEVEL_WEIGHTS[config.OBS_METRICS_DETAIL_LEVEL];
	const b = OBS_METRICS_DETAIL_LEVEL_WEIGHTS.medium;
	if (a < b) return;

	addAttribute(attributes, key, sanitizePathValue(pathValue));
}

export function addDbTargetAttribute(attributes: MetricAttributes, target: string | undefined): void {
	if (!target) return;
	const a = OBS_METRICS_DETAIL_LEVEL_WEIGHTS[config.OBS_METRICS_DETAIL_LEVEL];
	const b = OBS_METRICS_DETAIL_LEVEL_WEIGHTS.high;
	if (a < b) return;

	addAttribute(attributes, "db.target", sanitizeDbTarget(target));
}
