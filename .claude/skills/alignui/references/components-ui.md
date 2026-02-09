# ALIGN UI — Base UI Components

All components are in `components/ui/` across the 3 templates. The base set is shared; check any template for the source.

## Table of Contents

1. [Button](#button)
2. [Input](#input)
3. [Textarea](#textarea)
4. [Select](#select)
5. [Checkbox](#checkbox)
6. [Radio](#radio)
7. [Switch](#switch)
8. [Avatar](#avatar)
9. [Avatar Group](#avatar-group)
10. [Badge](#badge)
11. [Tag](#tag)
12. [Status Badge](#status-badge)
13. [Modal (Dialog)](#modal)
14. [Drawer](#drawer)
15. [Dropdown](#dropdown)
16. [Popover](#popover)
17. [Tooltip](#tooltip)
18. [Table](#table)
19. [Pagination](#pagination)
20. [Tab Menu Horizontal](#tab-menu-horizontal)
21. [Tab Menu Vertical](#tab-menu-vertical)
22. [Segmented Control](#segmented-control)
23. [Progress Bar](#progress-bar)
24. [Progress Circle](#progress-circle)
25. [Horizontal Stepper](#horizontal-stepper)
26. [Vertical Stepper](#vertical-stepper)
27. [Dot Stepper](#dot-stepper)
28. [Button Group](#button-group)
29. [Compact Button](#compact-button)
30. [Fancy Button](#fancy-button)
31. [Link Button](#link-button)
32. [Social Button](#social-button)
33. [Alert](#alert)
34. [Divider](#divider)
35. [Label](#label)
36. [Hint](#hint)
37. [KBD](#kbd)
38. [Digit Input](#digit-input)
39. [File Format Icon](#file-format-icon)
40. [Command Menu](#command-menu)
41. [Scroll Area](#scroll-area)
42. [Color Picker](#color-picker)

---

## Button
**Source**: `components/ui/button.tsx`
**Sub-components**: `Button.Root`, `Button.Icon`

| Prop | Type | Options | Default |
|------|------|---------|---------|
| `variant` | string | `primary`, `neutral`, `error` | `primary` |
| `mode` | string | `filled`, `stroke`, `lighter`, `ghost` | `filled` |
| `size` | string | `medium`, `small`, `xsmall`, `xxsmall` | `medium` |
| `asChild` | boolean | — | `false` |

```tsx
<Button.Root variant="primary" mode="filled" size="medium">
  <Button.Icon as={RiAddLine} />
  Create New
</Button.Root>
```

---

## Input
**Source**: `components/ui/input.tsx`
**Sub-components**: `Input.Root`, `Input.Wrapper`, `Input.Input`, `Input.Icon`, `Input.Affix`, `Input.InlineAffix`

| Prop | Type | Options | Default |
|------|------|---------|---------|
| `size` | string | `medium`, `small`, `xsmall` | `medium` |
| `hasError` | boolean | — | `false` |

```tsx
<Input.Root>
  <Input.Wrapper>
    <Input.Icon as={RiSearchLine} />
    <Input.Input placeholder="Search..." />
  </Input.Wrapper>
</Input.Root>
```

---

## Textarea
**Source**: `components/ui/textarea.tsx`
**Sub-components**: `Textarea` (simple), or compound with resize handle

| Prop | Type | Options | Default |
|------|------|---------|---------|
| `hasError` | boolean | — | `false` |
| `simple` | boolean | — | `false` |

---

## Select
**Source**: `components/ui/select.tsx`
**Sub-components**: `Select.Root`, `Select.Trigger`, `Select.TriggerIcon`, `Select.Content`, `Select.Item`, `Select.ItemIcon`, `Select.Group`, `Select.GroupLabel`, `Select.Separator`, `Select.Value`

| Prop | Type | Options | Default |
|------|------|---------|---------|
| `size` | string | `medium`, `small`, `xsmall` | `medium` |
| `variant` | string | `default`, `compact`, `compactForInput`, `inline` | `default` |
| `hasError` | boolean | — | `false` |

```tsx
<Select.Root size="small" defaultValue="usd">
  <Select.Trigger>
    <Select.Value placeholder="Select..." />
  </Select.Trigger>
  <Select.Content>
    <Select.Item value="usd">USD</Select.Item>
    <Select.Item value="eur">EUR</Select.Item>
  </Select.Content>
</Select.Root>
```

---

## Checkbox
**Source**: `components/ui/checkbox.tsx`
Built on Radix `@radix-ui/react-checkbox`. Custom animated SVG check/indeterminate icons.

---

## Radio
**Source**: `components/ui/radio.tsx`
Built on Radix `@radix-ui/react-radio-group`.

---

## Switch
**Source**: `components/ui/switch.tsx`
Built on Radix `@radix-ui/react-switch`.

---

## Avatar
**Source**: `components/ui/avatar.tsx`
**Sub-components**: `Avatar.Root`, `Avatar.Image`, `Avatar.Indicator`, `Avatar.Status`, `Avatar.BrandLogo`, `Avatar.Notification`

| Prop | Type | Options | Default |
|------|------|---------|---------|
| `size` | number | `20`, `24`, `32`, `40`, `48`, `56`, `64`, `72`, `80` | `40` |
| `color` | string | `gray`, `yellow`, `blue`, `sky`, `purple`, `red` | `gray` |
| `placeholderType` | string | `user`, `company` | `user` |

```tsx
<Avatar.Root size={40} color="blue">
  <Avatar.Image src="/avatar.jpg" alt="User" />
  <Avatar.Status status="online" />
</Avatar.Root>
```

---

## Avatar Group
**Source**: `components/ui/avatar-group.tsx`

| Prop | Type | Description |
|------|------|-------------|
| `limit` | number | Max avatars to show before "+N" overflow |

---

## Badge
**Source**: `components/ui/badge.tsx`
**Sub-components**: `Badge.Root`, `Badge.Icon`, `Badge.Dot`

| Prop | Type | Options | Default |
|------|------|---------|---------|
| `variant` | string | `filled`, `light`, `lighter`, `stroke` | `filled` |
| `size` | string | `small`, `medium` | `small` |
| `color` | string | `gray`, `blue`, `orange`, `red`, `green`, `yellow`, `purple`, `sky`, `pink`, `teal` | `gray` |
| `disabled` | boolean | — | `false` |
| `square` | boolean | forces square shape | `false` |

```tsx
<Badge.Root variant="light" color="green" size="small">
  <Badge.Dot />
  Active
</Badge.Root>
```

---

## Tag
**Source**: `components/ui/tag.tsx`
**Sub-components**: `Tag.Root`, `Tag.Icon`, `Tag.DismissButton`, `Tag.DismissIcon`

| Prop | Type | Options |
|------|------|---------|
| `variant` | string | `stroke`, `gray` |
| `disabled` | boolean | — |

---

## Status Badge
**Source**: `components/ui/status-badge.tsx`
Status indicators with various color variants matching the status color system.

---

## Modal
**Source**: `components/ui/modal.tsx`
**Sub-components**: `Modal.Root`, `Modal.Trigger`, `Modal.Close`, `Modal.Portal`, `Modal.Overlay`, `Modal.Content`, `Modal.Header`, `Modal.Title`, `Modal.Description`, `Modal.Body`, `Modal.Footer`

| Prop | Type | Description |
|------|------|-------------|
| `showClose` | boolean | Show close button |
| `overlayClassName` | string | Custom overlay class |

Built on Radix `@radix-ui/react-dialog`. Features backdrop blur, animations, 400px max-width default.

---

## Drawer
**Source**: `components/ui/drawer.tsx`
Side drawer/slide-out panel. Built on Radix Dialog.

---

## Dropdown
**Source**: `components/ui/dropdown.tsx`
Built on Radix `@radix-ui/react-dropdown-menu`.

---

## Popover
**Source**: `components/ui/popover.tsx`
Built on Radix `@radix-ui/react-popover`.

---

## Tooltip
**Source**: `components/ui/tooltip.tsx`

| Prop | Type | Options | Default |
|------|------|---------|---------|
| `variant` | string | `dark`, `light` | `dark` |
| `size` | string | `xsmall`, `small`, `medium` | `small` |
| `sideOffset` | number | — | `8` |

---

## Table
**Source**: `components/ui/table.tsx`
**Sub-components**: `Table`, `TableHeader`, `TableHead`, `TableBody`, `TableRow`, `TableRowDivider`, `TableCell`, `TableFoot`

Integrates with `@tanstack/react-table` for sorting, filtering, pagination.

---

## Pagination
**Source**: `components/ui/pagination.tsx`

| Prop | Type | Description |
|------|------|-------------|
| `page` | number | Current page |
| `pageSize` | number | Items per page |
| `total` | number | Total items |

---

## Tab Menu Horizontal
**Source**: `components/ui/tab-menu-horizontal.tsx`
Horizontal tab navigation with active state indicators.

---

## Tab Menu Vertical
**Source**: `components/ui/tab-menu-vertical.tsx`
Vertical tab navigation for sidebars/settings.

---

## Segmented Control
**Source**: `components/ui/segmented-control.tsx`
Toggle-style tabs with animated floating background.

| Prop | Type | Description |
|------|------|-------------|
| `defaultValue` | string | Default active segment |
| `floatingBgClassName` | string | Custom bg class |

---

## Progress Bar
**Source**: `components/ui/progress-bar.tsx`

| Prop | Type | Description |
|------|------|-------------|
| `value` | number | 0-100 |
| `max` | number | Maximum value |

---

## Progress Circle
**Source**: `components/ui/progress-circle.tsx`

| Prop | Type | Description |
|------|------|-------------|
| `value` | number | 0-100 |
| `size` | number | Circle size |

---

## Horizontal Stepper
**Source**: `components/ui/horizontal-stepper.tsx`

| Prop | Type | Description |
|------|------|-------------|
| `steps` | array | Step definitions |
| `currentStep` | number | Active step index |

---

## Vertical Stepper
**Source**: `components/ui/vertical-stepper.tsx`
Vertical progress stepper for multi-step flows.

---

## Dot Stepper
**Source**: `components/ui/dot-stepper.tsx`
Minimal dot-based step indicator.

---

## Button Group
**Source**: `components/ui/button-group.tsx`
**Sub-components**: `ButtonGroup.Root`, `ButtonGroup.Item`, `ButtonGroup.Icon`

| Prop | Type | Options |
|------|------|---------|
| `size` | string | `small`, `xsmall` |

---

## Compact Button
**Source**: `components/ui/compact-button.tsx`
Smaller button variant for dense layouts and toolbars.

---

## Fancy Button
**Source**: `components/ui/fancy-button.tsx`
Button with elevated shadow effects and premium styling.

---

## Link Button
**Source**: `components/ui/link-button.tsx`
Button styled as an inline text link.

---

## Social Button
**Source**: `components/ui/social-button.tsx`

| Prop | Type | Options |
|------|------|---------|
| `provider` | string | `apple`, `twitter`, `github`, `notion`, `tidal`, `amazon`, `zendesk` |

---

## Alert
**Source**: `components/ui/alert.tsx`
Notification/alert component with variant and icon support.

---

## Divider
**Source**: `components/ui/divider.tsx`
Horizontal/vertical separator line.

---

## Label
**Source**: `components/ui/label.tsx`
Form label built on Radix `@radix-ui/react-label`.

---

## Hint
**Source**: `components/ui/hint.tsx`
Helper text displayed below form fields.

---

## KBD
**Source**: `components/ui/kbd.tsx`
Keyboard shortcut key indicator (e.g., `⌘K`).

---

## Digit Input
**Source**: `components/ui/digit-input.tsx`
OTP-style individual digit input boxes. Uses `react-otp-input`.

---

## File Format Icon
**Source**: `components/ui/file-format-icon.tsx`
Displays file type icon based on format string.

---

## Command Menu
**Source**: `components/ui/command-menu.tsx`
Spotlight-style command palette. Uses `cmdk`.

---

## Scroll Area
**Source**: `components/ui/scroll-area.tsx`
Custom-styled scrollbar area. Built on Radix.

---

## Color Picker
**Source**: `components/ui/color-picker.tsx` (marketing template only)
Color selection component.
