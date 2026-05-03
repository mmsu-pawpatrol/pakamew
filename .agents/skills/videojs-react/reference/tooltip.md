# Tooltip

A tooltip component for displaying contextual labels on hover and focus

## Anatomy

tsx

```
<Tooltip.Provider>
  <Tooltip.Root>
    <Tooltip.Trigger>Hover me</Tooltip.Trigger>
    <Tooltip.Popup>
      <Tooltip.Arrow />
      Label text
    </Tooltip.Popup>
  </Tooltip.Root>
</Tooltip.Provider>
```

## Behavior

Displays a short label anchored to a trigger element. Opens after a configurable `delay` (default 600ms) on hover or immediately on focus. Closes when the pointer leaves or focus moves away, with an optional `closeDelay`.

The `side` and `align` props control placement relative to the trigger. Positioning uses CSS Anchor Positioning where supported, with a JavaScript measurement fallback.

The component is composed from four parts: `Root` manages state and context, `Trigger` renders a button that activates the tooltip, `Popup` contains the label content, and `Arrow` renders a decorative pointer. Wrap multiple tooltips in a `Tooltip.Provider` to coordinate open/close timing across a group — once a tooltip becomes visible, adjacent tooltips open instantly within the `timeout` window, skipping the normal `delay`.

## Styling

Use [CSS custom properties](tooltip.md) for positioning offsets:

React renders standard DOM elements. Add a `className` to style them:

css

```
.tooltip-popup {
  --media-tooltip-side-offset: 8px;
  --media-tooltip-align-offset: 0px;
}
```

Style based on open state and transition phases:

css

```
.tooltip-popup[data-open] {
  display: block;
}
.tooltip-popup[data-starting-style] {
  opacity: 0;
}
.tooltip-popup[data-ending-style] {
  opacity: 0;
}
.tooltip-popup[data-side="top"] {
  transform-origin: bottom center;
}
.tooltip-popup[data-side="bottom"] {
  transform-origin: top center;
}
```

## Accessibility

The trigger receives `aria-describedby` pointing to the popup when open. The popup renders with `role="tooltip"` and `popover="manual"`. Tooltips open on focus and close when focus leaves, ensuring keyboard-only users can access the label.

## Examples

### Basic Usage

Hover me

App.tsx

App.css

```
import { Tooltip } from '@videojs/react';

export default function BasicUsage() {
  return (
    <div className="demo">
      <Tooltip.Root>
        <Tooltip.Trigger className="trigger">Hover me</Tooltip.Trigger>
        <Tooltip.Popup className="media-tooltip">
          <Tooltip.Arrow className="arrow" />
          Tooltip content
        </Tooltip.Popup>
      </Tooltip.Root>
    </div>
  );
}
```
```
.demo {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px 24px;
}

.trigger {
  padding: 6px 16px;
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(10px);
  color: black;
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 9999px;
  cursor: pointer;
}

.media-tooltip {
  --media-tooltip-side-offset: 8px;
  margin: 0;
  border: 0;
  background: rgba(0, 0, 0, 0.85);
  backdrop-filter: blur(10px);
  color: white;
  border-radius: 6px;
  padding: 4px 10px;
  font-size: 13px;
  white-space: nowrap;
  pointer-events: none;
}

.arrow {
  fill: rgba(0, 0, 0, 0.85);
}
```

### Grouping

Wrap multiple tooltips in a `Tooltip.Provider` to share a delay group. Once a tooltip becomes visible, adjacent tooltips open instantly within the `timeout` window, skipping the normal `delay`.

PlayMuteFullscreen

App.tsx

App.css

```
import { Tooltip } from '@videojs/react';

export default function Grouping() {
  return (
    <div className="demo">
      <Tooltip.Provider>
        <Tooltip.Root>
          <Tooltip.Trigger className="trigger">Play</Tooltip.Trigger>
          <Tooltip.Popup className="media-tooltip">
            <Tooltip.Arrow className="arrow" />
            Play video
          </Tooltip.Popup>
        </Tooltip.Root>
        <Tooltip.Root>
          <Tooltip.Trigger className="trigger">Mute</Tooltip.Trigger>
          <Tooltip.Popup className="media-tooltip">
            <Tooltip.Arrow className="arrow" />
            Mute audio
          </Tooltip.Popup>
        </Tooltip.Root>
        <Tooltip.Root>
          <Tooltip.Trigger className="trigger">Fullscreen</Tooltip.Trigger>
          <Tooltip.Popup className="media-tooltip">
            <Tooltip.Arrow className="arrow" />
            Enter fullscreen
          </Tooltip.Popup>
        </Tooltip.Root>
      </Tooltip.Provider>
    </div>
  );
}
```
```
.demo {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px 24px;
}

.trigger {
  padding: 6px 16px;
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(10px);
  color: black;
  border: 1px solid rgba(255, 255, 255, 0.3);
  cursor: pointer;
}

.media-tooltip {
  --media-tooltip-side-offset: 8px;
  margin: 0;
  border: 0;
  background: rgba(0, 0, 0, 0.85);
  backdrop-filter: blur(10px);
  color: white;
  border-radius: 6px;
  padding: 4px 10px;
  font-size: 13px;
  white-space: nowrap;
  pointer-events: none;
}

.arrow {
  fill: rgba(0, 0, 0, 0.85);
}
```

## API Reference

### 

Provider

#### Props

Prop

Type

Default

Details

`closeDelay`

`number`

`—`

▸

Description

Default close delay in ms for tooltips in this group.

`delay`

`number`

`—`

▸

Description

Default open delay in ms for tooltips in this group.

`timeout`

`number`

`—`

▸

Description

Duration in ms after a tooltip closes during which the next tooltip opens instantly.

### 

Root

#### Props

Prop

Type

Default

Details

`align`

`'start' | 'center' | 'end'`

`'center'`

▸

Description

Alignment of the tooltip along the trigger's edge.

`closeDelay`

`number`

`0`

▸

Description

Delay in ms before closing after pointer leaves.

`defaultOpen`

`boolean`

`false`

▸

Description

Initial open state for uncontrolled usage.

`delay`

`number`

`600`

▸

Description

Delay in ms before opening on hover.

`disabled`

`boolean`

`false`

▸

Description

When true, the tooltip is disabled and will not open.

`disableHoverablePopup`

`boolean`

`true`

▸

Description

When true, hovering the popup does not keep it open.

`open`

`boolean`

`false`

▸

Description

Controlled open state.

`side`

`'top' | 'bottom' | 'left' | 'right'`

`'top'`

▸

Description

Which side of the trigger the tooltip appears on.

#### State

State is accessible via the `render`, `className`, and `style` props.

Property

Type

Details

`open`

`boolean`

▸

Description

Whether the tooltip is currently visible.

`status`

`'idle' | 'starting' | 'ending'`

▸

Description

Current phase of the transition lifecycle.

`side`

`'top' | 'bottom' | 'left' | 'right'`

▸

Description

Which side of the trigger the tooltip is positioned on.

`align`

`'start' | 'center' | 'end'`

▸

Description

How the tooltip is aligned relative to the specified side.

`transitionStarting`

`boolean`

▸

Description

Whether the open transition is in progress.

`transitionEnding`

`boolean`

▸

Description

Whether the close transition is in progress.

#### Data attributes

Attribute

Type

Details

`data-open`

▸

Description

Present when the tooltip is open.

`data-side`

`'top' | 'bottom' | 'left' | 'right'`

▸

Description

Indicates which side the tooltip is positioned relative to the trigger.

`data-align`

`'start' | 'center' | 'end'`

▸

Description

Indicates how the tooltip is aligned relative to the specified side.

`data-starting-style`

▸

Description

Present when the open transition is in progress.

`data-ending-style`

▸

Description

Present when the close transition is in progress.

#### CSS custom properties

Variable

Details

`--media-tooltip-side-offset`

▸

Description

Distance between the popup and the trigger along the side axis.

`--media-tooltip-align-offset`

▸

Description

Distance between the popup and the trigger along the alignment axis.

`--media-tooltip-anchor-width`

▸

Description

The anchor element's width.

`--media-tooltip-anchor-height`

▸

Description

The anchor element's height.

`--media-tooltip-available-width`

▸

Description

Available width between the trigger and the boundary edge.

`--media-tooltip-available-height`

▸

Description

Available height between the trigger and the boundary edge.

### 

Trigger

Element that triggers the tooltip on hover and focus. Renders a `<button>` element.

#### Data attributes

Attribute

Type

Details

`data-open`

▸

Description

Present when the tooltip is open.

`data-side`

`'top' | 'bottom' | 'left' | 'right'`

▸

Description

Indicates which side the tooltip is positioned relative to the trigger.

`data-align`

`'start' | 'center' | 'end'`

▸

Description

Indicates how the tooltip is aligned relative to the specified side.

`data-starting-style`

▸

Description

Present when the open transition is in progress.

`data-ending-style`

▸

Description

Present when the close transition is in progress.

### 

Popup

Container for the tooltip content. Positioned relative to the trigger using CSS anchor positioning with a JavaScript fallback.

#### Data attributes

Attribute

Type

Details

`data-open`

▸

Description

Present when the tooltip is open.

`data-side`

`'top' | 'bottom' | 'left' | 'right'`

▸

Description

Indicates which side the tooltip is positioned relative to the trigger.

`data-align`

`'start' | 'center' | 'end'`

▸

Description

Indicates how the tooltip is aligned relative to the specified side.

`data-starting-style`

▸

Description

Present when the open transition is in progress.

`data-ending-style`

▸

Description

Present when the close transition is in progress.

### 

Arrow

Decorative arrow pointing from the tooltip toward the trigger. Hidden from assistive technology.

---

React documentation: ../llms.txt
All documentation: ../_site/llms.txt