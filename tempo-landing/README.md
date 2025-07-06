# Tempo Landing Page

A static landing page for the Tempo life enrichment activity manager, built with Next.js and optimized for GitHub Pages deployment.

## Overview

This is a standalone Next.js React application featuring the marketing landing page for [Tempo](https://github.com/arach/tempo) - a life enrichment activity manager that breaks free from traditional time-grid calendars.

## Features

- ✨ Responsive design with dark mode support
- 🎨 Beautiful UI with Tailwind CSS
- 📱 Mobile-friendly layout
- 🚀 Optimized for static deployment
- 🔧 TypeScript support
- 🎭 Interactive calendar preview component

## Tech Stack

- **Framework**: Next.js 15.3.5 with App Router
- **Styling**: Tailwind CSS with shadcn/ui components
- **Language**: TypeScript
- **Theme**: next-themes for dark mode
- **Icons**: Lucide React
- **Deployment**: GitHub Pages via GitHub Actions

## Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## Deployment

The site is configured for automatic deployment to GitHub Pages:

1. Push changes to the `main` branch
2. GitHub Actions will automatically build and deploy
3. Site will be available at `https://[username].github.io/tempo-landing`

## Project Structure

```
tempo-landing/
├── app/
│   ├── globals.css          # Global styles with Tailwind
│   ├── layout.tsx           # Root layout with theme provider
│   └── page.tsx             # Main landing page
├── components/
│   ├── landing/
│   │   └── CalendarPreview.tsx  # Interactive calendar component
│   ├── ui/
│   │   └── button.tsx       # Reusable button component
│   ├── theme-provider.tsx   # Theme context provider
│   └── theme-toggle.tsx     # Dark mode toggle
├── lib/
│   └── utils.ts             # Utility functions
└── public/                  # Static assets
```

## Configuration

The project is configured for static export with:
- `output: 'export'` in `next.config.ts`
- GitHub Pages compatible routing
- Optimized images for static deployment
- Custom base path for GitHub Pages

## License

This project is part of the Tempo ecosystem. See the main [Tempo repository](https://github.com/arach/tempo) for licensing information.