# Latvian Auction House Design System

**Official Latvijas Izsole Design Guidelines**

## 🎨 Design Philosophy

The design is based on the official Latvian Auction House (Latvijas Izsole) visual identity - a professional, clean, and trustworthy platform for buying and selling premium assets. The system emphasizes clarity, professionalism, and user confidence.

---

## 📐 Color Palette

### Primary Color - Latvian Red

The defining color of the platform - represents trust, authority, and professional excellence.

```
primary-50:   #fef5f5    (Ultra Light)
primary-100:  #fce8e8    (Very Light)
primary-200:  #f8c8c8    (Light)
primary-300:  #f0a5a5    (Medium Light)
primary-400:  #e07f7f    (Medium)
primary-500:  #C8102E    ⭐ OFFICIAL PRIMARY
primary-600:  #a60d26    (Bold)
primary-700:  #7f0a1e    (Dark)
primary-800:  #5a0716    (Very Dark)
primary-900:  #3d050f    (Darkest)
```

### Neutral Colors - Slate Gray

Professional, clean palette for typography, backgrounds, and borders.

```
slate-50:   #f9fafb    (Background)
slate-100:  #f3f4f6    (Light Background)
slate-200:  #e5e7eb    (Borders)
slate-300:  #d1d5db    (Hover)
slate-400:  #9ca3af    (Secondary Text)
slate-500:  #6b7280    (Text)
slate-600:  #4b5563    (Bold Text)
slate-700:  #374151    (Dark Text)
slate-800:  #1f2937    (Very Dark)
slate-900:  #111827    (Darkest)
```

### Semantic Colors

For status, alerts, and specific states.

```
Success:    #10b981 (Emerald)
Warning:    #f59e0b (Amber)
Danger:     #ef4444 (Red)
Info:       #3b82f6 (Blue)
```

---

## 🔤 Typography System

### Font Family

**Primary**: Inter (sans-serif)  
Used for all body text, headers, and UI elements. Clean, modern, professional.

### Font Sizes

```
xs:    12px / 16px line-height  (Small labels, captions)
sm:    14px / 20px line-height  (Body text, secondary)
base:  16px / 24px line-height  (Default body text)
lg:    18px / 28px line-height  (Section headers)
xl:    20px / 28px line-height  (Subheadings)
2xl:   24px / 32px line-height  (Page titles)
3xl:   30px / 36px line-height  (Hero titles)
4xl:   36px / 42px line-height  (Large headers)
5xl:   48px / 56px line-height  (Hero sections)
```

### Font Weights

```
Regular:  400  (Default)
Medium:   500  (Emphasis)
Semibold: 600  (Strong)
Bold:     700  (Headings)
Extrabold: 800 (Hero text)
```

---

## 📏 Spacing System

Consistent spacing creates visual harmony and breathing room.

```
xs:   0.25rem  (4px)    - Minimal spacing
sm:   0.5rem   (8px)    - Compact spacing
md:   1rem     (16px)   - Standard spacing
lg:   1.5rem   (24px)   - Comfortable spacing
xl:   2rem     (32px)   - Large spacing
2xl:  2.5rem   (40px)   - Extra large
3xl:  3rem     (48px)   - Hero spacing
```

---

## 🎭 Shadows & Elevation

### Shadow System

Professional shadows for depth and hierarchy without being distracting.

```
xs:      0 1px 2px rgba(0, 0, 0, 0.05)
sm:      0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06)
md:      0 4px 6px rgba(0, 0, 0, 0.2), 0 2px 4px rgba(0, 0, 0, 0.1)
lg:      0 10px 15px rgba(0, 0, 0, 0.1), 0 4px 6px rgba(0, 0, 0, 0.05)
premium: 0 20px 40px rgba(200, 16, 46, 0.15)  - Red-tinted for emphasis
```

---

## 🔘 Border Radius

Clean, professional corners - not overly rounded.

```
none:  0px     (Square)
sm:    4px     (Minimal rounding) ⭐ PREFERRED
md:    8px     (Subtle rounding)
lg:    12px    (Comfortable rounding)
xl:    16px    (Card corners)
2xl:   20px    (Large elements)
full:  9999px  (Pills & circles)
```

---

## 🧩 Component Library

All components follow the Latvian design system and use the color palette above.

### Button Component

```tsx
// Variants available:
- primary    (Latvian Red background)
- secondary  (Slate outline)
- danger     (Red for destructive actions)
- ghost      (No background)
- outline    (Border only)

// Sizes:
- sm   (Small: 12px, px-4 py-1.5)
- md   (Medium: 14px, px-6 py-2)
- lg   (Large: 16px, px-8 py-3)
- xl   (Extra Large: 18px, px-10 py-4)

// Features:
- Loading state with spinner
- Icon support (left/right positioned)
- Disabled state styling
- Hover transitions
- Focus ring for accessibility
```

### Card Component

```tsx
// Elevation levels:
- none       (No shadow)
- sm         (Subtle shadow)
- md         (Standard shadow)
- lg         (Pronounced shadow)
- xl         (Deep shadow)
- premium    (Red-tinted shadow for featured items)

// Features:
- Hoverable option with smooth transitions
- Border: 1px slate-200
- Rounded corners (md default)
- Optional background colors
```

### Input Component

```tsx
// Features:
- Label with required indicator (*)
- Placeholder text support
- Error state with red text (danger-500)
- Helper text in secondary color
- Icon support (left/right positioning)
- Size variants: sm, md, lg
- Disabled state styling
- Form validation ready
```

### Badge Component

```tsx
// Variants:
- primary   (Latvian Red)
- success   (Green)
- warning   (Amber)
- danger    (Red)
- neutral   (Slate Gray)

// Sizes:
- sm        (Small: 12px)
- md        (Medium: 14px)
- lg        (Large: 16px)

// Features:
- Optional dot indicator for status
- Used for: Status, tags, counters
```

### AuctionCard Component

```tsx
// Display Elements:
- Product image with hover zoom
- Status badge (TIEŠRAIDE / DRĪZ SĀKSIES / BEIGTA)
- Title with truncation
- Current bid (bold, primary color)
- Time remaining
- Bid count with Users icon
- Location tag (optional)
- Verified checkmark (optional)
- Action button (Solīt or Atgādināt)

// Responsive:
- Mobile: Full width
- Tablet: 2 columns
- Desktop: 3-4 columns
- Smooth animations on hover
```

---

## 📱 Layout Guidelines

### Header

- Height: 80px (h-20)
- Logo + branding on left
- Navigation links on right
- Sticky positioning at top
- Light background with subtle shadow
- Responsive: Stack on mobile

### Sidebar (Featured Section)

- Gradient background (primary-600 → primary-800)
- White text
- Rounded corners (rounded-xl)
- Call-to-action with app download buttons
- Only visible on lg+ screens

### Main Content Grid

- Max width: 1280px (7xl container)
- Padding: 32px (lg) / 24px (md) / 16px (sm)
- Grid: 1 col mobile, 4 col desktop
- Gap: 24px between items

### Category Cards

- Grid: 4 columns on desktop, 2 on tablet, 1 on mobile
- Height: Auto (flex)
- Icon display with emoji
- Count badge in primary color
- Hover effect: shadow-md transition
- Border: 1px slate-200

### Auction Cards

- Fixed height image: 160px
- Rounded corners: rounded-lg
- Shadow: md on default, lg on hover
- Responsive grid layout
- Status badge with live indicator

### Footer

- Background: slate-100
- Border top: slate-200
- Centered text content
- Copyright information
- Dark text on light background

---

## 🎬 Transitions & Animations

### Duration

- Subtle: 200ms
- Standard: 300ms
- Smooth: 500ms

### Effects

- Hover color changes: 200ms
- Shadow transitions: 300ms
- Zoom/scale: 500ms (image hovers)
- Opacity: 200ms

### Easing

- Standard: ease (default)
- Smooth: ease-in-out for complex animations

---

## 🌐 Responsive Design

### Breakpoints

```
Mobile:      < 640px   (1 column, full width)
Small:       640px+    (2 columns)
Medium:      1024px+   (2-3 columns)
Large:       1280px+   (3-4 columns, max width)
```

### Mobile-First Approach

1. Start with mobile single-column layout
2. Add breakpoints for larger screens
3. Sidebar hidden on mobile (lg: block)
4. Navigation responsive
5. Text sizes scale appropriately

---

## 💡 Design Principles

1. **Trust & Authority**: Professional colors and clean layout
2. **Clarity**: Clear hierarchy, readable text, obvious CTAs
3. **Simplicity**: No unnecessary complexity or decoration
4. **Consistency**: Same components used throughout
5. **Accessibility**: Color contrast, semantic HTML, ARIA labels
6. **Performance**: Minimal animations, optimized images

---

## 📋 Component Usage Examples

### Primary Button (Call-to-Action)

```tsx
<Button variant="primary" size="lg">
  Pieteikšanās
</Button>
```

Red background, white text, hover to darker red.

### Secondary Button

```tsx
<Button variant="secondary" size="md">
  Izveidot kontu
</Button>
```

Border outline, slate colors, hover fill.

### Auction Card

```tsx
<div className="bg-white rounded-lg shadow-md hover:shadow-lg">
  <img className="group-hover:scale-105 transition-transform" />
  <Badge variant="primary">TIEŠRAIDE</Badge>
  <p className="text-primary-600 font-black">€42,500</p>
</div>
```

### Category Card

```tsx
<div className="bg-slate-100 hover:shadow-md p-4 rounded-lg">
  <div className="text-2xl">🚗</div>
  <h4>Automašīnas</h4>
  <p className="text-primary-600">912 Izsoles</p>
</div>
```

---

## 🔄 Design System Updates

This design system applies to:

- ✅ HomePage (completely redesigned)
- ✅ All components (Button, Card, Input, Badge, AuctionCard)
- ✅ Tailwind configuration (color palette, shadows, spacing)
- ⏳ All other pages (to be updated with matching design)
- ⏳ Forms pages (Login, Register)
- ⏳ Detail pages (AuctionDetail, Profile)
- ⏳ Additional pages (Watchlist, MyAuctions)

---

## 📐 File Locations

- **Design Config**: `frontend/tailwind.config.js`
- **Components**: `frontend/src/components/`
- **HomePage**: `frontend/src/pages/HomePage.tsx`
- **Other Pages**: `frontend/src/pages/*.tsx`

---

## ✨ Design Quality Checklist

Before implementing new features, ensure:

- [ ] Color palette matches (primary-500: #C8102E)
- [ ] Typography uses Inter font
- [ ] Spacing follows md unit system
- [ ] Shadows follow elevation system
- [ ] Border radius is sm (4px) preferred
- [ ] Components are reusable
- [ ] Responsive on mobile/tablet/desktop
- [ ] Hover states are clear
- [ ] Focus states for accessibility
- [ ] No hardcoded colors - use Tailwind tokens
- [ ] Loading states visible
- [ ] Error states visible
- [ ] Empty states handled

---

**Last Updated**: February 22, 2026  
**Version**: 1.0 - Latvian Auction House Official Design System  
**Status**: ✅ Active & Enforced
