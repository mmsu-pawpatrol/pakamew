# SeekButton

Accessible seek button for skipping forward or backward by a configurable number of seconds

## Anatomy

tsx

```
<SeekButton />
```

## Behavior

Seeks media by a configurable number of `seconds` (default 30). Positive values seek forward, negative values seek backward. The seek is clamped to media bounds (0 to duration).

## Accessibility

Renders a `<button>` with an automatic `aria-label` describing the action, e.g. “Seek forward 30 seconds” or “Seek backward 10 seconds”. Override with the `label` prop. Keyboard activation: Enter / Space.

## Examples

### Basic Usage

⏪ 5s10s ⏩

App.tsx

App.css

```
import { createPlayer, SeekButton } from '@videojs/react';
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
        <div className="buttons">
          <SeekButton
            seconds={-5}
            className="media-seek-button"
            render={(props, state) => (
              <button {...props}>
                {state.direction === 'backward' ? '\u23EA' : '\u23E9'} {5}s
              </button>
            )}
          />
          <SeekButton
            seconds={10}
            className="media-seek-button"
            render={(props, state) => (
              <button {...props}>
                {10}s {state.direction === 'forward' ? '\u23E9' : '\u23EA'}
              </button>
            )}
          />
        </div>
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

.buttons {
  display: flex;
  gap: 8px;
  position: absolute;
  bottom: 10px;
  left: 10px;
}

.media-seek-button {
  padding-block: 8px;
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(10px);
  color: black;
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 9999px;
  padding-inline: 20px;
  white-space: nowrap;
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

`string | ((state: SeekButtonState) => string)`

`seconds`

`number`

`30`

▸

Description

Seconds to seek. Positive = forward, negative = backward. Default `30`.

### State

State is accessible via the `render`, `className`, and `style` props.

Property

Type

Details

`seeking`

`boolean`

▸

Description

Whether a seek is in progress.

`direction`

`'forward' | 'backward'`

▸

Description

Whether the button seeks forward or backward.

`label`

`string`

### Data attributes

Attribute

Type

Details

`data-seeking`

▸

Description

Present when a seek is in progress.

`data-direction`

`'forward' | 'backward'`

▸

Description

Indicates the seek direction: `"forward"` or `"backward"`.

---

React documentation: ../llms.txt
All documentation: ../_site/llms.txt