# Deployment & Operations Guide

Complete guide for deploying the Auction Platform to production environments.

## Table of Contents

1. [Pre-deployment Checklist](#pre-deployment-checklist)
2. [Local Development Setup](#local-development-setup)
3. [Docker Deployment](#docker-deployment)
4. [Production Deployment](#production-deployment)
5. [Monitoring & Logging](#monitoring--logging)
6. [Backup & Recovery](#backup--recovery)
7. [Security Hardening](#security-hardening)
8. [Troubleshooting](#troubleshooting)

---

## Pre-deployment Checklist

### Backend

- [ ] Review `backend/.env.example` for required variables
- [ ] Set strong `DJANGO_SECRET_KEY`
- [ ] Configure PostgreSQL connection string
- [ ] Configure Redis connection
- [ ] Set up email backend (Gmail, SendGrid, etc.)
- [ ] Configure Stripe/PayPal keys
- [ ] Enable HTTPS only (`SECURE_SSL_REDIRECT=True`)
- [ ] Set CORS origins properly
- [ ] Configure logging destinations
- [ ] Set up database backups
- [ ] Create superuser for admin

### Frontend

- [ ] Review `frontend/.env.example` for required variables
- [ ] Set `VITE_API_URL` to production backend
- [ ] Set `VITE_WS_URL` for WebSockets
- [ ] Build production bundle (`npm run build`)
- [ ] Verify bundle size acceptable
- [ ] Test API connectivity
- [ ] Configure CDN for static assets
- [ ] Enable gzip compression

### Infrastructure

- [ ] Provision servers/VPS
- [ ] Install Docker & Docker Compose
- [ ] Configure firewall rules
- [ ] Set up SSL certificates (Let's Encrypt)
- [ ] Configure domain DNS
- [ ] Set up monitoring & alerting
- [ ] Configure backup storage
- [ ] Set up CI/CD pipeline

---

## Local Development Setup

### Quick Start (5 minutes)

```bash
# 1. Clone and setup backend
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver

# 2. In another terminal, setup frontend
cd frontend
npm install
cp .env.example .env.local
npm run dev
```

Visit:

- Frontend: http://localhost:5173
- Backend API: http://localhost:8000/api
- Django Admin: http://localhost:8000/admin

### With Docker

```bash
# Copy environment files
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env.local

# Update .env with local settings
nano backend/.env

# Start services
docker-compose up -d

# Run migrations
docker-compose exec backend python manage.py migrate

# Create superuser
docker-compose exec backend python manage.py createsuperuser

# View logs
docker-compose logs -f backend
docker-compose logs -f frontend
```

Services available:

- Frontend: http://localhost:3000
- Backend API: http://localhost:8000/api
- PostgreSQL: localhost:5432
- Redis: localhost:6379

---

## Docker Deployment

### Build Images

```bash
# Build backend
docker build -f backend/Dockerfile -t auction-backend:1.0.0 backend/

# Build frontend
docker build -f frontend/Dockerfile -t auction-frontend:1.0.0 frontend/

# Tag for registry
docker tag auction-backend:1.0.0 your-registry.com/auction-backend:1.0.0
docker tag auction-frontend:1.0.0 your-registry.com/auction-frontend:1.0.0

# Push to registry
docker push your-registry.com/auction-backend:1.0.0
docker push your-registry.com/auction-frontend:1.0.0
```

### Docker Compose for Production

Create `docker-compose.prod.yml`:

```yaml
version: "3.8"

services:
  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: ${DATABASE_NAME}
      POSTGRES_USER: ${DATABASE_USER}
      POSTGRES_PASSWORD: ${DATABASE_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 10s
      timeout: 5s
      retries: 5

  redis:
    image: redis:7-alpine
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5

  backend:
    image: your-registry.com/auction-backend:1.0.0
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
    environment:
      DJANGO_DEBUG: "False"
      DJANGO_ALLOWED_HOSTS: "${DJANGO_ALLOWED_HOSTS}"
      DATABASE_URL: "postgresql://${DATABASE_USER}:${DATABASE_PASSWORD}@postgres:5432/${DATABASE_NAME}"
      REDIS_URL: "redis://redis:6379/0"
      SECURE_SSL_REDIRECT: "True"
      SESSION_COOKIE_SECURE: "True"
      CSRF_COOKIE_SECURE: "True"
    ports:
      - "8000:8000"
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8000/health/"]
      interval: 30s
      timeout: 10s
      retries: 3

  celery:
    image: your-registry.com/auction-backend:1.0.0
    command: celery -A config worker -l info
    depends_on:
      - postgres
      - redis
      - backend
    environment:
      DJANGO_DEBUG: "False"
      DATABASE_URL: "postgresql://${DATABASE_USER}:${DATABASE_PASSWORD}@postgres:5432/${DATABASE_NAME}"
      REDIS_URL: "redis://redis:6379/0"

  celery-beat:
    image: your-registry.com/auction-backend:1.0.0
    command: celery -A config beat -l info --scheduler django_celery_beat.schedulers:DatabaseScheduler
    depends_on:
      - postgres
      - redis
      - backend
    environment:
      DJANGO_DEBUG: "False"
      DATABASE_URL: "postgresql://${DATABASE_USER}:${DATABASE_PASSWORD}@postgres:5432/${DATABASE_NAME}"
      REDIS_URL: "redis://redis:6379/0"

  frontend:
    image: your-registry.com/auction-frontend:1.0.0
    ports:
      - "80:80"
    environment:
      VITE_API_URL: "${VITE_API_URL}"
      VITE_WS_URL: "${VITE_WS_URL}"

volumes:
  postgres_data:
```

### Deploy with Docker Compose

```bash
# Copy environment file
cp .env.example .env
nano .env  # Edit with production values

# Pull latest images
docker pull your-registry.com/auction-backend:1.0.0
docker pull your-registry.com/auction-frontend:1.0.0

# Start services
docker-compose -f docker-compose.prod.yml up -d

# Run migrations
docker-compose -f docker-compose.prod.yml exec backend python manage.py migrate

# Collect static files
docker-compose -f docker-compose.prod.yml exec backend python manage.py collectstatic --noinput

# Create superuser
docker-compose -f docker-compose.prod.yml exec backend python manage.py createsuperuser

# Check logs
docker-compose -f docker-compose.prod.yml logs -f
```

---

## Production Deployment

### Cloud Deployment (AWS, DigitalOcean, Heroku)

#### Option 1: AWS ECS with RDS

1. **Create RDS PostgreSQL database**

```bash
aws rds create-db-instance \
  --db-instance-identifier auction-platform-db \
  --db-instance-class db.t3.micro \
  --engine postgres \
  --master-username postgres \
  --master-user-password YOUR_PASSWORD \
  --allocated-storage 20
```

2. **Create ElastiCache Redis cluster**

```bash
aws elasticache create-cache-cluster \
  --cache-cluster-id auction-platform-redis \
  --cache-node-type cache.t3.micro \
  --engine redis
```

3. **Create ECR repositories**

```bash
aws ecr create-repository --repository-name auction-backend
aws ecr create-repository --repository-name auction-frontend

# Push images
docker tag auction-backend:1.0.0 YOUR_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/auction-backend:1.0.0
docker push YOUR_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/auction-backend:1.0.0
```

4. **Create ECS task definitions and services**

```bash
# See AWS ECS documentation for detailed setup
```

#### Option 2: DigitalOcean App Platform

```yaml
name: auction-platform

services:
  - name: backend
    github:
      branch: main
      repo: your-org/auction-platform
      build_command: pip install -r requirements.txt
    http_port: 8000
    envs:
      - key: DJANGO_DEBUG
        value: "False"
      - key: DATABASE_URL
        value: ${db.connection_string}
      - key: REDIS_URL
        value: ${redis.connection_string}

  - name: frontend
    github:
      branch: main
      repo: your-org/auction-platform
      build_command: cd frontend && npm install && npm run build
    http_port: 80
    source_dir: frontend
    envs:
      - key: VITE_API_URL
        value: "https://api.example.com"

databases:
  - name: db
    engine: PG
    version: "15"

  - name: redis
    engine: REDIS
    version: "7"
```

#### Option 3: Render.com

```yaml
# render.yaml
services:
  - type: web
    name: auction-backend
    env: python
    buildCommand: pip install -r requirements.txt && python manage.py migrate && python manage.py collectstatic --noinput
    startCommand: gunicorn config.wsgi:application --bind 0.0.0.0:8000 --workers 4
    envVars:
      - key: DJANGO_DEBUG
        value: false
      - key: DATABASE_URL
        fromDatabase:
          name: auction_db
          property: connectionString
      - key: REDIS_URL
        fromService:
          name: auction_redis
          property: connectionString

  - type: web
    name: auction-frontend
    buildCommand: cd frontend && npm install && npm run build
    startCommand: serve -s dist -l 80
    staticSiteDir: frontend/dist
    envVars:
      - key: VITE_API_URL
        value: https://auction-backend.onrender.com

  - type: pserv
    name: auction_redis
    plan: free

databases:
  - name: auction_db
    databaseName: auction_platform
```

### Kubernetes Deployment

Create `k8s/deployment.yaml`:

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: auction-backend
spec:
  replicas: 3
  selector:
    matchLabels:
      app: auction-backend
  template:
    metadata:
      labels:
        app: auction-backend
    spec:
      containers:
        - name: auction-backend
          image: your-registry.com/auction-backend:1.0.0
          ports:
            - containerPort: 8000
          env:
            - name: DJANGO_DEBUG
              value: "False"
            - name: DATABASE_URL
              valueFrom:
                secretKeyRef:
                  name: auction-secrets
                  key: database-url
            - name: REDIS_URL
              value: "redis://redis-service:6379"
          livenessProbe:
            httpGet:
              path: /health/
              port: 8000
            initialDelaySeconds: 30
            periodSeconds: 10
          readinessProbe:
            httpGet:
              path: /health/
              port: 8000
            initialDelaySeconds: 10
            periodSeconds: 5
          resources:
            requests:
              cpu: 250m
              memory: 512Mi
            limits:
              cpu: 1000m
              memory: 1Gi

---
apiVersion: v1
kind: Service
metadata:
  name: auction-backend
spec:
  type: LoadBalancer
  ports:
    - port: 80
      targetPort: 8000
  selector:
    app: auction-backend

---
apiVersion: apps/v1
kind: StatefulSet
metadata:
  name: redis
spec:
  serviceName: redis
  replicas: 1
  selector:
    matchLabels:
      app: redis
  template:
    metadata:
      labels:
        app: redis
    spec:
      containers:
        - name: redis
          image: redis:7-alpine
          ports:
            - containerPort: 6379
          volumeMounts:
            - name: redis-data
              mountPath: /data
  volumeClaimTemplates:
    - metadata:
        name: redis-data
      spec:
        accessModes: ["ReadWriteOnce"]
        resources:
          requests:
            storage: 10Gi
```

Deploy:

```bash
kubectl create secret generic auction-secrets --from-literal=database-url=$DATABASE_URL
kubectl apply -f k8s/deployment.yaml
kubectl get pods
kubectl logs -f deployment/auction-backend
```

---

## Monitoring & Logging

### Application Monitoring

Install monitoring tools:

```bash
# Option 1: Sentry for error tracking
pip install sentry-sdk

# In settings.py
import sentry_sdk
sentry_sdk.init(
    dsn="https://KEY@sentry.io/PROJECT_ID",
    traces_sample_rate=1.0
)
```

```bash
# Option 2: New Relic
pip install newrelic
NEW_RELIC_CONFIG_FILE=newrelic.ini newrelic-admin run-program python manage.py runserver
```

### Infrastructure Monitoring

```bash
# Prometheus + Grafana stack
docker run -d -p 9090:9090 prom/prometheus

# Configure Prometheus to scrape Django metrics
# Configure Grafana to visualize
```

### Log Management

```bash
# Option 1: CloudWatch (AWS)
pip install watchtower

# Option 2: ELK Stack (Elasticsearch, Logstash, Kibana)
# Option 3: Datadog
pip install datadog

# Option 4: Splunk
# Option 5: Papertrail
```

### Key Metrics to Monitor

```
Backend:
- API response time (p50, p95, p99)
- Error rate (4xx, 5xx)
- Database query time
- Cache hit rate
- Active connections
- Request count
- WebSocket connections

Frontend:
- Page load time
- Time to interactive
- JavaScript errors
- API call latency
- WebSocket latency

Infrastructure:
- CPU usage (target: < 70%)
- Memory usage (target: < 80%)
- Disk usage (target: < 85%)
- Network I/O
- Database size
- Redis memory usage
```

### Alerting Rules

```
Critical:
- Backend unavailable (5xx rate > 5%)
- Database connection failed
- Redis unavailable
- Disk space < 10%

Warning:
- API response time > 1s (p95)
- Error rate > 1%
- CPU > 80%
- Memory > 85%
- WebSocket latency > 500ms
```

---

## Backup & Recovery

### Database Backups

```bash
# Daily backup script
#!/bin/bash
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_DIR="/backups/postgres"

# Create daily backup
docker-compose exec -T postgres pg_dump -U postgres auction_platform | \
  gzip > "$BACKUP_DIR/auction_platform_$TIMESTAMP.sql.gz"

# Keep last 30 days
find "$BACKUP_DIR" -name "auction_platform_*.sql.gz" -mtime +30 -delete

# Upload to S3
aws s3 cp "$BACKUP_DIR/auction_platform_$TIMESTAMP.sql.gz" \
  "s3://auction-backups/postgres/$TIMESTAMP/"
```

Add to crontab:

```bash
# Daily backup at 2 AM
0 2 * * * /path/to/backup.sh
```

### Database Recovery

```bash
# List available backups
aws s3 ls s3://auction-backups/postgres/

# Download backup
aws s3 cp s3://auction-backups/postgres/20260222_020000/auction_platform_20260222_020000.sql.gz .

# Restore
gunzip -c auction_platform_20260222_020000.sql.gz | docker-compose exec -T postgres psql -U postgres

# Verify
docker-compose exec postgres psql -U postgres -d auction_platform -c "SELECT COUNT(*) FROM users_user;"
```

### Code & Configuration Backups

```bash
# Git backup
git push origin main
git push backup main

# Configuration backup
tar -czf config_backup_$(date +%Y%m%d).tar.gz \
  backend/.env \
  frontend/.env.local \
  docker-compose.yml \
  k8s/

aws s3 cp config_backup_*.tar.gz s3://auction-backups/config/
```

### RTO & RPO Targets

```
Database:
- RTO (Recovery Time Objective): 1 hour
- RPO (Recovery Point Objective): 1 hour

Configuration:
- RTO: 15 minutes
- RPO: immediate (version controlled)

Application:
- RTO: 30 minutes
- RPO: N/A (stateless)

Full Site Recovery:
- RTO: 4 hours
- RPO: 1 hour
```

---

## Security Hardening

### Django Security

```python
# settings.py for production

# HTTPS
SECURE_SSL_REDIRECT = True
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True
SECURE_HSTS_SECONDS = 31536000  # 1 year
SECURE_HSTS_INCLUDE_SUBDOMAINS = True
SECURE_HSTS_PRELOAD = True

# Headers
SECURE_CONTENT_SECURITY_POLICY = {
    "default-src": ("'self'",),
    "script-src": ("'self'", "trusted-cdn.com"),
    "style-src": ("'self'", "'unsafe-inline'"),
    "img-src": ("'self'", "data:", "https:"),
}

# JWT
SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(hours=1),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=7),
    'ALGORITHM': 'HS256',
    'SIGNING_KEY': config('DJANGO_SECRET_KEY'),
}

# CORS
CORS_ALLOWED_ORIGINS = [
    "https://example.com",
    "https://www.example.com",
]

# Database
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'CONN_MAX_AGE': 600,
        'ATOMIC_REQUESTS': True,
    }
}
```

### Infrastructure Security

```bash
# Firewall rules
# Allow only necessary ports
- 80 (HTTP)
- 443 (HTTPS)
- 5432 (PostgreSQL - internal only)
- 6379 (Redis - internal only)
- 8000 (Django - internal only)

# SSH hardening
- Disable root login
- Disable password authentication
- Use SSH keys only
- Change default port 22

# Server hardening
- Keep OS updated
- Enable SELinux/AppArmor
- Configure firewall (ufw, iptables)
- Remove unnecessary packages
- Regular security scans
```

### Secrets Management

```bash
# Option 1: HashiCorp Vault
vault write secret/auction-platform \
  db_password=xxxxx \
  stripe_key=xxxxx

# Option 2: AWS Secrets Manager
aws secretsmanager create-secret \
  --name auction-platform/db \
  --secret-string '{"username":"postgres","password":"xxxxx"}'

# Option 3: Environment variables (Docker)
# Store in .env file (encrypted)

# Option 4: Sealed Secrets (Kubernetes)
kubeseal -f secrets.yaml -w sealed-secrets.yaml
```

### SSL/TLS Certificates

```bash
# Let's Encrypt with Certbot
certbot certonly --standalone -d example.com -d www.example.com

# Auto-renewal with cron
0 3 * * * certbot renew --quiet

# Or use container-based auto-renewal
# https://hub.docker.com/r/certbot/certbot
```

---

## Troubleshooting

### Common Issues

#### Backend won't start

```bash
# Check logs
docker-compose logs backend

# Common causes:
1. Database not running
   → docker-compose ps
   → docker-compose up db

2. Database migrations missing
   → docker-compose exec backend python manage.py migrate

3. Environment variables not set
   → cp .env.example .env
   → nano .env

4. Port already in use
   → lsof -i :8000
   → kill -9 <PID>
```

#### Frontend blank page

```bash
# Check browser console (F12)
# Common causes:

1. API_URL incorrect
   → Check VITE_API_URL in .env.local

2. Backend CORS not configured
   → Check CORS_ALLOWED_ORIGINS in settings.py

3. Build errors
   → npm run build
   → Check dist/ folder

4. WebSocket connection failed
   → Check WS_URL configuration
   → Verify Daphne is running
```

#### Database issues

```bash
# Connection refused
docker-compose logs postgres
→ Ensure postgres service is running and healthy

# Out of disk space
df -h
→ Clean old backups, database logs

# Slow queries
→ Enable query logging
→ Analyze slow query log
→ Add database indexes

# Connection pool exhausted
→ Increase CONN_MAX_AGE
→ Add connection pooling (pgBouncer)
```

#### Performance issues

```bash
# High CPU usage
→ Check slow queries
→ Add caching
→ Optimize N+1 queries
→ Scale horizontally

# High memory usage
→ Check for memory leaks
→ Monitor Redis memory
→ Set Redis maxmemory policy
→ Restart containers

# Slow API responses
→ Add query caching
→ Optimize database indexes
→ Enable CDN for static files
→ Use API pagination
```

#### WebSocket issues

```bash
# WebSocket connection drops
→ Check network stability
→ Verify Daphne is running
→ Check Redis connection
→ Review Channels configuration

# Message delivery fails
→ Check consumer implementation
→ Verify routing configuration
→ Review error logs
→ Test with WebSocket client
```

### Debug Commands

```bash
# Backend
docker-compose exec backend python manage.py shell
>>> from auctions.models import Auction
>>> Auction.objects.count()

# Database
docker-compose exec postgres psql -U postgres
postgres=# \l  # List databases
postgres=# \dt  # List tables

# Redis
docker-compose exec redis redis-cli
> PING
> INFO
> FLUSHDB  # Clear cache (dev only!)

# Frontend logs
docker-compose logs -f frontend

# Network
docker network ls
docker network inspect auction_platform_default
```

---

## Performance Optimization Checklist

- [ ] Enable database query caching
- [ ] Add Redis caching for frequently accessed data
- [ ] Optimize database indexes
- [ ] Use database connection pooling
- [ ] Enable gzip compression
- [ ] Use CDN for static assets and media
- [ ] Implement API rate limiting
- [ ] Add frontend code splitting
- [ ] Optimize images (WebP, responsive)
- [ ] Enable browser caching headers
- [ ] Use database read replicas for scaling
- [ ] Implement API response pagination
- [ ] Monitor and optimize slow queries
- [ ] Use async tasks for long-running operations
- [ ] Implement background job processing

---

## Cost Optimization

**Estimated Monthly Costs (AWS)**

```
Development:
- RDS db.t3.micro: $20
- ElastiCache cache.t3.micro: $15
- EC2 t3.small x2: $30
- Data transfer: $10
- Total: ~$75/month

Production (Small Scale):
- RDS db.t3.small: $40
- ElastiCache cache.t3.small: $30
- EC2 t3.medium x4: $60
- ELB: $20
- Data transfer: $50
- Total: ~$200/month

Production (Medium Scale):
- RDS db.t3.large: $100
- ElastiCache cache.r5.large: $200
- EC2 t3.large x6: $200
- ECS Fargate: $150
- ELB: $20
- Data transfer: $100
- Total: ~$770/month
```

Cost optimization tips:

1. Use reserved instances (30-40% savings)
2. Use spot instances for non-critical workloads
3. Auto-scale based on demand
4. Use smaller instance types during off-peak
5. Consolidate databases
6. Archive old data

---

## Maintenance Schedule

```
Daily:
- Monitor error rates
- Check disk space
- Review security alerts

Weekly:
- Database maintenance
- Log rotation
- Backup verification
- Performance review

Monthly:
- Security patching
- Dependency updates
- Capacity planning
- Cost review

Quarterly:
- Full disaster recovery test
- Security audit
- Architecture review
- Major version upgrades
```

---

**Last Updated: February 22, 2026**
**Version: 1.0.0**
