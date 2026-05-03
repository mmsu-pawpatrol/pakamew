# useSelector

Low-level hook for subscribing to derived state with customizable equality checks

`useSelector` is a low-level hook that subscribes to an external store using React’s `useSyncExternalStore`. It accepts a `subscribe` function, a `getSnapshot` function, a `selector` to derive state, and an optional `isEqual` comparator (defaults to `shallowEqual`).

TimeDisplay.tsx

```
import { useSelector, shallowEqual } from "@videojs/store/react";

function TimeDisplay({ store }) {
  const time = useSelector(
    (cb) => store.subscribe(cb),
    () => store.state,
    (state) => ({ current: state.currentTime, duration: state.duration }),
    shallowEqual,
  );

  return (
    <span>
      {time.current} / {time.duration}
    </span>
  );
}
```

### Relationship to useStore and useSnapshot

Both `useStore` and `useSnapshot` are built on `useSelector`:

Hook

Input

Use case

[`useStore`](use-store.md)

Store instance

Player and store access with selector

[`useSnapshot`](use-snapshot.md)

`State` container

Subscribe to raw state changes

`useSelector`

Custom subscribe/snapshot

Full control over subscription plumbing

Prefer [`useStore`](use-store.md) for store-backed state and [`useSnapshot`](use-snapshot.md) for `State` containers. Use `useSelector` when you need to integrate with a non-standard external source or customize the equality comparison.

### Equality comparison

The `isEqual` parameter controls when React re-renders. The default `shallowEqual` compares object properties one level deep — sufficient for most selector return values. Pass a custom comparator for deeply nested objects or when you need reference equality (`Object.is`).

## API Reference

### Parameters

Parameter

Type

Default

Details

`subscribe*`

`function`

`—`

▸

Description

Subscribe function that returns an unsubscribe callback.

Type

`((cb: (() => void)) => (() => void))`

`getSnapshot*`

`function`

`—`

▸

Description

Returns the current snapshot value.

Type

`(() => S)`

`selector*`

`Selector<S, R>`

`—`

▸

Description

Derives a value from the snapshot.

`isEqual`

`Comparator<R>`

`—`

▸

Description

Custom equality function. Defaults to `shallowEqual`.

### Return Value

`R`

---

React documentation: ../llms.txt
All documentation: ../_site/llms.txt