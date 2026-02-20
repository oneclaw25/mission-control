# Mission Control - GitHub & Render Deployment

## Step 1: Create GitHub Repository

### Option A: GitHub CLI (if installed)
```bash
cd ~/workspace/mission-control
gh repo create oneclaw25/mission-control --public --source=. --push
```

### Option B: Manual Steps
1. Go to https://github.com/new
2. Repository name: `mission-control`
3. Visibility: Public
4. Click "Create repository"
5. Run these commands:

```bash
cd ~/workspace/mission-control
git init
git add .
git commit -m "Initial commit: Mission Control dashboard"
git branch -M main
git remote add origin https://github.com/oneclaw25/mission-control.git
git push -u origin main
```

## Step 2: Deploy to Render

### Using Render Deploy Button
[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy?repo=https://github.com/oneclaw25/mission-control)

### Manual Deploy
1. Go to https://dashboard.render.com
2. Click "New Web Service"
3. Connect GitHub repository `oneclaw25/mission-control`
4. Configure:
   - **Name**: mission-control
   - **Runtime**: Node
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
   - **Plan**: Starter ($7/month)

5. Add Environment Variables:
```
NEXT_PUBLIC_SUPABASE_URL=https://smwusuvlqtqgmkywgxbe.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNtd3VzdXZscXRxZ21reXdneGJlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE1ODgzMDQsImV4cCI6MjA4NzE2NDMwNH0.SIKgjkP0IOsfyrk3sG6mOwJK3nC2krd6zhGaZL74XJE
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNtd3VzdXZscXRxZ21reXdneGJlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MTU4ODMwNCwiZXhwIjoyMDg3MTY0MzA0fQ.Ql7WcXJiFQrDGl-ig3Auppm0RFdHCKZh9FrDzgs0Gr8
NODE_ENV=production
PORT=10000
```

6. Click "Create Web Service"

## Step 3: Verify Deployment

1. Wait for build (2-3 minutes)
2. Click on the provided URL
3. Test all tabs
4. Check model testing functionality

## Files Ready for Deployment

✅ All source code committed
✅ render.yaml configured
✅ Dockerfile ready
✅ Environment variables documented
✅ Supabase connected

## Cost

- **Render Starter**: $7/month
- **Supabase Free Tier**: $0
- **Total**: $7/month

## Next Steps After Deploy

1. Set up custom domain (optional)
2. Configure monitoring
3. Add team members to Render
4. Set up CI/CD with GitHub Actions
