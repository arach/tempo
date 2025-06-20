# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Tempo is a life enrichment activity manager that breaks free from traditional time-grid calendars. It allows users to stack meaningful activities across different time scales without rigid time slots.

## Development Commands

```bash
# Install dependencies (use pnpm)
pnpm install

# Run development server
pnpm dev

# Build for production
pnpm build

# Run production build
pnpm start

# Type check
pnpm tsc --noEmit

# Lint
pnpm lint

# Format code
pnpm prettier --write .

# Add shadcn/ui components (Note: Currently using Tailwind CSS v4, manual component creation required)
pnpm dlx shadcn-ui@latest add [component-name]
```

## Architecture Overview

### Tech Stack
- **Framework**: Next.js 15.3.3 with App Router
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS v4
- **UI Components**: shadcn/ui (manually implemented due to Tailwind v4)
- **Drag & Drop**: @dnd-kit suite
- **Date Handling**: date-fns
- **State Management**: React hooks (no external state library)
- **Data Persistence**: localStorage (preparing for future backend)

### Core Concepts

1. **Activities vs Tasks**: Tempo focuses on meaningful life enrichment activities, not micro-tasks or productivity metrics
2. **No Time Slots**: Activities stack vertically without hour grids - focus on sequence, not schedule
3. **Activity Types**:
   - Enrichment (blue): Read book, learn guitar, study language
   - Connection (pink): Call grandma, coffee with friend, family dinner
   - Growth (green): Meditation, journal, therapy session
   - Creative (purple): Paint, write story, play music

### Key Components Structure

- `TempoCalendar`: Main container with DnD context
- `DayColumn`: Droppable column for each day
- `ActivityBlock`: Draggable activity card
- `ActivityEditor`: Dialog for creating/editing activities (TODO)
- `TemplateManager`: Save/load weekly templates (TODO)

### Data Flow

1. Activities stored in localStorage via `useTempoStorage` hook
2. Drag & drop handled by @dnd-kit with sortable contexts
3. State updates trigger localStorage persistence
4. No server-side state management yet

## Development Guidelines

1. **Component Philosophy**: Use shadcn/ui base components, build Tempo-specific components on top
2. **Life Enrichment Focus**: Warm colors, encouraging empty states, no productivity metrics
3. **Mobile Responsive**: Must work on tablets (mobile can be read-only initially)
4. **Keyboard Accessible**: Support full keyboard navigation
5. **Template-First Design**: Prioritize saving/loading weekly templates

## Important Constraints

- No micro-tasks (e.g., "take vitamins")
- Activities should be meaningful and enriching
- Keep UI calm and interactions smooth
- Focus on helping users create meaningful patterns

## Next Steps

1. Add Activity Editor dialog for creating/editing activities
2. Implement template save/load functionality
3. Add keyboard navigation support
4. Add activity suggestions/examples
5. Implement activity completion tracking (optional)
6. Add animations and transitions
7. Improve mobile responsiveness