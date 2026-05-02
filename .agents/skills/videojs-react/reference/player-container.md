# Player.Container

The player's interaction surface — handles layout, fullscreen, media attachment, and user activity detection.

The `Player.Container` is the player’s physical surface. It defines the visual boundary, attaches the media element, and detects user interaction like activity and (eventually) gestures and keyboard input. It lives inside a [`Player.Provider`](player-provider.md).

tsx

```
<Player.Provider>
  <Player.Container>
    <video src="video.mp4" />
    <Controls />
  </Player.Container>
</Player.Provider>
```

## How it’s created

The `Player.Container` comes from the same `createPlayer()` call that creates the `Player.Provider`. They’re a matched pair wired to the same feature set.

tsx

```
import { createPlayer } from '@videojs/react';
import { videoFeatures } from '@videojs/react/video';

const Player = createPlayer({ features: videoFeatures });
```

[`createPlayer` reference](create-player.md)

## What it does

### Layout & fullscreen

The container is the visual box around your media and controls. Sizing, aspect ratio, and visual boundaries all go here — on the container, not the provider.

tsx

```
<Player.Container style={{ width: 640, aspectRatio: '16/9' }}>
  <video src="video.mp4" />
  <Controls />
</Player.Container>
```

When the user goes fullscreen, the **container** goes fullscreen — not the video element. This keeps controls and other UI visible on top of the video, since they’re children of the container.

### Media attachment

Media discovery is handled by the provider, not the container. When a media component like `<Video>` registers itself via context, the provider wires it to the store and all of the player’s features.

### Interaction surface

The container is where user intent enters the player. It listens for physical interaction on its surface and translates that into player behavior:

*   **User activity** — Mouse movement, touch, and keyboard activity within the container drive idle detection. This is how controls know when to show and hide.
*   **Gestures** *(coming soon)* — Click-to-play, double-click fullscreen, swipe to seek, and other touch/mouse gestures.
*   **Keyboard controls** *(coming soon)* — Spacebar to play/pause, arrow keys to seek, and other keyboard shortcuts scoped to the container.

## Relationship to skins

A [skin](../concepts/skins.md) is a container plus UI controls. When you use a packaged skin, the container is built in — you don’t need to add one yourself.

tsx

```
{/* Packaged skin — container is inside VideoSkin */}
<Player.Provider>
  <VideoSkin>
    <Video src="video.mp4" />
  </VideoSkin>
</Player.Provider>

{/* Custom UI — you use Player.Container directly */}
<Player.Provider>
  <Player.Container>
    <video src="video.mp4" />
    <PlayButton />
  </Player.Container>
</Player.Provider>
```

## Inside vs. outside the container

The [provider](player-provider.md) gives components access to state and actions. The container layers on physical behaviors — fullscreen, activity detection, gesture handling. Components work in both places; the container just adds those extras.

tsx

```
<Player.Provider>
  <Player.Container>
    <video src="video.mp4" />
    <Controls />          {/* fullscreen, activity detection, gestures */}
  </Player.Container>

  <Transcript />          {/* state & actions, but no container behaviors */}
  <PlaylistSidebar />     {/* state & actions, but no container behaviors */}
</Player.Provider>
```

A play button outside the container still reads playback state and can toggle play/pause — it just won’t go fullscreen with the player or respond to the container’s idle state.

---

React documentation: ../llms.txt
All documentation: ../_site/llms.txt