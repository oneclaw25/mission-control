# Authentication Setup

Mission Control is now protected with HTTP Basic Authentication.

## Environment Variables

Add these to your Render dashboard:

```
AUTH_USER=your-username
AUTH_PASS=your-secure-password
```

## Accessing the Dashboard

When you visit the URL, your browser will prompt for:
- **Username:** (set in AUTH_USER)
- **Password:** (set in AUTH_PASS)

## Security Notes

- Change the default password immediately
- Use a strong, unique password
- The password is transmitted over HTTPS (ensure your Render URL uses HTTPS)
- Health check endpoint `/api/health` remains unblocked for monitoring

## Default Credentials (Change These!)

If you don't set AUTH_USER and AUTH_PASS, the defaults are:
- Username: `admin`
- Password: `mission2026`

**⚠️ IMPORTANT: Change these before deploying!**
