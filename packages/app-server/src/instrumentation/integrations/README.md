# Instrumentation Integrations

This directory contains framework-specific observability wiring for app-server request flow.
Core telemetry primitives live in `../core`.

## Modules

- `http`: Hono OpenTelemetry middleware registration and request root span-name override helpers.
- `better-auth`: maps Better Auth endpoints to normalized HTTP route templates and sets span-name overrides.
- `orpc`: wraps oRPC handler dispatch, captures route metadata, and records HTTP and oRPC metrics.

## Design Rules

- Keep integration code request-scoped and low-cardinality.
- Normalize route templates before writing metrics or span names.
- Store temporary cross-layer state on `Request` only when needed, and clear it in `finally`.
- Delegate metric, log, and tracer primitives to `../core`.
