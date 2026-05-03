# Poster

Poster image component that displays a thumbnail until video playback starts

## Anatomy

Import the component:

tsx

```
<Poster src="poster.jpg" alt="Video preview" />
```

## Behavior

The poster is visible before playback starts. Once the user plays or seeks, the poster hides permanently — pausing does not bring it back. The poster reappears when a new source is loaded.

## Styling

Style the poster with the `[data-visible]` attribute:

React renders an `<img>` element. Add a `className` to style it:

css

```
.poster:not([data-visible]) {
  display: none;
}
```

You control the child `<img>` — this means `srcset`, `sizes`, `loading="lazy"`, and framework image components all work naturally.

## Accessibility

Unlike the native `<video poster>` attribute, this component allows you to provide accessible text alternatives for screen readers via the `alt` attribute on your child `<img>`. This means you can describe the poster image (e.g., `alt="Keynote speaker at a conference"`) or mark it as decorative with `alt=""` if it doesn’t convey meaningful information.

## Examples

### Basic Usage

![](https://image.mux.com/BV3YZtogl89mg9VcNBhhnHm02Y34zI1nlMuMQfAbl3dM/thumbnail.jpg)Play

App.tsx

App.css

```
import { createPlayer, PlayButton, Poster } from '@videojs/react';
import { Video, videoFeatures } from '@videojs/react/video';

const Player = createPlayer({ features: videoFeatures });

export default function BasicUsage() {
  return (
    <Player.Provider>
      <Player.Container className="media-container">
        <Video src="https://stream.mux.com/BV3YZtogl89mg9VcNBhhnHm02Y34zI1nlMuMQfAbl3dM/highest.mp4" playsInline />

        <Poster
          className="media-poster"
          src="https://image.mux.com/BV3YZtogl89mg9VcNBhhnHm02Y34zI1nlMuMQfAbl3dM/thumbnail.jpg"
        />

        <PlayButton
          className="media-play-button"
          render={(props, state) => <button {...props}>{state.paused ? 'Play' : 'Pause'}</button>}
        />
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

.media-poster {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  pointer-events: none;
  transition: opacity 0.25s;
}

.media-poster:not([data-visible]) {
  opacity: 0;
}

.media-play-button {
  position: absolute;
  bottom: 10px;
  left: 10px;
  padding-block: 8px;
  background: rgba(255, 255, 255, 0.75);
  backdrop-filter: blur(10px);
  color: black;
  border: 1px solid rgba(255, 255, 255, 0.25);
  border-radius: 9999px;
  padding-inline: 16px;
  cursor: pointer;
}
```

## API Reference

### State

State is accessible via the `render`, `className`, and `style` props.

Property

Type

Details

`visible`

`boolean`

### Data attributes

Attribute

Type

Details

`data-visible`

---

React documentation: ../llms.txt
All documentation: ../_site/llms.txt