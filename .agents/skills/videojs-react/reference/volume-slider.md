# VolumeSlider

A slider component for controlling media playback volume

## Anatomy

tsx

```
<VolumeSlider.Root />
```

## Behavior

Controls the media volume level. The slider maps its 0–100 internal range to the media’s 0–1 volume scale. When the media is muted, the fill level drops to 0 regardless of the stored volume value.

## Styling

Use [CSS custom properties](volume-slider.md) to style the fill and pointer levels:

React renders a `<div>` element. Add a `className` to style it:

css

```
.volume-slider::before {
  width: calc(var(--media-slider-fill) * 1%);
}
```

## Accessibility

Renders with `role="slider"` and automatic `aria-label` of “Volume”. Override with the `label` prop. Keyboard controls:

*   Arrow Left / Arrow Right: step by `step` increment
*   Page Up / Page Down: step by `largeStep` increment
*   Home: set volume to 0
*   End: set volume to max

Scroll wheel support:

*   **Mouse wheel / trackpad scroll** : adjusts volume by `wheelStep` increment (default `5`)

## Examples

Nest sub-components for full control over the slider’s DOM structure. This example includes a track, fill bar, draggable thumb, and a tooltip that shows the volume percentage on hover.

Mute

0%

App.tsx

App.css

```
import { createPlayer, MuteButton, VolumeSlider } from '@videojs/react';
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
        <MuteButton
          className="media-mute-button"
          render={(props, state) => <button {...props}>{state.muted ? 'Unmute' : 'Mute'}</button>}
        />
        <VolumeSlider.Root className="media-volume-slider">
          <VolumeSlider.Track className="media-slider-track">
            <VolumeSlider.Fill className="media-slider-fill" />
          </VolumeSlider.Track>
          <VolumeSlider.Thumb className="media-slider-thumb" />
          <VolumeSlider.Value type="pointer" className="media-slider-value" />
        </VolumeSlider.Root>
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
  cursor: pointer;
}

.media-volume-slider {
  position: absolute;
  bottom: 10px;
  right: 10px;
  width: 100px;
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
  backdrop-filter: blur(10px);
  border-radius: 9999px;
  transition: height 150ms ease;
}

.media-volume-slider[data-interactive] .media-slider-track {
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

.media-volume-slider[data-interactive] .media-slider-thumb {
  transform: translateX(-50%) scale(1);
}

.media-volume-slider[data-dragging] .media-slider-thumb {
  transform: translateX(-50%) scale(1.1);
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

.media-volume-slider[data-pointing] .media-slider-value {
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

`disabled`

`boolean`

`—`

▸

Description

Whether the slider is non-interactive.

`label`

`string | function`

`'Volume'`

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

`wheelStep`

`number`

`5`

▸

Description

Step increment for wheel scrolling.

#### State

State is accessible via the `render`, `className`, and `style` props.

Property

Type

Details

`availability`

`'available' | 'unavailable' | 'unsupp...`

▸

Type

`'available' | 'unavailable' | 'unsupported'`

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

`muted`

`boolean`

▸

Description

Whether audio is muted.

`volume`

`number`

▸

Description

Volume level from 0 (silent) to 1 (max).

#### Data attributes

Attribute

Type

Details

`data-availability`

`'available' | 'unavailable' | 'unsupp...`

▸

Type

`'available' | 'unavailable' | 'unsupported'`

#### CSS custom properties

Variable

Details

`--media-slider-fill`

▸

Description

Fill level percentage (0–100), representing the current volume level.

`--media-slider-pointer`

▸

Description

Pointer position percentage (0–100), tracking the cursor along the slider.

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