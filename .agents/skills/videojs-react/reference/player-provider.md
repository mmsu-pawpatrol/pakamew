# Player.Provider

The state boundary — creates a store and broadcasts it to all descendants.

The `Player.Provider` is the state boundary of your player. It creates a store and makes it available to every component inside it via context. Every player needs exactly one.

App.tsx

```
import { videoFeatures } from '@videojs/react/video';
import { createPlayer } from '@videojs/react';

const Player = createPlayer({ features: videoFeatures });

function App() {
  return (
    <Player.Provider>
      {/* Everything inside can access the player store */}
      <Player.Container>
        <video src="video.mp4" />
      </Player.Container>
    </Player.Provider>
  );
}
```

## How it’s created

Call `createPlayer()` with a `features` array. The returned object contains `Provider`, `Container`, `usePlayer`, and `useMedia` — everything you need for one player instance.

tsx

```
import { createPlayer } from '@videojs/react';
import { videoFeatures } from '@videojs/react/video';

const Player = createPlayer({
  features: videoFeatures,
});
```

The [features](../concepts/features.md) you pass determine what state is available in the store. `videoFeatures` is a [preset](../concepts/presets.md) that includes playback, volume, fullscreen, and other standard video controls.

[createPlayer reference](create-player.md)

## What lives inside it

Everything that needs player state goes inside the provider: skins, containers, UI components, and your own custom components. Anything inside can access the store.

tsx

```
<Player.Provider>
  <VideoSkin>           {/* skin — includes container + controls */}
    <Video src="..." /> {/* media element */}
  </VideoSkin>
  <MyCustomOverlay />   {/* your own component — can use Player.usePlayer() */}
</Player.Provider>
```

## No visual presence

The `Provider` renders no visible element of its own — it’s purely a state wrapper. Sizing, borders, and background go on the [`Container`](player-container.md), not the Provider.

## Accessing state

Use `Player.usePlayer` to read state or call actions from any component inside the Provider:

PlayPauseButton.tsx

```
function PlayPauseButton() {
  const paused = Player.usePlayer(selectPlayback).paused;
  const store = Player.usePlayer();

  return (
    <button onClick={() => store.dispatch('toggle-playback')}>
      {paused ? 'Play' : 'Pause'}
    </button>
  );
}
```

[usePlayer reference](use-player.md)

## Extended player layouts

The provider’s scope can extend beyond the fullscreen target. Playlists, transcripts, sidebars, and other supplementary UI can live inside the provider but outside the container. They still have full access to the store, they just won’t go fullscreen with the video.

tsx

```
<Player.Provider>
  <Player.Container>
    <video src="video.mp4" />
    <Controls />          {/* goes fullscreen with the video */}
  </Player.Container>

  <Transcript />          {/* outside container — still has store access */}
  <PlaylistSidebar />     {/* outside container — still has store access */}
</Player.Provider>
```

---

React documentation: ../llms.txt
All documentation: ../_site/llms.txt