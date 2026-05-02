# Error

Media error state and actions for the player store

Tracks media errors.

## API Reference

### State

Property

Type

Details

`error`

`null | MediaError`

▸

Description

The current media error, or null if none.

### Actions

Action

Type

Details

`dismissError`

`() => void`

▸

Description

Dismiss the current error by clearing it.

### Selector

Pass `selectError` to [`usePlayer`](use-player.md) to subscribe to error state. Returns `undefined` if the error feature is not configured.

ErrorDisplay.tsx

```
import { selectError, usePlayer } from '@videojs/react';

function ErrorDisplay() {
  const err = usePlayer(selectError);
  if (!err?.error) return null;

  return (
    <div>
      <p>{err.error.message}</p>
      <button onClick={err.dismissError}>Dismiss</button>
    </div>
  );
}
```

---

React documentation: ../llms.txt
All documentation: ../_site/llms.txt