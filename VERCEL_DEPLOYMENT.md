# Vercel Deployment Guide for Amond Frontend

## Prerequisites
1. GitHub repository with the amond-frontend code
2. Vercel account (free tier is sufficient)

## Environment Variables Required
```
NEXT_PUBLIC_API_URL=https://api.mond.io.kr
NEXT_PUBLIC_APP_ENV=production
NEXT_PUBLIC_BACKEND_API_URL=https://api.mond.io.kr
NEXT_PUBLIC_INICIS_MID=your_inicis_mid
NEXT_PUBLIC_INICIS_SIGNKEY=your_inicis_signkey
NEXT_PUBLIC_INICIS_URL=https://stdpay.inicis.com/stdjs/INIStdPay.js
OPENAI_API_KEY=your_openai_api_key (if using AI features)
```

## Deployment Steps

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Prepare for Vercel deployment"
   git push origin main
   ```

2. **Import to Vercel**
   - Go to https://vercel.com/new
   - Import your GitHub repository
   - Select the `amond-frontend` directory if it's in a monorepo

3. **Configure Build Settings**
   - Framework Preset: Next.js (auto-detected)
   - Build Command: `npm run build`
   - Output Directory: `.next` (auto-detected)
   - Install Command: `npm install`

4. **Add Environment Variables**
   - In Vercel dashboard, go to Settings > Environment Variables
   - Add all the variables listed above

5. **Deploy**
   - Click "Deploy"
   - Wait for the build to complete

6. **Add Custom Domain**
   - Go to Settings > Domains
   - Add `service.mond.io.kr`
   - Since you're using Vercel nameservers, it should configure automatically

## Backend CORS Update

Make sure your backend includes the new domains in CORS configuration:
- `https://service.mond.io.kr`
- `https://amond-frontend.vercel.app`
- `https://amond-frontend-*.vercel.app` (for preview deployments)

## Notes
- Removed all Amplify-specific configurations
- The `amplify.yml` file is no longer needed
- Environment variables are now managed through Vercel dashboard