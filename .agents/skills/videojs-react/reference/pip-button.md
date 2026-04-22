# PiPButton

Accessible picture-in-picture toggle button with keyboard support and state reflection

## Anatomy

tsx

```
<PiPButton />
```

## Behavior

Toggles picture-in-picture (PiP) mode. Detects platform support through `availability` — when PiP is `"unsupported"`, the toggle does nothing.

## Styling

You can style the button based on PiP state:

React renders a `<button>` element. Add a `className` to style it:

css

```
/* In PiP mode */
.pip-button[data-pip] {
  background: red;
}
```

Consider hiding the button when unsupported:

css

```
.pip-button[data-availability="unsupported"] {
  display: none;
}
```

## Accessibility

Renders a `<button>` with an automatic `aria-label`: “Enter PiP” or “Exit PiP”. Override with the `label` prop. Keyboard activation: Enter / Space.

## Examples

### Basic Usage

Enter PiP

App.tsx

App.css

```
import { createPlayer, PiPButton } from '@videojs/react';
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
        <PiPButton
          className="media-pip-button"
          render={(props, state) => <button {...props}>{state.pip ? 'Exit PiP' : 'Enter PiP'}</button>}
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

.media-pip-button {
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

`string | ((state: PiPButtonState) => string)`

### State

State is accessible via the `render`, `className`, and `style` props.

Property

Type

Details

`availability`

`'available' | 'unavailable' | 'unsupp...`

▸

Description

Whether picture-in-picture can be requested on this platform.

Type

`'available' | 'unavailable' | 'unsupported'`

`pip`

`boolean`

▸

Description

Whether picture-in-picture mode is currently active.

`label`

`string`

### Data attributes

Attribute

Type

Details

`data-pip`

▸

Description

Present when picture-in-picture mode is active.

`data-availability`

`'available' | 'unavailable' | 'unsupp...`

▸

Description

Indicates picture-in-picture availability (`available` or `unsupported`).

Type

`'available' | 'unavailable' | 'unsupported'`

---

React documentation: ../llms.txt
All documentation: ../_site/llms.txt