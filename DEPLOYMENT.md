# Deployment Guide - GlobalVoice Nexus

## Prerequisites

- Docker & Docker Compose
- Node.js 18+
- Python 3.11+
- PostgreSQL 15+
- Redis 7+
- Kubernetes cluster (for production)

## Local Development

### 1. Environment Setup

```bash
# Copy environment files
cp .env.example .env
cp frontend/.env.example frontend/.env

# Edit .env with your API keys
nano .env
```

### 2. Install Dependencies

```bash
# Root dependencies
npm install

# Backend dependencies
cd backend && npm install

# Frontend dependencies
cd ../frontend && npm install

# NLP Engine dependencies
cd ../nlp-engine && pip install -r requirements.txt
```

### 3. Database Setup

```bash
# Start PostgreSQL and Redis
docker-compose up -d postgres redis

# Run migrations
cd backend
npm run migrate
```

### 4. Start Development Servers

```bash
# From root directory
npm run dev

# Or start individually:
# Backend: cd backend && npm run dev
# Frontend: cd frontend && npm run dev
# NLP Engine: cd nlp-engine && python -m uvicorn main:app --reload --port 8001
```

Access the application:
- Frontend: http://localhost:3000
- Backend API: http://localhost:3001
- NLP Engine: http://localhost:8001

## Docker Deployment

### Build and Run with Docker Compose

```bash
# Build all services
docker-compose build

# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

## Production Deployment (Kubernetes)

### 1. Build Docker Images

```bash
# Build and tag images
docker build -t globalvoice/frontend:latest ./frontend
docker build -t globalvoice/backend:latest ./backend
docker build -t globalvoice/nlp-engine:latest ./nlp-engine

# Push to registry
docker push globalvoice/frontend:latest
docker push globalvoice/backend:latest
docker push globalvoice/nlp-engine:latest
```

### 2. Deploy to Kubernetes

```bash
# Create namespace
kubectl create namespace globalvoice

# Create secrets
kubectl create secret generic globalvoice-secrets \
  --from-env-file=.env \
  --namespace=globalvoice

# Deploy services
kubectl apply -f k8s/ --namespace=globalvoice

# Check status
kubectl get pods --namespace=globalvoice
```

### 3. Configure Ingress

```bash
# Install nginx ingress controller
kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/controller-v1.8.1/deploy/static/provider/cloud/deploy.yaml

# Apply ingress configuration
kubectl apply -f k8s/ingress.yaml --namespace=globalvoice
```

## Environment Variables

### Required API Keys

- `OPENAI_API_KEY`: OpenAI GPT-4o API key
- `ANTHROPIC_API_KEY`: Anthropic Claude API key
- `ELEVENLABS_API_KEY`: ElevenLabs voice synthesis
- `TWILIO_ACCOUNT_SID`: Twilio account SID
- `TWILIO_AUTH_TOKEN`: Twilio auth token
- `TWILIO_PHONE_NUMBER`: Your Twilio phone number

### Database Configuration

- `DATABASE_URL`: PostgreSQL connection string
- `REDIS_URL`: Redis connection string

### Security

- `JWT_SECRET`: Secret for JWT token signing
- `ENCRYPTION_KEY`: 32-byte encryption key

## Monitoring & Logging

### Application Logs

```bash
# View backend logs
docker-compose logs -f backend

# View NLP engine logs
docker-compose logs -f nlp-engine

# Kubernetes logs
kubectl logs -f deployment/backend --namespace=globalvoice
```

### Health Checks

- Backend: http://localhost:3001/health
- NLP Engine: http://localhost:8001/health

## Scaling

### Horizontal Pod Autoscaling (Kubernetes)

```bash
# Enable autoscaling
kubectl autoscale deployment backend \
  --cpu-percent=70 \
  --min=2 \
  --max=10 \
  --namespace=globalvoice
```

### Database Scaling

- Use PostgreSQL read replicas for read-heavy workloads
- Implement connection pooling (PgBouncer)
- Use Redis cluster for distributed caching

## Backup & Recovery

### Database Backups

```bash
# Backup PostgreSQL
pg_dump -h localhost -U postgres globalvoice > backup.sql

# Restore
psql -h localhost -U postgres globalvoice < backup.sql
```

### Automated Backups (Kubernetes)

```bash
# Create CronJob for daily backups
kubectl apply -f k8s/backup-cronjob.yaml --namespace=globalvoice
```

## Security Best Practices

1. **API Keys**: Store in Kubernetes secrets or AWS Secrets Manager
2. **HTTPS**: Use Let's Encrypt for SSL certificates
3. **Rate Limiting**: Configure rate limits in nginx ingress
4. **CORS**: Restrict origins in production
5. **Database**: Use SSL connections, rotate credentials regularly
6. **Monitoring**: Set up Sentry or similar for error tracking

## Performance Optimization

1. **CDN**: Use CloudFront or similar for static assets
2. **Caching**: Implement Redis caching for frequently accessed data
3. **Database Indexing**: Add indexes on frequently queried columns
4. **Load Balancing**: Use multiple backend instances
5. **WebSocket Scaling**: Use Redis adapter for Socket.IO

## Troubleshooting

### Common Issues

**Database Connection Failed**
```bash
# Check PostgreSQL is running
docker-compose ps postgres

# Test connection
psql -h localhost -U postgres -d globalvoice
```

**NLP Engine Not Responding**
```bash
# Check logs
docker-compose logs nlp-engine

# Restart service
docker-compose restart nlp-engine
```

**Twilio Webhooks Not Working**
- Ensure your server is publicly accessible
- Use ngrok for local testing: `ngrok http 3001`
- Update webhook URLs in Twilio console

## Support

For issues or questions:
- Email: support@globalvoice-nexus.com
- Documentation: https://docs.globalvoice-nexus.com
- GitHub Issues: https://github.com/your-org/globalvoice-nexus/issues
