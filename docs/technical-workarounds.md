# Technical Workarounds

This document centralizes temporary or implementation-specific workarounds used in the codebase.

## [2026/03/01] Vite config loader fails for shared TS source imports

### Context

`@pakamew/shared` is consumed as TypeScript source (no build step), and its internal imports intentionally use extensionless relative specifiers (for example, `./resolver`).

### Symptom

Server `dev`/`build` can fail while loading `packages/app-server/vite.config.ts` with errors similar to:

- `Cannot find module .../packages/app-shared/utils/get-env/resolver`
- `failed to load config from packages/app-server/vite.config.ts`

### Root Cause

When Vite config is evaluated through Node's native ESM loader path, extensionless TypeScript relative imports in workspace-linked source packages may fail resolution.

### Current Workaround

Use Vite's runner config loader in `packages/app-server/package.json`:

- `dev`: `vite --configLoader runner`
- `build`: `vite build --configLoader runner`

### Impact

- Keeps `@pakamew/shared` import style consistent (no explicit `.ts` required internally).
- Avoids introducing a dedicated build step for `@pakamew/shared`.

### Revisit Conditions

Re-evaluate this workaround if:

- Vite/Node resolver behavior changes to reliably support this pattern, or
- the project adopts a different shared package distribution strategy (for example, prebuilt JS artifacts).

## [2026/03/01] createGetEnv overload ambiguity without explicit schema generic

### Context

`createGetEnv` supports a doc-aware overload that allows preserving field JSDoc from a source interface on selected env slices.

### Symptom

Calling `createGetEnv<Env>(EnvSchema)` can fail with a type error saying `Env` does not satisfy the schema constraint.

### Root Cause

`createGetEnv` has two schema-bound overloads:

- one where the first generic is `EnvDocShape`, and
- one where the first generic is `Schema`.

When only one generic argument is supplied, TypeScript can match it to the schema-only overload and interpret `Env` as `Schema`.

### Current Workaround

When passing a doc shape explicitly, also pass the schema generic explicitly:

- `createGetEnv<Env, typeof EnvSchema>(EnvSchema)`

This forces TypeScript to select the doc-aware overload.

### Impact

- Preserves field-level JSDoc from env interfaces on `getEnv(...)` outputs.
- Keeps existing runtime behavior unchanged (type-only workaround).

### Revisit Conditions

Re-evaluate this workaround if:

- the `createGetEnv` API is redesigned to avoid ambiguous generic positions, or
- newer TypeScript versions improve overload/generic inference in this pattern.

## [2026/03/01] OTel logs in ESM not working via "@opentelemetry/instrumentation-pino"

### Context

`@pakamew/server` runs as ESM (`"type": "module"`) and initializes OpenTelemetry through `packages/app-server/src/lib/instrumentation/otel.ts`.

### Symptom

- App logs are visible in stdout but missing in Loki/Grafana.
- Collector accepts manual OTLP log payloads, but not app-generated logs.

### Root Cause

`@opentelemetry/instrumentation-pino` log sending/correlation in ESM can be sensitive to import path, module loader behavior, and patch timing. In this runtime path (`vite --configLoader runner` + ESM), pino logs were not reliably bridged to the OpenTelemetry Logs SDK.

Related upstream references:

- <https://github.com/open-telemetry/opentelemetry-js-contrib/issues/1587>
- <https://github.com/open-telemetry/opentelemetry-js/issues/4553>
- <https://github.com/pinojs/pino-opentelemetry-transport/issues/172>
- <https://raw.githubusercontent.com/open-telemetry/opentelemetry-js/main/doc/esm-support.md>

### Current Workaround

- Send logs directly via `pino-opentelemetry-transport` in `packages/app-server/src/lib/instrumentation/logger/core.ts`.
- Keep pretty logs in dev by using pino transport targets:
  - `pino-pretty` for console readability,
  - `pino-opentelemetry-transport` for OTLP logs export.
- Configure OTLP logs URL explicitly from `OTEL_EXPORTER_OTLP_ENDPOINT` as `<endpoint>/v1/logs`.
- Do not use NodeSDK log pipeline in app runtime path:
  - removed `OTLPLogExporter`,
  - removed `BatchLogRecordProcessor(logExporter)`,
  - removed `PinoInstrumentation` from `NodeSDK` instrumentations.

### Impact

- Restores log export in current ESM runtime path.
- Keeps structured stdout logs unchanged for local debugging.
- Avoids duplicate log export paths (NodeSDK log exporter + pino transport).

### Revisit Conditions

Re-evaluate this workaround if:

- OpenTelemetry instrumentation behavior in ESM becomes stable for this runtime and import path, and
- we can verify `@opentelemetry/instrumentation-pino` consistently exports app logs in dev/build/prod entrypoints.

## [2026/03/02] app-web Vite config fails with "\_\_dirname is not defined"

### Context

`@pakamew/web` runs Vite using `--configLoader runner`, which evaluates `packages/app-web/vite.config.ts` through an ESM execution path.

### Symptom

Running `pnpm dev` in `packages/app-web` fails before server startup with errors similar to:

- `failed to load config from packages/app-web/vite.config.ts`
- `ReferenceError: __dirname is not defined`

### Root Cause

In ESM, `__dirname` is not a built-in global. `packages/app-web/vite.config.ts` used `path.resolve(__dirname, "./src")` for alias resolution, which throws when config is loaded via the ESM runner path.

### Current Workaround

Use an ESM-safe dirname derivation in `packages/app-web/vite.config.ts`:

- import `fileURLToPath` from `node:url`
- derive `__dirname` from `import.meta.url`
- keep alias resolution based on that derived directory

Example pattern:

```ts
import { fileURLToPath } from "node:url";
import path from "path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
```

Temporary fallback (if unblocking is urgent): remove `--configLoader runner` from web scripts and run plain `vite` until config is ESM-safe.

### Impact

- Restores `pnpm dev` startup for `@pakamew/web` with current router migration setup.
- Preserves `--configLoader runner` behavior used elsewhere in the workspace.

### Revisit Conditions

Re-evaluate this workaround if:

- Vite/Node config loading behavior changes such that `__dirname` usage is normalized in this path, or
- the project migrates to a different config style that no longer depends on dirname-based aliasing.
