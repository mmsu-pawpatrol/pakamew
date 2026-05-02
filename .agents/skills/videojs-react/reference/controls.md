# Controls

Container component for composing and auto-hiding video player controls on user interaction

## Anatomy

Import the component and assemble its parts:

tsx

```
<Controls.Root>
  <Controls.Group />
</Controls.Root>
```

## Behavior

If the user is active, or if the video is paused, this component will show controls. Otherwise, it will hide them after a short delay.

User activity is tracked via pointer movement, keyboard input, and focus events on the player container. On touch devices, a quick tap toggles visibility. `mouseleave` immediately sets the user as inactive.

## Styling

By default, controls have the following styles:

React renders `<div>` elements. Add a `className` to style them:

css

```
/* Click-through: clicks pass through controls to video beneath */
.controls {
  pointer-events: none;
}

.controls-group {
  pointer-events: auto;
}

/* Fade transition */
.controls {
  transition: opacity 0.25s;
}

.controls:not([data-visible]) {
  opacity: 0;
}
```

## Accessibility

No ARIA role is applied to `Controls.Root` — it is a layout wrapper, not a landmark. `Controls.Group` automatically receives `role="group"` when an `aria-label` or `aria-labelledby` attribute is provided; otherwise no role is assigned.

## Examples

### Basic Usage

Play0:00

App.tsx

App.css

```
import { Controls, createPlayer, PlayButton, Time } from '@videojs/react';
import { Video, videoFeatures } from '@videojs/react/video';

const Player = createPlayer({ features: videoFeatures });

export default function BasicUsage() {
  return (
    <Player.Provider>
      <Player.Container className="media-container">
        <Video
          src="https://stream.mux.com/BV3YZtogl89mg9VcNBhhnHm02Y34zI1nlMuMQfAbl3dM/highest.mp4"
          autoPlay
          muted
          playsInline
          loop
        />

        <Controls.Root className="media-controls">
          <Controls.Group className="controls-group" aria-label="Playback controls">
            <PlayButton
              className="button"
              render={(props, state) => <button {...props}>{state.paused ? 'Play' : 'Pause'}</button>}
            />

            <Time.Value type="current" className="time" />
          </Controls.Group>
        </Controls.Root>
      </Player.Container>
    </Player.Provider>
  );
}
```
```
.media-container {
  position: relative;
}

.media-container video {
  width: 100%;
}

.media-controls {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: flex-end;
  padding: 12px;
  pointer-events: none;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.45), transparent 45%);
  transition: opacity 0.25s;
}

.media-controls:not([data-visible]) {
  opacity: 0;
}

.controls-group {
  pointer-events: auto;
}

.time {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding-block: 8px;
  padding-inline: 16px;
  border-radius: 9999px;
  background: rgba(255, 255, 255, 0.75);
  backdrop-filter: blur(10px);
  color: black;
  border: 1px solid rgba(255, 255, 255, 0.25);
  font-size: 14px;
}

.controls-group {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
}

.button {
  padding-block: 8px;
  background: rgba(255, 255, 255, 0.75);
  backdrop-filter: blur(10px);
  color: black;
  border: 1px solid rgba(255, 255, 255, 0.25);
  border-radius: 9999px;
  padding-inline: 16px;
  font-size: 14px;
  cursor: pointer;
}
```

## API Reference

### 

Root

Root container for player controls state and rendered control content.

#### State

State is accessible via the `render`, `className`, and `style` props.

Property

Type

Details

`visible`

`boolean`

`userActive`

`boolean`

#### Data attributes

Attribute

Type

Details

`data-visible`

▸

Description

Present when controls are visible.

`data-user-active`

▸

Description

Present when the user has recently interacted.

### 

Group

Layout group for related controls; sets `role="group"` when labeled.

#### Data attributes

Attribute

Type

Details

`data-visible`

▸

Description

Present when controls are visible.

`data-user-active`

▸

Description

Present when the user has recently interacted.

---

React documentation: ../llms.txt
All documentation: ../_site/llms.txt