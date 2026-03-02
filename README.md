# Pakamew

## Tech Stack

- 🖥️ **Frontend App:** [React](https://react.dev/) + [TanStack Router](https://tanstack.com/router/latest) power the web SPA & routing.
- 🎨 **Frontend UI:** [Tailwind CSS](https://tailwindcss.com/) + [shadcn/ui](https://ui.shadcn.com/) + support component styling and UI primitives.
- 🧠 **Backend Runtime:** [Node.js](https://nodejs.org/) + [Hono](https://hono.dev/) powers the server and backend tooling.
- 🛣️ **API Layer:** [oRPC](https://orpc.unnoq.com/) + [OpenAPI](https://www.openapis.org/) + [Scalar](https://scalar.com/) provide typed APIs and interactive API docs.
- 🔐 **Authentication:** [Better Auth](https://www.better-auth.com/) handles sessions, anonymous access, admin flows, and API keys.
- 🗄️ **Database:** [Prisma](https://www.prisma.io/) + [PostgreSQL](https://www.postgresql.org/) power typed data access and relational persistence.
- 📊 **Observability:** [OpenTelemetry](https://opentelemetry.io/) + [Grafana](https://grafana.com/) + [Loki](https://grafana.com/oss/loki/) + [Tempo](https://grafana.com/oss/tempo/) + [Prometheus](https://prometheus.io/) cover traces, logs, metrics, and dashboards.
- 📡 **Livestream Node:** [Express](https://expressjs.com/) + [ws](https://github.com/websockets/ws) + [SerialPort](https://serialport.io/) bridge shelter camera streams over network and serial channels.
- 🐾 **Shelter Device:** [esp32-camera](https://github.com/espressif/esp32-camera) + [WiFi (Arduino ESP32)](https://github.com/espressif/arduino-esp32/tree/master/libraries/WiFi) + [Serial (Arduino)](https://docs.arduino.cc/language-reference/en/functions/communication/serial/) run shelter streaming

Detailed breakdown: [docs/technology-stack.md](./docs/technology-stack.md)

## Development

Environment:

- Preferred Runtime: `NodeJS v22`
- Preferred Package Manager: `pnpm v10`

After cloning the repository, run the following commands to initialize the repo.

```bash
# ⚠️ project node_modules ≈ 700 MB disk size
pnpm install        # install project dependencies and prepares git hooks
```

Create local environment files for both apps:

```bash
cp ./server/.env.example ./server/.env
cp ./web/.env.example ./web/.env
```

Start external dependency services with docker-compose:

```bash
# ℹ️ Grafana LGTM for Observability during dev is OPTIONAL
# ⚠️ See download/disk sizes
docker compose up -d postgres   # postgres:17.4 ≈ 100 MB download size / 400 MB disk size
docker compose up -d lgtm       # grafana/otel-lgtm:0.19.1 ≈ 600 MB download size / 2.0 GB disk size
```

Generate Prisma client and apply schema changes to the local database:

```bash
cd ./server
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
cd ./server
pnpm run dev        # start development server
pnpm run build      # bundle server for production
pnpm run preview    # preview server for prod

# Web App
cd ./web
pnpm run dev        # start development server
pnpm run build      # build web app
pnpm run preview    # preview web for prod
```

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for more information

## Tooling

This project uses the following tools to enforce consistent coding conventions, formatting, and automated workflows:

### Formatting & Linting

- [Vitest](https://vitest.dev/): Framework for unit and integration testing.
- [Vite](https://vitejs.dev/): HMR-dev server and bundler for web applications.
- [Prettier](https://prettier.io/): Enforces consistent code formatting.
- [ESLint](https://eslint.org/): Enforces best practices on coding conventions.
- [Typescript](http://typescriptlang.org/): Provides static typing and checks.
- [CommitLint](https://commitlint.js.org/): Standardizes commit messages based on [Conventional Commits](https://www.conventionalcommits.org/).

### Automation

- [Github Actions](https://github.com/features/actions): Automates CI workflows, including formatting, linting, & typechecking.

## Contributors

In alphabetical order:

- [Geila Rigayen](https://github.com/geilala) (**@geilala**)
- [Janille Maeh Benito](https://github.com/LoisDub) (**@LoisDub**)
- [Lois Concepcion](https://github.com/LoisDub) (**@LoisDub**)
- [Theone Eclarin](https://github.com/daawaan4x) (**@daawaan4x**)
