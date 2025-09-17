# Deployment Checklist

## Pre-Deployment Setup

### 1. GitHub OAuth App Setup
- [ ] Create GitHub OAuth App at https://github.com/settings/developers
- [ ] Set Homepage URL: `https://your-domain.com`
- [ ] Set Authorization callback URL: `https://your-domain.com/api/auth/callback/github`
- [ ] Note down Client ID and Client Secret

### 2. Database Setup
- [ ] Create Vercel Postgres database OR set up PostgreSQL instance
- [ ] Note down connection string

### 3. Environment Variables
Copy these to your deployment platform:

```env
# NextAuth
NEXTAUTH_URL=https://your-domain.com
NEXTAUTH_SECRET=your-secure-random-secret-here

# GitHub OAuth
GITHUB_ID=your-github-oauth-app-id
GITHUB_SECRET=your-github-oauth-app-secret

# Database
POSTGRES_URL=your-postgres-connection-string

# Optional: Vercel Realtime
VERCEL_REALTIME_URL=
VERCEL_REALTIME_TOKEN=
```

## Vercel Deployment

### Quick Deploy
1. [ ] Push code to GitHub repository
2. [ ] Connect repository to Vercel
3. [ ] Add environment variables in Vercel dashboard
4. [ ] Deploy!

### Manual Steps
1. [ ] Install Vercel CLI: `npm i -g vercel`
2. [ ] Run `vercel` in project directory
3. [ ] Follow prompts to link project
4. [ ] Add environment variables: `vercel env add`
5. [ ] Deploy: `vercel --prod`

## Post-Deployment

### 1. Database Migration
Run this once after first deployment:
```bash
vercel env pull .env.local
pnpm db:push
```

### 2. Test Core Flows
- [ ] Landing page loads
- [ ] Can create a session (host flow)
- [ ] Can join session with code
- [ ] GitHub authentication works
- [ ] Can submit survey response
- [ ] Results page shows live data
- [ ] Prize sidebar updates correctly

### 3. Test Edge Cases
- [ ] Invalid session codes show error
- [ ] Duplicate submissions are prevented
- [ ] Ended sessions reject new responses
- [ ] Private GitHub emails work with email field
- [ ] Rate limiting works (try multiple rapid submissions)

### 4. Performance Check
- [ ] All pages load under 3 seconds
- [ ] Images and QR codes generate properly
- [ ] Charts render correctly
- [ ] Real-time updates work (or polling fallback)

## Production Configuration

### Security
- [ ] NEXTAUTH_SECRET is a secure random string (32+ characters)
- [ ] GitHub OAuth app callback URL matches production domain
- [ ] Database connection uses SSL in production
- [ ] No development/debug code in production build

### Monitoring
- [ ] Set up error tracking (Sentry, etc.)
- [ ] Monitor database performance
- [ ] Set up uptime monitoring
- [ ] Check Vercel function logs

## Troubleshooting

### Common Issues

**"Session not found" errors:**
- Check POSTGRES_URL is correct
- Ensure database schema is pushed (`pnpm db:push`)

**GitHub auth fails:**
- Verify GITHUB_ID and GITHUB_SECRET
- Check OAuth app callback URL
- Ensure NEXTAUTH_URL matches your domain

**Real-time not working:**
- Check if VERCEL_REALTIME_* vars are set
- App should fall back to polling automatically
- Look for console errors in browser

**Charts not rendering:**
- Verify Recharts is properly installed
- Check for JavaScript errors in browser console
- Ensure data format matches chart expectations

**QR codes not generating:**
- Check if qrcode package is installed
- Verify server-side rendering is working
- Look for image generation errors in logs

### Performance Issues

**Slow page loads:**
- Enable Vercel Analytics
- Check bundle size with `pnpm build`
- Optimize images and reduce JavaScript

**Database timeouts:**
- Check connection pool settings
- Monitor query performance
- Consider database scaling

## Scaling Considerations

### For High Traffic Events

1. **Database**: Upgrade to higher-tier Postgres plan
2. **Caching**: Add Redis for session/response caching
3. **CDN**: Ensure static assets are cached
4. **Rate Limiting**: Implement more sophisticated rate limiting
5. **Real-time**: Use Vercel Realtime or consider Pusher/Ably

### Monitoring at Scale

- Set up database monitoring
- Track API response times
- Monitor memory usage
- Set up alerting for errors

---

## Quick Test Script

After deployment, run this manual test:

1. Visit your domain - should see landing page
2. Go to `/host` - create session - should get code
3. Go to `/join?code=YOURCODE` - should prompt for GitHub auth
4. Sign in and submit survey - should succeed
5. Go to `/results/SESSION_ID` - should see your response

If all steps work, your deployment is successful! 🎉
