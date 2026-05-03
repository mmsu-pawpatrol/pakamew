# Playback

Play/pause state and actions for the player store

Controls play/pause state and tracks whether playback has started or is stalled.

## API Reference

### State

Property

Type

Details

`paused`

`boolean`

▸

Description

Whether playback is paused.

`ended`

`boolean`

▸

Description

Whether playback has reached the end.

`started`

`boolean`

▸

Description

Whether playback has started (played or seeked).

`waiting`

`boolean`

▸

Description

Whether playback is stalled waiting for data.

### Actions

Action

Type

Details

`play`

`() => Promise<void>`

▸

Description

Start playback.

`pause`

`() => void`

▸

Description

Pause playback.

`togglePaused`

`() => boolean`

▸

Description

Toggle play/pause. Returns `true` if playback started.

### Selector

Pass `selectPlayback` to [`usePlayer`](use-player.md) to subscribe to playback state. Returns `undefined` if the playback feature is not configured.

PlayButton.tsx

```
import { selectPlayback, usePlayer } from '@videojs/react';

function PlayButton() {
  const playback = usePlayer(selectPlayback);
  if (!playback) return null;
  return <button onClick={playback.toggle}>{playback.paused ? 'Play' : 'Pause'}</button>;
}
```

---

React documentation: ../llms.txt
All documentation: ../_site/llms.txt