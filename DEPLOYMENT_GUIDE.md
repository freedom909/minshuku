# 🚀 Minshuku AI System - Deployment Guide

## Overview
This guide provides comprehensive instructions for deploying the Minshuku AI system in various environments.

## System Architecture

```
Frontend (Next.js) ←→ API Gateway ←→ Microservices
    ↓
Machine AI Service (FastAPI) ←→ Databases (MySQL, Neo4j, Redis)
    ↓
ML Models & Analytics
```

## Quick Start

### 1. Prerequisites
- Docker & Docker Compose
- Python 3.11+
- Node.js 18+

### 2. Environment Setup

```bash
# Clone the repository
git clone <repository-url>
cd minshuku

# Create environment file
cp .env.example .env
# Edit .env with your configuration
```

### 3. Docker Deployment (Recommended)

```bash
# Start all services
docker-compose up -d

# Check service status
docker-compose ps

# View logs
docker-compose logs -f machine
```

### 4. Manual Deployment

#### Backend (Machine AI Service)

```bash
cd machine

# Install dependencies
pip install -r requirements.txt

# Start service
uvicorn main:app --host 0.0.0.0 --port 9000 --reload
```

#### Frontend

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

## Configuration

### Environment Variables

```env
# Database
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_USER=root
MYSQL_PASSWORD=password

# Neo4j
NEO4J_URI=bolt://localhost:7687
NEO4J_USER=neo4j
NEO4J_PASSWORD=password

# AI Services
GEMINI_API_KEY=your-gemini-api-key

# Security
SECRET_KEY=your-secret-key-here
```

### Feature Flags

Enable/disable features via configuration:

```bash
# Enable chatbot
curl -X POST http://localhost:9000/config/features/chatbot/enable

# Disable analytics
curl -X POST http://localhost:9000/config/features/analytics/disable
```

## API Endpoints

### Core AI Services

| Service | Endpoint | Description |
|---------|----------|-------------|
| Title Optimization | `POST /api/title/suggest` | Generate better listing titles |
| Description Improvement | `POST /api/description/suggest` | Improve listing descriptions |
| Review Reply | `POST /api/review-reply/suggest` | Generate review responses |
| Chatbot | `POST /api/chatbot/chat` | AI-powered customer support |

### Machine Learning

| Service | Endpoint | Description |
|---------|----------|-------------|
| Predictive Analytics | `GET /ml/predictive/booking-trends` | Booking trend predictions |
| Recommendation Engine | `POST /ml/recommendation/similar` | Similar listing recommendations |
| Real-time Analytics | `GET /ml/analytics/dashboard` | Live system analytics |
| Model Training | `POST /ml/training/pricing` | Train pricing models |

### Monitoring & Configuration

| Service | Endpoint | Description |
|---------|----------|-------------|
| System Health | `GET /health` | Service health check |
| Performance Metrics | `GET /monitoring/performance` | System performance |
| Configuration | `GET /config/settings` | Application settings |
| Feature Management | `GET /config/features` | Feature flag status |

## Health Checks

### Service Health

```bash
# Basic health check
curl http://localhost:9000/health

# Detailed health check
curl http://localhost:9000/monitoring/health/detailed
```

### System Monitoring

```bash
# Get system metrics
curl http://localhost:9000/monitoring/metrics

# Get performance summary
curl "http://localhost:9000/monitoring/performance?hours=24"
```

## Scaling & Performance

### Horizontal Scaling

```yaml
# docker-compose.scale.yml
services:
  machine:
    deploy:
      replicas: 3
    environment:
      - WORKERS=4
```

### Performance Optimization

1. **Enable Caching**: Use Redis for session and model caching
2. **Database Optimization**: Configure connection pooling
3. **CDN Setup**: Use CDN for static assets
4. **Load Balancing**: Deploy behind a load balancer

## Security

### Best Practices

1. **Environment Variables**: Never commit secrets
2. **API Rate Limiting**: Configure appropriate limits
3. **CORS Configuration**: Restrict allowed origins
4. **Regular Updates**: Keep dependencies updated

### Security Headers

```python
# Add security headers
@app.middleware("http")
async def add_security_headers(request, call_next):
    response = await call_next(request)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    return response
```

## Monitoring & Logging

### Log Configuration

```python
# Logging setup
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('minshuku.log'),
        logging.StreamHandler()
    ]
)
```

### Alerting Rules

Configure alerts for:
- High CPU/Memory usage (>80%)
- Slow response times (>2s)
- High error rates (>5%)
- Disk space warnings (>90%)

## Backup & Recovery

### Database Backups

```bash
# MySQL backup
mysqldump -u root -p minshuku > backup.sql

# Neo4j backup
neo4j-admin backup --backup-dir=/backups --name=graph-backup
```

### Model Backups

```bash
# Backup ML models
tar -czf ml_models_backup.tar.gz ml_models/
```

## Troubleshooting

### Common Issues

1. **Port Conflicts**: Check if ports 9000, 3000 are available
2. **Database Connections**: Verify database credentials
3. **API Keys**: Ensure AI service API keys are valid
4. **Memory Issues**: Monitor system resources

### Debug Mode

```bash
# Enable debug mode
export DEBUG=true

# Or via API
curl -X PUT http://localhost:9000/config/settings \
  -H "Content-Type: application/json" \
  -d '{"debug": true}'
```

## Support

For technical support:
1. Check logs: `docker-compose logs machine`
2. Verify configuration: `curl http://localhost:9000/config/settings`
3. Test endpoints: Use the provided API documentation

## Next Steps

1. **Production Deployment**: Configure for production environment
2. **SSL/TLS**: Set up HTTPS encryption
3. **Monitoring Stack**: Deploy Prometheus + Grafana
4. **CI/CD Pipeline**: Automate testing and deployment

---

**Version**: 2.0.0  
**Last Updated**: 2024-01-15