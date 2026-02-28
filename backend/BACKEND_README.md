# Auction Platform - Backend API

Enterprise-grade Django REST API for the Auction Platform marketplace.

## Overview

Production-ready Django backend with 7 modular applications handling:

- User authentication and profiles
- Auction management
- Real-time bidding
- Payment processing
- Notifications
- Fraud detection
- Admin management

## Technology Stack

- Django 4.2
- Django REST Framework 3.14
- PostgreSQL / SQLite
- Redis 7+
- Celery 5.3
- Django Channels 4.0
- Daphne 4.0
- JWT Authentication
- Stripe / PayPal API

## Project Structure

```
backend/
├── config/              # Project configuration
│   ├── settings.py     # Django settings (480+ lines)
│   ├── urls.py         # URL routing
│   ├── asgi.py         # ASGI server (Channels)
│   ├── wsgi.py         # WSGI server
│   └── celery.py       # Celery configuration
│
├── apps/               # Django applications
│   ├── users/          # User & profile management
│   │   ├── models.py       # User, Profile, BusinessAccount
│   │   ├── views.py        # User API views
│   │   ├── serializers.py  # DRF serializers
│   │   └── urls.py         # App routing
│   │
│   ├── auctions/       # Auction listing & management
│   │   ├── models.py       # Auction, Lot, Category
│   │   ├── views.py        # Auction API views
│   │   ├── serializers.py  # Serializers
│   │   └── urls.py         # App routing
│   │
│   ├── bidding/        # Bidding & WebSockets
│   │   ├── models.py       # Bid, AutoBidRule
│   │   ├── consumers.py    # WebSocket consumer
│   │   ├── routing.py      # WebSocket routing
│   │   ├── views.py        # Bidding API
│   │   ├── serializers.py  # Serializers
│   │   └── urls.py         # App routing
│   │
│   ├── payments/       # Payment processing
│   │   ├── models.py       # Payment, Invoice, Subscription
│   │   ├── views.py        # Payment API
│   │   ├── serializers.py  # Serializers
│   │   └── urls.py         # App routing
│   │
│   ├── notifications/  # Notifications & messaging
│   │   ├── models.py       # Notification, Message, AuditLog
│   │   ├── views.py        # Notification API
│   │   ├── serializers.py  # Serializers
│   │   └── urls.py         # App routing
│   │
│   ├── fraud/          # Fraud detection
│   │   ├── models.py       # FraudSignal, VelocityCheck
│   │   ├── views.py        # Fraud API
│   │   ├── serializers.py  # Serializers
│   │   └── urls.py         # App routing
│   │
│   └── adminpanel/     # Admin interface
│       ├── models.py       # Settings, AdminLog, Report
│       ├── views.py        # Admin API
│       ├── serializers.py  # Serializers
│       └── urls.py         # App routing
│
├── manage.py           # Django management CLI
├── requirements.txt    # Python dependencies
├── .env.example        # Environment variables template
├── Dockerfile         # Docker configuration
└── README.md          # This file
```

## Installation

### Prerequisites

```bash
# Python 3.11+
python --version

# PostgreSQL (optional, SQLite used by default)
# Redis (optional, for Celery)
```

### Setup

1. **Create virtual environment**

```bash
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
```

2. **Install dependencies**

```bash
pip install -r requirements.txt
```

3. **Configure environment**

```bash
cp .env.example .env
# Edit .env with your settings
```

4. **Run migrations**

```bash
python manage.py migrate
```

5. **Create superuser**

```bash
python manage.py createsuperuser
```

6. **Run server**

```bash
python manage.py runserver
```

API will be available at: **http://localhost:8000/api**

## Configuration

### Environment Variables

See `.env.example` for all options:

```env
# Django
DJANGO_DEBUG=True
DJANGO_SECRET_KEY=your-secret-key
DJANGO_ALLOWED_HOSTS=localhost,127.0.0.1

# Database (PostgreSQL)
DATABASE_ENGINE=postgres
DATABASE_NAME=auction_platform
DATABASE_USER=postgres
DATABASE_PASSWORD=password
DATABASE_HOST=localhost
DATABASE_PORT=5432

# Redis (for Celery)
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_DB=0

# Stripe
STRIPE_PUBLIC_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...

# Email
EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend
EMAIL_HOST=smtp.gmail.com
EMAIL_HOST_USER=your-email@gmail.com
EMAIL_HOST_PASSWORD=your-app-password
```

## Apps Documentation

### Users App

**Models:**

- `User` - Custom user model with additional fields
- `UserProfile` - Extended profile with KYC and verification
- `BusinessAccount` - Business seller subscriptions

**Endpoints:**

- `GET /api/users/` - List users
- `POST /api/users/` - Register
- `GET /api/users/me/` - Current user
- `GET/PUT /api/users/profile/` - User profile
- `GET /api/users/business/` - Business account

### Auctions App

**Models:**

- `Category` - Auction categories
- `Auction` - Main auction listing
- `Lot` - Item being auctioned
- `AuctionImage` - Item images
- `Watchlist` - Saved auctions
- `FeatureFlag` - Feature toggles

**Endpoints:**

- `GET /api/auctions/` - List auctions
- `POST /api/auctions/` - Create auction
- `GET /api/auctions/{id}/` - Auction detail
- `PATCH /api/auctions/{id}/` - Update auction
- `POST /api/auctions/{id}/activate/` - Activate auction
- `GET /api/auctions/my_auctions/` - Seller's auctions
- `GET /api/auctions/watchlist/` - User's watchlist
- `POST /api/auctions/watchlist/` - Add to watchlist
- `DELETE /api/auctions/watchlist/` - Remove from watchlist

### Bidding App

**Models:**

- `Bid` - Individual bid
- `AutoBidRule` - Proxy bidding rules
- `BidHistory` - Immutable bid history

**Endpoints:**

- `POST /api/bidding/bids/` - Place bid
- `GET /api/bidding/bids/` - User's bids
- `GET /api/bidding/bids/auction_bids/` - Auction bids
- `POST /api/bidding/auto-bid/` - Create auto-bid rule
- `GET /api/bidding/auto-bid/` - User's auto-bid rules
- `PUT /api/bidding/auto-bid/` - Update auto-bid rule

**WebSocket:**

- `WS /ws/auction/{id}/` - Real-time bid updates

### Payments App

**Models:**

- `Payment` - Payment records
- `Invoice` - Auction winning invoices
- `Subscription` - Business subscriptions
- `Escrow` - Payment escrow

**Endpoints:**

- `POST /api/payments/payments/` - Create payment
- `GET /api/payments/payments/` - User's payments
- `POST /api/payments/payments/{id}/confirm/` - Confirm payment
- `GET /api/payments/invoices/` - User's invoices
- `GET /api/payments/subscription/` - User's subscription
- `POST /api/payments/subscription/` - Update subscription
- `POST /api/payments/stripe-webhook/` - Stripe webhook

### Notifications App

**Models:**

- `Notification` - User notifications
- `Message` - Direct messages
- `AuditLog` - Action audit trail

**Endpoints:**

- `GET /api/notifications/notifications/` - User's notifications
- `GET /api/notifications/notifications/unread/` - Unread notifications
- `POST /api/notifications/notifications/{id}/mark_as_read/` - Mark as read
- `GET /api/notifications/messages/` - User's messages
- `POST /api/notifications/messages/` - Send message
- `GET /api/notifications/messages/inbox/` - Inbox
- `GET /api/notifications/messages/sent/` - Sent messages
- `POST /api/notifications/messages/{id}/mark_as_read/` - Mark as read

### Fraud App

**Models:**

- `FraudSignal` - Fraud detection signals
- `MultiAccountDetection` - Linked accounts detection
- `VelocityCheck` - Activity velocity monitoring

**Endpoints:**

- `GET /api/fraud/signals/` - All fraud signals (admin)
- `GET /api/fraud/signals/unreviewed/` - Unreviewed signals
- `GET /api/fraud/signals/high_risk/` - High-risk signals
- `POST /api/fraud/signals/{id}/review/` - Review signal

### Admin Panel App

**Models:**

- `SystemSettings` - Global system settings
- `AdminLog` - Admin action logs
- `Report` - User reports

**Endpoints:**

- `GET /api/admin/settings/` - System settings
- `PUT /api/admin/settings/` - Update settings
- `POST /api/admin/users/ban/` - Ban user
- `POST /api/admin/users/unban/` - Unban user
- `GET /api/admin/reports/` - User reports
- `GET /api/admin/dashboard/` - Dashboard metrics

## Running Services

### Celery Worker

```bash
celery -A config worker -l info
```

### Celery Beat (Scheduler)

```bash
celery -A config beat -l info
```

### ASGI Server (Daphne)

```bash
daphne -b 0.0.0.0 -p 8000 config.asgi:application
```

### Production Server (Gunicorn)

```bash
gunicorn config.wsgi:application --bind 0.0.0.0:8000 --workers 4
```

## Database Schema

### Core Tables

- `users_user` - Custom user model (500+ MB potential)
- `users_profile` - User preferences and KYC
- `users_business_account` - Business accounts
- `auctions_category` - Auction categories
- `auctions_auction` - Main auction listings
- `auctions_lot` - Items being auctioned
- `auctions_image` - Product images
- `auctions_watchlist` - User watchlists (indexed)
- `bidding_bid` - Bid records (indexed)
- `bidding_auto_bid_rule` - Proxy bidding (unique together)
- `bidding_bid_history` - Immutable bid history
- `payments_payment` - Payment records (indexed)
- `payments_invoice` - Invoices
- `payments_subscription` - Subscriptions
- `payments_escrow` - Escrow accounts
- `notifications_notification` - Notifications (indexed)
- `notifications_message` - Direct messages (indexed)
- `notifications_audit_log` - Audit trail (indexed)
- `fraud_signal` - Fraud signals (indexed)
- `fraud_multi_account_detection` - Account linking
- `fraud_velocity_check` - Activity velocity
- `adminpanel_system_settings` - Settings
- `adminpanel_admin_log` - Admin logs
- `adminpanel_report` - User reports

## Testing

```bash
# Run all tests
pytest

# Run specific app tests
pytest backend/apps/auctions/

# Run with coverage
pytest --cov=backend/apps

# Run specific test
pytest backend/apps/auctions/tests.py::test_create_auction
```

## API Documentation

### Swagger UI

http://localhost:8000/api/schema/swagger/

### ReDoc

http://localhost:8000/api/schema/redoc/

### OpenAPI Schema

http://localhost:8000/api/schema/

## Authentication

All endpoints (except login/register) require JWT token:

```bash
# Login
curl -X POST http://localhost:8000/api/auth/token/ \
  -H "Content-Type: application/json" \
  -d '{"username":"user","password":"pass"}'

# Response:
{
  "access": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGc..."
}

# Use access token in requests:
curl http://localhost:8000/api/users/me/ \
  -H "Authorization: Bearer <access_token>"

# Refresh token when expired:
curl -X POST http://localhost:8000/api/auth/token/refresh/ \
  -H "Content-Type: application/json" \
  -d '{"refresh":"<refresh_token>"}'
```

## Permissions

- `IsAuthenticatedOrReadOnly` - Read public, write if authenticated
- `IsAuthenticated` - Must be logged in
- `IsAdminUser` - Admin only

## Pagination

```bash
GET /api/auctions/?page=1&page_size=20
```

Response:

```json
{
  "count": 100,
  "next": "http://../?page=2",
  "previous": null,
  "results": [...]
}
```

## Filtering & Search

```bash
# Filter by status
GET /api/auctions/?status=active

# Search
GET /api/auctions/?search=laptop

# Order by
GET /api/auctions/?ordering=-created_at

# Combine
GET /api/auctions/?status=active&search=laptop&ordering=-current_price
```

## Rate Limiting

- Anonymous: 100 requests/hour
- Authenticated: 1000 requests/hour

## Logging

Logs are written to `logs/django.log` with rotation:

- Max file size: 15MB
- Backup count: 10 files

## Troubleshooting

### ModuleNotFoundError

```bash
pip install --force-reinstall -r requirements.txt
```

### Database locked

```bash
python manage.py migrate zero
python manage.py migrate
```

### Port 8000 in use

```bash
python manage.py runserver 8001
```

### Permission denied on logs

```bash
mkdir -p logs
chmod 755 logs
```

## Security Headers

The API includes:

- CSRF protection
- CORS validation
- Rate limiting
- XSS protection
- SQL injection prevention
- Secure password hashing

## Monitoring

Key metrics to monitor:

- API response time
- Database query performance
- Redis cache hit rate
- Celery task queue length
- Active WebSocket connections
- Fraud signal alerts

## Performance Tips

1. Enable query caching with Redis
2. Use database indexing
3. Optimize slow queries
4. Use connection pooling
5. Cache frequently accessed data
6. Use async tasks for long operations
7. Monitor database size

## Deployment

See [SETUP.md](../SETUP.md) for deployment instructions.

## Support

- Django Docs: https://docs.djangoproject.com/
- DRF Docs: https://www.django-rest-framework.org/
- Celery Docs: https://docs.celeryproject.io/
- Channels Docs: https://channels.readthedocs.io/

---

**Backend API Version: 1.0.0**
**Last Updated: February 22, 2026**
