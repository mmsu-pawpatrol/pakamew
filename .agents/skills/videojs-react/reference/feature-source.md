# Source

Media source state and actions for the player store

Tracks the current media source and readiness.

## API Reference

### State

Property

Type

Details

`source`

`null | string`

▸

Description

Current media source URL (null if none).

`canPlay`

`boolean`

▸

Description

Whether enough data is loaded to begin playback.

### Actions

Action

Type

Details

`loadSource`

`(src: string) => string`

▸

Description

Load a new media source. Returns the new source URL.

### Selector

Pass `selectSource` to [`usePlayer`](use-player.md) to subscribe to source state. Returns `undefined` if the source feature is not configured.

SourceInfo.tsx

```
import { selectSource, usePlayer } from '@videojs/react';

function SourceInfo() {
  const source = usePlayer(selectSource);
  if (!source) return null;

  return <span>{source.src}</span>;
}
```

---

React documentation: ../llms.txt
All documentation: ../_site/llms.txt