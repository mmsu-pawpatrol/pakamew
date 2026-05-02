# BufferingIndicator

Loading indicator that displays when the video player is buffering or waiting for data

## Anatomy

tsx

```
<BufferingIndicator />
```

## Behavior

Shows a loading indicator when the media is waiting to buffer and not paused, but only after a configurable `delay` (default 500ms). This delay prevents the indicator from flickering during brief stalls. The indicator hides immediately when buffering ends.

## Styling

Hide and show the indicator based on the `data-visible` attribute.

## Examples

### Basic Usage

App.tsx

App.css

```
import { BufferingIndicator, createPlayer } from '@videojs/react';
import { Video, videoFeatures } from '@videojs/react/video';

const Player = createPlayer({ features: videoFeatures });

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
        <BufferingIndicator
          className="media-buffering-indicator"
          render={(props, state) => <div {...props}>{state.visible && <div className="spinner" />}</div>}
        />
      </Player.Container>
    </Player.Provider>
  );
}
```
```
.media-container {
  display: flex;
  width: 100%;
  height: 100%;
  position: relative;
}

.media-buffering-indicator {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;
  z-index: 30;
}

.spinner {
  width: 48px;
  height: 48px;
  border: 4px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: buffering-spin 0.8s linear infinite;
  display: none;
}

.media-buffering-indicator[data-visible] .spinner {
  display: block;
}

@keyframes buffering-spin {
  to {
    transform: rotate(360deg);
  }
}
```

## API Reference

### Props

Prop

Type

Default

Details

`delay`

`number`

`500`

▸

Description

Delay in milliseconds before the indicator becomes visible.

### State

State is accessible via the `render`, `className`, and `style` props.

Property

Type

Details

`visible`

`boolean`

▸

Description

Whether the indicator should be visible. True after the delay elapses while media is waiting and not paused.

### Data attributes

Attribute

Type

Details

`data-visible`

▸

Description

Present when the buffering indicator is visible (after delay).

---

React documentation: ../llms.txt
All documentation: ../_site/llms.txt