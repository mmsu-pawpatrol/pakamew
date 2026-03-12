# Agent Instructions

## Tooling

Prefer native tooling only if it exists, including but not limited to:

- `pnpm tsgo:check` over `pnpm tsc:check`

Always run codebase-wide typechecking and file-scoped linting (`pnpm eslint`) after every set of changes made and resolve any errors encountered.

- Typechecking needs to be codebase-wide to prevent type conflict side-effects in untouched parts of the codebase.
- Linting can be file-scoped and does not need to be codebase-wide (preferred for shorter lint checks)

## Contributing

Follow `CONTRIBUTING.md` when writing or editing code.

## Skills

For frontend-related tasks (UI, UX, styling, layouts, components, pages, accessibility, or frontend architecture), load relevant skills from `.agents/skills` before proceeding.

### Frontend Skill Routing

Skills marked with (!) are crucial to development and must always be included for any frontend task that involves analyzing/modifying code.

- (!) `vercel-react-best-practices` - Use this skill when writing, reviewing, or refactoring React/Next.js code to enforce performance best practices.
- (!) `web-design-guidelines` - Use this skill when reviewing UI quality, accessibility, and UX against web interface best practices.
- (!) `vercel-composition-patterns` - Use this skill when component APIs are getting complex (boolean prop proliferation, compound components, context architecture).
- `shadcn` - Use this skill when constructing any UI or the task touches shadcn/ui components, registries, presets, or projects with `components.json`.
- `frontend-design` - Use this skill when building or styling web pages/components, marketing pages, visual artifacts, or beautifying UI.
- `interface-design` - Use this skill when building product interfaces such as dashboards, admin panels, SaaS tools, and app flows (not marketing pages).

Frontend workflow expectation:

1. Load the always-include skills first.
2. Add all task-specific frontend skills that apply.
3. If multiple frontend skills apply, use all of them (do not pick only one).
