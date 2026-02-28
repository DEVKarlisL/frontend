# API Implementation Roadmap

**Created**: February 22, 2026  
**Target**: Complete REST API + WebSocket implementation  
**Priority**: Sequential implementation following master_prompt.md

---

## Phase 1: User Authentication & Management

### Models ✅

- `User` (custom)
- `UserProfile`
- `BusinessAccount`

### API Endpoints to Create

#### Authentication

```python
# POST /api/auth/token/
# Input: { "username": "...", "password": "..." }
# Output: { "access": "...", "refresh": "..." }

# POST /api/auth/token/refresh/
# Input: { "refresh": "..." }
# Output: { "access": "..." }

# POST /api/users/register/
# Input: { "username": "...", "email": "...", "password": "...", "full_name": "..." }
# Output: User object + tokens

# POST /api/auth/logout/
# BlackList refresh token
```

#### User Management

```python
# GET /api/users/me/
# Returns current authenticated user

# GET/PUT /api/users/profile/
# Get or update user profile

# GET/PUT /api/users/business/
# Get or update business account

# POST /api/users/avatar/
# Upload profile picture

# GET /api/users/{id}/
# Get other user profile (public)
```

### Implementation Steps

1. Create `UserSerializer`, `ProfileSerializer`, `BusinessSerializer`
2. Create `UserViewSet` with custom actions
3. Create JWT token endpoints
4. Implement permission classes:
   - `IsOwnerOrReadOnly`
   - `IsAuthenticated`
5. Add token refresh logic
6. Create tests

### Files to Create

- `backend/apps/users/serializers.py`
- `backend/apps/users/views.py`
- `backend/apps/users/permissions.py`
- `backend/apps/users/urls.py`
- `backend/apps/users/tests.py`

---

## Phase 2: Auction Listings

### Models ✅

- `Category`
- `Auction`
- `Lot`
- `AuctionImage`
- `Watchlist`

### API Endpoints

```python
# GET /api/auctions/
# Query params: status, category, search, ordering, page
# Return: Paginated list with images

# POST /api/auctions/
# Create new auction (seller only)
# Input: { "title": "...", "description": "...", "category": ... }

# GET /api/auctions/{id}/
# Full auction details with images and bids

# PATCH /api/auctions/{id}/
# Update auction (seller only)

# DELETE /api/auctions/{id}/
# Delete auction (seller only, before first bid)

# POST /api/auctions/{id}/activate/
# Start auction countdown

# POST /api/auctions/{id}/end/
# Manually end auction (admin/seller)

# GET /api/auctions/active/
# List only active auctions

# GET /api/auctions/ending-soon/
# List auctions ending in < 24 hours

# GET /api/auctions/my-auctions/
# Seller's own auctions

# GET /api/auctions/watchlist/
# User's watchlist

# POST /api/auctions/{id}/watch/
# Add to watchlist

# DELETE /api/auctions/{id}/watch/
# Remove from watchlist

# GET /api/categories/
# List all categories

# POST /api/auctions/{id}/images/
# Upload images
```

### Implementation Steps

1. Create serializers with image nesting
2. Create viewsets with filtering/search
3. Implement permissions:
   - `IsSellerOrReadOnly` - Can edit own auctions
   - `CanActivateAuction` - Seller can activate
4. Add image upload handling
5. Implement auction status transitions
6. Add auction ending logic (Celery task)
7. Create comprehensive tests

### Files to Create

- `backend/apps/auctions/serializers.py` (major)
- `backend/apps/auctions/views.py` (major)
- `backend/apps/auctions/permissions.py`
- `backend/apps/auctions/urls.py`
- `backend/apps/auctions/filters.py` (custom filters)
- `backend/apps/auctions/tasks.py` (Celery tasks)

---

## Phase 3: Bidding System

### Models ✅

- `Bid`
- `AutoBidRule`
- `BidHistory`

### API Endpoints

```python
# POST /api/bids/
# Place a bid
# Input: { "auction_id": ..., "amount": ... }
# Validation: amount > current_bid + minimum_increment

# GET /api/bids/?auction_id={id}
# Get auction bids

# GET /api/bids/my-bids/
# Get user's bids

# GET /api/bids/winning/
# Get bids user is winning

# GET /api/bids/losing/
# Get bids user is losing

# POST /api/auto-bids/
# Create auto-bid rule
# Input: { "auction_id": ..., "max_bid": ... }

# GET /api/auto-bids/
# Get user's auto-bid rules

# PUT /api/auto-bids/{id}/
# Update auto-bid rule

# DELETE /api/auto-bids/{id}/
# Delete auto-bid rule

# GET /api/bid-history/?auction_id={id}
# Get immutable bid history
```

### Implementation Steps

1. Create `BidSerializer` with validation
2. Create custom validators:
   - Bid must be > current_bid + increment
   - Auction must be active
   - Bidder can't be seller
3. Create AutoBid proxy bidding logic
4. Implement real-time bid notifications
5. Create bid history logging
6. Add anti-sniping (extend auction if bid near end)
7. Create tests

### Files to Create

- `backend/apps/bidding/serializers.py`
- `backend/apps/bidding/views.py`
- `backend/apps/bidding/permissions.py`
- `backend/apps/bidding/urls.py`
- `backend/apps/bidding/validators.py` (custom bid validation)
- `backend/apps/bidding/tasks.py` (auto-bid processing)

---

## Phase 4: WebSocket Real-time Bidding

### WebSocket Endpoints

```python
# WS /ws/auction/{auction_id}/
# Connect to live bidding room

# Message Types (from server to client):
{
    "type": "bid_placed",
    "auction_id": 1,
    "bidder": "username",
    "amount": 45000,
    "timestamp": "2026-02-22T10:30:00Z",
    "total_bids": 5
}

{
    "type": "auto_bid_triggered",
    "auction_id": 1,
    "amount": 46000,
    "auto_bidder": "username"
}

{
    "type": "auction_ending_soon",
    "auction_id": 1,
    "seconds_remaining": 60
}

{
    "type": "auction_ended",
    "auction_id": 1,
    "winner": "username",
    "final_bid": 50000
}

{
    "type": "user_outbid",
    "auction_id": 1,
    "new_bid": 46000
}
```

### Implementation Steps

1. Create `AuctionConsumer` with Channels
2. Implement consumer methods:
   - `connect()` - Join auction room
   - `disconnect()` - Leave auction room
   - `receive()` - Handle incoming bid
   - `bid_placed()` - Broadcast bid update
3. Setup Redis channel layer
4. Create routing configuration
5. Implement authentication in WebSocket
6. Add message throttling (prevent spam)
7. Create comprehensive tests

### Files

- `backend/apps/bidding/consumers.py` (major update)
- `backend/apps/bidding/routing.py` (major update)

---

## Phase 5: Payments

### Models ✅

- `Payment`
- `Invoice`
- `Subscription`
- `Escrow`

### API Endpoints

```python
# GET /api/payments/
# Get user's payment history

# POST /api/payments/
# Create payment for won auction
# Input: { "auction_id": ..., "payment_method": "stripe|paypal" }

# GET /api/payments/{id}/
# Get payment details

# POST /api/payments/{id}/confirm/
# Confirm payment

# POST /api/payments/stripe-webhook/
# Stripe webhook handler

# POST /api/payments/paypal-webhook/
# PayPal webhook handler

# GET /api/invoices/
# Get user's invoices

# GET /api/invoices/{id}/
# Download invoice PDF

# GET /api/subscriptions/
# Get subscription status

# POST /api/subscriptions/
# Upgrade subscription

# POST /api/subscriptions/cancel/
# Cancel subscription

# GET /api/escrow/
# Get escrow transactions
```

### Implementation Steps

1. Integrate Stripe API
2. Integrate PayPal API
3. Create payment serializers
4. Implement webhook handlers
5. Create invoice generation (ReportLab)
6. Implement subscription logic
7. Add payment notifications
8. Create security tests

### Files

- `backend/apps/payments/serializers.py`
- `backend/apps/payments/views.py`
- `backend/apps/payments/urls.py`
- `backend/apps/payments/integrations/stripe_handler.py`
- `backend/apps/payments/integrations/paypal_handler.py`
- `backend/apps/payments/tasks.py`

---

## Phase 6: Notifications

### API Endpoints

```python
# GET /api/notifications/
# Get user's notifications

# GET /api/notifications/unread/
# Get unread notifications

# POST /api/notifications/{id}/read/
# Mark notification as read

# POST /api/notifications/read-all/
# Mark all as read

# POST /api/notifications/settings/
# Update notification preferences

# GET /api/messages/
# Get user's messages

# POST /api/messages/
# Send message

# GET /api/messages/conversations/
# List message conversations

# GET /api/messages/{conversation_id}/
# Get conversation messages

# POST /api/messages/{id}/read/
# Mark message as read
```

### Implementation Steps

1. Create notification system
2. Add email notifications
3. Add in-app notifications
4. Create message system
5. Add real-time WebSocket notifications
6. Create notification preferences
7. Add tests

### Files

- `backend/apps/notifications/serializers.py`
- `backend/apps/notifications/views.py`
- `backend/apps/notifications/urls.py`
- `backend/apps/notifications/tasks.py` (email sending)

---

## Phase 7: Admin Dashboard

### Endpoints

```python
# GET /api/admin/dashboard/
# Dashboard metrics

# GET /api/admin/users/
# Manage users

# PATCH /api/admin/users/{id}/
# Update user status

# POST /api/admin/users/{id}/ban/
# Ban user

# GET /api/admin/auctions/
# Manage auctions

# DELETE /api/admin/auctions/{id}/
# Remove fraudulent auction

# GET /api/admin/payments/
# View all payments

# GET /api/admin/reports/
# View user reports

# POST /api/admin/reports/{id}/resolve/
# Resolve report

# GET /api/admin/settings/
# System settings

# PUT /api/admin/settings/
# Update settings
```

---

## Testing Strategy

### Unit Tests

- Model tests (validation, methods)
- Serializer tests (data validation)
- View tests (permissions, responses)

### Integration Tests

- API endpoint tests
- WebSocket tests
- Payment integration tests

### E2E Tests

- Complete bidding flow
- Payment flow
- User registration & auth

### Performance Tests

- Load testing (concurrent bidders)
- Database query optimization
- WebSocket stability

---

## Security Considerations

### Authentication

- ✅ JWT tokens with refresh rotation
- ✅ CSRF protection for non-token requests
- ✅ Rate limiting on auth endpoints

### Authorization

- ✅ Permission classes for all endpoints
- ✅ Role-based access control
- ✅ Object-level permissions (user can only see own data)

### Data Validation

- ✅ Input validation on all endpoints
- ✅ Bid amount validation
- ✅ Payment amount validation

### API Security

- ✅ HTTPS required in production
- ✅ API versioning ready
- ✅ CORS configured

### Fraud Prevention

- ✅ Multi-bid validation
- ✅ Velocity checking
- ✅ Account linking detection

---

## Frontend API Integration

### Services to Create

```typescript
// api/client.ts
export class APIClient {
  async login(username: string, password: string);
  async register(data: RegisterData);
  async refreshToken();
  async getCurrentUser();
  async getAuctions(filters);
  async getAuction(id);
  async createAuction(data);
  async placeBid(auctionId, amount);
  async createPayment(data);
  // ... more methods
}

// services/websocket.ts
export class WebSocketService {
  connect(auctionId: number);
  onBidUpdate(callback);
  placeBid(amount);
  disconnect();
}
```

### React Hooks to Create

```typescript
// useAuth() - Authentication
// useAuctions() - Auction listing
// useAuction(id) - Auction detail
// usePlaceBid() - Place bid mutation
// usePayment() - Payment flow
// useNotifications() - Real-time notifications
// useWebSocket(auctionId) - WebSocket connection
```

---

## Development Timeline

**Estimated**: 4-6 weeks (2 developers)

| Phase            | Duration  | Priority |
| ---------------- | --------- | -------- |
| 1. Auth          | 1 week    | P0       |
| 2. Auctions      | 1 week    | P0       |
| 3. Bidding       | 1.5 weeks | P0       |
| 4. WebSocket     | 1 week    | P0       |
| 5. Payments      | 1.5 weeks | P1       |
| 6. Notifications | 0.5 weeks | P2       |
| 7. Admin         | 1 week    | P2       |
| Testing & Polish | 2 weeks   | P0       |

---

## Success Criteria

- [ ] All endpoints documented and working
- [ ] 100% code coverage for critical paths
- [ ] Real-time bidding latency < 200ms
- [ ] API handles 100+ concurrent connections
- [ ] All security tests passing
- [ ] Performance benchmarks met
- [ ] Complete API documentation (Swagger)

---

**Next Action**: Start Phase 1 implementation  
**Priority**: User authentication & JWT flow
