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

Condition-based skill inclusion (mandatory when condition matches):

- `shadcn` - Include this skill whenever constructing, implementing, or modifying any UI (components, pages, layouts, styling, states), and whenever the task touches shadcn/ui, `components.json`, registries, presets, or shadcn component composition. Treat this as required for UI implementation work.
- `frontend-design` - Include this skill when the task focuses on aesthetic/styling work for visual pages or components, including landing pages, marketing sections, visual polish, branding treatment, or beautifying UI.
- `interface-design` - Include this skill when the task focuses on product/app interface styling and UX patterns, including dashboards, admin panels, SaaS screens, tools, workflows, and data-dense application surfaces. Do not use this as the primary design skill for marketing/landing aesthetics.

Frontend workflow expectation:

1. Load the always-include skills first.
2. Apply condition-based routing and include every skill whose condition matches.
3. For UI implementation tasks, always include `shadcn` in addition to any matching design skill(s).
4. If a task spans both visual marketing aesthetics and app-interface concerns, include both `frontend-design` and `interface-design`.
