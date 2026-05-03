# PlaybackRateButton

A button that cycles through playback speed rates

## Anatomy

tsx

```
<PlaybackRateButton />
```

## Behavior

Cycles through playback rates on click. The default rate list is `[0.2, 0.5, 0.7, 1, 1.2, 1.5, 1.7, 2]`. After the last rate, it wraps back to the first. If the current rate isn’t in the list (e.g., set programmatically), the button jumps to the next rate greater than the current one.

## Styling

Display the current rate using the `data-rate` attribute:

Use the `render` prop for rate display:

tsx

```
<PlaybackRateButton
  render={(props, state) => <button {...props}>{state.rate}&times;</button>}
/>
```

## Accessibility

Renders a `<button>` with an automatic `aria-label` of `"Playback rate {rate}"` (e.g., `"Playback rate 1.5"`). Override with the `label` prop. Keyboard activation: Enter / Space.

## Examples

### Basic Usage

1×

App.tsx

App.css

```
import { createPlayer, PlaybackRateButton } from '@videojs/react';
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
        <PlaybackRateButton
          className="media-playback-rate-button"
          render={(props, state) => <button {...props}>{Math.round(state.rate * 10) / 10}&times;</button>}
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

.media-playback-rate-button {
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

`string | ((state: PlaybackRateButtonState) => string)`

### State

State is accessible via the `render`, `className`, and `style` props.

Property

Type

Details

`rate`

`number`

`label`

`string`

### Data attributes

Attribute

Type

Details

`data-rate`

`number`

▸

Description

Current playback rate.

---

React documentation: ../llms.txt
All documentation: ../_site/llms.txt