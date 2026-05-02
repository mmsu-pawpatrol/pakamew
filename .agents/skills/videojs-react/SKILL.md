---
name: videojs-react
description: Build, customize, and debug Video.js v10 React players using the local mirrored docs in this folder. Use when working with `@videojs/react`, `createPlayer`, `Player.Provider`, `Player.Container`, Video.js skins, features, presets, controls, sliders, captions, HLS-backed players, or custom player UI in React.
user-invocable: false
---

# Video.js React

Local reference skill for Video.js v10 React player work. This folder contains mirrored markdown docs from the React documentation site, so prefer these local files over remote browsing.

## When to Apply

Use this skill when the task involves:

- Building a player with `@videojs/react`
- Choosing between presets, skins, features, and custom UI
- Wiring `createPlayer`, `Player.Provider`, `Player.Container`, `usePlayer`, or `useMedia`
- Implementing or modifying Video.js controls such as play, mute, captions, fullscreen, PiP, time slider, or volume slider
- Customizing skins, controls layout, render props, or CSS state styling
- Debugging accessibility, fullscreen behavior, activity-driven controls, or media attachment

## Core Model

Video.js React is organized around three layers:

1. State: `createPlayer({ features })` returns a typed player API with `Provider`, `Container`, `usePlayer`, and `useMedia`.
2. UI: Use a packaged skin or compose UI components manually.
3. Media: Use the default media element for a preset or swap in another compatible provider such as HLS.

Start from this mental model before changing code. Most mistakes come from mixing provider/container responsibilities or composing controls without the expected feature set.

## Default Approach

For most tasks:

1. Prefer a preset first.
2. Create one player instance with `createPlayer`.
3. Render exactly one `Player.Provider` per player instance.
4. If using packaged skins, let the skin own the container.
5. If building custom UI, render `Player.Container` yourself and place media plus controls inside it.
6. Use `Player.usePlayer(selector)` for reactive subscriptions and `Player.usePlayer()` for imperative actions.

Default presets to consider first:

- `@videojs/react/video` for general video players
- `@videojs/react/audio` for audio-only players
- `@videojs/react/background` for ambient/background video without standard controls

## Critical Rules

- Do not render player controls outside `Player.Provider`; they need provider context.
- Do not put layout, aspect ratio, borders, or fullscreen expectations on `Player.Provider`; those belong on `Player.Container` or the packaged skin.
- Do not add `Player.Container` inside a packaged skin unless the docs explicitly call for it. Skins already include container behavior.
- When using the `render` prop on Video.js UI components, always spread the provided `props` onto the rendered element so ARIA, handlers, refs, and data attributes remain intact.
- Do not assume features exist. If a button or selector depends on fullscreen, PiP, text tracks, or volume support, verify the matching feature bundle includes that capability.
- Respect feature availability states such as fullscreen/PiP/volume support and hide or degrade unsupported controls instead of forcing them visible.
- Treat accessibility as part of the implementation, not polish. Preserve keyboard behavior, ARIA attributes, captions support, target sizes, contrast, and reduced-motion behavior.
- Video.js v10 is beta. Prefer the local mirrored docs in this folder over memory.

## Workflow

### 1. Identify the player shape

Read the smallest relevant files first:

- Architecture: [concepts/overview.md](./concepts/overview.md)
- Features: [concepts/features.md](./concepts/features.md)
- Presets: [concepts/presets.md](./concepts/presets.md)
- Setup/CSP: [how-to/installation.md](./how-to/installation.md)

Decide whether the task is:

- Preset-based player work
- Custom controls on top of a preset
- Fully custom UI composition
- Skin customization/ejection

### 2. Pick the right assembly pattern

- For standard video or audio playback, start from the matching preset and only customize if the preset is insufficient.
- For custom controls with normal player behavior, keep the preset feature bundle and replace or extend the UI.
- For unusual behavior, build from explicit features and verify each needed state/action exists.
- If the task is mostly visual and close to an existing skin, use the skin as a starting point and read [how-to/customize-skins.md](./how-to/customize-skins.md).

### 3. Read the relevant API pages

Open only the files needed for the task:

- Player factory: [reference/create-player.md](./reference/create-player.md)
- Provider boundary: [reference/player-provider.md](./reference/player-provider.md)
- Container behavior: [reference/player-container.md](./reference/player-container.md)
- Store hooks: [reference/use-player.md](./reference/use-player.md), [reference/use-media.md](./reference/use-media.md), [reference/use-store.md](./reference/use-store.md)
- UI composition model: [concepts/ui-components.md](./concepts/ui-components.md)

For control-specific work, read the matching reference file in `reference/` instead of guessing the API.

### 4. Implement carefully

- Keep custom controls inside `Player.Container` when they should participate in fullscreen and user-activity behavior.
- Put auxiliary UI such as playlists, transcripts, or sidebars inside `Player.Provider` but outside `Player.Container` if they should share state without joining fullscreen.
- Prefer selector-based subscriptions for render-sensitive UI.
- Use the component data attributes and CSS custom properties for styling state changes before reaching for extra React state.

### 5. Validate behavior

Check:

- Media attaches correctly
- The expected features exist in the chosen bundle
- Fullscreen and idle-controls behavior still work
- Keyboard interaction and captions still work
- Unsupported availability states do not expose broken UI

For deeper accessibility work, read [concepts/accessibility.md](./concepts/accessibility.md).

## Reference Map

Use these local files as the reference layer.

### Start here

- [concepts/overview.md](./concepts/overview.md)
- [concepts/features.md](./concepts/features.md)
- [concepts/presets.md](./concepts/presets.md)
- [how-to/installation.md](./how-to/installation.md)

### Composition and customization

- [concepts/ui-components.md](./concepts/ui-components.md)
- [concepts/skins.md](./concepts/skins.md)
- [how-to/customize-skins.md](./how-to/customize-skins.md)
- [concepts/accessibility.md](./concepts/accessibility.md)

### Player foundation

- [reference/create-player.md](./reference/create-player.md)
- [reference/player-provider.md](./reference/player-provider.md)
- [reference/player-container.md](./reference/player-container.md)
- [reference/use-player.md](./reference/use-player.md)
- [reference/use-media.md](./reference/use-media.md)
- [reference/use-store.md](./reference/use-store.md)

### Common controls

- [reference/controls.md](./reference/controls.md)
- [reference/play-button.md](./reference/play-button.md)
- [reference/mute-button.md](./reference/mute-button.md)
- [reference/fullscreen-button.md](./reference/fullscreen-button.md)
- [reference/pip-button.md](./reference/pip-button.md)
- [reference/captions-button.md](./reference/captions-button.md)
- [reference/time-slider.md](./reference/time-slider.md)
- [reference/volume-slider.md](./reference/volume-slider.md)
- [reference/seek-button.md](./reference/seek-button.md)
- [reference/poster.md](./reference/poster.md)
- [reference/thumbnail.md](./reference/thumbnail.md)
- [reference/time.md](./reference/time.md)
- [reference/tooltip.md](./reference/tooltip.md)
- [reference/popover.md](./reference/popover.md)

### Feature slices

- [reference/feature-playback.md](./reference/feature-playback.md)
- [reference/feature-playback-rate.md](./reference/feature-playback-rate.md)
- [reference/feature-volume.md](./reference/feature-volume.md)
- [reference/feature-time.md](./reference/feature-time.md)
- [reference/feature-buffer.md](./reference/feature-buffer.md)
- [reference/feature-source.md](./reference/feature-source.md)
- [reference/feature-controls.md](./reference/feature-controls.md)
- [reference/feature-fullscreen.md](./reference/feature-fullscreen.md)
- [reference/feature-pip.md](./reference/feature-pip.md)
- [reference/feature-text-tracks.md](./reference/feature-text-tracks.md)
- [reference/feature-error.md](./reference/feature-error.md)
- [reference/feature-cast.md](./reference/feature-cast.md)

## Quick Heuristics

- Need a standard player fast: start with the preset docs, then `createPlayer`.
- Need custom UI but standard behavior: keep the preset features, compose custom controls inside `Player.Container`.
- Need styling changes only: read the skin or component reference before adding new state.
- Need custom buttons or sliders: use the component `render` prop and documented data attributes.
- Need to debug missing state/actions: inspect the feature bundle first.
- Need captions/accessibility fixes: open the text tracks feature doc and the accessibility guide together.

## Local Documentation Index

The mirrored documentation lives in this folder:

- Concepts: `concepts/*.md`
- Task guides: `how-to/*.md`
- API reference: `reference/*.md`
- React docs index: [llms.txt](./llms.txt)
- Site-wide docs index: [_site/llms.txt](./_site/llms.txt)

If a task needs a Video.js React API detail, read the exact local markdown page before making assumptions.
