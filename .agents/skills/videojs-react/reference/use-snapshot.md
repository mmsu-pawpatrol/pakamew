# useSnapshot

Hook to subscribe to a State container's current value

`useSnapshot` subscribes to a `State` container and returns its current value, re-rendering when the value changes. It has two overloads:

**Full state** — returns the entire state object.

tsx

```
function Display({ state }) {
  const value = useSnapshot(state);
  return <span>{value.count}</span>;
}
```

**With selector** — returns a derived value from the state, re-rendering only when the selected value changes. Pass a custom comparator as the third argument when needed.

tsx

```
function Count({ state }) {
  const count = useSnapshot(state, (s) => s.count);
  return <span>{count}</span>;
}
```

### State containers vs stores

A `State` container is a reactive primitive that holds an object value and notifies subscribers on change. Stores are built on top of `State` containers but add features, actions, and lifecycle.

Hook

Input

Subscribes to

`useSnapshot`

`State<T>`

Raw state container

[`useStore`](use-store.md)

Store instance

Store-backed state with features

Use `useSnapshot` when working with standalone `State` containers outside the player store system — for example, custom state in component libraries. For player state, use [`usePlayer`](use-player.md) or [`useStore`](use-store.md).

`useSnapshot` is built on [`useSelector`](use-selector.md) and uses `shallowEqual` by default. The HTML equivalent is `SnapshotController`.

## API Reference

### Without Selector

Subscribe to a State container's current value.

#### Parameters

Parameter

Type

Default

Details

`state*`

`State<object>`

`—`

#### Return Value

`object`

### With Selector

Select a value from state. Re-renders when the selected value changes.

#### Parameters

Parameter

Type

Default

Details

`state*`

`State<object>`

`—`

`selector*`

`Selector<object, R>`

`—`

▸

Description

Derives a value from state.

`isEqual`

`Comparator<R>`

`—`

▸

Description

Custom equality function. Defaults to `shallowEqual`.

#### Return Value

`R`

---

React documentation: ../llms.txt
All documentation: ../_site/llms.txt