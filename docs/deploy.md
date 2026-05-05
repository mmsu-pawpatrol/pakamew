## Docker Compose Deployment

Pakamew ships with a simple Docker Compose production layout under `docker/production/`.

The deployment flow is split into two modes:

- `docker/production/docker-compose.yml`: builds the production-shaped images locally and is the default file for local testing.
- `docker/production/docker-compose.registry.yml`: switches `app-server` and `livestream-node` to the GHCR images published by CI for real deployments.
- `docker/production/docker-compose.cadvisor.yml`: native-Linux-only override that enables cAdvisor-based container metrics for Alloy.

The container build files are grouped in `docker/images/`. This keeps image build inputs separate from runtime stack definitions and makes the distinction between "how we build containers" and "how we run the stack" clearer.

## Prerequisites

1. Create the package runtime env files if you have not already:

```bash
cp packages/app-server/.env.example packages/app-server/.env
cp packages/livestream-node/.env.example packages/livestream-node/.env
```

2. Create the production compose env file:

```bash
cp docker/production/.env.example docker/production/.env
```

3. Review the env files before starting the stack.

Notes:

- `packages/app-server/.env` and `packages/livestream-node/.env` are required by the production compose file.
- The production compose file overrides only the URL values that must change for Docker DNS:
  - `DATABASE_URL`
  - `OTEL_EXPORTER_OTLP_ENDPOINT`
  - `OME_RTMP_URL`
- Other service runtime settings still come from the package-local `.env` files.
- `docker/production/.env` provides both the Grafana Cloud OTLP connection values and the Alloy tail-sampling settings.

Client-facing network contract:

- `app-server` is exposed through Traefik at `https://api.pakamew.site`
- `livestream-node` is exposed through Traefik at `wss://lsg.pakamew.site/viewer` for viewers and `wss://lsg.pakamew.site/esp32-stream` for the shelter camera
- OvenMediaEngine LL-HLS/WebRTC signaling is exposed through Traefik at `https://ls.pakamew.site/app/esp32/master.m3u8`
- Cloudflare should proxy those three hostnames to the same origin server on standard HTTP/HTTPS ports

Ingress behavior:

- `app-server` and `livestream-node` are not published directly from their own containers
- Traefik owns the public `:80` and `:443` ports, matches requests by `Host(...)`, and forwards them to the internal service ports
- OvenMediaEngine LL-HLS/WebRTC signaling is routed through Traefik, while RTMP/SRT/OVT/TURN/ICE remain on their own OME ports because that protocol surface is broader than normal HTTP/WebSocket traffic

How each component uses those endpoints:

- The shelter camera pushes frames to `livestream-node` at `/esp32-stream`
- The web app talks to `app-server` using `VITE_API_URL`
- The web app plays livestream video from OvenMediaEngine using `VITE_LIVESTREAM_PUBLIC_HLS_URL`
- The web app can also use `livestream-node` directly through `VITE_LIVESTREAM_GATEWAY_WS_URL`
- for the current Cloudflare-backed production host, those should be `https://api.pakamew.site`, `https://ls.pakamew.site/app/esp32/master.m3u8`, and `wss://lsg.pakamew.site/viewer`

## Local Testing

The local-production stack uses the fixed project name `pakamew-prod`. That isolates container, network, and volume names from the dev stack, but it is still expected to use the standard published ports, so do not run the dev and prod stacks at the same time on one host unless you intentionally reconfigure the ports.

Start it with:

```bash
docker compose \
  --env-file docker/production/.env \
  -f docker/production/docker-compose.yml \
  up -d
```

What this does:

- builds `app-server` and `livestream-node` locally from the Dockerfiles in `docker/images/`
- starts PostgreSQL, OvenMediaEngine, Traefik, Grafana Alloy, `app-server`, and `livestream-node`
- keeps container, network, and volume names isolated under the `pakamew-prod` project
- forwards Alloy’s unified OTLP pipeline upstream to the configured Grafana endpoint
- applies the configured tail-sampling policy before traces are exported

Useful local endpoints with the default `docker/production/.env.example` values:

- Backend health check through Traefik: `http://127.0.0.1/api/health` with `Host: api.pakamew.site`
- Backend API base URL for the web app: `https://api.pakamew.site`
- Livestream gateway UI through Traefik: `http://127.0.0.1/` with `Host: lsg.pakamew.site`
- Livestream gateway viewer websocket: `wss://lsg.pakamew.site/viewer`
- Livestream gateway shelter websocket: `wss://lsg.pakamew.site/esp32-stream`
- OvenMediaEngine LL-HLS through Traefik: `http://127.0.0.1/app/esp32/master.m3u8` with `Host: ls.pakamew.site`
- OvenMediaEngine LL-HLS: `http://127.0.0.1:3333/app/esp32/master.m3u8`
- Traefik dashboard: `http://127.0.0.1:8080`
- Grafana Alloy UI: `http://127.0.0.1:12345`
- PostgreSQL host port: `127.0.0.1:5432`
- OvenMediaEngine WebRTC signaling port: `127.0.0.1:3333`

Notes for local testing:

- Use `curl -H 'Host: api.pakamew.site' http://127.0.0.1/api/health` as the first backend smoke test.
- The livestream gateway serves its test page through Traefik with `Host: lsg.pakamew.site`.
- Browser viewers connect through `wss://lsg.pakamew.site/viewer` in production.
- The shelter camera connects through `wss://lsg.pakamew.site/esp32-stream` in production.
- The default stack does not enable cAdvisor.
- Docker Desktop’s WSL2 backend should use the default stack only. Grafana’s cAdvisor docs state that Docker Desktop on Windows/macOS runs Docker inside a Linux VM, which prevents direct host monitoring from the Alloy container.
- Enable cAdvisor only on native Linux hosts by adding `docker/production/docker-compose.cadvisor.yml`.

Validate the fully rendered stack before booting:

```bash
docker compose \
  --env-file docker/production/.env \
  -f docker/production/docker-compose.yml \
  config
```

To validate the native-Linux cAdvisor variant:

```bash
docker compose \
  --env-file docker/production/.env \
  -f docker/production/docker-compose.yml \
  -f docker/production/docker-compose.cadvisor.yml \
  config
```

Stop the local-production stack with:

```bash
docker compose \
  --env-file docker/production/.env \
  -f docker/production/docker-compose.yml \
  down
```

If you need to remove volumes as well:

```bash
docker compose \
  --env-file docker/production/.env \
  -f docker/production/docker-compose.yml \
  down -v
```

## CI Container Builds

The GitHub Actions workflow lives at `.github/workflows/containers.yml`.

Behavior:

- Pull requests build both production images with Buildx and BuildKit cache reuse.
- Pull requests do not push images.
- Pushes to `master` build the same images and push them to GHCR.

The published images are:

- `ghcr.io/daawaan4x/pakamew-app-server`
- `ghcr.io/daawaan4x/pakamew-livestream-node`

## Production Host Deployment

For a production host that should use the CI-built images instead of rebuilding locally:

1. Check out the repository on the target host.
2. Create `docker/production/.env`.
3. Set the production-facing values:

- public hostnames for `app-server`, `livestream-node`, and OvenMediaEngine
- public bind IPs and host ports for Traefik's HTTP/HTTPS entrypoints
- real OvenMediaEngine published ports
- real `GRAFANA_CLOUD_OTLP_*` credentials and endpoint
- registry image tags if you want a pinned release instead of `latest`

4. Ensure `packages/app-server/.env` and `packages/livestream-node/.env` exist on the host.
5. If the host is native Linux and you want cAdvisor container metrics, include `docker/production/docker-compose.cadvisor.yml`.
6. Start the registry-backed stack:

```bash
docker compose \
  --env-file docker/production/.env \
  -f docker/production/docker-compose.yml \
  -f docker/production/docker-compose.cadvisor.yml \
  -f docker/production/docker-compose.registry.yml \
  up -d
```

That override file changes `app-server` and `livestream-node` from local-build mode to registry-pull mode by setting:

- the GHCR image references
- `pull_policy: always`

If you want Compose to refresh images first without recreating everything immediately:

```bash
docker compose \
  --env-file docker/production/.env \
  -f docker/production/docker-compose.yml \
  -f docker/production/docker-compose.registry.yml \
  pull
```

Then apply the updated containers:

```bash
docker compose \
  --env-file docker/production/.env \
  -f docker/production/docker-compose.yml \
  -f docker/production/docker-compose.cadvisor.yml \
  -f docker/production/docker-compose.registry.yml \
  up -d
```

If you do not want cAdvisor on the production host, omit `docker/production/docker-compose.cadvisor.yml`.

## Notes

- The `pakamew-prod` project name avoids name collisions with the dev stack, but the default published ports are the standard ones.
- Traefik is the public front door for `app-server`, `livestream-node`, and OvenMediaEngine HTTP/WebSocket traffic on `:80` and `:443`, so Alloy can still observe Traefik access logs and request metrics for those services.
- Traefik and Alloy dashboards stay localhost-only by default.
- Alloy is connected to Docker and Traefik using:
  - `discovery.docker` + `loki.source.docker` for container logs
  - `prometheus.scrape` for Traefik metrics
  - `otelcol.receiver.otlp` for app OTLP telemetry
- Alloy normalizes Docker and Traefik metadata into OTLP resource attributes so Grafana Cloud can group telemetry under stable service names instead of `unknown_service`.
- The optional cAdvisor override adds `prometheus.exporter.cadvisor`, privileged mode, and the native Linux host mounts required for container metrics.
- Alloy applies three tail-sampling policies:
  - keep error traces
  - keep high-latency traces
  - probabilistically sample the rest using `TAIL_SAMPLING_NON_ERROR_PERCENT`
- The current Alloy config forwards all three signal types upstream through `otelcol.exporter.otlphttp`, which matches Grafana’s documented OTLP ingestion path.
- The current deployment assumes Grafana Cloud specifically. `GRAFANA_CLOUD_OTLP_ENDPOINT` must be your Grafana Cloud OTLP gateway URL, and Alloy authenticates with `GRAFANA_CLOUD_OTLP_USERNAME` plus `GRAFANA_CLOUD_OTLP_API_KEY`.
- If auth flows depend on the externally reachable base URL, make sure `packages/app-server/.env` uses the correct `BETTER_AUTH_URL` for the environment you are testing.
