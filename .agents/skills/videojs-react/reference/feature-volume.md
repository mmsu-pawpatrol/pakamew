# Volume

Volume level and mute state for the player store

Controls volume level and mute state.

## API Reference

### State

Property

Type

Details

`volume`

`number`

▸

Description

Volume level from 0 (silent) to 1 (max).

`muted`

`boolean`

▸

Description

Whether audio is muted.

`volumeAvailability`

`'available' | 'unavailable' | 'unsupported'`

▸

Description

Whether volume can be programmatically set on this platform.

### Actions

Action

Type

Details

`setVolume`

`(volume: number) => number`

▸

Description

Set volume (clamped 0-1). Returns the clamped value.

`toggleMuted`

`() => boolean`

▸

Description

Toggle mute state. Returns the new muted value.

### Selector

Pass `selectVolume` to [`usePlayer`](use-player.md) to subscribe to volume state. Returns `undefined` if the volume feature is not configured.

VolumeSlider.tsx

```
import { selectVolume, usePlayer } from '@videojs/react';

function VolumeSlider() {
  const vol = usePlayer(selectVolume);
  if (!vol) return null;

  return (
    <input
      type="range"
      min={0}
      max={1}
      step={0.01}
      value={vol.volume}
      onChange={(e) => vol.setVolume(Number(e.target.value))}
    />
  );
}
```

---

React documentation: ../llms.txt
All documentation: ../_site/llms.txt