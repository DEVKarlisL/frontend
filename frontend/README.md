# Auction Platform Frontend

React + TypeScript + Vite frontend for the Enterprise Auction Marketplace

## Features

- Real-time auction bidding with WebSocket support
- User authentication with JWT
- Responsive design with Tailwind CSS
- State management with Zustand
- Data fetching with React Query
- Type-safe development with TypeScript

## Project Structure

```
src/
  components/        # Reusable UI components
  pages/            # Page components (routes)
  features/         # Feature-specific components and logic
  hooks/            # Custom React hooks
  services/         # API service layer
  store/            # Zustand state management
  utils/            # Utility functions
  types/            # TypeScript type definitions
  App.tsx           # Main app component
  main.tsx          # Entry point
```

## Getting Started

### Install Dependencies

```bash
npm install
```

### Development Server

```bash
npm run dev
```

### Build for Production

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

### Type Checking

```bash
npm run type-check
```

### Linting & Formatting

```bash
npm run lint
npm run format
```

## Configuration

### Environment Variables

Create a `.env.local` file:

```env
VITE_API_URL=http://localhost:8000/api
VITE_WS_URL=ws://localhost:8000/ws
VITE_APP_NAME=Auction Platform
```

## API Integration

The frontend communicates with the Django REST API:

- Base URL: `http://localhost:8000/api`
- Authentication: JWT Bearer tokens
- WebSocket: Real-time bidding updates

## Key Libraries

- **React Query**: Server state management
- **Zustand**: Client state management
- **Axios**: HTTP client
- **React Router**: Navigation
- **Tailwind CSS**: Styling
- **React Hook Form**: Form handling

## Authentication Flow

1. User logs in with credentials
2. Backend returns JWT access and refresh tokens
3. Access token stored in secure storage
4. Refresh token used to obtain new access token when expired
5. All API requests include Authorization header

## WebSocket Connection

For real-time auction updates:

```typescript
const ws = new WebSocket(`ws://localhost:8000/ws/auction/${auctionId}/`);
```

## Production Deployment

1. Build the application: `npm run build`
2. Output is in `dist/` directory
3. Serve with any static file server or CDN
4. Set `VITE_API_URL` to production API URL

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
