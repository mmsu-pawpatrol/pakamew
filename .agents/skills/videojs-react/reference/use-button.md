# useButton

Hook for creating accessible button components with keyboard and pointer interaction

`useButton` provides button behavior including keyboard activation and accessibility checks. It returns a `getButtonProps` function for spreading onto a `<button>` element and a `buttonRef` for validation.

`getButtonProps` merges internal button props (click/keyboard handlers, disabled state) with any external props you pass in. Use [`renderElement`](render-element.md) to render the button with state-driven props and render prop support. In development mode, `buttonRef` warns if the rendered element is not a `<button>`.

## Examples

### Basic Usage

Activated 0 timesDisabled

App.tsx

App.css

```
import { useButton } from '@videojs/react';
import { useState } from 'react';

export default function BasicUsage() {
  const [count, setCount] = useState(0);
  const [disabled, setDisabled] = useState(false);

  const { getButtonProps, buttonRef } = useButton({
    displayName: 'ActivateButton',
    onActivate: () => setCount((c) => c + 1),
    isDisabled: () => disabled,
  });

  return (
    <div className="demo">
      <button ref={buttonRef} {...getButtonProps()} className="button" disabled={disabled}>
        Activated {count} times
      </button>
      <label className="label">
        <input type="checkbox" checked={disabled} onChange={(e) => setDisabled(e.target.checked)} />
        Disabled
      </label>
    </div>
  );
}
```
```
.demo {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 16px;
}

.button {
  align-self: flex-start;
  padding: 8px 20px;
  border-radius: 6px;
  border: 1px solid #ccc;
  background: #f5f5f5;
  cursor: pointer;
  font-variant-numeric: tabular-nums;
  transition: opacity 0.2s;
}

.button[disabled] {
  opacity: 0.5;
  cursor: not-allowed;
}

.label {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.875rem;
  color: #6b7280;
}
```

## API Reference

### Parameters

Parameter

Type

Default

Details

`params*`

`UseButtonParameters`

`—`

▸

Description

Button configuration with activation handler and disabled check.

### Return Value

Property

Type

Details

`getButtonProps`

`function`

▸

Type

`((externalProps: ComponentPropsWithRef<ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement> | undefined) => DetailedHTMLProps<ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement>)`

`buttonRef`

`Ref<HTMLElement>`

---

React documentation: ../llms.txt
All documentation: ../_site/llms.txt