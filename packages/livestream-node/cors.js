const DEFAULT_ALLOWED_ORIGINS = ["http://127.0.0.1:5173", "http://localhost:5173"];

function normalizeOrigin(value) {
	const url = new URL(value.trim());

	if (url.protocol !== "http:" && url.protocol !== "https:") {
		throw new Error(`Allowed origins must use http or https: ${value}`);
	}

	return url.origin;
}

function parseAllowedOrigins(value) {
	const entries = typeof value === "string" && value.trim().length > 0 ? value.split(",") : DEFAULT_ALLOWED_ORIGINS;

	return new Set(
		entries
			.map((entry) => entry.trim())
			.filter((entry) => entry.length > 0)
			.map((entry) => normalizeOrigin(entry)),
	);
}

function getAllowedOrigin(origin, allowedOrigins) {
	if (typeof origin !== "string" || origin.trim().length === 0) {
		return null;
	}

	try {
		const normalizedOrigin = normalizeOrigin(origin);

		return allowedOrigins.has(normalizedOrigin) ? normalizedOrigin : null;
	} catch {
		return null;
	}
}

function appendVaryHeader(res, value) {
	const currentValue = res.getHeader("Vary");

	if (typeof currentValue !== "string" || currentValue.length === 0) {
		res.setHeader("Vary", value);
		return;
	}

	const values = currentValue
		.split(",")
		.map((entry) => entry.trim())
		.filter((entry) => entry.length > 0);

	if (!values.includes(value)) {
		values.push(value);
		res.setHeader("Vary", values.join(", "));
	}
}

function createCorsMiddleware(allowedOrigins) {
	return (req, res, next) => {
		const allowedOrigin = getAllowedOrigin(req.headers.origin, allowedOrigins);

		if (allowedOrigin) {
			res.setHeader("Access-Control-Allow-Origin", allowedOrigin);
			res.setHeader("Access-Control-Allow-Methods", "GET,HEAD,OPTIONS");
			appendVaryHeader(res, "Origin");

			const requestHeaders = req.headers["access-control-request-headers"];

			if (typeof requestHeaders === "string" && requestHeaders.length > 0) {
				res.setHeader("Access-Control-Allow-Headers", requestHeaders);
				appendVaryHeader(res, "Access-Control-Request-Headers");
			}
		}

		if (req.method === "OPTIONS") {
			res.sendStatus(allowedOrigin ? 204 : 403);
			return;
		}

		next();
	};
}

function verifyWebSocketOrigin(info, allowedOrigins, protectedPathnames = null) {
	if (Array.isArray(protectedPathnames)) {
		const pathname = new URL(info.req.url ?? "/", "http://localhost").pathname;

		if (!protectedPathnames.includes(pathname)) {
			return true;
		}
	}

	return getAllowedOrigin(info.origin || info.req.headers.origin, allowedOrigins) !== null;
}

module.exports = {
	createCorsMiddleware,
	parseAllowedOrigins,
	verifyWebSocketOrigin,
};
