# Pakamew

## Tech Stack

- 🖥️ **Frontend App:** [React](https://react.dev/) + [TanStack Router](https://tanstack.com/router/latest) power the web SPA and routing.
- 🎨 **Frontend UI:** [Tailwind CSS](https://tailwindcss.com/) + [shadcn/ui](https://ui.shadcn.com/) support component styling and UI primitives.
- 🧠 **Backend Runtime:** [Node.js](https://nodejs.org/) + [Hono](https://hono.dev/) power the server and backend tooling.
- 🛣️ **API Layer:** [oRPC](https://orpc.unnoq.com/) + [OpenAPI](https://www.openapis.org/) + [Scalar](https://scalar.com/) provide typed APIs and interactive API docs.
- 🔐 **Authentication:** [Better Auth](https://www.better-auth.com/) handles sessions, anonymous access, admin flows, and API keys.
- 🗄️ **Database:** [Prisma](https://www.prisma.io/) + [PostgreSQL](https://www.postgresql.org/) power typed data access and relational persistence.
- 📊 **Observability:** [OpenTelemetry](https://opentelemetry.io/) + [OpenObserve](https://openobserve.ai/) + [Grafana LGTM](https://grafana.com/docs/opentelemetry/collector/opentelemetry-collector-lgtm/) cover lightweight and full local observability workflows.
- 📡 **Livestream Node:** [Express](https://expressjs.com/) + [ws](https://github.com/websockets/ws) + [SerialPort](https://serialport.io/) bridge shelter camera streams over network and serial channels.
- 🐾 **Shelter Device:** [esp32-camera](https://github.com/espressif/esp32-camera) + [WiFi (Arduino ESP32)](https://github.com/espressif/arduino-esp32/tree/master/libraries/WiFi) + [Serial (Arduino)](https://docs.arduino.cc/language-reference/en/functions/communication/serial/) run shelter streaming.

Detailed breakdown: [docs/technology.md](./docs/technology.md)

## Development

Environment:

- Preferred Runtime: `NodeJS v24`
- Preferred Package Manager: `pnpm v10`

After cloning the repository, run the following command to initialize the repo.

```bash
# ⚠️ project node_modules ≈ 700 MB disk size
pnpm install
```

Create local environment files for the workspace packages:

```bash
cp ./packages/app-server/.env.example ./packages/app-server/.env
cp ./packages/app-web/.env.example ./packages/app-web/.env
cp ./packages/livestream-node/.env.example ./packages/livestream-node/.env
```

Start dependency services from the `docker/` compose files:

```bash
# Base app infrastructure
docker compose -f docker/docker-compose.app.yml up -d

# E2E livestream workflow
docker compose \
  -f docker/docker-compose.app.yml \
  -f docker/docker-compose.ovenmediaengine.yml \
  up -d

# Lightweight observability workflow
docker compose \
  -f docker/docker-compose.app.yml \
  -f docker/docker-compose.otel-openobserve.yml \
  up -d

# Full local observability workflow
docker compose \
  -f docker/docker-compose.app.yml \
  -f docker/docker-compose.otel-lgtm.yml \
  up -d
```

Generate Prisma client and apply schema changes to the local database:

```bash
cd ./packages/app-server
pnpm exec prisma generate
pnpm exec prisma migrate dev
```

The following is a list of the primary scripts for the project.

```bash
# Global Scripts
pnpm run eslint             # lint with ESLint
pnpm run eslint:fix         # fix lint errors with ESLint
pnpm run prettier           # check formatting with Prettier
pnpm run prettier:write     # format with Prettier
pnpm run tsc:check          # typecheck with Typescript
pnpm run tsgo:check         # typecheck with native Typescript (experimental / faster)
pnpm run test               # run vitest

# Server App
cd ./packages/app-server
pnpm run dev        # start development server
pnpm run build      # bundle server for production
pnpm run preview    # preview server for prod

# Web App
cd ./packages/app-web
pnpm run dev        # start development server
pnpm run build      # build web app
pnpm run preview    # preview web for prod
```

## Devcontainers

The repository ships with workflow-specific devcontainer variants under `.devcontainer/`:

- `app`: base cloud-friendly workspace for frontend and backend work.
- `design`: frontend design-time workspace, no extra container services.
- `livestream`: app workspace plus OvenMediaEngine for E2E livestream work.
- `observability`: app workspace plus OpenObserve.
- `full`: app, livestream, and lightweight observability combined.

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for more information.

## Tooling

This project uses the following tools to enforce consistent coding conventions, formatting, and automated workflows:

### Formatting and Linting

- [Vitest](https://vitest.dev/): Framework for unit and integration testing.
- [Vite](https://vitejs.dev/): HMR dev server and bundler for web applications.
- [Prettier](https://prettier.io/): Enforces consistent code formatting.
- [ESLint](https://eslint.org/): Enforces best practices on coding conventions.
- [Typescript](http://typescriptlang.org/): Provides static typing and checks.
- [CommitLint](https://commitlint.js.org/): Standardizes commit messages based on [Conventional Commits](https://www.conventionalcommits.org/).

### Automation

- [GitHub Actions](https://github.com/features/actions): Automates CI workflows, including formatting, linting, and typechecking.

## Contributors

In alphabetical order:

- [Geila Rigayen](https://github.com/geilala) (**@geilala**)
- [Janille Maeh Benito](https://github.com/LoisDub) (**@LoisDub**)
- [Lois Concepcion](https://github.com/LoisDub) (**@LoisDub**)
- [Theone Eclarin](https://github.com/daawaan4x) (**@daawaan4x**)
