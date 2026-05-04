# Contributing Guidelines

## Technical Workarounds

- Document workaround-specific behavior in `docs/workarounds.md`.
- Keep `README.md` focused on onboarding and day-1 setup.

## Environment Variables

- Always access environment variables through typed env modules and helpers.
- Do not access environment variables directly from `process.env` or `import.meta.env` in app code (except inside env modules).

### Usage

- **App server (Node runtime)**: use `getEnv(...)` from `packages/app-server/src/env` and request only the keys needed by that file.

```ts
import { getEnv } from "./env";

const env = getEnv((shape) => [shape.HOST, shape.PORT]);
```

- **App web server-side config** (for example `packages/app-web/vite.config.ts`): use `getEnv(...)` from `packages/app-web/src/env.server.ts`.

```ts
import { getEnv } from "./src/env.server";

const env = getEnv((shape) => ({ HOST: shape.HOST, PORT: shape.PORT }));
```

- **App web client code**: use the parsed `env` object from `packages/app-web/src/env.ts`.

```ts
import { env } from "../env";

const apiUrl = env.VITE_API_URL;
```

### Adding New Env Variables and Modules

1. Decide whether you are:
   - adding a variable to an existing env module, or
   - introducing a new env module for a new concern/boundary.
2. Pick the correct runtime location:
   - `packages/app-server/src/env/core.ts` for app/runtime config.
   - `packages/app-server/src/env/otel.ts` for OTEL exporter/service identity.
   - `packages/app-server/src/env/observability.ts` for log/metric/tracing switches.
   - `packages/app-web/src/env.ts` for `VITE_*` client vars.
   - `packages/app-web/src/env.server.ts` for web server/dev-server-only vars.
3. For existing modules, add the variable to both the interface and Zod schema, including validation/defaults when appropriate.
4. For a new app-server env module:
   - create `packages/app-server/src/env/<module>.ts` with interface + schema,
   - import and merge it in `packages/app-server/src/env/index.ts` (`Env` interface + `EnvSchema` composition).
5. For a new app-web env module, follow the same pattern used by `env.ts`/`env.server.ts`: typed interface + schema + runtime-specific access helper.
6. Add or update entries in the matching `.env.example` (`packages/app-server/.env.example` or `packages/app-web/.env.example`).
7. Read env values only through `getEnv(...)` (server/runtime code) or `env` (web client code).
8. When env behavior depends on observability presets, update `packages/app-server/src/instrumentation/core/config.ts` and keep collector preset examples aligned.

### Env Selection Rules

- Select one key at a time in `getEnv(...)` and transform each key independently.
- Prefer file-local env slices (`getEnv((shape) => [...])`) rather than importing a global env object.
- For tests, pass a custom source object as the second argument to `getEnv(...)` instead of mutating `process.env`.

## Observability

Backend changes should include observability updates by default.

### Baseline Requirement

- New or changed backend behavior should include:
  - structured logs for lifecycle and error paths,
  - spans for request flow and critical operations,
  - metrics for throughput, latency, and error rate where relevant.
- If a change intentionally omits one of the above, explain why in the PR description.

### Logging Guidelines

- Use structured logs (key-value context) instead of free-form text.
- Log request lifecycle boundaries and external dependency failures.
- Normalize error metadata (for example, `error_code`, `source`, `operation`) to keep queries stable.
- Never log secrets, raw authorization headers, cookies, or sensitive payloads.

### Metrics Guidelines

- Prefer counters for totals, histograms for latency/size, and up-down counters for in-flight state.
- Use bounded attributes only (for example, `route`, `method`, `status_class`, `operation`, `result`).
- Avoid high-cardinality labels (raw IDs, full URLs, query strings, user input).
- Keep metric names and units consistent with existing observability modules.

#### Adding New Metrics and Metrics Modules

1. Decide whether you are:
   - adding an instrument/helper to an existing metrics module, or
   - introducing a new metrics module for a new domain.
2. Pick the closest existing module in `packages/app-server/src/instrumentation/core/metrics`:
   - `http.ts` for HTTP middleware metrics,
   - `orpc.ts` for procedure-level RPC metrics,
   - `prisma.ts` for DB query metrics.
3. If no existing module is a good fit, create `packages/app-server/src/instrumentation/core/metrics/<domain>.ts` and keep the same conventions:
   - instruments defined from shared `meter` in `metrics/core.ts`,
   - typed `record...Metrics(...)` and/or `begin...Metrics(...)` helpers,
   - low-cardinality attributes only.
4. Reuse policy helpers from `metrics/policy.ts` (`addPathAttribute`, `addDbTargetAttribute`, `toStatusClass`) when relevant; add new policy helpers there if needed.
5. Export new helper(s) from `metrics/index.ts`.
6. Call metrics helper(s) at execution boundaries (request middleware, RPC handling, Prisma events, or other domain boundaries).
7. If you start an in-flight metric (`begin...Metrics(...)`), always call the returned cleanup function in `finally`.

Example:

```ts
const endInFlight = beginHttpRequestMetrics(method, route);
try {
	// handle request
} finally {
	endInFlight();
	recordHttpRequestMetrics({
		method,
		route,
		statusCode,
		durationMs,
	});
}
```

### Tracing Guidelines

- Add spans around request handling, DB boundaries, external calls, and expensive operations.
- Add span attributes/events that help debugging without exposing sensitive data.
- Record exceptions and set span error status on failures.
- Prefer manual spans only for business-relevant boundaries not covered by auto instrumentation.

#### Using Tracing

- OpenTelemetry SDK initialization is centralized in `packages/app-server/src/instrumentation/otel.ts` and loaded by `packages/app-server/src/app.ts`.
- Auto instrumentation already covers common libraries (Hono middleware, oRPC, Prisma, pg). Add manual spans only for domain/business boundaries.
- Use `withSpan(...)` from `packages/app-server/src/instrumentation/core/tracer.ts` for most cases. It automatically:
  - runs your handler in span context,
  - records exceptions,
  - marks span status as error,
  - ends the span.
- Set `kind` and stable attributes (`http.method`, `http.route`, `orpc.procedure`, etc.) to keep traces queryable.
- Use `beginSpan(...)` only when you need manual lifecycle control, and always `end()` spans in `finally`.

### Integration Instrumentation Guidelines

- Put framework-specific wiring in `packages/app-server/src/instrumentation/integrations/<domain>`.
- Keep integration modules focused on extracting low-cardinality request/procedure metadata, then call shared helpers from `instrumentation/core` for logs, metrics, and tracing.
- Use request-scoped state for cross-layer handoff (for example, HTTP span-name overrides and oRPC dispatch state), and always clear mutable request state in `finally`.
- Keep integration tests colocated with the integration module (for example, `packages/app-server/src/instrumentation/integrations/<domain>/*.test.ts`).

Example:

```ts
await withSpan("orpc.dispatch", () => orpcHandler.handle(request, context), {
	kind: SpanKind.INTERNAL,
	attributes: {
		"http.method": method,
		"http.route": "/api/*",
		"orpc.procedure": procedure,
	},
});
```

### Presets and Overrides

- Use observability presets (`debug`, `dev`, `test`, `staging`, `prod`) as the default behavior.
- Use per-signal environment overrides only when needed for focused debugging or incident response.
- Keep production collector-side tail sampling enabled so error traces preserve full context.
- Workflow:
  - copy one app preset to `packages/app-server/.env` (or set `OBS_PRESET` manually),
  - use the OpenObserve compose stack for lightweight local telemetry,
  - configure `docker/production/.env` when you need to validate the production Alloy sampling path.

### PR Checklist (Backend)

- Did you add or update logs for new behavior and failures?
- Did you add or update metrics for volume, latency, and errors?
- Did you add or update spans for important execution boundaries?
- Did you verify labels/attributes are low-cardinality and safe?
- Did you verify the effective behavior under the intended observability preset?

## File Naming

- Use `kebab-case` for file names.

## Backend Module Organization

### Route vs Flow vs Data

- Use route-bound oRPC procedures with `.route({ method, path })` for externally reachable backend APIs.
- Keep REST API shape through oRPC route metadata so OpenAPI generation remains accurate.
- Put flow-based modules in domain folders such as `src/routes/(rpc)/donations`.
- Put internal-by-default DB access in `src/routes/(rpc)/data/<semantic-domain>`.
- Group data modules by semantics, not by raw table names.
  - Prefer `data/donations` or `data/dispenser`
  - Avoid scattering raw table helpers across unrelated flow folders
- Only split into a subfolder when that semantic area needs multiple files.
- If a repo or service is one implementation file plus a barrel, hoist it instead of creating a needless folder.

### Naming

- Use `*Repo` for resource-style CRUD access.
- Use `*Service` for multi-step flow orchestration.
- Colocate types with the function, method, or module they directly support.
  - Avoid generic `types.ts` dumping grounds when the types have a single obvious home.
- Prefer resource-shaped client APIs when a domain has multiple operations.
  - Example: `XenditClient.PaymentSession.create()` over a flat verb list.
- Treat callable oRPC functions like regular functions in naming.
- Do not suffix callable names with `Procedure`.
- Localize internal names when they stay inside their home folder.
  - `create`, `update`, `findById` are preferred over `createDonationRecordProcedure`, `updateDonationProcedure`, etc. when they are local to one folder.
- Keep repo methods CRUD-oriented when generic CRUD is enough.
  - Prefer `create`, `findById`, `findFirst`, `update`, `delete`
  - Avoid domain-specific wrappers like `markPaid()` when `update()` is sufficient
- Do not accept generic Prisma `Where` inputs at repo boundaries.
- Prefer explicit object-shaped params with only the filters and pagination fields the repo intentionally supports.
- Nested `where` shapes are acceptable only when they are explicitly defined and directly handled by repo logic.
- Reuse Prisma types selectively for result or payload shapes when that stays clear, but do not expose generic caller-supplied Prisma filter contracts.
- For barrel-exported backend objects, define an interface for the barrel shape so referenced methods remain visible and traceable.

### Control Flow

- Reduce nesting and cyclomatic complexity before adding more abstraction.
- Prefer fewer lines of code for the same behavior when readability stays intact.
  - Fold simple expressions, short object literals, and straightforward returns onto one line when they remain easy to scan.
  - Keep spacing between not-so-related code steps inside a body so the execution phases remain visible.
  - Use more lines only when they improve readability, preserve compatibility, or support a measurable performance reason.
- Hoist wrapped async work into named functions or `const` callbacks when using wrappers such as `withSpan(...)`.
- Keep logger scopes and span names consistent with the domain and operation they represent.
- Prefer lookup maps for straightforward status or copy translation over long branch chains.
- Inline helpers that only wrap a trivial single expression or are used once.
  - Do not create abstractions that do not earn their existence.

### Callable Procedure Preference

- Prefer oRPC callable procedures over plain functions for backend work that performs I/O.
- Reasons:
  - automatic instrumentation
  - typed input/output contracts
  - consistent observability behavior
- Route-bound oRPC procedures are also service methods, but they should not be made callable by default.
  - Keep `.route({ ... })` procedures as procedures so OpenAPI metadata remains visible to Scalar/OpenAPI tooling.
  - When server-side code must invoke a route-bound procedure, create a callable at the call site with `.callable({ context })(input)` or use `call(procedure, input, { context })` from `@orpc/server`.
  - Prefer `.callable({ context })(input)` when the same local caller invokes the procedure repeatedly; prefer `call(...)` for one-off invocation.
- When invoking a callable procedure directly, prefer the callable itself with the second argument for options/context over wrapping it with `call(...)`.
- When the callable does not accept unknown user input, prefer `type<>` input typing instead of introducing unnecessary Zod schemas.
- Always pass required initial context explicitly when creating or invoking server-side oRPC clients/callables.
  - oRPC can compute execution context through middleware, but it does not implicitly capture a parent procedure context for separate direct server-side calls.
  - If nested logic needs the current request context, pass the relevant context slice from the caller.
- Fall back to plain functions only for:
  - pure domain logic with no I/O to trace
  - pure CPU-bound operations. If this is computationally expensive, wrap at the service-layer with `withSpan()`, so instrumentation is opt-in

### Documentation Comments

- Place file-header documentation at the very top of the file, before imports.
- Leave exactly one empty line between the file-header JSDoc and the first import or statement.
- Use JSDoc/TSDoc for documenting APIs, reusable modules, exported items, and
  stable internal boundaries that other files call into.
- Every export must have JSDoc unless it is a pure re-export with documentation preserved at the source symbol.
- Use regular comments for inline implementation notes and logic hotspots.
  JSDoc is not a substitute for ordinary code comments.
- Add regular comments before grouped statements when the group is not self-explanatory from names and local control flow alone.
  - Prefer a short comment that explains the invariant, ordering dependency, or side effect.
  - Do not comment obvious single statements, constructor assignments, or straightforward field copies.
- Keep the first sentence as a brief summary. Put extra operational detail in
  `@remarks` when the extra context helps a caller use the API correctly.
- Collapse a JSDoc block to one line when it has only one sentence and fits under 80 characters.
  - Example: `/** Shared fixed donation tiers for the immediate-feed MVP. */`
  - Do not collapse when `@param`, `@returns`, `@remarks`, or other tags are present.
- `@param` and `@returns` should explain semantics, invariants, side effects,
  lifecycle expectations, and failure-sensitive behavior.
  Do not merely restate the parameter name or TypeScript type in English.
- Callable procedures must document their callable input with `@param`.
  - For object inputs, document the object as `@param input - ...` and document meaningful nested properties as `@param input.<field> - ...`.
  - Route-bound procedures do not need callable-style `@param` documentation unless they are explicitly made callable at a call site.
- Prefer reusable documentation over duplicated documentation, but do not rely on unsupported editor behavior.
  - TypeScript editor hovers support documentation references such as `@see` and `{@link ...}`.
  - TypeScript does not currently treat `@inheritDoc` / `@inheritdoc` as a supported editor-hover inheritance tag.
  - TypeDoc supports `{@inheritDoc SomeSymbol}` for generated API docs. Use it only when generated TypeDoc output is the target.
  - For local wrapper/barrel surfaces, prefer `typeof implementation` member types and a concise `@see` / `{@link ...}` instead of copying the implementation's full JSDoc.
- Document the contract that matters to the consumer:
  what the code is for, when to call it, what it guarantees, and what the
  caller must already have prepared.
- Follow TSDoc/JSDoc-compatible structure so editor hovers and future doc tools
  can parse the comments consistently.
- Put JSDoc immediately before the code it documents.
- Colocate types with the function, method, schema, or module section they support.
  - If a type or schema is shared across the file, place it near the top after imports and module constants.
  - If a type or schema is used once and is small, inline it directly in `.input(...)`, `.output(...)`, or the local signature.
  - If a type is only used in one contiguous implementation section but is too large to inline clearly, keep it immediately before that section.

### CRUD Parameter Shape

- Standardize repo callable params around an object input, even when only one or two fields are needed.
- Use Prisma generated create/update input types for repo `data` payloads when they directly describe the intended CRUD operation.
- Do not use Prisma generated generic filter, `where`, ordering, include, or select input types at repo boundaries.
- Use this as the direction for consistency, not as a requirement to implement every variation up front. Do not treat this as actual real type to be shared:

```ts
type RepoParams<TWhere, TData> = {
	id?: string;
	ids?: string[];
	pagination?: { type: "cursor"; nextCursor?: string } | { type: "offset"; page: number; size: number };
	where?: TWhere;
	data?: TData;
};
```

- Only implement the specific CRUD methods and params the current feature actually needs.
- Do not accept catch-all filtering contracts just to mirror Prisma surface area.
- Keep repo params explicit enough to support validation, access checks, and predictable instrumentation.

### Access Rules

- When using a backend function or callable outside its home folder, prefer access through barrel exports.
- Avoid direct imports from deep implementation files when a folder barrel is available.
- Tree shaking is not a concern for backend code here; optimize for traceability and stable boundaries.
- Treat route-bound oRPC procedures as the service method itself.
  - Do not add pass-through controller wrappers that only call another function with the same input and output.
  - Hoist input and output schemas/types alongside the route-bound procedure that uses them.
  - Do not call `.callable()` on route-bound procedures at export time unless they are intentionally internal-only and excluded from OpenAPI output.
- Name route files by the resource noun that the route exposes, and put the verb in the exported method name. Example:
  - Public donation checkout sessions live at `src/routes/(rpc)/donations/checkout-session.ts`, export `create`, and are accessed server-side as `DonationService.CheckoutSession.create`.
  - Provider webhooks live under `src/routes/(rpc)/webhook/<provider>/<resource>.ts`; prefer an event-ingestion verb such as `receive`.
  - Xendit payment-session webhooks live at `src/routes/(rpc)/webhook/xendit/payment-session.ts`, export `receive`, and are accessed server-side as `WebhookService.Xendit.PaymentSession.receive`.

### oRPC Error Handling

- Follow oRPC OpenAPI error handling conventions for externally reachable route-bound procedures.
- Reference: `https://orpc.dev/docs/openapi/error-handling`
- Throw structured oRPC errors instead of ad hoc response payloads when representing API failures.
- Map predictable backend failures to stable statuses, for example:
  - validation/input issues -> `BAD_REQUEST` / `400`
  - access or state conflicts -> `CONFLICT` / `409`
  - missing resources -> `NOT_FOUND` / `404`
  - upstream provider failures -> `BAD_GATEWAY` / `502`
  - unexpected server failures -> `INTERNAL_SERVER_ERROR` / `500`

### Example

Preferred structure:

```ts
// src/routes/(rpc)/data/donations.ts
export const DonationRepo = {
\tcreate,
\tfindById,
\tfindFirst,
\tupdate,
\tdelete,
};
```

Prefer this:

```ts
import { DonationRepo } from "../../data/donations";
import { DonationService } from "../donations";
import { WebhookService } from "../webhook";

await DonationService.CheckoutSession.create(input);
await WebhookService.Xendit.PaymentSession.receive(input);
```

Over this:

```ts
import { update } from "../../data/donations";
import { createCheckout, webhookPaymentSession } from "./shared/services";
```

Prefer this:

```ts
await DonationRepo.update({
	id: donationId,
	data: { status: "COMPLETED" },
});
```

Over this:

```ts
await DonationRepo.update({
	where: arbitraryPrismaWhereFromCaller,
	data,
});
```

## Schema Naming

- All Zod schema constants must use PascalCase.
- Entity schemas must use PascalCase and end with `Schema`.
- Use the format `<EntityName>Schema` (for example, `UserSchema`, `ProjectMemberSchema`).
- Do not use camelCase entity schema names (for example, avoid `userSchema`).
- Utility schemas are not treated as entity schemas; name them by purpose.

## Prisma Migrations

- Use precise timestamps for Prisma migration directory names.
- Do not create new migrations with coarse timestamps.
