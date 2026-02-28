# Auction Platform - Frontend

Enterprise-grade React + TypeScript frontend for the Auction Platform marketplace.

## Overview

Production-ready React application with:

- Real-time auction bidding via WebSockets
- User authentication with JWT
- Server state management with React Query
- Client state with Zustand
- Responsive design with Tailwind CSS
- Type-safe development with TypeScript

## Technology Stack

- React 18
- TypeScript 5.x
- Vite 5.x
- React Router v6
- React Query 5.25
- Zustand 4.4
- Axios 1.6
- Tailwind CSS 3.3
- Lucide React (icons)
- React Hook Form with Zod validation

## Project Structure

```
frontend/
├── public/                  # Static assets
│   └── favicon.ico
│
├── src/
│   ├── components/         # Reusable React components
│   │   ├── Header.tsx      # Navigation header
│   │   └── Footer.tsx      # Page footer
│   │
│   ├── pages/              # Page components (route-based)
│   │   ├── HomePage.tsx         # Auction listing
│   │   ├── LoginPage.tsx        # Login form
│   │   ├── RegisterPage.tsx     # Registration form
│   │   ├── AuctionDetailPage.tsx # Auction with live bidding
│   │   ├── ProfilePage.tsx       # User profile
│   │   ├── MyAuctionsPage.tsx   # User's auctions
│   │   └── WatchlistPage.tsx    # Saved auctions
│   │
│   ├── features/           # Feature-specific modules (future)
│   │   └── ...
│   │
│   ├── hooks/              # Custom React hooks
│   │   └── useApi.ts       # API queries and mutations
│   │
│   ├── services/           # External service clients
│   │   ├── api.ts          # HTTP client (APIClient)
│   │   └── websocket.ts    # WebSocket service
│   │
│   ├── store/              # Zustand state stores
│   │   ├── authStore.ts    # Authentication state
│   │   └── auctionStore.ts # Auction state
│   │
│   ├── types/              # TypeScript type definitions
│   │   └── index.ts        # All interfaces and types
│   │
│   ├── utils/              # Utility functions
│   │   └── helpers.ts      # Formatting and helpers
│   │
│   ├── App.tsx             # Root component
│   ├── main.tsx            # Entry point
│   └── index.css           # Global styles
│
├── .env.example            # Environment variables template
├── index.html              # HTML template
├── vite.config.ts          # Vite configuration
├── tsconfig.json           # TypeScript configuration
├── tailwind.config.js      # Tailwind CSS config
├── postcss.config.js       # PostCSS config
├── package.json            # Dependencies
├── Dockerfile              # Docker configuration
└── README.md              # This file
```

## Installation

### Prerequisites

```bash
# Node 18+
node --version
npm --version

# or yarn
yarn --version
```

### Setup

1. **Install dependencies**

```bash
npm install
# or: yarn install
```

2. **Configure environment**

```bash
cp .env.example .env.local
# Edit .env.local with your settings
```

3. **Start development server**

```bash
npm run dev
```

App will be available at: **http://localhost:5173**

## Environment Variables

Create `.env.local` based on `.env.example`:

```env
# API Configuration
VITE_API_URL=http://localhost:8000/api
VITE_WS_URL=ws://localhost:8000/ws

# Feature flags
VITE_ENABLE_PAYMENTS=true
VITE_ENABLE_REAL_TIME=true
```

## Scripts

```bash
# Development
npm run dev              # Start dev server
npm run dev:host        # Expose on network

# Build
npm run build           # Production build
npm run build:analyze   # Analyze bundle

# Preview
npm run preview         # Preview production build

# Linting
npm run lint            # ESLint check
npm run lint:fix        # Auto-fix issues

# Formatting
npm run format          # Prettier format
```

## Component Hierarchy

```
App
├── <ProtectedRoute>
│   ├── HomePage
│   │   ├── Header
│   │   ├── Hero Section
│   │   ├── Auction Grid
│   │   │   └── AuctionCard (map)
│   │   └── Footer
│   │
│   ├── AuctionDetailPage
│   │   ├── Header
│   │   ├── Auction Details
│   │   │   ├── Image Gallery
│   │   │   ├── Bid History
│   │   │   └── Bid Form
│   │   ├── WebSocket Connection
│   │   └── Footer
│   │
│   ├── MyAuctionsPage
│   │   ├── Header
│   │   ├── Auction Table
│   │   └── Footer
│   │
│   ├── WatchlistPage
│   │   ├── Header
│   │   ├── Auction Grid (Watchlist)
│   │   └── Footer
│   │
│   ├── ProfilePage
│   │   ├── Header
│   │   ├── Profile Stats
│   │   └── Footer
│   │
│   └── ... other protected pages
│
├── LoginPage
│   ├── Login Form
│   └── Register Link
│
├── RegisterPage
│   ├── Registration Form
│   └── Login Link
│
└── <Fallback to Login>
```

## State Management

### Zustand Stores

#### authStore.ts

```typescript
// Authentication state
- user: User | null
- isAuthenticated: boolean
- isLoading: boolean
- error: string | null

// Methods
- login(username, password)
- logout()
- register(userData)
- fetchCurrentUser()
```

#### auctionStore.ts

```typescript
// Auction state
- selectedAuction: Auction | null
- auctions: Auction[]
- bids: Bid[]
- isLoading: boolean

// Methods
- setSelectedAuction(auction)
- updateAuctionBid(auction_id, bid)
- addBid(bid)
```

### React Query Hooks

```typescript
// useAuth()
- User info with auto-refresh
- Login/logout mutations
- Registration mutation

// useAuctions(page, filters)
- Paginated auction listing
- Real-time filtering
- Search and sorting

// useAuction(auctionId)
- Single auction details
- Auto-refresh on WebSocket update

// usePlaceBid(auctionId)
- Place bid mutation
- Automatic cache invalidation
- Error handling

// useWatchlist()
- Add/remove watchlist mutations
- Instant UI updates

// useNotifications()
- Auto-refresh every 30 seconds
- Read/unread filtering

// useCreateAuction()
- Create new auction mutation
- File upload support

// useUpdateAuction(auctionId)
- Update auction details
- Only for auction creator
```

## WebSocket Integration

### Real-time Bidding

```typescript
// Connection
WS /ws/auction/{auctionId}/

// Message Types
{
  type: 'bid_placed',
  auction_id: 123,
  bid: {
    id: 456,
    amount: 150.50,
    bidder: 'username',
    created_at: '2026-02-22T10:30:00Z'
  }
}

{
  type: 'auction_ending_soon',
  auction_id: 123,
  time_remaining: 300  // seconds
}
```

### Auto-reconnection

- Attempts: 5
- Delay: 1s, 2s, 4s, 8s, 16s (exponential backoff)
- Automatic cleanup on disconnect

## API Endpoints

### Authentication

```
POST   /api/auth/token/           # Login
POST   /api/auth/token/refresh/   # Refresh token
POST   /api/users/                # Register
```

### Users

```
GET    /api/users/me/             # Current user
GET/PUT /api/users/profile/        # User profile
GET    /api/users/business/       # Business account
```

### Auctions

```
GET    /api/auctions/             # List auctions
POST   /api/auctions/             # Create auction
GET    /api/auctions/{id}/        # Auction details
PATCH  /api/auctions/{id}/        # Update auction
POST   /api/auctions/{id}/activate/ # Activate
GET    /api/auctions/my_auctions/ # User's auctions
GET    /api/auctions/watchlist/   # Watchlist
POST   /api/auctions/watchlist/   # Add to watchlist
DELETE /api/auctions/watchlist/   # Remove from watchlist
```

### Bidding

```
POST   /api/bidding/bids/         # Place bid
GET    /api/bidding/bids/         # User's bids
GET    /api/bidding/bids/auction_bids/ # Auction bids
POST   /api/bidding/auto-bid/     # Create auto-bid
GET    /api/bidding/auto-bid/     # User's auto-bids
PUT    /api/bidding/auto-bid/     # Update auto-bid
```

### Payments

```
POST   /api/payments/payments/    # Create payment
GET    /api/payments/payments/    # User's payments
GET    /api/payments/invoices/    # User's invoices
GET    /api/payments/subscription/ # User's subscription
```

### Notifications

```
GET    /api/notifications/notifications/     # Notifications
GET    /api/notifications/messages/          # Messages
POST   /api/notifications/messages/          # Send message
```

## Type Definitions

All TypeScript interfaces in `src/types/index.ts`:

```typescript
// User & Auth
-User -
  UserProfile -
  BusinessAccount -
  AuthResponse -
  LoginRequest -
  RegisterRequest -
  // Auctions
  Auction -
  Category -
  Lot -
  AuctionImage -
  Watchlist -
  // Bidding
  Bid -
  AutoBidRule -
  BidHistory -
  // Payments
  Payment -
  Invoice -
  Subscription -
  // Notifications
  Notification -
  Message -
  // API
  PaginatedResponse <
  T >
  -APIError - APIResponse<T>;
```

## Styling

### Tailwind Configuration

```javascript
// Colors
- primary: #3B82F6 (blue)
- success: #10B981 (green)
- danger: #EF4444 (red)
- warning: #F59E0B (amber)

// Custom components
- .btn, .btn-primary, .btn-secondary
- .card
- .input-field
- .badge, .badge-success, etc.
```

### Global Styles

CSS variables and utility classes in `index.css`:

- Button styles (primary, secondary, danger)
- Card containers
- Form inputs
- Responsive grid
- Dark mode support (future)

## Forms & Validation

Using React Hook Form with Zod:

```typescript
// Example: Login form
const schema = z.object({
  username: z.string().min(3),
  password: z.string().min(8),
});

const form = useForm({ resolver: zodResolver(schema) });
```

## Error Handling

### API Errors

```typescript
// Automatic extraction of error messages
const error = response.data.detail || "Unknown error";
```

### WebSocket Errors

```typescript
// Auto-reconnection on connection failure
// Manual reconnect button if max attempts exceeded
```

### Form Errors

```typescript
// Field-level validation errors displayed inline
// Generic error toast for submission failures
```

## Performance Optimizations

1. **Code Splitting** - Lazy load route components
2. **Image Optimization** - Lazy load auction images
3. **Query Caching** - React Query 5-minute cache
4. **Debouncing** - Search input with 300ms delay
5. **Memoization** - useMemo for expensive calculations

## Security

- XSS Prevention - React's built-in XSS protection
- CSRF Protection - Django CSRF tokens in requests
- Token Security - JWT stored in secure storage
- API Validation - Input validation on client and server
- HTTPS Recommended - For production deployments

## Debugging

### Redux DevTools

Browser extension for state inspection (if Redux configured)

### Network Tab

Monitor API requests and WebSocket connections

### Console Logs

Key events logged:

```
[Auth] User logged in: username
[API] GET /api/auctions/ → 200
[WS] Connected to ws://...
[WS] Message: bid_placed
```

## Testing

```bash
# Future: Unit tests with Vitest
npm run test

# Future: E2E tests with Playwright
npm run test:e2e

# Future: Component tests with Testing Library
npm run test:components
```

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Build Output

Production build:

```
dist/
├── index.html          # Main HTML (< 5KB)
├── assets/
│   ├── main.*.js      # Main bundle
│   ├── vendor.*.js    # Dependencies
│   └── style.*.css    # Styles
└── ...
```

Expected sizes:

- HTML: 5 KB
- JS (gzipped): ~150 KB
- CSS (gzipped): ~20 KB

## Deployment

### Docker

```bash
docker build -t auction-frontend .
docker run -p 80:80 auction-frontend
```

### Static Hosting (Vercel, Netlify)

```bash
npm run build
# Deploy dist/ folder
```

### Environment-specific Builds

```bash
# Development
npm run build

# Staging
VITE_API_URL=https://api-staging.example.com npm run build

# Production
VITE_API_URL=https://api.example.com npm run build
```

## Monitoring

Key metrics to track:

- Page load time (< 2s target)
- Time to interactive (< 3s target)
- API response time (< 200ms target)
- WebSocket connection stability (99%+ uptime)
- Error rate (< 1%)

## Troubleshooting

### CORS Errors

```
Ensure VITE_API_URL matches Django's CORS_ALLOWED_ORIGINS
```

### WebSocket Connection Failed

```
Check WS_URL matches Django Channels config
Verify Daphne is running on correct port
```

### Blank Page

```
Check browser console for errors
Verify .env.local is configured
Clear cache: Ctrl+Shift+Delete
```

### Build Errors

```bash
# Clear node_modules
rm -rf node_modules
npm install

# Clear Vite cache
rm -rf .vite
npm run build
```

## Dependencies

### Core

- react@18.2
- react-dom@18.2
- react-router-dom@6.20
- typescript@5.3

### State Management

- zustand@4.4
- @tanstack/react-query@5.25

### HTTP & WebSockets

- axios@1.6
- (WebSocket via native browser API)

### Forms & Validation

- react-hook-form@7.48
- @hookform/resolvers@3.3
- zod@3.22

### Styling

- tailwindcss@3.3
- postcss@8.4
- autoprefixer@10.4

### UI

- lucide-react@0.294
- clsx@2.0

### Development

- @vitejs/plugin-react@4.2
- vite@5.0
- eslint@8.55
- prettier@3.1

## Resources

- React: https://react.dev
- Vite: https://vitejs.dev
- TypeScript: https://www.typescriptlang.org/
- Tailwind: https://tailwindcss.com
- React Query: https://tanstack.com/query
- Zustand: https://github.com/pmndrs/zustand

---

**Frontend Version: 1.0.0**
**Last Updated: February 22, 2026**
