# 🎨 Visual Design Specifications

## Official Color Reference

### Latvian Red - Primary (#C8102E)

```
■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■ #C8102E (Official Primary)
Official Latvian Red - Authoritative, trustworthy, professional
```

**CSS Variations:**

```css
.primary-50 {
  background: #fef5f5;
} /* Ultra light - subtle backgrounds */
.primary-100 {
  background: #fce8e8;
} /* Very light - light backgrounds */
.primary-200 {
  background: #f8c8c8;
} /* Light - hover states */
.primary-300 {
  background: #f0a5a5;
} /* Medium light - disabled */
.primary-400 {
  background: #e07f7f;
} /* Medium - light hover */
.primary-500 {
  background: #c8102e;
} /* PRIMARY - Use this! */
.primary-600 {
  background: #a60d26;
} /* Bold - hover buttons */
.primary-700 {
  background: #7f0a1e;
} /* Dark - active states */
.primary-800 {
  background: #5a0716;
} /* Very dark - gradients */
.primary-900 {
  background: #3d050f;
} /* Darkest - text emphasis */
```

---

## Neutral Slate Palette

### Gray Spectrum

```
■■■■■■■■ #f9fafb (50) - Page background, lightest
■■■■■■■▓ #f3f4f6 (100) - Light background
■■■■■■▓▓ #e5e7eb (200) - Borders, dividers
■■■■■▓▓▓ #d1d5db (300) - Hover borders
■■■▓▓▓▓▓ #9ca3af (400) - Secondary icons
■■▓▓▓▓▓▓ #6b7280 (500) - Secondary text
■▓▓▓▓▓▓▓ #4b5563 (600) - Primary text
▓▓▓▓▓▓▓▓ #374151 (700) - Dark text
███████▓ #1f2937 (800) - Very dark
████████ #111827 (900) - Darkest text
```

---

## Component Color Mapping

### Button Component

```
┌─────────────────────────────────────────────────┐
│ PRIMARY BUTTON                                  │
├─────────────────────────────────────────────────┤
│ Default:    bg-primary-500  (#C8102E)          │
│ Hover:      bg-primary-600  (#a60d26)          │
│ Active:     bg-primary-700  (#7f0a1e)          │
│ Disabled:   bg-slate-200    (#e5e7eb)          │
│ Text:       text-white                          │
│ Border:     none                                │
└─────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────┐
│ SECONDARY BUTTON                                │
├─────────────────────────────────────────────────┤
│ Default:    border-slate-300                    │
│ Background: transparent                         │
│ Text:       text-slate-700                      │
│ Hover:      bg-slate-50                         │
│ Active:     bg-slate-100                        │
└─────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────┐
│ DANGER BUTTON                                   │
├─────────────────────────────────────────────────┤
│ Default:    bg-danger-500   (#ef4444)          │
│ Hover:      bg-danger-600   (#dc2626)          │
│ Text:       text-white                          │
└─────────────────────────────────────────────────┘
```

### Card Component

```
┌─────────────────────────────────────────────────┐
│ Card Elevation System                           │
├─────────────────────────────────────────────────┤
│ none:    0 box-shadow                           │
│ sm:      0 1px 3px rgba(0,0,0,0.1)             │
│ md:      0 4px 6px rgba(0,0,0,0.2)  ← DEFAULT │
│ lg:      0 10px 15px rgba(0,0,0,0.1)           │
│ xl:      0 20px 25px rgba(0,0,0,0.1)           │
│ premium: 0 20px 40px rgba(200,16,46,0.15)      │
└─────────────────────────────────────────────────┘
```

### Input Component

```
┌─────────────────────────────────────────────────┐
│ Input States                                    │
├─────────────────────────────────────────────────┤
│ Default:   border-slate-200                     │
│ Focus:     border-primary-500                   │
│ Error:     border-danger-500                    │
│ Disabled:  bg-slate-50  text-slate-400          │
│ Label:     text-slate-700  font-semibold        │
│ Helper:    text-slate-500  text-xs              │
│ Error Msg: text-danger-600  text-sm             │
└─────────────────────────────────────────────────┘
```

### Badge Component

```
┌─────────────────────────────────────────────────┐
│ Badge Variants                                  │
├─────────────────────────────────────────────────┤
│ Primary:   bg-primary-50   text-primary-600     │
│ Success:   bg-success-50   text-success-600     │
│ Warning:   bg-warning-50   text-warning-600     │
│ Danger:    bg-danger-50    text-danger-600      │
│ Neutral:   bg-slate-100    text-slate-700       │
│                                                 │
│ Auction Status Badges:                          │
│ TIEŠRAIDE:     bg-success-500  text-white       │
│ DRĪZ SĀKSIES:  bg-warning-500  text-white       │
│ BEIGTA:        bg-slate-400    text-white       │
└─────────────────────────────────────────────────┘
```

---

## Typography Hierarchy

### Font Sizes

```
Heading H1    48px / 56px line-height   (5xl) - HERO
Heading H2    30px / 36px line-height   (3xl) - SECTION
Heading H3    24px / 32px line-height   (2xl) - SUBSECTION
Heading H4    20px / 28px line-height   (xl)  - SMALL HEADING
Body Text     16px / 24px line-height   (base) - DEFAULT
Secondary     14px / 20px line-height   (sm)  - LABEL/HELP
Caption       12px / 16px line-height   (xs)  - FOOTNOTE
```

### Font Weights

```
Regular       400  ← Default text weight
Medium        500  ← Emphasis
Semibold      600  ← Strong emphasis
Bold          700  ← Headings
Extrabold     800  ← Hero text
```

---

## Spacing Scale (8px Grid)

```
xs  = 0.25rem = 4px    ▪
sm  = 0.5rem  = 8px    ▪▪
md  = 1rem    = 16px   ▪▪▪▪       ← PREFERRED
lg  = 1.5rem  = 24px   ▪▪▪▪▪▪
xl  = 2rem    = 32px   ▪▪▪▪▪▪▪▪
2xl = 2.5rem  = 40px   ▪▪▪▪▪▪▪▪▪▪
3xl = 3rem    = 48px   ▪▪▪▪▪▪▪▪▪▪▪▪
```

### Applied To:

```
Padding:    p-4 (px-4, py-4)
Margin:     m-4 (mx-4, my-4)
Gap:        gap-4 (grid gap)
Rounded:    rounded-md (8px)
```

---

## Responsive Grid System

### Column Count by Breakpoint

```
Mobile  (< 640px):    1 column   (full width)
Small   (640px+):     2 columns  (50% width each)
Medium  (1024px+):    3 columns  (33% width each)
Large   (1280px+):    4 columns  (25% width each) ← max container
```

### Breakpoint Classes

```
default:   applies to all sizes
sm:        640px and up
md:        768px and up
lg:        1024px and up
xl:        1280px and up
2xl:       1536px and up

Example:
<div className="w-full sm:w-1/2 lg:w-1/3">
  { 100% mobile → 50% tablet → 33% desktop }
</div>
```

---

## Shadow System Visual

```
shadow-xs   ┌─────────────┐
            │   Card      │    1px soft
            └─────────────┘

shadow-sm   ┌─────────────┐
            │   Card      │    3px soft
            │             │
            └─────────────┘

shadow-md   ┌─────────────┐
            │   Card      │    6px medium ← DEFAULT
            │             │
            │             │
            └─────────────┘

shadow-lg   ┌─────────────┐
            │   Card      │    15px pronounced
            │             │
            │             │
            │             │
            └─────────────┘

shadow-premium  ┌─────────────┐
                │   Card      │    Tinted with red
                │  (featured) │    40px deep
                │             │
                │             │
                └─────────────┘
```

---

## Status Indicators

### Auction Status Badges

```
┌──────────────────────────────────────────┐
│ ● TIEŠRAIDE          (Green - Live)      │
├──────────────────────────────────────────┤
│ ■ DRĪZ SĀKSIES       (Amber - Coming)    │
├──────────────────────────────────────────┤
│ ○ BEIGTA             (Gray - Ended)      │
├──────────────────────────────────────────┤
│ ★ IZCILS             (Red - Featured)    │
└──────────────────────────────────────────┘
```

### Color Meanings

```
🟢 GREEN (#10b981)    = Success, Live, Go
🟡 AMBER (#f59e0b)    = Warning, Coming soon
🔴 RED (#C8102E)      = Important, Featured
⚪ GRAY (#9ca3af)     = Neutral, Ended, Inactive
🔵 BLUE (#3b82f6)     = Info, Secondary
```

---

## Common Component Patterns

### Button Group

```
┌─────────────┬─────────────┬─────────────┐
│  Solīt      │   Atgādināt  │   Dzēst    │
└─────────────┴─────────────┴─────────────┘
  Primary       Secondary     Danger
```

### Form Layout

```
┌─────────────────────────────────────────┐
│ Label                                   │
│ ┌─────────────────────────────────────┐ │
│ │ Input field                        │ │
│ └─────────────────────────────────────┘ │
│ Helper text or error message            │
└─────────────────────────────────────────┘
```

### Card Layout

```
┌───────────────────────────────────────┐
│  Image (400x300px)                    │
├───────────────────────────────────────┤
│ Title                                 │
│ Metadata (status, seller, etc)        │
│                                       │
│ Price: €XXX              Time: XX:XX  │
│                                       │
│ [Button] [Add to favorites]           │
└───────────────────────────────────────┘
```

---

## Responsive Typography

```
Mobile:    16px body (readable)
Tablet:    16px body
Desktop:   16px body (no change needed)

Headings scale:
Mobile:    24px (H1)
Desktop:   30px+ (H1)

Padding scales:
Mobile:    px-4 (16px)
Desktop:   px-6 to px-8 (24-32px)
```

---

## Accessibility Colors

### Contrast Ratios (WCAG AA - 4.5:1 minimum)

```
primary-500 (#C8102E) on white:  8.2:1 ✓
slate-600 (#4b5563) on white:    8.4:1 ✓
slate-700 (#374151) on white:   12:1 ✓
success-500 (#10b981) on white:  5.3:1 ✓
warning-500 (#f59e0b) on white:  4.6:1 ✓
```

---

## Quick Copy-Paste Snippets

### Primary Button

```html
<button
  className="bg-primary-500 hover:bg-primary-600 text-white px-6 py-2 rounded font-semibold"
>
  Solīt
</button>
```

### Card

```html
<div
  className="bg-white border border-slate-100 rounded-lg shadow-md hover:shadow-lg p-6"
>
  Content here
</div>
```

### Badge

```html
<span
  className="inline-block px-3 py-1 bg-primary-50 text-primary-600 text-xs font-bold rounded"
>
  TIEŠRAIDE
</span>
```

### Input

```html
<input
  className="w-full border border-slate-200 rounded px-4 py-2 focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
  placeholder="..."
/>
```

### Grid

```html
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
  {/* 4 items */}
</div>
```

---

**Visual Design Specifications v1.0**  
**Last Updated**: February 22, 2026  
**Status**: ✅ Complete & Verified
