# Amond Frontend

Next.js-based frontend for Amond - AI-powered social media content generator.

## Prerequisites

- Node.js v20+
- npm or yarn

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create environment file:
```bash
cp .env.example .env.local
```

3. Configure environment variables in `.env.local`:
```
NEXT_PUBLIC_API_URL=http://localhost:9988  # Backend API URL
NEXT_PUBLIC_APP_ENV=dev                    # Environment (dev/prod)
```

## Development

```bash
npm run dev
```

The app runs at http://localhost:3000

## Build & Production

```bash
npm run build
npm start
```

## Deployment

This frontend is automatically deployed via AWS Amplify when pushed to the main branch.

Production URL: https://mond.io.kr/service

## Project Structure

```
src/
├── pages/          # Next.js pages
├── component/      # React components
├── module/         # Utilities and contexts
├── constant/       # Constants and config
└── styles/         # Global styles
```

## Key Features

- Instagram feed generation (4 images per set)
- Project management
- Payment integration (INICIS)
- User authentication
- Real-time content generation

## Notes

- Uses Next.js with `basePath: '/service'`
- Styled with MUI (Material-UI)
- Individual image generation is temporarily disabled