# Controls

User activity and controls visibility state for the player store

Read-only — tracks user activity for showing and hiding controls.

## API Reference

### State

Property

Type

Details

`userActive`

`boolean`

▸

Description

Whether the user has recently interacted with the player.

`controlsVisible`

`boolean`

▸

Description

Whether controls should be visible (userActive || paused).

### Actions

Action

Type

Details

`toggleControls`

`() => boolean`

▸

Description

Toggle controls visibility. Returns the new `controlsVisible` value.

### Selector

Pass `selectControls` to [`usePlayer`](use-player.md) to subscribe to controls state. Returns `undefined` if the controls feature is not configured.

ControlsOverlay.tsx

```
import { selectControls, usePlayer } from '@videojs/react';

function ControlsOverlay({ children }: { children: React.ReactNode }) {
  const controls = usePlayer(selectControls);
  if (!controls) return null;

  return (
    <div style={{ opacity: controls.visible ? 1 : 0 }}>
      {children}
    </div>
  );
}
```

---

React documentation: ../llms.txt
All documentation: ../_site/llms.txt