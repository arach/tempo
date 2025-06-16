# Tempo

A mindful weekly planner that helps you schedule meaningful activities without the pressure of exact times.

## Overview

Tempo is a drag-and-drop weekly calendar designed for people who want to plan their week with intention but without rigid time constraints. Instead of scheduling activities at specific times, you simply place them on the days you'd like to do them.

## Features

- **Pressure-free planning**: Add activities to days without specifying exact times
- **Meaningful categorization**: Organize activities by type (Enrichment, Connection, Growth, Creative)
- **Drag and drop**: Easily move activities between days
- **Clean, modern UI**: Inspired by VSCode's design philosophy - functional yet refined
- **Dark mode support**: Seamless theme switching for comfortable use any time
- **Responsive design**: Works beautifully on desktop and tablet devices

## Tech Stack

- **Next.js 15.3.3** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS v4** - Utility-first styling
- **@dnd-kit** - Accessible drag and drop
- **Lucide Icons** - Beautiful, consistent iconography
- **Local Storage** - Simple, privacy-focused data persistence

## Getting Started

### Prerequisites

- Node.js 18+ 
- pnpm (recommended) or npm

### Installation

```bash
# Clone the repository
git clone [your-repo-url]
cd tempo

# Install dependencies
pnpm install

# Run the development server
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

### Building for Production

```bash
pnpm build
pnpm start
```

## Project Structure

```
tempo/
├── app/                    # Next.js app directory
│   ├── globals.css        # Global styles and design tokens
│   └── tempo/             # Tempo app page
├── components/
│   └── tempo/             # Tempo-specific components
│       ├── TempoCalendar.tsx    # Main calendar container
│       ├── DayColumn.tsx        # Individual day column
│       ├── ActivityBlock.tsx    # Draggable activity card
│       └── ActivityEditor.tsx   # Activity creation/editing modal
├── hooks/
│   └── useTempoStorage.ts # Local storage persistence
└── lib/
    ├── types.ts           # TypeScript type definitions
    └── utils.ts           # Utility functions
```

## Design Philosophy

Tempo embraces a "less is more" approach:

- **Minimal cognitive load**: No time slots to worry about
- **Visual clarity**: Clean interface that doesn't compete for attention
- **Meaningful defaults**: Four activity types that cover most personal goals
- **Playful touches**: Subtle personality without sacrificing professionalism

## Activity Types

- 🎯 **Enrichment** (blue): Learning, reading, skill development
- 💝 **Connection** (pink): Social activities, quality time with others
- 🌱 **Growth** (green): Exercise, meditation, self-improvement
- 🎨 **Creative** (purple): Art, music, creative projects

## Contributing

Feel free to open issues or submit pull requests. Please follow the existing code style and design principles.

## License

[Your chosen license]

---

Built with ♥ to help you focus on what matters