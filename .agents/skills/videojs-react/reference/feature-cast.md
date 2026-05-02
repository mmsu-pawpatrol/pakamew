# Cast

Cast state and actions for the player store

Controls casting to remote playback devices (e.g. Chromecast). Exits fullscreen before initiating a cast session.

## API Reference

### State

Property

Type

Details

`castState`

`'disconnected' | 'connecting' | 'connected'`

▸

Description

Current cast connection state.

`castAvailability`

`'available' | 'unavailable' | 'unsupported'`

▸

Description

Whether casting can be requested on this platform.

### Actions

Action

Type

Details

`toggleCast`

`() => Promise<void>`

▸

Description

Toggle cast connection.

### Selector

Pass `selectCast` to [`usePlayer`](use-player.md) to subscribe to cast state. Returns `undefined` if the cast feature is not configured.

CastButton.tsx

```
import { selectCast, usePlayer } from '@videojs/react';

function CastButton() {
  const cast = usePlayer(selectCast);
  if (!cast || cast.castAvailability !== 'available') return null;

  return (
    <button onClick={cast.toggleCast}>
      {cast.castState === 'connected' ? 'Disconnect' : 'Cast'}
    </button>
  );
}
```

---

React documentation: ../llms.txt
All documentation: ../_site/llms.txt