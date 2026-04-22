# Slider

A composable slider component with track, fill, thumb, preview, and value parts

## Anatomy

tsx

```
<Slider.Root>
  <Slider.Track>
    <Slider.Fill />
  </Slider.Track>
  <Slider.Thumb />
  <Slider.Preview>
    <Slider.Value type="pointer" />
  </Slider.Preview>
</Slider.Root>
```

## Behavior

The base Slider provides a generic range input. It manages value, pointer tracking, and drag interactions. Domain-specific sliders like [TimeSlider](time-slider.md) and [VolumeSlider](volume-slider.md) extend this with media-specific bindings.

The slider supports vertical orientation via the `orientation` prop (defaults to `"horizontal"`).

## Styling

Use [CSS custom properties](slider.md) to position fill, thumb, and preview elements:

React renders standard DOM elements. Add a `className` to style them:

css

```
.slider-fill {
  width: var(--media-slider-fill);
}

.slider-thumb {
  left: var(--media-slider-fill);
}
```

Style based on [interaction state](slider.md):

css

```
.slider[data-interactive] .slider-track {
  height: 6px;
}
.slider[data-pointing] .slider-preview {
  opacity: 1;
}
```

## Accessibility

Renders with `role="slider"` and automatic ARIA attributes (`aria-valuemin`, `aria-valuemax`, `aria-valuenow`, `aria-valuetext`). Override the label with the `label` prop. Keyboard controls:

*   Arrow Left / Arrow Right: step by `step` increment
*   Page Up / Page Down: step by `largeStep` increment
*   Home: jump to minimum
*   End: jump to maximum

## Examples

### Basic

A slider with track, fill, and thumb.

App.tsx

App.css

```
import { Slider } from '@videojs/react';
import { useState } from 'react';

export default function BasicUsage() {
  const [value, setValue] = useState(50);

  return (
    <div className="demo">
      <Slider.Root className="media-slider" value={value} onValueChange={setValue}>
        <Slider.Track className="media-slider-track">
          <Slider.Fill className="media-slider-fill" />
        </Slider.Track>
        <Slider.Thumb className="media-slider-thumb" />
      </Slider.Root>
    </div>
  );
}
```
```
.demo {
  display: flex;
  align-items: center;
  padding: 24px;
  background: #1a1a1a;
}

.media-slider {
  position: relative;
  width: 100%;
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

.media-slider[data-interactive] .media-slider-track {
  height: 6px;
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

.media-slider[data-interactive] .media-slider-thumb {
  transform: translateX(-50%) scale(1);
}

.media-slider[data-dragging] .media-slider-thumb {
  transform: translateX(-50%) scale(1.1);
}
```

### With Preview

A slider with a pointer-tracking preview that displays the value at the current pointer position.

0

App.tsx

App.css

```
import { Slider } from '@videojs/react';
import { useState } from 'react';

export default function WithPreview() {
  const [value, setValue] = useState(50);

  return (
    <div className="demo">
      <Slider.Root className="media-slider" value={value} onValueChange={setValue}>
        <Slider.Track className="media-slider-track">
          <Slider.Fill className="media-slider-fill" />
        </Slider.Track>
        <Slider.Thumb className="media-slider-thumb" />
        <Slider.Preview className="preview">
          <Slider.Value type="pointer" className="media-slider-value" />
        </Slider.Preview>
      </Slider.Root>
    </div>
  );
}
```
```
.demo {
  display: flex;
  align-items: center;
  padding: 40px 24px;
  background: #1a1a1a;
}

.media-slider {
  position: relative;
  width: 100%;
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

.media-slider[data-interactive] .media-slider-track {
  height: 6px;
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

.media-slider[data-interactive] .media-slider-thumb {
  transform: translateX(-50%) scale(1);
}

.media-slider[data-dragging] .media-slider-thumb {
  transform: translateX(-50%) scale(1.1);
}

.preview {
  position: absolute;
  bottom: 100%;
  margin-bottom: 6px;
  pointer-events: none;
  opacity: 0;
  transition: opacity 150ms ease;
}

.media-slider[data-pointing] .preview {
  opacity: 1;
}

.media-slider-value {
  background: rgba(0, 0, 0, 0.8);
  color: white;
  font-size: 12px;
  padding: 2px 6px;
  border-radius: 4px;
  white-space: nowrap;
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

`disabled`

`boolean`

`false`

▸

Description

Whether the slider is non-interactive.

`label`

`string | function`

`''`

▸

Description

Custom label for the slider.

Type

`string | ((state: SliderState) => string)`

`largeStep`

`number`

`10`

▸

Description

Large step increment (Page Up/Down keys).

`max`

`number`

`100`

▸

Description

Maximum value of the slider range.

`min`

`number`

`0`

▸

Description

Minimum value of the slider range.

`orientation`

`'horizontal' | 'vertical'`

`'horizontal'`

▸

Description

Axis of slider movement.

`step`

`number`

`1`

▸

Description

Step increment for value changes (arrow keys).

`thumbAlignment`

`'center' | 'edge'`

`'center'`

▸

Description

How the thumb aligns at the track edges. `edge` constrains the thumb within track bounds.

`value`

`number`

`0`

▸

Description

Current slider value.

#### State

State is accessible via the `render`, `className`, and `style` props.

Property

Type

Details

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

#### CSS custom properties

Variable

Details

`--media-slider-fill`

▸

Description

Fill level percentage (0–100).

`--media-slider-pointer`

▸

Description

Pointer position percentage (0–100).

`--media-slider-buffer`

▸

Description

Buffer level percentage (0–100).

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

Thumbnail

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