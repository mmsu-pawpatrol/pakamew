# Picture-in-picture

Picture-in-picture state and actions for the player store

Controls picture-in-picture mode.

## API Reference

### State

Property

Type

Details

`pip`

`boolean`

▸

Description

Whether picture-in-picture mode is currently active.

`pipAvailability`

`'available' | 'unavailable' | 'unsupported'`

▸

Description

Whether picture-in-picture can be requested on this platform.

### Actions

Action

Type

Details

`requestPictureInPicture`

`() => Promise<void>`

▸

Description

Enter picture-in-picture mode.

`exitPictureInPicture`

`() => Promise<void>`

▸

Description

Exit picture-in-picture mode.

`togglePictureInPicture`

`() => Promise<void>`

▸

Description

Toggle picture-in-picture mode.

### Selector

Pass `selectPiP` to [`usePlayer`](use-player.md) to subscribe to picture-in-picture state. Returns `undefined` if the PiP feature is not configured.

PiPButton.tsx

```
import { selectPiP, usePlayer } from '@videojs/react';

function PiPButton() {
  const pip = usePlayer(selectPiP);
  if (!pip || pip.availability !== 'available') return null;

  return (
    <button onClick={pip.toggle}>
      {pip.active ? 'Exit PiP' : 'Picture-in-Picture'}
    </button>
  );
}
```

---

React documentation: ../llms.txt
All documentation: ../_site/llms.txt