# Deployment Configuration

## Subdomain Architecture

The application uses a subdomain setup:
1. **Landing Page**: Hosted on Vercel at `mond.io.kr`
2. **Main App**: Hosted on AWS Amplify at `service.mond.io.kr`

## Configuration

### Next.js Configuration
```javascript
// No basePath needed
// basePath: '/service'
```

### URLs
- Landing Page: `https://mond.io.kr`
- Main App: `https://service.mond.io.kr`
- API Backend: `https://api.mond.io.kr`

## DNS Setup

Add these DNS records:
```
Type: CNAME
Name: service
Value: [Your Amplify domain - e.g., main.dpvdj8dsmc7us.amplifyapp.com]
```

## AWS Amplify Setup

1. In Amplify Console:
   - Go to App settings → Domain management
   - Add custom domain: `service.mond.io.kr`
   - No rewrites needed

2. SSL Certificate:
   - Amplify will automatically provision SSL

## Backend CORS Update

Update backend CORS to allow:
- `https://service.mond.io.kr`
- `https://mond.io.kr` (if needed)

## Testing
1. Direct Amplify URL: `https://main.dpvdj8dsmc7us.amplifyapp.com`
2. Subdomain: `https://service.mond.io.kr`
3. Verify all assets load correctly
4. Check API calls work properly

## Benefits
- Clean URLs without path prefixes
- No proxy complications  
- Better performance
- Easier debugging
- Standard architecture pattern