# createPlayer

Factory function that creates a player instance with typed store, Provider component, Container, and hooks

`createPlayer` is the entry point for setting up a Video.js player in React. It accepts a configuration object with a `features` array and returns hooks and components for building a player.

The hook is typed according to the provided features, giving you full type safety for state selectors and actions.

tsx

```
import { createPlayer } from '@videojs/react';
import { videoFeatures } from '@videojs/react/video';

const Player = createPlayer({ features: videoFeatures });
// Player.Provider, Player.Container, Player.usePlayer, Player.useMedia
```

## Examples

### Basic Usage

Play

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
  const paused = Player.usePlayer((s) => s.paused);

  return (
    <div className="controls">
      <button type="button" className="button" onClick={() => (paused ? store.play() : store.pause())}>
        {paused ? 'Play' : 'Pause'}
      </button>
    </div>
  );
}

export default function BasicUsage() {
  return (
    <Player.Provider>
      <Player.Container className="media-container">
        <Video
          src="https://stream.mux.com/BV3YZtogl89mg9VcNBhhnHm02Y34zI1nlMuMQfAbl3dM/highest.mp4"
          autoPlay
          muted
          playsInline
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
  position: absolute;
  bottom: 10px;
  left: 10px;
}

.button {
  padding-block: 8px;
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(10px);
  color: black;
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 9999px;
  padding-inline: 20px;
  cursor: pointer;
}
```

## API Reference

### Video

Create a player instance with typed store, Provider component, Container, and hooks.

#### Parameters

Parameter

Type

Default

Details

`config*`

`CreatePlayerConfig<VideoFeatures>`

`—`

▸

Description

Player configuration with features and optional display name.

#### Return Value

Property

Type

Details

`Provider`

`React.FC<ProviderProps>`

`Container`

`React.ForwardRefExoticComponent<ContainerProps & RefAttributes<HTMLDivElement>>`

`usePlayer`

`UsePlayerHook<VideoPlayerStore>`

`useMedia`

`null) | function`

▸

Type

`(() => Media | null)`

### Audio

Create a player for audio media.

#### Parameters

Parameter

Type

Default

Details

`config*`

`CreatePlayerConfig<AudioFeatures>`

`—`

▸

Description

Player configuration with features and optional display name.

#### Return Value

Property

Type

Details

`Provider`

`React.FC<ProviderProps>`

`Container`

`React.ForwardRefExoticComponent<ContainerProps & RefAttributes<HTMLDivElement>>`

`usePlayer`

`UsePlayerHook<AudioPlayerStore>`

`useMedia`

`null) | function`

▸

Type

`(() => Media | null)`

### Generic

Create a player with custom features.

#### Parameters

Parameter

Type

Default

Details

`config*`

`CreatePlayerConfig<AnyPlayerFeature[]>`

`—`

▸

Description

Player configuration with features and optional display name.

#### Return Value

Property

Type

Details

`Provider`

`React.FC<ProviderProps>`

`Container`

`React.ForwardRefExoticComponent<ContainerProps & RefAttributes<HTMLDivElement>>`

`usePlayer`

`UsePlayerHook<PlayerStore<AnyPlayerFeature[]>>`

`useMedia`

`null) | function`

▸

Type

`(() => Media | null)`

---

React documentation: ../llms.txt
All documentation: ../_site/llms.txt