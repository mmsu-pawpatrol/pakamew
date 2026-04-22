# Playback rate

Playback speed state and actions for the player store

Controls speed of playback.

## API Reference

### State

Property

Type

Details

`playbackRates`

`readonly number[]`

▸

Description

Available playback rates.

`playbackRate`

`number`

▸

Description

Current playback rate.

### Actions

Action

Type

Details

`setPlaybackRate`

`(rate: number) => void`

▸

Description

Set the playback rate.

### Selector

Pass `selectPlaybackRate` to [`usePlayer`](use-player.md) to subscribe to playback rate state. Returns `undefined` if the playback rate feature is not configured.

RateDisplay.tsx

```
import { selectPlaybackRate, usePlayer } from '@videojs/react';

function RateDisplay() {
  const rate = usePlayer(selectPlaybackRate);
  if (!rate) return null;

  return <span>{rate.playbackRate}x</span>;
}
```

---

React documentation: ../llms.txt
All documentation: ../_site/llms.txt