# Mission Control - Render Deployment Guide

## Quick Deploy

### 1. Create Supabase Project
1. Go to https://supabase.com
2. Create new project
3. Run the schema: `supabase/schema.sql`
4. Copy the connection details

### 2. Deploy to Render

#### Option A: Deploy Button (Easiest)
[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy?repo=https://github.com/yourusername/mission-control)

#### Option B: Manual Setup

1. **Create Web Service**
   - Go to https://dashboard.render.com
   - Click "New Web Service"
   - Connect your GitHub repo

2. **Configure Service**
   ```
   Name: mission-control
   Build Command: npm install && npm run build
   Start Command: npm start
   Plan: Starter ($7/month) or Free
   ```

3. **Environment Variables**
   Add these in Render dashboard:
   ```
   # Supabase
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

   # API Keys (for model testing)
   MOONSHOT_API_KEY=your-key
   ANTHROPIC_API_KEY=your-key
   OPENAI_API_KEY=your-key

   # App Config
   PORT=10000
   NODE_ENV=production
   ```

4. **Deploy**
   - Click "Create Web Service"
   - Wait for build (~2-3 minutes)
   - Access your app at the provided URL

### 3. Custom Domain (Optional)
1. In Render dashboard: Settings → Custom Domain
2. Add your domain
3. Configure DNS as instructed

## Files Created

```
render.yaml          # Infrastructure as code
Dockerfile           # Container config
render-start.sh      # Startup script
```

## Monitoring

- Render Dashboard: https://dashboard.render.com
- Logs: Available in dashboard
- Metrics: CPU, memory, requests

## Scaling

Upgrade plan in Render dashboard:
- Starter: $7/month, 512MB RAM
- Standard: $25/month, 2GB RAM
- Pro: $85/month, 4GB RAM

## Troubleshooting

**Build fails:**
- Check Node.js version (18+)
- Verify all dependencies in package.json

**Runtime errors:**
- Check environment variables are set
- Verify Supabase connection
- Check logs in Render dashboard

**Slow performance:**
- Upgrade to paid plan for more resources
- Enable caching in Render settings

## Cost Estimate

| Component | Cost |
|-----------|------|
| Render Starter | $7/month |
| Supabase Free Tier | $0 |
| **Total** | **$7/month** |

## Next Steps

1. Set up CI/CD with GitHub Actions
2. Configure monitoring with LogRocket/Sentry
3. Set up backups
4. Add custom domain with SSL
