# Popover

A popover component for displaying contextual content anchored to a trigger

## Anatomy

tsx

```
<Popover.Root>
  <Popover.Trigger>Open</Popover.Trigger>
  <Popover.Popup>
    <Popover.Arrow />
    Content
  </Popover.Popup>
</Popover.Root>
```

## Behavior

Displays contextual content anchored to a trigger element. By default, opens on click and closes when clicking outside, pressing Escape, or when the trigger loses focus.

Set `openOnHover` to open on pointer hover instead of click. Use `delay` and `closeDelay` to control timing for hover interactions.

The `side` and `align` props control popup placement relative to the trigger. The popup repositions automatically to stay within viewport bounds.

In React, the component is composed from four parts: `Root` manages state, `Trigger` toggles the popover, `Popup` contains the content, and `Arrow` renders a directional arrow.

## Styling

Use [CSS custom properties](popover.md) for positioning offsets:

React renders standard DOM elements. Add a `className` to style them:

css

```
.popover {
  --media-popover-side-offset: 8px;
  --media-popover-align-offset: 0px;
}
```

Style based on open state and transition phases:

css

```
.popover[data-open] .popup {
  display: block;
}
.popover[data-starting-style] .popup {
  opacity: 0;
}
.popover[data-ending-style] .popup {
  opacity: 0;
}
```

## Accessibility

The trigger receives `aria-expanded` reflecting the open state. When `modal` is set, the popup receives `aria-modal="true"`. Closing via Escape is enabled by default and can be disabled with `closeOnEscape={false}`.

## Examples

### Basic Usage

Settings

App.tsx

App.css

```
import { createPlayer, Popover } from '@videojs/react';
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
        <div className="bar">
          <Popover.Root>
            <Popover.Trigger className="trigger">Settings</Popover.Trigger>
            <Popover.Popup className="popup">
              <Popover.Arrow className="arrow" />
              <div className="content">Popover content</div>
            </Popover.Popup>
          </Popover.Root>
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

.bar {
  position: absolute;
  bottom: 10px;
  left: 10px;
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

.popup {
  /* Reset UA [popover] defaults */
  margin: 0;
  border: 0;
  --media-popover-side-offset: 8px;

  background: rgba(0, 0, 0, 0.85);
  backdrop-filter: blur(10px);
  color: white;
  border-radius: 8px;
  padding: 12px 16px;
  font-size: 14px;
}

.arrow {
  fill: rgba(0, 0, 0, 0.85);
}

.content {
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

`align`

`'start' | 'center' | 'end'`

`'center'`

▸

Description

Alignment of the popup along the trigger's edge.

`closeDelay`

`number`

`0`

▸

Description

Delay in ms before closing after pointer leaves.

`closeOnEscape`

`boolean`

`true`

▸

Description

Close the popup when the Escape key is pressed.

`closeOnOutsideClick`

`boolean`

`true`

▸

Description

Close the popup when clicking outside the trigger and popup.

`defaultOpen`

`boolean`

`false`

▸

Description

Initial open state for uncontrolled usage.

`delay`

`number`

`300`

▸

Description

Delay in ms before opening on hover.

`modal`

`boolean | 'trap-focus'`

`false`

▸

Description

*   `false` (default): non-modal; background content remains interactive.
*   `true`: modal; sets `aria-modal="true"` on the popup.
*   `'trap-focus'`: reserved for future focus-trapping behavior.

`open`

`boolean`

`false`

▸

Description

Controlled open state. When set, the consumer is responsible for toggling.

`openOnHover`

`boolean`

`false`

▸

Description

Open the popup on pointer hover instead of click.

`side`

`'top' | 'bottom' | 'left' | 'right'`

`'top'`

▸

Description

Which side of the trigger the popup appears on.

#### State

State is accessible via the `render`, `className`, and `style` props.

Property

Type

Details

`open`

`boolean`

`status`

`'idle' | 'starting' | 'ending'`

`side`

`'top' | 'bottom' | 'left' | 'right'`

`align`

`'start' | 'center' | 'end'`

`modal`

`boolean | 'trap-focus'`

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

Present when the popover is open.

`data-side`

`'top' | 'bottom' | 'left' | 'right'`

▸

Description

Indicates which side the popover is positioned relative to the trigger.

`data-align`

`'start' | 'center' | 'end'`

▸

Description

Indicates how the popover is aligned relative to the specified side.

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

`--media-popover-side-offset`

▸

Description

Distance between the popup and the trigger along the side axis.

`--media-popover-align-offset`

▸

Description

Distance between the popup and the trigger along the alignment axis.

`--media-popover-anchor-width`

▸

Description

The anchor element's width.

`--media-popover-anchor-height`

▸

Description

The anchor element's height.

`--media-popover-available-width`

▸

Description

Available width between the trigger and the boundary edge.

`--media-popover-available-height`

▸

Description

Available height between the trigger and the boundary edge.

### 

Arrow

Decorative arrow pointing from the popup toward the trigger. Hidden from assistive technology.

### 

Popup

Container for the popover content. Positioned relative to the trigger using CSS anchor positioning with a JavaScript fallback.

#### Data attributes

Attribute

Type

Details

`data-open`

▸

Description

Present when the popover is open.

`data-side`

`'top' | 'bottom' | 'left' | 'right'`

▸

Description

Indicates which side the popover is positioned relative to the trigger.

`data-align`

`'start' | 'center' | 'end'`

▸

Description

Indicates how the popover is aligned relative to the specified side.

`data-starting-style`

▸

Description

Present when the open transition is in progress.

`data-ending-style`

▸

Description

Present when the close transition is in progress.

### 

Trigger

Button that toggles the popover visibility. Renders a `<button>` element.

#### Data attributes

Attribute

Type

Details

`data-open`

▸

Description

Present when the popover is open.

`data-side`

`'top' | 'bottom' | 'left' | 'right'`

▸

Description

Indicates which side the popover is positioned relative to the trigger.

`data-align`

`'start' | 'center' | 'end'`

▸

Description

Indicates how the popover is aligned relative to the specified side.

`data-starting-style`

▸

Description

Present when the open transition is in progress.

`data-ending-style`

▸

Description

Present when the close transition is in progress.

---

React documentation: ../llms.txt
All documentation: ../_site/llms.txt