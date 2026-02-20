# Mission Control - Production Deployment Guide

## Overview

Mission Control is a Next.js 14 application that provides a comprehensive dashboard for managing OpenClaw agents, projects, and tasks.

**Features:**
- Real-time agent management with chat
- Project and task tracking
- Model switching and configuration
- Memory browser and team view
- Digital office workspace

---

## Quick Start

### Option 1: Local Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Open http://localhost:3000
```

### Option 2: Production Build (Local)

```bash
# Build the application
npm run build

# Start production server
npm start

# Or use the deploy script
./deploy.sh local
```

### Option 3: Docker Deployment

```bash
# Build and run with Docker
docker-compose up -d

# With nginx reverse proxy
docker-compose --profile with-nginx up -d
```

---

## Production Deployment

### Prerequisites

- Docker 20.10+ and Docker Compose 2.0+
- Node.js 18+ (for local builds)
- Git (for version control)

### Environment Variables

Create a `.env.local` file for sensitive configuration:

```env
# Optional: External API configurations
NEXT_PUBLIC_API_URL=http://localhost:8000

# Optional: Analytics
NEXT_PUBLIC_ANALYTICS_ID=your-analytics-id
```

### Deployment Steps

#### 1. Staging Deployment

```bash
# Clone repository
git clone <repository-url>
cd mission-control

# Deploy to staging
./deploy.sh staging

# Verify deployment
curl http://localhost:3000/health
```

#### 2. Production Deployment

```bash
# Configure SSL certificates (optional)
mkdir -p ssl
cp your-cert.pem ssl/cert.pem
cp your-key.pem ssl/key.pem

# Deploy to production
./deploy.sh production

# Verify deployment
curl http://localhost
curl -k https://localhost  # If SSL configured
```

#### 3. Manual Docker Deployment

```bash
# Build production image
docker build -t mission-control:latest .

# Run container
docker run -d \
  --name mission-control \
  -p 3000:3000 \
  --restart unless-stopped \
  mission-control:latest

# View logs
docker logs -f mission-control
```

---

## Architecture

### Agent Hierarchy

```
PRIMARY AGENT
└── OneClaw (Cloud - Main Instance)

SECONDARY AGENT
└── BossClaw (Local Mac Studio)

SUB-AGENTS (Spawned by OneClaw)
├── Architect (Strategy)
├── Builder (Product)
├── Money Maker (Business)
└── Operator (Operations)
```

### Technology Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **State:** React Context API
- **UI Components:** Lucide React Icons
- **Containerization:** Docker + Docker Compose

---

## File Structure

```
mission-control/
├── components/           # React components
│   ├── AgentManager.tsx  # Agent management interface
│   ├── OfficeView.tsx    # Digital office
│   ├── ProjectsView.tsx  # Project management
│   ├── TasksBoard.tsx    # Kanban task board
│   └── ...
├── pages/               # Next.js pages
│   ├── index.tsx        # Main dashboard
│   └── _app.tsx         # App wrapper
├── public/              # Static assets
├── Dockerfile           # Production Dockerfile
├── docker-compose.yml   # Docker Compose config
├── nginx.conf          # Nginx reverse proxy config
├── deploy.sh           # Deployment script
└── package.json        # Dependencies
```

---

## Monitoring & Logging

### Health Check

```bash
# Application health
curl http://localhost:3000

# Docker health
docker ps
docker inspect --format='{{.State.Health.Status}}' mission-control
```

### Logs

```bash
# Application logs (Docker)
docker logs -f mission-control

# System logs (host)
journalctl -u docker.service -f
```

---

## Updating

### Rolling Update

```bash
# Pull latest code
git pull origin main

# Rebuild and redeploy
./deploy.sh production
```

### Zero-Downtime Update

```bash
# Start new container
docker-compose up -d --scale mission-control=2

# Wait for health check
sleep 10

# Stop old container
docker-compose stop mission-control

# Remove old container
docker-compose rm -f mission-control

# Scale back to 1
docker-compose up -d --scale mission-control=1
```

---

## Backup & Recovery

### Backup

```bash
# Backup configuration
tar -czf mission-control-backup-$(date +%Y%m%d).tar.gz \
  .env.local \
  docker-compose.yml \
  nginx.conf
```

### Recovery

```bash
# Restore configuration
tar -xzf mission-control-backup-20240220.tar.gz

# Restart services
./deploy.sh production
```

---

## Troubleshooting

### Build Errors

```bash
# Clear Next.js cache
rm -rf .next

# Rebuild
npm run build
```

### Container Issues

```bash
# Restart container
docker-compose restart

# Rebuild from scratch
docker-compose down
docker-compose up --build -d
```

### Port Conflicts

```bash
# Check port usage
lsof -i :3000

# Kill process on port
kill -9 $(lsof -t -i :3000)
```

---

## Security

### Best Practices

1. **Environment Variables:** Never commit `.env.local` to git
2. **SSL/TLS:** Use HTTPS in production with valid certificates
3. **Docker:** Run containers as non-root user
4. **Updates:** Regularly update base images and dependencies
5. **Firewall:** Restrict access to necessary ports only

### SSL Certificate Setup

```bash
# Using Let's Encrypt (production)
certbot certonly --standalone -d your-domain.com

# Copy certificates
cp /etc/letsencrypt/live/your-domain.com/fullchain.pem ssl/cert.pem
cp /etc/letsencrypt/live/your-domain.com/privkey.pem ssl/key.pem

# Update nginx.conf to use SSL (uncomment HTTPS server block)
```

---

## Performance

### Optimization Tips

1. **Enable Compression:** Already enabled in Next.js
2. **CDN:** Use CloudFlare or AWS CloudFront for static assets
3. **Caching:** Implement Redis for session storage
4. **Monitoring:** Use Prometheus + Grafana for metrics

### Resource Requirements

| Resource | Minimum | Recommended |
|----------|---------|-------------|
| CPU | 1 core | 2 cores |
| Memory | 512 MB | 1 GB |
| Disk | 1 GB | 5 GB |
| Network | 10 Mbps | 100 Mbps |

---

## Support

### Getting Help

- **Documentation:** This README and inline code comments
- **Issues:** Check logs with `docker logs mission-control`
- **Health:** Verify with `curl http://localhost:3000`

### Useful Commands

```bash
# View running containers
docker ps

# Check resource usage
docker stats

# Shell into container
docker exec -it mission-control sh

# View container details
docker inspect mission-control
```

---

## License

Private - For BossClaw/OneClaw use only

---

## Changelog

### v1.0.0 (2026-02-20)
- Initial production release
- 10 dashboard views implemented
- Agent management with chat
- Model switching interface
- Project and task management

---

**Mission Control is now ready for production deployment!** 🚀
