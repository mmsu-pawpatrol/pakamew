# CaptionsButton

Accessible captions toggle button with availability detection and state reflection

## Anatomy

tsx

```
<CaptionsButton />
```

## Behavior

Toggles captions and subtitles on and off. The button checks the media’s text track list for tracks with `kind="captions"` or `kind="subtitles"` and reflects availability via `data-availability`.

When no caption or subtitle tracks are present, `data-availability="unavailable"` is set. Use this to hide the button when there are no tracks to toggle.

## Styling

Style the button based on active state:

css

```
media-captions-button[data-active] .icon-on { display: inline; }
media-captions-button:not([data-active]) .icon-off { display: inline; }
```

Hide when no caption tracks are available:

css

```
media-captions-button[data-availability="unavailable"] {
  display: none;
}
```

## Accessibility

Renders a `<button>` with an automatic `aria-label`: “Disable captions” when active, “Enable captions” when inactive. Override with the `label` prop. Keyboard activation: Enter / Space.

## Examples

### Basic Usage

Captions On

App.tsx

App.css

```
import { CaptionsButton, createPlayer } from '@videojs/react';
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
        >
          <track kind="captions" src="/docs/demos/captions-button/captions.vtt" srcLang="en" label="English" />
        </Video>
        <CaptionsButton
          className="media-captions-button"
          render={(props, state) => (
            <button {...props}>{state.subtitlesShowing ? 'Captions Off' : 'Captions On'}</button>
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

.media-captions-button {
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

`string | ((state: CaptionsButtonState) => string)`

### State

State is accessible via the `render`, `className`, and `style` props.

Property

Type

Details

`availability`

`'available' | 'unavailable'`

`subtitlesShowing`

`boolean`

▸

Description

Whether captions/subtitles are currently enabled.

`label`

`string`

### Data attributes

Attribute

Type

Details

`data-active`

▸

Description

Present when captions are enabled.

`data-availability`

`'available' | 'unavailable'`

▸

Description

Indicates captions availability (`available` or `unavailable`).

---

React documentation: ../llms.txt
All documentation: ../_site/llms.txt