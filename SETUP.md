# Setup & Installation Guide

Complete step-by-step guide to get the Auction Platform running.

## Prerequisites

### System Requirements

- **Python**: 3.11 or higher
- **Node.js**: 18 LTS or higher
- **PostgreSQL**: 14+ (optional if using SQLite for development)
- **Redis**: 7+ (optional if not using Celery)
- **Docker**: 20+ (optional, recommended for production)

### Installation

#### Windows

1. Install Python from https://www.python.org/downloads/
2. Install Node.js from https://nodejs.org/
3. Install PostgreSQL from https://www.postgresql.org/download/windows/
4. Install Redis from https://github.com/microsoftarchive/redis/releases

#### macOS

```bash
# Using Homebrew
brew install python node postgresql redis
```

#### Linux (Ubuntu/Debian)

```bash
sudo apt-get update
sudo apt-get install python3.11 nodejs postgresql postgresql-contrib redis-server
```

## Backend Setup (Django)

### Step 1: Create Virtual Environment

```bash
cd backend

# Windows
python -m venv venv
venv\Scripts\activate

# macOS/Linux
python3 -m venv venv
source venv/bin/activate
```

### Step 2: Install Dependencies

```bash
pip install -r requirements.txt
```

### Step 3: Configure Environment

Copy `.env.example` to `.env` and update values:

```bash
cp .env.example .env
```

Edit `backend/.env`:

```env
DJANGO_DEBUG=True
DJANGO_SECRET_KEY=your-secret-key-here-change-in-production
DATABASE_ENGINE=sqlite3
# For PostgreSQL:
# DATABASE_ENGINE=postgres
# DATABASE_NAME=auction_platform
# DATABASE_USER=postgres
# DATABASE_PASSWORD=yourpassword
# DATABASE_HOST=localhost
```

### Step 4: Database Migrations

```bash
# Create tables
python manage.py migrate

# Create superuser for admin
python manage.py createsuperuser
# Follow prompts to create admin account
```

### Step 5: Collect Static Files

```bash
python manage.py collectstatic --noinput
```

### Step 6: Create Logs Directory

```bash
mkdir -p logs
```

### Step 7: Run Development Server

```bash
python manage.py runserver
```

The API should be available at: **http://localhost:8000/api**

Admin panel: **http://localhost:8000/admin**

### Step 8: Start Celery Workers (Optional)

In separate terminals:

```bash
# Worker
celery -A config worker -l info

# Beat (Scheduler)
celery -A config beat -l info
```

## Frontend Setup (React)

### Step 1: Install Dependencies

```bash
cd frontend
npm install
```

### Step 2: Configure Environment

```bash
cp .env.example .env.local
```

Edit `frontend/.env.local`:

```env
VITE_API_URL=http://localhost:8000/api
VITE_WS_URL=ws://localhost:8000/ws
```

### Step 3: Run Development Server

```bash
npm run dev
```

The application should be available at: **http://localhost:5173**

### Step 4: Build for Production

```bash
npm run build
# Output will be in dist/ folder
```

## Docker Setup (Recommended for Production)

### Prerequisites

- Docker Desktop installed
- Docker Compose installed

### Step 1: Build Images

```bash
docker-compose build
```

### Step 2: Start Services

```bash
docker-compose up -d
```

This will start:

- PostgreSQL database
- Redis cache
- Django backend (with Daphne ASGI server)
- Celery worker
- Celery beat scheduler
- React frontend

### Step 3: Initialize Database

```bash
# Run migrations
docker-compose exec backend python manage.py migrate

# Create superuser
docker-compose exec backend python manage.py createsuperuser

# Collect static files
docker-compose exec backend python manage.py collectstatic --noinput
```

### Step 4: Access the Application

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:8000/api
- **Admin**: http://localhost:8000/admin
- **PostgreSQL**: localhost:5432
- **Redis**: localhost:6379

### Useful Docker Commands

```bash
# View logs
docker-compose logs -f backend
docker-compose logs -f frontend

# Execute command in container
docker-compose exec backend python manage.py shell
docker-compose exec backend python manage.py createsuperuser

# Stop services
docker-compose down

# Remove volumes (careful - deletes data)
docker-compose down -v

# Rebuild after code changes
docker-compose up -d --build
```

## Database Setup

### Using PostgreSQL (Production)

```bash
# Create database and user
sudo -u postgres psql

-- In PostgreSQL shell:
CREATE DATABASE auction_platform;
CREATE USER auction_user WITH PASSWORD 'secure_password';
ALTER ROLE auction_user SET client_encoding TO 'utf8';
ALTER ROLE auction_user SET default_transaction_isolation TO 'read committed';
ALTER ROLE auction_user SET default_transaction_deferrable TO on;
ALTER ROLE auction_user SET default_transaction_level TO 'read committed';
ALTER ROLE auction_user SET timezone TO 'UTC';
GRANT ALL PRIVILEGES ON DATABASE auction_platform TO auction_user;
\q
```

Update `backend/.env`:

```env
DATABASE_ENGINE=postgres
DATABASE_NAME=auction_platform
DATABASE_USER=auction_user
DATABASE_PASSWORD=secure_password
DATABASE_HOST=localhost
DATABASE_PORT=5432
```

### Using SQLite (Development)

Default option. Just ensure `backend/.env` has:

```env
DATABASE_ENGINE=sqlite3
```

## Redis Setup

### macOS (Homebrew)

```bash
brew install redis
brew services start redis
```

### Linux

```bash
sudo apt-get install redis-server
sudo systemctl start redis-server
```

### Windows

Use Docker or WSL2 recommended.

Verify Redis is running:

```bash
redis-cli ping
# Should return: PONG
```

## Testing

### Backend Tests

```bash
cd backend
pytest

# Run specific test file
pytest backend/apps/auctions/tests.py

# Run with coverage
pytest --cov=backend/apps
```

### Frontend Tests

```bash
cd frontend
npm test

# Run specific test file
npm test -- HomePage.test.tsx

# Run with coverage
npm test -- --coverage
```

## Troubleshooting

### Backend Issues

#### Port 8000 already in use

```bash
# Find process using port 8000
lsof -i :8000

# Kill the process
kill -9 <PID>

# Or use different port
python manage.py runserver 8001
```

#### Database errors

```bash
# Reset migrations
python manage.py migrate zero

# Reapply all migrations
python manage.py migrate

# Clear database and start fresh (development only)
rm db.sqlite3
python manage.py migrate
python manage.py createsuperuser
```

#### Module not found errors

```bash
# Reinstall dependencies
pip install --force-reinstall -r requirements.txt

# Update pip
pip install --upgrade pip
```

### Frontend Issues

#### npm ERR! code ERESOLVE

```bash
npm install --legacy-peer-deps
```

#### Port 5173 already in use

```bash
npm run dev -- --port 3001
```

#### Vite can't connect to backend

Check `VITE_API_URL` in `.env.local` matches your backend URL.

### Docker Issues

#### Container won't start

```bash
# Check logs
docker-compose logs backend

# Rebuild
docker-compose down
docker-compose up -d --build
```

#### Permission denied errors

```bash
# On Linux, might need sudo
sudo docker-compose up -d

# Or fix Docker permissions
sudo usermod -aG docker $USER
newgrp docker
```

## Production Deployment

### Security Checklist

- [ ] Change `DJANGO_SECRET_KEY` to a strong random value
- [ ] Set `DJANGO_DEBUG=False`
- [ ] Set `ALLOWED_HOSTS` to your domain
- [ ] Configure SSL/TLS certificates
- [ ] Set strong database password
- [ ] Configure email service (SMTP)
- [ ] Set Stripe production keys
- [ ] Configure backup strategy
- [ ] Set up monitoring and alerts
- [ ] Enable Django security middleware
- [ ] Configure CORS properly
- [ ] Set up log aggregation

### Environment Variables for Production

```env
# Django
DJANGO_DEBUG=False
DJANGO_SECRET_KEY=your-very-secure-secret-key-here
DJANGO_ALLOWED_HOSTS=yourdomain.com,www.yourdomain.com

# Database
DATABASE_ENGINE=postgres
DATABASE_NAME=auction_platform
DATABASE_USER=auction_user
DATABASE_PASSWORD=very_secure_password
DATABASE_HOST=db.yourdomain.com
DATABASE_PORT=5432
DATABASE_SSL_MODE=require

# Redis
REDIS_HOST=redis.yourdomain.com
REDIS_PORT=6379

# CORS
CORS_ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com

# Email
EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=your-email@gmail.com
EMAIL_HOST_PASSWORD=your-app-password

# Stripe (Production)
STRIPE_PUBLIC_KEY=pk_live_your_public_key
STRIPE_SECRET_KEY=sk_live_your_secret_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret

# Security
SECURE_SSL_REDIRECT=True
SESSION_COOKIE_SECURE=True
CSRF_COOKIE_SECURE=True
```

### Deployment Steps

1. **Using Heroku**:

```bash
heroku login
heroku create your-app-name
git push heroku main
heroku run python manage.py migrate
```

2. **Using AWS ECS**:
   - Push Docker images to ECR
   - Create ECS task definitions
   - Configure RDS for PostgreSQL
   - Configure ElastiCache for Redis
   - Set up load balancer

3. **Using DigitalOcean**:
   - Deploy with App Platform
   - Use Managed Databases
   - Use Managed Redis
   - Configure domain and SSL

## Monitoring

### Django Admin

Access at `/admin/` with superuser credentials.

### API Documentation

- Swagger UI: `/api/schema/swagger/`
- ReDoc: `/api/schema/redoc/`

### Health Checks

```bash
# Backend health
curl http://localhost:8000/api/users/me/

# Frontend health
curl http://localhost:5173/
```

## Performance Optimization

### Backend

- Enable database query caching with Redis
- Use database connection pooling
- Enable Gzip compression
- Use CDN for static files
- Monitor slow queries

### Frontend

- Build with `npm run build`
- Use production API URL
- Enable service workers
- Optimize images
- Minify CSS/JS

## Resources

- [Django Documentation](https://docs.djangoproject.com/)
- [React Documentation](https://react.dev/)
- [Vite Documentation](https://vitejs.dev/)
- [Django REST Framework](https://www.django-rest-framework.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Docker Documentation](https://docs.docker.com/)

## Support

For issues or questions:

1. Check the [README.md](./README.md)
2. Review [Architecture Documentation](./docs/system_architecture_full.md)
3. Check existing issues in GitHub
4. Create a new issue with detailed information

---

**Happy auctioning! 🎯**
