# Time

Playback position and duration state for the player store

Tracks playback position and duration.

## API Reference

### State

Property

Type

Details

`currentTime`

`number`

▸

Description

Current playback position in seconds.

`duration`

`number`

▸

Description

Total duration in seconds (0 if unknown).

`seeking`

`boolean`

▸

Description

Whether a seek operation is in progress.

### Actions

Action

Type

Details

`seek`

`(time: number) => Promise<number>`

▸

Description

Seek to a time in seconds. Returns the actual position after seek.

### Selector

Pass `selectTime` to [`usePlayer`](use-player.md) to subscribe to time state. Returns `undefined` if the time feature is not configured.

TimeDisplay.tsx

```
import { selectTime, usePlayer } from '@videojs/react';

function TimeDisplay() {
  const time = usePlayer(selectTime);
  if (!time) return null;

  return (
    <span>
      {Math.floor(time.currentTime)} / {Math.floor(time.duration)}
    </span>
  );
}
```

---

React documentation: ../llms.txt
All documentation: ../_site/llms.txt