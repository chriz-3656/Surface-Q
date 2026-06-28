# SurfaceQ Deployment Guide

This guide covers deploying the SurfaceQ platform to production environments, including hosting options, configuration, monitoring, and operational best practices.

---

## Production Considerations

Before deploying to production, address the following:

- **Environment Variables**: Never commit `.env` files or API keys to version control. Use your hosting platform's secrets management.
- **API Key Security**: Ensure `GEMINI_API_KEY` and `API_KEY` are stored securely using environment variables or a secrets manager.
- **CORS Configuration**: Restrict `CORS_ORIGIN` to your exact extension ID. Never use `*` in production.
- **Rate Limiting**: Configure rate limits appropriate to your expected traffic. The defaults (100 requests per 15 minutes) are suitable for personal use but may need adjustment for team deployments.
- **HTTPS**: Always serve the API over HTTPS in production to protect API keys in transit.
- **Database**: SQLite is excellent for single-server deployments. For multi-instance deployments, consider migrating to PostgreSQL.
- **Logging**: Set `LOG_LEVEL=warn` or `LOG_LEVEL=error` in production to reduce log volume and avoid leaking sensitive data.

---

## GitHub Pages (Extension Dashboard)

If you want to host a public-facing landing page, documentation, or a read-only version of the dashboard, GitHub Pages provides free static hosting.

### Setup

1. **Create the `gh-pages` branch:**

   ```bash
   git checkout --orphan gh-pages
   git reset --hard
   ```

2. **Add your static files:**

   Copy or build your static assets (landing page, documentation site) into the branch root.

   ```bash
   # Example: copy documentation
   cp -r docs/* .
   # Create an index.html if needed
   ```

3. **Commit and push:**

   ```bash
   git add -A
   git commit -m "Deploy to GitHub Pages"
   git push origin gh-pages
   ```

4. **Configure GitHub Pages:**

   - Go to your repository on GitHub.
   - Navigate to **Settings → Pages**.
   - Under "Source," select the `gh-pages` branch.
   - Set the directory to `/ (root)`.
   - Click **Save**.

5. **Configure base URL:**

   If your site uses relative paths, update your build configuration to use the repository name as the base URL:

   ```
   Base URL: /Surface-Q/
   ```

   Your site will be available at: `https://<username>.github.io/Surface-Q/`

> **Note:** GitHub Pages only hosts static content. The SurfaceQ backend server must be deployed separately.

---

## Railway Deployment

[Railway](https://railway.app) is a cloud platform that makes it easy to deploy Node.js applications with automatic builds and managed infrastructure.

### Step 1: Create a Railway Project

1. Sign up or log in at [railway.app](https://railway.app).
2. Click **"New Project"** from the dashboard.
3. Select **"Deploy from GitHub repo"**.

### Step 2: Connect Your Repository

1. Authorize Railway to access your GitHub account.
2. Select the **Surface-Q** repository.
3. Railway will auto-detect the Node.js project.

### Step 3: Configure the Service

Set the following in your Railway service settings:

- **Root Directory**: `server`
- **Build Command**: `npm install`
- **Start Command**: `npm start`

### Step 4: Set Environment Variables

Navigate to the **Variables** tab and add:

| Variable | Value |
|----------|-------|
| `GEMINI_API_KEY` | Your Gemini API key |
| `API_KEY` | A strong random string for extension auth |
| `NODE_ENV` | `production` |
| `CORS_ORIGIN` | `chrome-extension://<your-extension-id>` |
| `PORT` | `3001` (Railway may auto-assign) |
| `LOG_LEVEL` | `warn` |

### Step 5: Deploy

Click **"Deploy"** or push to your connected branch. Railway will:
1. Clone your repository.
2. Install dependencies.
3. Start the server.
4. Assign a public URL (e.g., `https://surface-q-production.up.railway.app`).

### Step 6: Update Extension Configuration

Update the extension's server URL to point to your Railway deployment:

```javascript
// In extension configuration
const API_BASE_URL = 'https://surface-q-production.up.railway.app/api';
```

---

## Docker Production Deployment

For self-hosted production deployments, Docker with Nginx reverse proxy provides a robust setup with SSL termination.

### Production Docker Compose

Create a `docker-compose.prod.yml` in the project root:

```yaml
version: '3.8'

services:
  surfaceq-server:
    build:
      context: ./server
      dockerfile: Dockerfile
    container_name: surfaceq-server
    restart: unless-stopped
    env_file:
      - ./server/.env
    environment:
      - NODE_ENV=production
      - PORT=3001
    volumes:
      - surfaceq-data:/app/data
    networks:
      - surfaceq-network
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3001/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 10s

  nginx:
    image: nginx:alpine
    container_name: surfaceq-nginx
    restart: unless-stopped
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf:ro
      - ./nginx/ssl:/etc/nginx/ssl:ro
      - certbot-webroot:/var/www/certbot:ro
    depends_on:
      - surfaceq-server
    networks:
      - surfaceq-network

  certbot:
    image: certbot/certbot
    container_name: surfaceq-certbot
    volumes:
      - ./nginx/ssl:/etc/letsencrypt
      - certbot-webroot:/var/www/certbot
    entrypoint: "/bin/sh -c 'trap exit TERM; while :; do certbot renew; sleep 12h & wait $${!}; done;'"

volumes:
  surfaceq-data:
    driver: local
  certbot-webroot:
    driver: local

networks:
  surfaceq-network:
    driver: bridge
```

### Nginx Reverse Proxy Configuration

Create `nginx/nginx.conf`:

```nginx
events {
    worker_connections 1024;
}

http {
    # Rate limiting zone
    limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;

    # Upstream server
    upstream surfaceq {
        server surfaceq-server:3001;
    }

    # Redirect HTTP to HTTPS
    server {
        listen 80;
        server_name your-domain.com;

        location /.well-known/acme-challenge/ {
            root /var/www/certbot;
        }

        location / {
            return 301 https://$host$request_uri;
        }
    }

    # HTTPS server
    server {
        listen 443 ssl http2;
        server_name your-domain.com;

        ssl_certificate /etc/nginx/ssl/live/your-domain.com/fullchain.pem;
        ssl_certificate_key /etc/nginx/ssl/live/your-domain.com/privkey.pem;

        # SSL configuration
        ssl_protocols TLSv1.2 TLSv1.3;
        ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384;
        ssl_prefer_server_ciphers off;

        # Security headers
        add_header X-Frame-Options "DENY" always;
        add_header X-Content-Type-Options "nosniff" always;
        add_header X-XSS-Protection "1; mode=block" always;
        add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
        add_header Referrer-Policy "strict-origin-when-cross-origin" always;

        # API proxy
        location /api/ {
            limit_req zone=api burst=20 nodelay;
            proxy_pass http://surfaceq;
            proxy_http_version 1.1;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            proxy_read_timeout 60s;
            proxy_send_timeout 60s;
        }

        # Health check
        location /health {
            proxy_pass http://surfaceq;
            proxy_http_version 1.1;
            proxy_set_header Host $host;
        }
    }
}
```

### SSL Certificate Setup with Let's Encrypt

```bash
# Initial certificate generation
docker-compose -f docker-compose.prod.yml run --rm certbot \
  certonly --webroot \
  --webroot-path=/var/www/certbot \
  --email chrizmonsaji@gmail.com \
  --agree-tos \
  --no-eff-email \
  -d your-domain.com

# Start all services
docker-compose -f docker-compose.prod.yml up -d
```

The Certbot container automatically handles certificate renewal every 12 hours.

### Deploying

```bash
# Build and start production containers
docker-compose -f docker-compose.prod.yml up -d --build

# Verify deployment
curl https://your-domain.com/health

# View logs
docker-compose -f docker-compose.prod.yml logs -f surfaceq-server
```

---

## Environment Variables Reference

Complete reference for all environment variables used by SurfaceQ:

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `PORT` | HTTP port the server listens on | `3001` | No |
| `NODE_ENV` | Runtime environment: `development`, `production`, `test` | `development` | No |
| `GEMINI_API_KEY` | Google Gemini API key for AI analysis features | — | **Yes** |
| `API_KEY` | Secret key for authenticating extension API requests | — | Recommended |
| `CORS_ORIGIN` | Allowed CORS origins (comma-separated for multiple) | `*` | Recommended |
| `RATE_LIMIT_WINDOW_MS` | Rate limit window duration in milliseconds | `900000` | No |
| `RATE_LIMIT_MAX_REQUESTS` | Maximum requests allowed per rate limit window | `100` | No |
| `DB_PATH` | Filesystem path to the SQLite database file | `./data/surfaceq.db` | No |
| `LOG_LEVEL` | Logging verbosity: `error`, `warn`, `info`, `debug` | `info` | No |
| `REQUEST_TIMEOUT_MS` | Timeout for outbound HTTP requests in milliseconds | `30000` | No |
| `MAX_CONCURRENT_SCANS` | Maximum simultaneous scan operations | `5` | No |

### Environment-Specific Recommendations

| Setting | Development | Production |
|---------|-------------|------------|
| `NODE_ENV` | `development` | `production` |
| `LOG_LEVEL` | `debug` | `warn` |
| `CORS_ORIGIN` | `*` | `chrome-extension://<id>` |
| `API_KEY` | Optional | **Required** |
| `RATE_LIMIT_MAX_REQUESTS` | `1000` | `100` |

---

## Monitoring

### Health Endpoint

The `/health` endpoint provides real-time server status:

```bash
# Basic health check
curl https://your-domain.com/health

# Example response
{
  "status": "healthy",
  "version": "1.0.0",
  "uptime": 86400,
  "timestamp": "2025-01-15T10:30:00.000Z"
}
```

Use this endpoint for:
- **Load balancer health checks**: Configure your load balancer to poll `/health` every 30 seconds.
- **Uptime monitoring**: Integrate with services like UptimeRobot, Pingdom, or Better Uptime.
- **Docker health checks**: Already configured in the production Docker Compose file.

### Logging

SurfaceQ outputs structured logs to stdout, making them compatible with any log aggregation system:

```bash
# View real-time logs (Docker)
docker-compose logs -f surfaceq-server

# View logs with timestamps (Docker)
docker-compose logs -f -t surfaceq-server

# Filter logs by level (systemd)
journalctl -u surfaceq --priority=warning
```

**Log Aggregation Integration:**
- **Docker**: Use the `json-file` or `fluentd` logging driver to forward logs.
- **Cloud Platforms**: Railway and similar platforms automatically capture stdout/stderr.
- **Self-hosted**: Forward logs to Elasticsearch, Loki, or a similar system using Filebeat or Promtail.

### Error Tracking

For production error tracking, consider integrating:

- **Sentry**: Add `@sentry/node` for automatic error capture and alerting.
- **Custom webhook**: Configure error-level logs to trigger alerts via Slack, Discord, or email.

Example Sentry integration:

```javascript
// server/index.js
const Sentry = require('@sentry/node');
Sentry.init({ dsn: process.env.SENTRY_DSN });
```

---

## Backup Strategy

### SQLite Backup

Since SurfaceQ uses SQLite, backups are straightforward — the entire database is a single file. However, backing up a live SQLite database requires care to avoid corruption.

### Recommended Backup Approach

Use SQLite's `.backup` command or the `sqlite3` CLI to create consistent backups:

```bash
#!/bin/bash
# backup.sh - SurfaceQ database backup script

# Configuration
DB_PATH="${DB_PATH:-./data/surfaceq.db}"
BACKUP_DIR="${BACKUP_DIR:-./backups}"
RETENTION_DAYS="${RETENTION_DAYS:-30}"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="${BACKUP_DIR}/surfaceq_${TIMESTAMP}.db"

# Create backup directory if it doesn't exist
mkdir -p "${BACKUP_DIR}"

# Create backup using SQLite's built-in backup command
# This is safe to run on a live database
sqlite3 "${DB_PATH}" ".backup '${BACKUP_FILE}'"

# Verify backup integrity
if sqlite3 "${BACKUP_FILE}" "PRAGMA integrity_check;" | grep -q "ok"; then
    echo "[$(date)] Backup created successfully: ${BACKUP_FILE}"
    
    # Compress the backup
    gzip "${BACKUP_FILE}"
    echo "[$(date)] Backup compressed: ${BACKUP_FILE}.gz"
    
    # Calculate backup size
    BACKUP_SIZE=$(du -h "${BACKUP_FILE}.gz" | cut -f1)
    echo "[$(date)] Backup size: ${BACKUP_SIZE}"
else
    echo "[$(date)] ERROR: Backup integrity check failed!"
    rm -f "${BACKUP_FILE}"
    exit 1
fi

# Remove backups older than retention period
DELETED=$(find "${BACKUP_DIR}" -name "surfaceq_*.db.gz" -mtime +${RETENTION_DAYS} -delete -print | wc -l)
if [ "${DELETED}" -gt 0 ]; then
    echo "[$(date)] Removed ${DELETED} backups older than ${RETENTION_DAYS} days"
fi

echo "[$(date)] Backup complete"
```

### Automating Backups

Set up a cron job to run daily backups:

```bash
# Edit crontab
crontab -e

# Add daily backup at 2:00 AM
0 2 * * * /path/to/Surface-Q/backup.sh >> /var/log/surfaceq-backup.log 2>&1
```

### Docker Backup

For Docker deployments, run the backup inside the container:

```bash
# One-time backup
docker exec surfaceq-server sqlite3 /app/data/surfaceq.db ".backup '/app/data/backup.db'"
docker cp surfaceq-server:/app/data/backup.db ./backups/

# Or mount a backup volume and use cron on the host
```

### Restore from Backup

```bash
# Stop the server
docker-compose down
# or: npm stop / kill the process

# Replace the database file
cp backups/surfaceq_20250115_020000.db data/surfaceq.db

# Restart the server
docker-compose up -d
# or: npm start
```

---

## Scaling Considerations

### Single Server (Current Architecture)

SurfaceQ's current architecture is optimized for single-server deployment:

- **SQLite**: Excellent performance for read-heavy workloads with moderate write volume. Supports up to ~50 concurrent readers.
- **Express.js**: Single-threaded event loop handles I/O-bound operations efficiently.
- **Suitable for**: Individual users, small teams (up to ~20 users), development environments.

### Vertical Scaling

For increased capacity on a single server:

1. **Increase Node.js memory**: Set `--max-old-space-size=4096` for larger result sets.
2. **Enable WAL mode**: SQLite Write-Ahead Logging improves concurrent access.
   ```sql
   PRAGMA journal_mode = WAL;
   ```
3. **Use PM2**: Run multiple Node.js processes with a process manager.
   ```bash
   npm install -g pm2
   pm2 start server/index.js -i max --name surfaceq
   ```

### Horizontal Scaling

For high-traffic production deployments, consider these architectural changes:

1. **Database Migration**: Replace SQLite with PostgreSQL or MySQL for multi-instance database access.
2. **Load Balancing**: Deploy multiple Express.js instances behind Nginx or a cloud load balancer.
3. **Session/State Management**: Use Redis for shared state across instances.
4. **Queue System**: Use BullMQ or similar for background scan processing.
5. **CDN**: Serve static extension assets via a CDN for faster updates.

```
                        ┌──────────────┐
                        │  Load        │
    Extension ──────────│  Balancer    │──────────┐
                        │  (Nginx)     │          │
                        └──────────────┘          │
                              │                   │
                    ┌─────────┼─────────┐         │
                    │         │         │         │
               ┌────┴───┐ ┌──┴─────┐ ┌─┴──────┐  │
               │ App 1  │ │ App 2  │ │ App 3  │  │
               └────┬───┘ └──┬─────┘ └─┬──────┘  │
                    │         │         │         │
                    └─────────┼─────────┘         │
                              │                   │
                     ┌────────┴────────┐   ┌──────┴──────┐
                     │  PostgreSQL     │   │    Redis     │
                     │  Database       │   │    Cache     │
                     └─────────────────┘   └─────────────┘
```

> **Recommendation:** For most use cases, a single server deployment with PM2 and SQLite WAL mode handles thousands of scans per day comfortably. Only migrate to a distributed architecture if you consistently exceed this throughput.
