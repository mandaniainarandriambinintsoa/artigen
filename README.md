# Perchance WebApp

A Next.js frontend for the Perchance Character Generator API.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Copy the environment file:
```bash
cp .env.example .env.local
```

3. Update `.env.local` with your API URL:
```
NEXT_PUBLIC_API_URL=http://localhost:8000
```

4. Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Features

- Character generation form with prompt input
- Style selector with multiple art styles
- Resolution selector (square, portrait, landscape)
- Negative prompt support
- Image display with download button
- Loading state during generation

## Deployment (Vercel)

1. Connect your GitHub repository to Vercel
2. Set the environment variable:
   - `NEXT_PUBLIC_API_URL` = your Railway API URL
3. Deploy

## Tech Stack

- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- shadcn/ui components
