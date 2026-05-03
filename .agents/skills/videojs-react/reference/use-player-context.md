# usePlayerContext

Hook to access the full player context including store, media element, and media setter

`usePlayerContext` returns the full `PlayerContextValue` object, which includes the store, the current media element, and the media setter.

DebugPanel.tsx

```
import { usePlayerContext } from "@videojs/react";

function DebugPanel() {
  const { store, media, setMedia } = usePlayerContext();

  return (
    <pre>
      {JSON.stringify(
        {
          hasStore: !!store,
          hasMedia: !!media,
          tagName: media?.tagName,
        },
        null,
        2,
      )}
    </pre>
  );
}
```

Throws an error if called outside a Player `Provider`.

### Prefer higher-level hooks

For most use cases, use the focused hooks instead:

Need

Hook

Store access with selector

[`usePlayer`](use-player.md)

Current media element

[`useMedia`](use-media.md)

Attach custom media

[`useMediaAttach`](use-media-attach.md)

These hooks read from the same context internally. `usePlayerContext` exposes the raw context value — use it when you need multiple context fields in one call or when building a custom abstraction over the player context.

## API Reference

### Return Value

Property

Type

Details

`store`

`BaseStore & UnknownState`

`media`

`Media | null`

`setMedia`

`Dispatch<SetStateAction<Media | null>>`

`container`

`MediaContainer | null`

`setContainer`

`Dispatch<SetStateAction<HTMLElement |...`

▸

Type

`Dispatch<SetStateAction<HTMLElement | null>>`

---

React documentation: ../llms.txt
All documentation: ../_site/llms.txt