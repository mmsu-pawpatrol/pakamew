# Buffer

Buffered and seekable time range state for the player store

Read-only — tracks buffered and seekable time ranges.

## API Reference

### State

Property

Type

Details

`buffered`

`[number, number][]`

▸

Description

Buffered time ranges as \[start, end\] tuples.

`seekable`

`[number, number][]`

▸

Description

Seekable time ranges as \[start, end\] tuples.

### Selector

Pass `selectBuffer` to [`usePlayer`](use-player.md) to subscribe to buffer state. Returns `undefined` if the buffer feature is not configured.

BufferBar.tsx

```
import { selectBuffer, usePlayer } from '@videojs/react';

function BufferBar() {
  const buffer = usePlayer(selectBuffer);
  if (!buffer) return null;

  return (
    <div style={{ width: `${buffer.percentBuffered * 100}%` }} />
  );
}
```

---

React documentation: ../llms.txt
All documentation: ../_site/llms.txt