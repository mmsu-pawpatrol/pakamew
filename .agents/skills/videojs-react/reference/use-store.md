# useStore

Hook to access store state and actions with optional selector-based subscriptions

`useStore` subscribes to a store instance directly. It has the same two overloads as [`usePlayer`](use-player.md) — without a selector for store access, or with a selector for reactive state. Within a player provider, `usePlayer` is usually simpler since it reads the store from context. Reach for `useStore` when you have a store instance directly or need to derive computed values from the store.

## Examples

### Store Access

Call `useStore(store)` without a selector to get the store instance back for imperative actions. The component does not subscribe to state changes.

Go to startGo to middle

App.tsx

App.css

```
import { createPlayer, useStore } from '@videojs/react';
import { Video, videoFeatures } from '@videojs/react/video';

const Player = createPlayer({
  features: videoFeatures,
});

function SeekControls() {
  const store = Player.usePlayer();
  const s = useStore(store);

  return (
    <div className="controls">
      <button type="button" onClick={() => s.seek(0)}>
        Go to start
      </button>
      <button type="button" onClick={() => s.seek(s.state.duration / 2)}>
        Go to middle
      </button>
    </div>
  );
}

export default function StoreAccess() {
  return (
    <Player.Provider>
      <Player.Container className="media-container">
        <Video
          src="https://stream.mux.com/BV3YZtogl89mg9VcNBhhnHm02Y34zI1nlMuMQfAbl3dM/highest.mp4"
          autoPlay
          muted
          playsInline
          loop
        />
        <SeekControls />
      </Player.Container>
    </Player.Provider>
  );
}
```
```
.media-container {
  position: relative;
}

.media-container video {
  width: 100%;
}

.controls {
  display: flex;
  gap: 6px;
  padding: 12px;
  background: rgba(0, 0, 0, 0.05);
  border-top: 1px solid rgba(0, 0, 0, 0.1);
}

.controls button {
  padding: 4px 12px;
  border-radius: 6px;
  border: 1px solid #ccc;
  background: white;
  cursor: pointer;
  font-size: 0.8125rem;
}
```

### Selector Subscription

Pass a selector to derive and subscribe to computed values from the store. The component re-renders when the derived value changes, using shallow equality by default.

Remaining

0.0s

Progress

0.0%

App.tsx

App.css

```
import { createPlayer, useStore } from '@videojs/react';
import { Video, videoFeatures } from '@videojs/react/video';

const Player = createPlayer({
  features: videoFeatures,
});

function DerivedState() {
  const store = Player.usePlayer();
  const derived = useStore(store, (s) => ({
    remaining: s.duration - s.currentTime,
    progress: s.duration > 0 ? (s.currentTime / s.duration) * 100 : 0,
  }));

  return (
    <dl className="panel">
      <div>
        <dt>Remaining</dt>
        <dd>{derived.remaining.toFixed(1)}s</dd>
      </div>
      <div>
        <dt>Progress</dt>
        <dd>{derived.progress.toFixed(1)}%</dd>
      </div>
    </dl>
  );
}

export default function Selector() {
  return (
    <Player.Provider>
      <Player.Container className="media-container">
        <Video
          src="https://stream.mux.com/BV3YZtogl89mg9VcNBhhnHm02Y34zI1nlMuMQfAbl3dM/highest.mp4"
          autoPlay
          muted
          playsInline
          loop
        />
        <DerivedState />
      </Player.Container>
    </Player.Provider>
  );
}
```
```
.media-container {
  position: relative;
}

.media-container video {
  width: 100%;
}

.panel {
  display: flex;
  gap: 16px;
  padding: 12px;
  margin: 0;
  font-size: 0.8125rem;
  background: rgba(0, 0, 0, 0.05);
  border-top: 1px solid rgba(0, 0, 0, 0.1);
}

.panel div {
  display: flex;
  gap: 8px;
}

.panel dt {
  color: #6b7280;
}

.panel dd {
  margin: 0;
  font-variant-numeric: tabular-nums;
}
```

## API Reference

### Without Selector

Access store state and actions.

Without selector: Returns the store, does NOT subscribe to changes. With selector: Returns selected state, re-renders when selected state changes (shallowEqual).

#### Parameters

Parameter

Type

Default

Details

`store*`

`S`

`—`

#### Return Value

`S`

### With Selector

Select a value from the store. Re-renders when the selected value changes (shallowEqual).

#### Parameters

Parameter

Type

Default

Details

`store*`

`S`

`—`

`selector*`

`Selector<InferStoreState<S>, R>`

`—`

▸

Description

Derives a value from the store state.

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