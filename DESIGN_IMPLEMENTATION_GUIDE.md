# Design Implementation Guide - Latvian Auction House

## Overview

The entire application has been redesigned to match the official **Latvian Auction House (Latvijas Izsole)** visual identity. This guide shows how to apply the design system to remaining pages.

## ✅ Completed

### Homepage (`frontend/src/pages/HomePage.tsx`)

- ✅ Full Latvian design implementation
- ✅ Category grid with emojis and counts
- ✅ Featured auctions section
- ✅ Responsive grid layout (1/2/4 columns)
- ✅ Status badges (TIEŠRAIDE / DRĪZ SĀKSIES)
- ✅ Professional header and footer
- ✅ Sidebar with call-to-action

### Components (`frontend/src/components/`)

- ✅ Button.tsx - Updated color scheme
- ✅ Card.tsx - Updated shadows
- ✅ Input.tsx - Updated styling
- ✅ Badge.tsx - Updated colors
- ✅ AuctionCard.tsx - Updated layout

### Design System (`frontend/tailwind.config.js`)

- ✅ Primary: Latvian Red (#C8102E)
- ✅ Neutral: Slate Gray palette
- ✅ Shadows & Elevation system
- ✅ Typography: Inter font
- ✅ Spacing system (xs-3xl)
- ✅ Border radius scale

---

## 📋 Remaining Pages to Update

### 1. LoginPage (`frontend/src/pages/LoginPage.tsx`)

**Design Elements**:

- Clean, centered layout (max-w-md)
- Latvian Auction House branding
- Email/Password inputs with proper styling
- Primary red "Pieteikšanās" button
- Link to RegisterPage
- Optional: Feature showcase on right side

**Template Structure**:

```tsx
<div className="min-h-screen flex">
  {/* Left: Logo & Form */}
  <div className="w-full md:w-1/2 bg-white flex items-center justify-center p-8">
    <div className="w-full max-w-md">
      {/* Logo */}
      <div className="flex items-center gap-2 mb-8">
        <div className="w-12 h-12 bg-primary-500 rounded flex items-center justify-center text-white font-bold">
          L
        </div>
        <div>
          <div className="font-bold text-xl">LATVIJAS</div>
          <div className="text-xs tracking-widest text-slate-500">IZSOLE</div>
        </div>
      </div>

      <h1 className="text-3xl font-bold mb-2">Pieteikšanās</h1>
      <p className="text-slate-600 mb-8">Ielogojieties savā kontā</p>

      {/* Form */}
      <Input label="E-pasts" type="email" placeholder="vards@example.com" />
      <Input
        label="Parole"
        type="password"
        placeholder="••••••••"
        className="mt-4"
      />

      <Button variant="primary" size="lg" className="w-full mt-6">
        Pieteikties
      </Button>

      <p className="text-center text-slate-600 text-sm mt-4">
        Nav konta?{" "}
        <a href="/register" className="text-primary-600 hover:underline">
          Reģistrēties
        </a>
      </p>
    </div>
  </div>

  {/* Right: Feature image */}
  <div className="hidden md:flex w-1/2 bg-gradient-to-br from-primary-600 to-primary-800 items-center justify-center p-8">
    {/* Hero content */}
  </div>
</div>
```

**Color Usage**:

- Background: white
- Text: slate-900
- Primary buttons: primary-500 (Latvian Red)
- Links: primary-600
- Input borders: slate-200
- Helper text: slate-500

---

### 2. RegisterPage (`frontend/src/pages/RegisterPage.tsx`)

**Similar to LoginPage** with additional fields:

- Name field
- Email field
- Password field (with strength indicator)
- Confirm password field
- Checkbox for terms & conditions
- "Izveidot kontu" button (primary red)

**Design principles same as LoginPage**

---

### 3. AuctionDetailPage (`frontend/src/pages/AuctionDetailPage.tsx`)

**Layout**:

```tsx
<div className="min-h-screen bg-slate-50">
  {/* Header - same as HomePage */}

  <div className="max-w-7xl mx-auto px-4 py-8">
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Left: Image Gallery */}
      <div className="lg:col-span-2">
        <div className="bg-white rounded-lg overflow-hidden shadow-md mb-6">
          <img className="w-full h-96 object-cover" src={auction.image} />
          {/* Thumbnail gallery below */}
        </div>

        {/* Auction Details */}
        <Card className="mb-6">
          <h1 className="text-3xl font-bold mb-4">{auction.title}</h1>
          <Badge variant="primary" className="mb-4">
            TIEŠRAIDE
          </Badge>

          {/* Description, specs, etc */}
        </Card>
      </div>

      {/* Right: Bidding Sidebar */}
      <div>
        <Card className="mb-6">
          <p className="text-slate-600 text-sm">Pašreizējā cena</p>
          <p className="text-4xl font-black text-primary-600">€{currentBid}</p>

          <div className="bg-slate-50 p-4 rounded mt-4 mb-4">
            <p className="text-xs text-slate-600">Atlicis</p>
            <p className="text-2xl font-bold">{timeRemaining}</p>
          </div>

          <Button variant="primary" size="lg" className="w-full mb-3">
            Solīt
          </Button>

          <Button variant="outline" size="lg" className="w-full">
            Pievienot favorītiem
          </Button>
        </Card>

        {/* Seller info */}
        <Card>
          <div className="flex items-center gap-3 mb-4">
            <img className="w-12 h-12 rounded-full" />
            <div>
              <p className="font-bold">{seller.name}</p>
              <p className="text-xs text-slate-600">⭐ 4.8 (125 atsauksmes)</p>
            </div>
          </div>

          <Button variant="secondary" size="sm" className="w-full">
            Skatīt citus objektus
          </Button>
        </Card>
      </div>
    </div>
  </div>
</div>
```

**Colors**:

- Primary button: primary-500
- Secondary button: outline style
- Price: primary-600
- Background: slate-50/white
- Text: slate-900/600

---

### 4. ProfilePage (`frontend/src/pages/ProfilePage.tsx`)

**Layout**:

```tsx
<div className="min-h-screen bg-slate-50">
  {/* Header */}

  <div className="max-w-7xl mx-auto px-4 py-8">
    {/* Cover Photo & Avatar */}
    <div className="bg-white rounded-lg overflow-hidden shadow-md mb-8">
      <div className="h-32 bg-gradient-to-r from-primary-600 to-primary-800"></div>
      <div className="px-8 pb-8">
        <div className="flex items-end gap-6">
          <img className="w-24 h-24 rounded-full border-4 border-white -mt-12" />
          <div>
            <h1 className="text-3xl font-bold">{user.name}</h1>
            <p className="text-slate-600">⭐ 4.8 | 127 atsauksmes</p>
          </div>
        </div>
      </div>
    </div>

    {/* Tabs: About, Auctions, Bids */}
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Main content */}
      {/* Sidebar with stats */}
    </div>
  </div>
</div>
```

---

### 5. MyAuctionsPage (`frontend/src/pages/MyAuctionsPage.tsx`)

**Layout**:

```tsx
<div className="min-h-screen bg-slate-50">
  {/* Header */}

  <div className="max-w-7xl mx-auto px-4 py-8">
    <h1 className="text-3xl font-bold mb-4">Manas izsoles</h1>

    {/* Tabs */}
    <div className="flex gap-2 mb-8 border-b border-slate-200">
      <button className="px-4 py-2 border-b-2 border-primary-600 text-primary-600 font-bold">
        Aktīvās (12)
      </button>
      <button className="px-4 py-2 text-slate-600">Pabeigtas (34)</button>
      <button className="px-4 py-2 text-slate-600">Plānotas (5)</button>
    </div>

    {/* Auction grid */}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {/* AuctionCard components */}
    </div>
  </div>
</div>
```

---

### 6. WatchlistPage (`frontend/src/pages/WatchlistPage.tsx`)

**Similar to MyAuctionsPage**:

- Title: "Mani iecienītie"
- List/Grid view toggle
- Sort options (Price, Time Remaining, Recently Added)
- Remove from watchlist button on each card

---

## 🎨 Common Design Patterns

### Header (Used on All Pages)

```tsx
<header className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div className="flex justify-between items-center h-20">
      {/* Logo */}
      {/* Navigation */}
      {/* Auth Buttons */}
    </div>
  </div>
</header>
```

### Page Container

```tsx
<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
  {/* Content */}
</div>
```

### Form Layout

```tsx
<Card className="max-w-md mx-auto">
  <h1 className="text-2xl font-bold mb-6">Title</h1>

  <Input label="Field 1" placeholder="..." className="mb-4" />
  <Input label="Field 2" placeholder="..." className="mb-6" />

  <Button variant="primary" size="lg" className="w-full">
    Submit
  </Button>
</Card>
```

---

## 🔨 Implementation Checklist

For each page update:

- [ ] Use correct primary color (#C8102E)
- [ ] Apply proper spacing (md units)
- [ ] Use component library (Button, Card, Input, Badge)
- [ ] Add proper shadows (md on cards, lg on hover)
- [ ] Ensure responsive layout
- [ ] Add proper typography (fonts, weights, sizes)
- [ ] Include hover states
- [ ] Test accessibility (color contrast, focus states)
- [ ] Check mobile responsiveness
- [ ] Verify all colors use Tailwind tokens (no hardcoded)

---

## 📱 Responsive Classes

Use these classes consistently:

```tsx
// Grid columns
grid-cols-1           // Mobile
md:grid-cols-2        // Tablet
lg:grid-cols-3        // Desktop
lg:grid-cols-4        // Large desktop

// Padding
px-4                  // Mobile (16px)
sm:px-6               // Small (24px)
lg:px-8               // Large (32px)

// Width
w-full                // Mobile full width
lg:w-2/3              // Desktop 2/3 width
max-w-md              // Max content width

// Display
hidden md:block       // Hide on mobile, show on tablet+
lg:col-span-1         // Span on grid
```

---

## 🎯 Next Steps

1. **Update LoginPage** with design system
2. **Update RegisterPage** with design system
3. **Update AuctionDetailPage** with design system
4. **Update ProfilePage** with design system
5. **Update MyAuctionsPage** with design system
6. **Update WatchlistPage** with design system
7. **Test all pages** on mobile/tablet/desktop
8. **Verify colors** against official palette
9. **Check accessibility** scores
10. **Deploy** with confidence

---

## 📞 Design Questions?

Refer to:

- **Color Reference**: [LATVIAN_DESIGN_SYSTEM.md](./LATVIAN_DESIGN_SYSTEM.md)
- **Component Docs**: Individual component files in `frontend/src/components/`
- **Tailwind Config**: `frontend/tailwind.config.js`
- **HomePage Example**: `frontend/src/pages/HomePage.tsx` (fully implemented reference)

---

**Status**: ✅ Design System Complete & Ready for Implementation  
**Last Updated**: February 22, 2026
