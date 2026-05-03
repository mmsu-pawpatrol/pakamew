# MuteButton

Accessible mute/unmute button with keyboard support and volume state reflection

## Anatomy

tsx

```
<MuteButton />
```

## Behavior

Toggles mute on and off, and exposes a derived `volumeLevel` based on the current volume and mute state.

## Styling

Style the button based on muted state:

React renders a `<button>` element. Add a `className` to style it:

css

```
.mute-button[data-muted] .icon-muted { display: inline; }
.mute-button:not([data-muted]) .icon-unmuted { display: inline; }
```

Use `data-volume-level` for multi-level icon switching:

css

```
.mute-button[data-volume-level="off"] .icon-off { display: inline; }
.mute-button[data-volume-level="low"] .icon-low { display: inline; }
.mute-button[data-volume-level="medium"] .icon-medium { display: inline; }
.mute-button[data-volume-level="high"] .icon-high { display: inline; }
```

## Accessibility

Renders a `<button>` with an automatic `aria-label`: “Unmute” when muted, “Mute” when unmuted. Override with the `label` prop. Keyboard activation: Enter / Space.

## Examples

### Basic Usage

Mute

App.tsx

App.css

```
import { createPlayer, MuteButton } from '@videojs/react';
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
        <MuteButton
          className="media-mute-button"
          render={(props, state) => <button {...props}>{state.muted ? 'Unmute' : 'Mute'}</button>}
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

.media-mute-button {
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

### Volume Levels

High

App.tsx

App.css

```
import { createPlayer, MuteButton } from '@videojs/react';
import { Video, videoFeatures } from '@videojs/react/video';

const Player = createPlayer({ features: videoFeatures });

export default function VolumeLevels() {
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
        <MuteButton
          className="media-mute-button"
          render={(props, state) => (
            <button {...props}>
              {state.volumeLevel === 'off'
                ? 'Off'
                : state.volumeLevel === 'low'
                  ? 'Low'
                  : state.volumeLevel === 'medium'
                    ? 'Medium'
                    : 'High'}
            </button>
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

.media-mute-button {
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

`string | ((state: MuteButtonState) => string)`

### State

State is accessible via the `render`, `className`, and `style` props.

Property

Type

Details

`volumeLevel`

`'off' | 'low' | 'medium' | 'high'`

▸

Description

Derived volume level:

*   `off`: muted or volume is 0
*   `low`: volume < 0.5
*   `medium`: volume < 0.75
*   `high`: volume >= 0.75

`muted`

`boolean`

▸

Description

Whether audio is muted.

`label`

`string`

### Data attributes

Attribute

Type

Details

`data-muted`

▸

Description

Present when the media is muted.

`data-volume-level`

`'off' | 'low' | 'medium' | 'high'`

▸

Description

Indicates the volume level.

---

React documentation: ../llms.txt
All documentation: ../_site/llms.txt