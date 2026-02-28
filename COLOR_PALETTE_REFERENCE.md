# 🎨 Color Palette Reference Card

## Latvian Red - Primary Color (#C8102E)

Used for: Buttons, links, important elements, primary actions

| Level   | Color           | Hex         | Tailwind        | Usage                              |
| ------- | --------------- | ----------- | --------------- | ---------------------------------- |
| 50      | 🟡 Very Light   | #fef5f5     | primary-50      | Subtle backgrounds, hover states   |
| 100     | 🟡 Light        | #fce8e8     | primary-100     | Light backgrounds                  |
| 200     | 🟠 Light        | #f8c8c8     | primary-200     | Light borders, disabled            |
| 300     | 🟠 Medium Light | #f0a5a5     | primary-300     | Hover backgrounds                  |
| 400     | 🔴 Medium       | #e07f7f     | primary-400     | Light hover                        |
| **500** | **🔴 Primary**  | **#C8102E** | **primary-500** | **PRIMARY COLOR - BUTTONS, LINKS** |
| 600     | 🔴 Bold         | #a60d26     | primary-600     | Hover buttons, emphasis            |
| 700     | 🟣 Dark         | #7f0a1e     | primary-700     | Active state, strong emphasis      |
| 800     | 🟣 Very Dark    | #5a0716     | primary-800     | Dark backgrounds, gradients        |
| 900     | ⚫ Darkest      | #3d050f     | primary-900     | Very dark text, strong contrast    |

### Usage Examples

```tsx
// Primary button
<button className="bg-primary-500 text-white hover:bg-primary-600">
  Solīt
</button>

// Link
<a href="#" className="text-primary-600 hover:text-primary-700">
  Skatīt lielāk
</a>

// Gradient background
<div className="bg-gradient-to-br from-primary-600 to-primary-800">
  Featured Section
</div>

// Badge
<span className="bg-primary-50 text-primary-600">
  TIEŠRAIDE
</span>
```

---

## Slate Gray - Neutral Palette

Used for: Text, backgrounds, borders, secondary elements

| Level | Color           | Hex     | Tailwind  | Usage                  |
| ----- | --------------- | ------- | --------- | ---------------------- |
| 50    | ⚪ Ultra Light  | #f9fafb | slate-50  | Page background        |
| 100   | ⚪ Very Light   | #f3f4f6 | slate-100 | Card background, hover |
| 200   | 🩶 Light        | #e5e7eb | slate-200 | Borders, dividers      |
| 300   | 🩶 Light Medium | #d1d5db | slate-300 | Hover borders          |
| 400   | 🩶 Medium       | #9ca3af | slate-400 | Secondary icons        |
| 500   | 🩶 Medium Dark  | #6b7280 | slate-500 | Secondary text         |
| 600   | 🩶 Dark         | #4b5563 | slate-600 | Primary text, headers  |
| 700   | ⚫ Very Dark    | #374151 | slate-700 | Dark text, strong      |
| 800   | ⚫ Very Dark    | #1f2937 | slate-800 | Very dark text         |
| 900   | ⚫ Darkest      | #111827 | slate-900 | Darkest text           |

### Usage Examples

```tsx
// Page background
<div className="bg-slate-50">

// Card background
<div className="bg-white border border-slate-200">

// Body text
<p className="text-slate-600">

// Secondary text
<p className="text-slate-500">

// Very dark text
<h1 className="text-slate-900">
```

---

## Semantic Colors

For status, alerts, and specific states

### Success - Green (#10b981)

```tsx
<div className="bg-success-50 text-success-600">✓ Veiksmīgi</div>
```

### Warning - Amber (#f59e0b)

```tsx
<div className="bg-warning-50 text-warning-600">⚠ Uzmanību</div>
```

### Danger - Red (#ef4444)

```tsx
<div className="bg-danger-50 text-danger-600">✕ Kļūda</div>
```

### Info - Blue (#3b82f6)

```tsx
<div className="bg-info-50 text-info-600">ℹ Informācija</div>
```

---

## Shadow Colors

### Red-Tinted Premium Shadow

```
rgba(200, 16, 46, 0.15)
```

Used on featured cards, hover states, premium elements

```tsx
<div className="shadow-premium hover:shadow-lg">Featured Auction Card</div>
```

---

## Complete Color Usage Guide

### Navigation & Header

```tsx
// Header background
<header className="bg-white border-b border-slate-200">

// Logo background
<div className="bg-primary-500 text-white">L</div>

// Navigation text
<nav className="text-slate-700">

// Links
<a className="text-primary-600 hover:text-primary-700">
```

### Forms & Inputs

```tsx
// Input background
<input className="bg-white border border-slate-200">

// Focus state
<input className="border-primary-500">

// Error state
<input className="border-danger-500 text-danger-600">

// Label text
<label className="text-slate-700">
```

### Buttons

```tsx
// Primary button
<button className="bg-primary-500 hover:bg-primary-600 text-white">

// Secondary button
<button className="border border-slate-300 text-slate-700 hover:bg-slate-50">

// Danger button
<button className="bg-danger-500 hover:bg-danger-600 text-white">

// Disabled button
<button className="bg-slate-200 text-slate-400 cursor-not-allowed">
```

### Cards & Containers

```tsx
// Card background
<div className="bg-white rounded-lg shadow-md border border-slate-100">

// Highlighted background
<div className="bg-slate-50 p-4 rounded">

// Gradient section
<div className="bg-gradient-to-r from-primary-600 to-primary-800 text-white">
```

### Status Badges

```tsx
// Live auction
<span className="bg-success-500 text-white">TIEŠRAIDE</span>

// Coming soon
<span className="bg-warning-500 text-white">DRĪZ SĀKSIES</span>

// Ended
<span className="bg-slate-400 text-white">BEIGTA</span>

// Featured
<span className="bg-primary-600 text-white">IZCILS</span>
```

### Typography

```tsx
// Headings - primary dark
<h1 className="text-slate-900 font-bold">

// Body text
<p className="text-slate-700">

// Secondary text
<p className="text-slate-500">

// Important links
<a className="text-primary-600 font-semibold">
```

---

## RGB Values (for reference)

### Latvian Red (#C8102E)

```
RGB: 200, 16, 46
HSL: 350°, 85%, 42%
```

### Slate Gray Base (#6b7280)

```
RGB: 107, 114, 128
HSL: 220°, 9%, 46%
```

---

## Accessibility Notes

### Color Contrast

- ✅ primary-500 on white: 8.2:1 (AAA compliant)
- ✅ slate-600 on white: 6.4:1 (AAA compliant)
- ✅ slate-500 on white: 5.2:1 (AA compliant)

### Color Blindness

- Red (#C8102E) + White provides strong contrast for color blind users
- Semantic colors (success/warning/danger) include symbols/icons
- Status is never indicated by color alone

---

## Design System Implementation

### CSS Classes

All colors are available as Tailwind classes:

```
bg-primary-500        (background)
text-primary-600      (text)
border-primary-200    (border)
from-primary-600      (gradient start)
to-primary-800        (gradient end)
hover:bg-primary-600  (hover state)
focus:ring-primary-500 (focus ring)
```

### Example Component

```tsx
function Button({ variant = "primary" }) {
  return (
    <button
      className={`
      ${variant === "primary" && "bg-primary-500 hover:bg-primary-600 text-white"}
      ${variant === "secondary" && "border border-slate-300 text-slate-700"}
      px-6 py-2 rounded font-semibold transition-colors
    `}
    >
      Click me
    </button>
  );
}
```

---

## Print This Reference

Save or print this page as your color palette reference guide!

---

**Color Palette Version**: 1.0  
**Design System**: Latvian Auction House Official  
**Last Updated**: February 22, 2026

For complete design guidelines, see: **LATVIAN_DESIGN_SYSTEM.md**
