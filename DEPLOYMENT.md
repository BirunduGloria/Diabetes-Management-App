# 🚀 Deployment Guide - Diabetes Management App

## Quick Deploy Options

### Option 1: One-Click Deploy (Recommended)
```bash
./deploy.sh
```

### Option 2: Manual Deploy
```bash
cd client
npm run deploy
```

### Option 3: Preview Deploy
```bash
cd client
npm run deploy:preview
```

## Environment Variables (Automatically Set)

The following environment variables are automatically configured:

- `REACT_APP_API_URL`: https://costly-lonnie-birundugloria2-1f5686e8.koyeb.app
- `GENERATE_SOURCEMAP`: false
- `REACT_APP_ENV`: production

## Files That Automate Deployment

1. **`vercel.json`** - Main Vercel configuration with environment variables
2. **`.env.production`** - Production environment variables
3. **`deploy.sh`** - One-click deployment script
4. **`.github/workflows/deploy.yml`** - Automatic deployment on git push
5. **`client/package.json`** - Contains deployment scripts

## First Time Setup

1. Install Vercel CLI:
   ```bash
   npm install -g vercel
   ```

2. Login to Vercel:
   ```bash
   vercel login
   ```

3. Run deployment:
   ```bash
   ./deploy.sh
   ```

## Automatic Deployment (GitHub Actions)

To enable automatic deployment on every push to main:

1. Go to your Vercel dashboard
2. Get your tokens from Settings > Tokens
3. Add these secrets to your GitHub repository:
   - `VERCEL_TOKEN`
   - `VERCEL_ORG_ID`
   - `VERCEL_PROJECT_ID`

## Troubleshooting

- **Build fails**: Check `client/package.json` dependencies
- **Environment variables not working**: Verify `vercel.json` configuration
- **404 errors**: Check routing configuration in `vercel.json`

## Production URLs

- **Frontend**: Will be provided after first deployment
- **Backend**: https://costly-lonnie-birundugloria2-1f5686e8.koyeb.app
