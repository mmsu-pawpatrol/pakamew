# Player.useMedia

Hook to access the underlying media element from within a Player.Provider

`Player.useMedia` returns the current `HTMLMediaElement` (or `null` if no media element has been registered yet). Use it to interact directly with the native media element when needed. It must be called within a `Player.Provider`. The media element becomes available after a `<Video>` or `<Audio>` component mounts inside the provider tree. Also available as a standalone import (`import { useMedia } from '@videojs/react'`) — identical behavior, no typing difference. To attach a custom media element instead of the built-in components, see [`useMediaAttach`](use-media-attach.md).

## Examples

### Basic Usage

App.tsx

App.css

```
import { createPlayer } from '@videojs/react';
import { Video, videoFeatures } from '@videojs/react/video';

const Player = createPlayer({
  features: videoFeatures,
});

function MediaInfo() {
  const media = Player.useMedia();

  if (!media) return null;

  return (
    <dl className="info-panel">
      <div>
        <dt>tagName</dt>
        <dd>{media.tagName.toLowerCase()}</dd>
      </div>
      <div>
        <dt>src</dt>
        <dd>{media.currentSrc || '—'}</dd>
      </div>
      <div>
        <dt>videoWidth</dt>
        <dd>{media.videoWidth}px</dd>
      </div>
      <div>
        <dt>videoHeight</dt>
        <dd>{media.videoHeight}px</dd>
      </div>
    </dl>
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
          loop
        />
        <MediaInfo />
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

.info-panel {
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin: 0;
  padding: 12px;
  background: rgba(0, 0, 0, 0.05);
  border-top: 1px solid rgba(0, 0, 0, 0.1);
  font-size: 0.8125rem;
}

.info-panel div {
  display: flex;
  gap: 8px;
}

.info-panel dt {
  color: #6b7280;
  min-width: 80px;
}

.info-panel dd {
  margin: 0;
  font-variant-numeric: tabular-nums;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
```

## API Reference

### Return Value

`Media | null`

---

React documentation: ../llms.txt
All documentation: ../_site/llms.txt