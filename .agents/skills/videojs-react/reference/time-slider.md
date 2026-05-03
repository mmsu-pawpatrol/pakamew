# TimeSlider

A slider component for seeking through media playback time

## Anatomy

tsx

```
<TimeSlider.Root />
```

## Behavior

Displays and controls the current playback position. Dragging the slider seeks the media. The fill level reflects `currentTime / duration` as a percentage, and the buffer level shows how much media has been buffered.

Value changes during drag are throttled via the `changeThrottle` prop (default 100ms) using a leading+trailing throttle to keep the UI responsive without overwhelming the media element.

## Styling

Use [CSS custom properties](time-slider.md) to style the fill, pointer, and buffer levels:

React renders a `<div>` element. Add a `className` to style it:

css

```
.time-slider::before {
  width: var(--media-slider-fill);
}
```

Use `data-seeking` to style during active seek operations:

css

```
.time-slider[data-seeking] {
  opacity: 0.8;
}
```

## Accessibility

Renders with `role="slider"` and automatic `aria-label` of “Seek”. Override with the `label` prop. Keyboard controls:

*   Arrow Left / Arrow Right: step by `step` increment
*   Page Up / Page Down: step by `largeStep` increment
*   Home: seek to start
*   End: seek to end

## Examples

Nest sub-components for full control over the slider’s DOM structure. This example includes a track, fill bar, buffer indicator, draggable thumb, and a tooltip that shows the pointed-at time.

0:00

App.tsx

App.css

```
import { createPlayer, TimeSlider } from '@videojs/react';
import { Video, videoFeatures } from '@videojs/react/video';

const Player = createPlayer({ features: videoFeatures });

export default function WithParts() {
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
        <TimeSlider.Root className="media-time-slider">
          <TimeSlider.Track className="media-slider-track">
            <TimeSlider.Buffer className="media-slider-buffer" />
            <TimeSlider.Fill className="media-slider-fill" />
          </TimeSlider.Track>
          <TimeSlider.Thumb className="media-slider-thumb" />
          <TimeSlider.Value type="pointer" className="media-slider-value" />
        </TimeSlider.Root>
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

.media-time-slider {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  align-items: center;
  height: 20px;
  cursor: pointer;
}

.media-slider-track {
  position: absolute;
  left: 0;
  right: 0;
  height: 4px;
  background: rgba(255, 255, 255, 0.3);
  border-radius: 9999px;
  transition: height 150ms ease;
}

.media-time-slider[data-interactive] .media-slider-track {
  height: 6px;
}

.media-slider-buffer {
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  width: var(--media-slider-buffer);
  background: rgba(255, 255, 255, 0.4);
  border-radius: 9999px;
}

.media-slider-fill {
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  width: var(--media-slider-fill);
  background: white;
  border-radius: 9999px;
}

.media-slider-thumb {
  position: absolute;
  left: var(--media-slider-fill);
  width: 14px;
  height: 14px;
  background: white;
  border-radius: 50%;
  transform: translateX(-50%) scale(0);
  transition: transform 150ms ease;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.4);
}

.media-time-slider[data-interactive] .media-slider-thumb {
  transform: translateX(-50%) scale(1);
}

.media-time-slider[data-dragging] .media-slider-thumb {
  left: var(--media-slider-pointer);
  transform: translateX(-50%) scale(1.1);
}

.media-time-slider[data-dragging] .media-slider-fill {
  width: var(--media-slider-pointer);
}

.media-slider-value {
  position: absolute;
  left: var(--media-slider-pointer);
  bottom: 100%;
  transform: translateX(-50%);
  margin-bottom: 6px;
  background: rgba(0, 0, 0, 0.8);
  color: white;
  font-size: 12px;
  padding: 2px 6px;
  border-radius: 4px;
  pointer-events: none;
  white-space: nowrap;
  opacity: 0;
  transition: opacity 150ms ease;
}

.media-time-slider[data-pointing] .media-slider-value {
  opacity: 1;
}
```

## API Reference

### 

Root

#### Props

Prop

Type

Default

Details

`changeThrottle`

`number`

`100`

▸

Description

Leading+trailing throttle (ms) for `onValueChange` during drag.

`disabled`

`boolean`

`—`

▸

Description

Whether the slider is non-interactive.

`label`

`string | function`

`'Seek'`

▸

Description

Custom label for the slider.

Type

`string | ((state: SliderState) => string)`

`largeStep`

`number`

`—`

▸

Description

Large step increment (Page Up/Down keys).

`max`

`number`

`—`

`min`

`number`

`—`

`orientation`

`'horizontal' | 'vertical'`

`—`

▸

Description

Axis of slider movement.

`step`

`number`

`—`

▸

Description

Step increment for value changes (arrow keys).

`thumbAlignment`

`'center' | 'edge'`

`—`

▸

Description

How the thumb aligns at the track edges. `edge` constrains the thumb within track bounds.

`value`

`number`

`—`

#### State

State is accessible via the `render`, `className`, and `style` props.

Property

Type

Details

`bufferPercent`

`number`

▸

Description

Buffered amount as a percentage of duration (0–100).

`value`

`number`

▸

Description

Current slider value in the min–max range.

`fillPercent`

`number`

▸

Description

Fill level as a percentage (0–100), derived from value.

`pointerPercent`

`number`

▸

Description

Pointer position as a percentage of the track (0–100).

`dragging`

`boolean`

▸

Description

Whether the user is actively dragging.

`pointing`

`boolean`

▸

Description

Whether the pointer is over the slider.

`interactive`

`boolean`

▸

Description

Whether dragging or pointing is active.

`orientation`

`'horizontal' | 'vertical'`

▸

Description

Axis of slider movement.

`disabled`

`boolean`

▸

Description

Whether the slider is non-interactive.

`thumbAlignment`

`'center' | 'edge'`

▸

Description

How the thumb aligns at the track edges.

`seeking`

`boolean`

▸

Description

Whether a seek operation is in progress.

`duration`

`number`

▸

Description

Total duration in seconds (0 if unknown).

`currentTime`

`number`

▸

Description

Current playback position in seconds.

#### Data attributes

Attribute

Type

Details

`data-seeking`

▸

Description

Present when a seek operation is in progress.

#### CSS custom properties

Variable

Details

`--media-slider-fill`

▸

Description

Fill level percentage (0–100), representing current playback position.

`--media-slider-pointer`

▸

Description

Pointer position percentage (0–100), tracking the cursor along the slider.

`--media-slider-buffer`

▸

Description

Buffer level percentage (0–100), indicating how much media has been buffered.

### 

Buffer

Displays the buffered range on the slider track.

### 

Fill

Displays the filled portion from start to the current value.

### 

Preview

Positioning container for preview content that tracks the pointer along the slider.

#### Props

Prop

Type

Default

Details

`overflow`

`SliderPreviewOverflow`

`—`

▸

Description

How the preview handles the slider boundaries. `'clamp'` keeps the preview within bounds, `'visible'` allows it to extend beyond the edges.

#### Data attributes

Attribute

Type

Details

`data-dragging`

▸

Description

Present when the user is actively dragging.

`data-pointing`

▸

Description

Present when the pointer is over the slider.

`data-interactive`

▸

Description

Present when dragging or pointing is active.

`data-orientation`

`'horizontal' | 'vertical'`

▸

Description

Current axis of slider movement (`horizontal` or `vertical`).

`data-disabled`

▸

Description

Present when the slider is non-interactive.

### 

Thumb

Draggable handle for setting the slider value. Receives focus and handles keyboard interaction.

#### Data attributes

Attribute

Type

Details

`data-dragging`

▸

Description

Present when the user is actively dragging.

`data-pointing`

▸

Description

Present when the pointer is over the slider.

`data-interactive`

▸

Description

Present when dragging or pointing is active.

`data-orientation`

`'horizontal' | 'vertical'`

▸

Description

Current axis of slider movement (`horizontal` or `vertical`).

`data-disabled`

▸

Description

Present when the slider is non-interactive.

### 

Track

Contains the slider's visual track and interactive hit zone.

### 

Value

Displays a formatted text representation of the slider value. Renders an `<output>` element.

#### Props

Prop

Type

Default

Details

`format`

`((value: number) => string)`

`—`

▸

Description

Custom formatter for the displayed value. Overrides the root's `formatValue`.

`type`

`"current" | "pointer"`

`—`

▸

Description

Which slider value to display: the current position or the pointer position.

#### Data attributes

Attribute

Type

Details

`data-dragging`

▸

Description

Present when the user is actively dragging.

`data-pointing`

▸

Description

Present when the pointer is over the slider.

`data-interactive`

▸

Description

Present when dragging or pointing is active.

`data-orientation`

`'horizontal' | 'vertical'`

▸

Description

Current axis of slider movement (`horizontal` or `vertical`).

`data-disabled`

▸

Description

Present when the slider is non-interactive.

---

React documentation: ../llms.txt
All documentation: ../_site/llms.txt