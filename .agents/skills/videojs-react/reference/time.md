# Time

Time display components for showing current time, duration, and remaining time in a video player

## Anatomy

tsx

```
<Time.Group>
  <Time.Value type="current" />
  <Time.Separator />
  <Time.Value type="duration" />
</Time.Group>
```

## Behavior

Three display types — `current`, `duration`, and `remaining` — in digital format with smart padding:

*   **Hours** are never padded (`1:05:30`, not `01:05:30`)
*   **Minutes** are padded when hours are shown (`1:05:30`, but `5:30`)
*   **Seconds** are always padded (`1:05`, not `1:5`)

Hour display is triggered when either the current value or the duration exceeds 1 hour, ensuring consistency within a Group. Remaining time displays a negative sign (customizable via the `negativeSign` prop).

## Styling

The negative sign is rendered inside `<span aria-hidden="true">` and can be hidden with CSS:

css

```
[data-type="remaining"] > span[aria-hidden] {
  display: none;
}
```

## Accessibility

Each `<Time.Value>` has:

*   `aria-label` for the static role label (“Current time”, “Duration”, “Remaining”)
*   `aria-valuetext` for the dynamic human-readable time (“1 minute, 30 seconds”)

No `aria-live` region is used — time updates too frequently and might overwhelm screen readers. The separator is `aria-hidden="true"` since screen readers already hear each time value separately. The negative sign is also `aria-hidden` because `aria-valuetext` already conveys “remaining”. In React, `<time datetime>` provides machine-readable time for parsers.

## Examples

### Current Time

0:00

App.tsx

App.css

```
import { createPlayer, Time } from '@videojs/react';
import { Video, videoFeatures } from '@videojs/react/video';

const Player = createPlayer({ features: videoFeatures });

export default function CurrentTime() {
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
        <Time.Value type="current" className="media-time" />
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

.media-time {
  position: absolute;
  bottom: 10px;
  left: 10px;
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(10px);
  color: black;
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 9999px;
  padding-block: 8px;
  padding-inline: 20px;
  font-variant-numeric: tabular-nums;
}
```

### Current / Duration

0:00/0:00

App.tsx

App.css

```
import { createPlayer, Time } from '@videojs/react';
import { Video, videoFeatures } from '@videojs/react/video';

const Player = createPlayer({ features: videoFeatures });

export default function CurrentDuration() {
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
        <Time.Group className="time-group">
          <Time.Value type="current" />
          <Time.Separator />
          <Time.Value type="duration" />
        </Time.Group>
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

.time-group {
  display: flex;
  align-items: center;
  gap: 4px;
  position: absolute;
  bottom: 10px;
  left: 10px;
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(10px);
  color: black;
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 9999px;
  padding-block: 8px;
  padding-inline: 20px;
  font-variant-numeric: tabular-nums;
}
```

### Remaining

0:00

App.tsx

App.css

```
import { createPlayer, Time } from '@videojs/react';
import { Video, videoFeatures } from '@videojs/react/video';

const Player = createPlayer({ features: videoFeatures });

export default function Remaining() {
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
        <Time.Value type="remaining" className="media-time" />
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

.media-time {
  position: absolute;
  bottom: 10px;
  left: 10px;
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(10px);
  color: black;
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 9999px;
  padding-block: 8px;
  padding-inline: 20px;
  font-variant-numeric: tabular-nums;
}
```

### Custom Separator

0:00 of 0:00

App.tsx

App.css

```
import { createPlayer, Time } from '@videojs/react';
import { Video, videoFeatures } from '@videojs/react/video';

const Player = createPlayer({ features: videoFeatures });

export default function CustomSeparator() {
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
        <Time.Group className="time-group">
          <Time.Value type="current" />
          <Time.Separator> of </Time.Separator>
          <Time.Value type="duration" />
        </Time.Group>
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

.time-group {
  display: flex;
  align-items: center;
  gap: 4px;
  position: absolute;
  bottom: 10px;
  left: 10px;
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(10px);
  color: black;
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 9999px;
  padding-block: 8px;
  padding-inline: 20px;
  font-variant-numeric: tabular-nums;
}
```

### Custom Negative Sign

0:00

App.tsx

App.css

```
import { createPlayer, Time } from '@videojs/react';
import { Video, videoFeatures } from '@videojs/react/video';

const Player = createPlayer({ features: videoFeatures });

export default function CustomNegativeSign() {
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
        <Time.Value type="remaining" negativeSign="~" className="media-time" />
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

.media-time {
  position: absolute;
  bottom: 10px;
  left: 10px;
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(10px);
  color: black;
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 9999px;
  padding-block: 8px;
  padding-inline: 20px;
  font-variant-numeric: tabular-nums;
}
```

## API Reference

### 

Value

Displays a formatted time value (current, duration, or remaining).

#### Props

Prop

Type

Default

Details

`label`

`string | function`

`''`

▸

Description

Custom label for accessibility.

Type

`string | ((state: TimeState) => string)`

`negativeSign`

`string`

`'-'`

▸

Description

Symbol prepended to remaining time.

`type`

`'current' | 'duration' | 'remaining'`

`'current'`

▸

Description

Which time value to display.

#### State

State is accessible via the `render`, `className`, and `style` props.

Property

Type

Details

`type`

`'current' | 'duration' | 'remaining'`

▸

Description

Time display type.

`seconds`

`number`

▸

Description

Raw value in seconds.

`negative`

`boolean`

▸

Description

Whether the time value is negative (remaining time before end).

`text`

`string`

▸

Description

Formatted display text without sign (e.g., "1:30").

`phrase`

`string`

▸

Description

Human-readable phrase (e.g., "1 minute, 30 seconds").

`datetime`

`string`

▸

Description

ISO 8601 duration (e.g., "PT1M30S").

#### Data attributes

Attribute

Type

Details

`data-type`

`'current' | 'duration' | 'remaining'`

▸

Description

The type of time being displayed.

### 

Group

Container for composed time displays. Renders a `<span>` element.

### 

Separator

Divider between time values. Hidden from screen readers.

---

React documentation: ../llms.txt
All documentation: ../_site/llms.txt