# Deployment Configuration

## Important: Domain Routing Setup

The application is configured to work with two scenarios:

### 1. Amplify Default URL (works out of the box)
- URL: `https://main.dpvdj8dsmc7us.amplifyapp.com/`
- No additional configuration needed

### 2. Custom Domain (mond.io.kr)
- URL: `https://mond.io.kr/`
- The app is now configured WITHOUT a basePath

## Configuration Changes Made

1. **Removed basePath from next.config.js**
   - Previously: `basePath: '/service'`
   - Now: No basePath (commented out)

2. **Updated paths utility**
   - `withBasePath()` now returns paths as-is
   - No path manipulation needed

## Domain Configuration Options

### Option A: Serve at root domain (Current Setup)
- App accessible at: `https://mond.io.kr/`
- No `/service` subdirectory needed
- This is the current configuration

### Option B: If you need to serve at /service
1. Uncomment `basePath: '/service'` in `next.config.js`
2. Configure your domain/CDN to:
   - Route `mond.io.kr/service/*` → Amplify app
   - Or use a subdomain like `service.mond.io.kr`

## AWS Amplify Custom Domain Settings

In AWS Amplify Console:
1. Go to App settings → Domain management
2. Add custom domain: `mond.io.kr`
3. If serving at subdirectory, configure rewrites:
   - Source: `/service/<*>`
   - Target: `/<*>`
   - Type: 200 (Rewrite)

## Testing
- After deployment, test both:
  - `https://mond.io.kr/` (should work with current config)
  - Static assets loading correctly
  - API calls to backend