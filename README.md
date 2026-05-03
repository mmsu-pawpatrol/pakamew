<h1 align="center">
  Pakamew
</h1>

<table align="center">
  <tr>
    <td width="480" align="center">
      <img width="480" alt="Mr. Fresh" src="./packages/app-web/public/mr-fresh.jpg" /><br>
      <sub> <i> Mr. Fresh, the orange "side-eye cat" popularized by Hello-Street-Cat feeder livestream clips, went viral for staring down the camera until fresh food dropped. </i> </sub>
    </td>
  </tr>
</table>

## Pitch

People on campus often want to help stray animals, but the support system is usually fragmented. Feeding depends on whoever is available, donations can be hard to coordinate, and supporters rarely directy see what happens after giving.

Pakamew turns individual effort into a campus-wide platform for animal welfare transparency. It combines donations, livestream access, connected feeders, and admin tools for oversight in one system. Supporters can contribute with clear expectations on where donations go. Organizers get the infrastructure to operate their program. The result is a more organized, accountable, and sustainable way to care for campus strays.

## Development

View [docs/technology.md](./docs/technology.md) for a detailed breakdown of the individual components of the system.

Environment:

- Preferred Runtime: `NodeJS v24`
- Preferred Package Manager: `pnpm v10`

After cloning the repository, run the following command to initialize the repo.

```bash
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

# E2E livestream
docker compose \
  -f docker/docker-compose.app.yml \
  -f docker/docker-compose.ovenmediaengine.yml \
  up -d

# Lightweight observability
docker compose \
  -f docker/docker-compose.app.yml \
  -f docker/docker-compose.otel-openobserve.yml \
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
