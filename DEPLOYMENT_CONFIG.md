# Deployment Configuration

## Important: Domain Routing Setup with Vercel Proxy

The application uses a two-part architecture:
1. **Landing Page**: Hosted on Vercel at `mond.io.kr`
2. **Main App**: Hosted on AWS Amplify, accessed via `/service`

## How It Works

### Vercel Proxy Configuration
The landing page on Vercel has rewrites configured:
```javascript
// When user goes to mond.io.kr/service
source: '/service'
destination: 'https://main.dpvdj8dsmc7us.amplifyapp.com/'

// For subpaths like /service/login
source: '/service/:path+'
destination: 'https://main.dpvdj8dsmc7us.amplifyapp.com/:path+'
```

### Next.js Configuration
The Amplify app MUST have:
```javascript
basePath: '/service'
```

This ensures:
- Static assets load from `/service/_next/...`
- Internal routing works correctly
- The app functions properly when proxied

## URLs

### Direct Access (for testing)
- Amplify URL: `https://main.dpvdj8dsmc7us.amplifyapp.com/service`
- All routes will have `/service` prefix

### Production Access (via Vercel proxy)
- User visits: `https://mond.io.kr/service`
- Vercel proxies to Amplify
- User sees the app at `/service` path

## Key Points

1. **DO NOT remove `basePath: '/service'`** - it's required for the proxy setup
2. The `withBasePath()` utility returns paths as-is because Next.js handles it
3. All internal links automatically get `/service` prefix from Next.js

## Testing
After deployment:
1. Test direct Amplify URL: `https://main.dpvdj8dsmc7us.amplifyapp.com/service`
2. Test via proxy: `https://mond.io.kr/service`
3. Verify static assets load correctly
4. Check API calls work properly