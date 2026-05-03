# Fullscreen

Fullscreen state and actions for the player store

Controls fullscreen mode. Tries the container element first, falls back to the media element.

## API Reference

### State

Property

Type

Details

`fullscreen`

`boolean`

▸

Description

Whether fullscreen mode is currently active.

`fullscreenAvailability`

`'available' | 'unavailable' | 'unsupported'`

▸

Description

Whether fullscreen can be requested on this platform.

### Actions

Action

Type

Details

`requestFullscreen`

`() => Promise<void>`

▸

Description

Enter fullscreen mode. Tries container first, falls back to media element.

`exitFullscreen`

`() => Promise<void>`

▸

Description

Exit fullscreen mode.

`toggleFullscreen`

`() => Promise<void>`

▸

Description

Toggle fullscreen mode.

### Selector

Pass `selectFullscreen` to [`usePlayer`](use-player.md) to subscribe to fullscreen state. Returns `undefined` if the fullscreen feature is not configured.

FullscreenButton.tsx

```
import { selectFullscreen, usePlayer } from '@videojs/react';

function FullscreenButton() {
  const fs = usePlayer(selectFullscreen);
  if (!fs || fs.availability !== 'available') return null;

  return (
    <button onClick={fs.toggle}>
      {fs.active ? 'Exit fullscreen' : 'Fullscreen'}
    </button>
  );
}
```

---

React documentation: ../llms.txt
All documentation: ../_site/llms.txt