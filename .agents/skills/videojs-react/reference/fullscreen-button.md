# FullscreenButton

Accessible fullscreen toggle button with keyboard support and state reflection

## Anatomy

tsx

```
<FullscreenButton />
```

## Behavior

Toggles fullscreen mode. Detects platform support through `availability` — when fullscreen is `"unsupported"`, the toggle does nothing.

## Styling

You can style the button based on fullscreen state:

React renders a `<button>` element. Add a `className` to style it:

css

```
/* In fullscreen */
.fullscreen-button[data-fullscreen] {
  background: red;
}
```

Consider hiding the button when unsupported:

css

```
.fullscreen-button[data-availability="unsupported"] {
  display: none;
}
```

## Accessibility

Renders a `<button>` with an automatic `aria-label`: “Enter fullscreen” or “Exit fullscreen”. Override with the `label` prop. Keyboard activation: Enter / Space.

## Examples

### Basic Usage

Fullscreen

App.tsx

App.css

```
import { createPlayer, FullscreenButton } from '@videojs/react';
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
        <FullscreenButton
          className="media-fullscreen-button"
          render={(props, state) => <button {...props}>{state.fullscreen ? 'Exit Fullscreen' : 'Fullscreen'}</button>}
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

.media-fullscreen-button {
  padding-block: 8px;
  position: absolute;
  bottom: 10px;
  right: 10px;
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

`string | ((state: FullscreenButtonState) => string)`

### State

State is accessible via the `render`, `className`, and `style` props.

Property

Type

Details

`availability`

`'available' | 'unavailable' | 'unsupp...`

▸

Description

Whether fullscreen can be requested on this platform.

Type

`'available' | 'unavailable' | 'unsupported'`

`fullscreen`

`boolean`

▸

Description

Whether fullscreen mode is currently active.

`label`

`string`

### Data attributes

Attribute

Type

Details

`data-fullscreen`

▸

Description

Present when fullscreen mode is active.

`data-availability`

`'available' | 'unavailable' | 'unsupp...`

▸

Description

Indicates fullscreen availability (`available` or `unsupported`).

Type

`'available' | 'unavailable' | 'unsupported'`

---

React documentation: ../llms.txt
All documentation: ../_site/llms.txt