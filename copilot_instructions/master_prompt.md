# MASTER PROMPT — Enterprise Auction Platform (EmiratesAuction-level clone)

You are a senior enterprise software architect and full-stack engineer.

Your task is to build a production-grade, scalable, secure, mobile-ready auction platform similar in functionality, architecture, and behavior to emiratesauction.com.

The system MUST be built using:

BACKEND:

* Django 5+
* Django REST Framework
* PostgreSQL
* Redis
* Celery
* Django Channels (WebSockets)
* JWT Authentication
* Docker ready

FRONTEND:

* React 18+
* TypeScript
* Vite
* TailwindCSS
* React Query
* Zustand
* PWA support
* Mobile-first responsive design

The system must be designed so it can later be converted into mobile apps using React Native without backend changes.

---

# SYSTEM ARCHITECTURE

Create TWO completely separate applications:

/backend → Django REST API server
/frontend → React frontend client

They must communicate only via REST API and WebSockets.

Never mix frontend and backend code.

---

# BACKEND REQUIREMENTS

Create full Django project structure:

backend/
manage.py
config/
settings.py
urls.py
asgi.py
wsgi.py
apps/
users/
auctions/
bids/
payments/
notifications/
vehicles/
media/
core/

Each app must include:

models.py
views.py
serializers.py
urls.py
admin.py
services.py

---

# CORE FEATURES TO IMPLEMENT

User system:

* registration
* login/logout
* JWT authentication
* profile management
* profile verification
* user roles:

  * admin
  * seller
  * bidder

Auction system:

* create auction
* edit auction
* delete auction
* start auction
* end auction automatically
* reserve price
* buy now price
* minimum increment
* auction status tracking

Bid system:

* place bid
* validate bid amount
* reject invalid bids
* store bid history
* determine winning bid
* real-time updates using WebSockets

Vehicle system:

* vehicle listings
* vehicle images
* vehicle details
* vehicle ownership

Payment system:

* payment tracking
* payment status
* transaction history
* payment validation

Notification system:

* real-time bid notifications
* auction win notification
* auction loss notification

Media system:

* image upload
* image storage
* multiple images per auction

Admin system:

* full admin dashboard
* manage users
* manage auctions
* manage bids
* manage payments

---

# REAL-TIME REQUIREMENTS

Use Django Channels and Redis.

Must support:

* live bidding
* instant bid updates
* instant auction status updates

---

# SECURITY REQUIREMENTS

Implement:

* JWT authentication
* permission classes
* role-based access control
* secure API endpoints
* input validation
* protection against common attacks

---

# FRONTEND REQUIREMENTS

Create full React project structure:

frontend/
src/
app/
pages/
features/
auth/
auctions/
bids/
users/
payments/
components/
services/
hooks/
store/
types/
utils/

Implement:

Authentication pages:

* login
* register

Auction pages:

* auction list
* auction details
* create auction
* live bidding page

User pages:

* profile page
* dashboard

---

# FRONTEND TECH REQUIREMENTS

Use:

React Query → API communication
Axios → HTTP client
Zustand → state management
TailwindCSS → styling

Implement:

* clean architecture
* reusable components
* mobile-first design
* responsive layout
* professional UI

---

# MOBILE REQUIREMENTS

Frontend MUST be:

* fully responsive
* PWA ready
* easily portable to React Native

Avoid browser-only dependencies.

---

# API REQUIREMENTS

Implement REST endpoints:

/api/auth/
/api/users/
/api/auctions/
/api/bids/
/api/payments/
/api/notifications/

Follow REST best practices.

---

# PERFORMANCE REQUIREMENTS

Implement:

* database indexing
* efficient queries
* pagination
* caching using Redis

---

# CODE QUALITY REQUIREMENTS

Code must be:

* production-grade
* clean
* modular
* secure
* scalable
* fully structured

Never generate placeholder code.

Always generate complete working implementations.

---

# DEVELOPMENT ORDER

Always follow this order when generating code:

1. backend config
2. backend models
3. backend serializers
4. backend views
5. backend urls
6. backend websocket consumers
7. frontend API services
8. frontend state management
9. frontend pages
10. frontend components

---

# OUTPUT REQUIREMENTS

When generating code:

* Always generate full files
* Never generate partial snippets
* Always include imports
* Always include working logic

---

# FINAL GOAL

The result must be a fully functional enterprise auction platform backend and frontend ready for production deployment and future mobile app conversion.
