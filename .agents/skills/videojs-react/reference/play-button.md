# PlayButton

Accessible play/pause button with keyboard support and customizable rendering

## Anatomy

tsx

```
<PlayButton />
```

## Behavior

PlayButton is a three-state button: **play** , **pause** , and **replay** . When media reaches the end (`ended` state), clicking restarts playback from the beginning.

## Styling

Style with the `[data-paused]` and `[data-ended]` attributes to show/hide play/pause/replay icons based on state. For example:

React renders a `<button>` element. Add a `className` to style it:

css

```
/* Paused (but not ended) */
.play-button[data-paused]:not([data-ended]) .play-icon { display: inline; }

/* Playing */
.play-button:not([data-paused]) .pause-icon { display: inline; }

/* Ended */
.play-button[data-ended] .replay-icon { display: inline; }
```

After first play, the `data-started` attribute is added and remains present until a new source is loaded. Use this to hide the play button when media hasn’t started yet:

css

```
/* Hide play button before first play */
.play-button:not([data-started]) .play-icon { display: none; }
```

## Accessibility

Renders a `<button>` element with an automatic `aria-label` that updates based on state: “Play”, “Pause”, or “Replay”. Override with the `label` prop (accepts a string or function). Keyboard activation: Enter / Space.

## Examples

### Basic Usage

Play

App.tsx

App.css

```
import { createPlayer, PlayButton } from '@videojs/react';
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
        />
        <PlayButton
          className="media-play-button"
          render={(props, state) => (
            <button {...props}>{state.ended ? 'Replay' : state.paused ? 'Play' : 'Pause'}</button>
          )}
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

.media-play-button {
  padding-block: 8px;
  position: absolute;
  bottom: 10px;
  left: 10px;
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

### Props

Prop

Type

Default

Details

`disabled`

`boolean`

`false`

▸

Description

Whether the button is disabled.

`label`

`string | function`

`''`

▸

Description

Custom label for the button.

Type

`string | ((state: PlayButtonState) => string)`

### State

State is accessible via the `render`, `className`, and `style` props.

Property

Type

Details

`paused`

`boolean`

▸

Description

Whether playback is paused.

`ended`

`boolean`

▸

Description

Whether playback has reached the end.

`started`

`boolean`

▸

Description

Whether playback has started (played or seeked).

`label`

`string`

### Data attributes

Attribute

Type

Details

`data-paused`

▸

Description

Present when the media is paused.

`data-ended`

▸

Description

Present when the media has ended.

`data-started`

▸

Description

Present when playback has started.

---

React documentation: ../llms.txt
All documentation: ../_site/llms.txt