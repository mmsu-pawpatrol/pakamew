# renderElement

Utility for rendering UI component elements with state-driven props and render prop support

`renderElement` renders a UI component element, handling default tag rendering, render props (element or function), props merging, ref composition, and state-driven `className`/`style`.

PlayButton.tsx

```
import { renderElement } from "@videojs/react";

function PlayButton({ className, style, render, ...props }) {
  const state = { paused: true };

  return renderElement(
    "button",
    { className, style, render },
    {
      state,
      ref: buttonRef,
      props: [{ type: "button", "aria-label": "Play" }, props],
    },
  );
}
```

The `className` and `style` component props accept either static values or functions that receive the current state:

tsx

```
<PlayButton
  className={(state) => (state.paused ? "paused" : "playing")}
  style={(state) => ({ opacity: state.paused ? 0.5 : 1 })}
/>
```

The `render` prop lets consumers fully customize the rendered element while preserving all internal props and refs:

tsx

```
<PlayButton
  render={(props, state) => (
    <button {...props}>{state.paused ? "Play" : "Pause"}</button>
  )}
/>
```

## Examples

### Basic Usage

Activate

Default <span>**Element <strong>***Inactive*

App.tsx

App.css

```
import { renderElement } from '@videojs/react';
import { type ReactNode, useState } from 'react';

interface TagState {
  active: boolean;
}

function Tag({
  className,
  style,
  render,
  active,
  children,
}: renderElement.ComponentProps<TagState> & { active: boolean; children?: ReactNode }) {
  const state: TagState = { active };

  return renderElement(
    'span',
    { className, style, render },
    {
      state,
      props: { children },
      stateAttrMap: { active: 'data-active' },
    }
  );
}

export default function BasicUsage() {
  const [active, setActive] = useState(false);

  const className = (state: TagState) => `tag${state.active ? ' tag--active' : ''}`;

  const style = (state: TagState) => ({
    fontSize: state.active ? '1.125rem' : '0.875rem',
  });

  return (
    <div className="demo">
      <button type="button" className="toggle" onClick={() => setActive((prev) => !prev)}>
        {active ? 'Deactivate' : 'Activate'}
      </button>

      <div className="tags">
        <Tag active={active} className={className} style={style}>
          Default &lt;span&gt;
        </Tag>

        <Tag active={active} className={className} style={style} render={<strong />}>
          Element &lt;strong&gt;
        </Tag>

        <Tag
          active={active}
          className={className}
          style={style}
          render={(props, state) => <em {...props}>{state.active ? 'Active!' : 'Inactive'}</em>}
        />
      </div>
    </div>
  );
}
```
```
.demo {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 16px;
}

.toggle {
  align-self: flex-start;
  padding: 6px 16px;
  border-radius: 6px;
  border: 1px solid #ccc;
  background: #f5f5f5;
  cursor: pointer;
}

.tags {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.tag {
  display: inline-flex;
  align-items: center;
  padding: 6px 12px;
  border-radius: 9999px;
  background: #e5e7eb;
  color: #374151;
  transition: all 0.2s ease;
}

.tag--active {
  background: #3b82f6;
  color: white;
}
```

## API Reference

### Parameters

Parameter

Type

Default

Details

`element*`

`TagName`

`—`

`componentProps*`

`UseRenderComponentProps<object>`

`—`

`params*`

`UseRenderParameters<object, Element>`

`—`

### Return Value

`ReactElement | null`

---

React documentation: ../llms.txt
All documentation: ../_site/llms.txt