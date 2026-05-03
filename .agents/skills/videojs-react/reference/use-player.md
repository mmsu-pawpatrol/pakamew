# Player.usePlayer

Hook to access the player store from within a Player.Provider

`Player.usePlayer` gives you access to the player store from any component within a `Player.Provider`. It has two overloads — without arguments for direct store access, or with a selector for reactive state subscriptions. `Player.usePlayer` is typed to the features you passed to [`createPlayer`](create-player.md). It’s also available as a standalone import (`import { usePlayer } from '@videojs/react'`), but the standalone version returns an untyped store.

## Examples

### Store Access

Call `Player.usePlayer()` without arguments to get the store instance. Use this for imperative actions like play, pause, and volume changes. The component does not re-render on state changes.

PlayPause

App.tsx

App.css

```
import { createPlayer } from '@videojs/react';
import { Video, videoFeatures } from '@videojs/react/video';

const Player = createPlayer({
  features: videoFeatures,
});

function Controls() {
  const store = Player.usePlayer();

  return (
    <div className="controls">
      <button type="button" onClick={() => store.play()}>
        Play
      </button>
      <button type="button" onClick={() => store.pause()}>
        Pause
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
        <Controls />
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

Pass a selector function to subscribe to specific state. The component re-renders when the selected value changes, using shallow equality by default.

Paused

true

Time

0.0s / 0.0s

App.tsx

App.css

```
import { createPlayer } from '@videojs/react';
import { Video, videoFeatures } from '@videojs/react/video';

const Player = createPlayer({
  features: videoFeatures,
});

function StateDisplay() {
  const state = Player.usePlayer((s) => ({
    paused: s.paused,
    currentTime: s.currentTime,
    duration: s.duration,
  }));

  return (
    <dl className="panel">
      <div>
        <dt>Paused</dt>
        <dd>{String(state.paused)}</dd>
      </div>
      <div>
        <dt>Time</dt>
        <dd>
          {state.currentTime.toFixed(1)}s / {state.duration.toFixed(1)}s
        </dd>
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
        <StateDisplay />
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

Access the player store from within a Player Provider.

#### Return Value

`BaseStore & UnknownState`

### With Selector

Select a value from the player store. Re-renders when the selected value changes.

#### Parameters

Parameter

Type

Default

Details

`selector*`

`function`

`—`

▸

Description

Derives a value from the player store state.

Type

`((state: UnknownState) => R)`

#### Return Value

`R`

---

React documentation: ../llms.txt
All documentation: ../_site/llms.txt