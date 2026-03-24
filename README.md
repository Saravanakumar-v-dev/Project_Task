# Project Tracker — Multi-View Task Management

A fully functional frontend project management tool built with React, TypeScript, and Tailwind CSS. Features three switchable views (Kanban board, sortable list, timeline/Gantt), a custom-built drag-and-drop system, virtual scrolling for large datasets, and simulated real-time collaboration indicators.

## Setup Instructions

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

The app runs at `http://localhost:5173/` by default.

## State Management Decision: Zustand

**Why Zustand over Context + useReducer:**

1. **Minimal boilerplate** — Zustand requires no Provider wrapper, no context creation, no reducer switch statements. The entire store is a single `create()` call with state and actions co-located.

2. **Selector-based re-renders** — Components subscribe to specific slices of state via selectors (e.g. `useTaskStore(s => s.activeView)`), preventing unnecessary re-renders. With Context, any state change re-renders all consumers unless you manually split into multiple contexts.

3. **External access** — `useTaskStore.getState()` lets non-React code (URL sync, event handlers) read/write state without hooks. This was critical for the drag-and-drop system and URL filter synchronisation.

4. **Performance with 500+ tasks** — Zustand's subscription model means only the components displaying affected data re-render when a task's status changes, whereas Context would re-render the entire tree.

## Virtual Scrolling Implementation

The virtual scrolling engine is in `src/hooks/useVirtualScroll.ts`. It works as follows:

1. **Fixed row height** (52px) — enables O(1) position calculation without measuring DOM elements.

2. **Scroll tracking** — listens to the container's `scroll` event and uses `requestAnimationFrame` to batch scroll position updates, preventing layout thrashing.

3. **Visible window computation** — from `scrollTop`, computes `startIndex = floor(scrollTop / rowHeight) - overscan` and renders only rows in `[startIndex, startIndex + visibleCount + 2*overscan]`.

4. **Overscan buffer** — renders 5 extra rows above and below the viewport to prevent blank flashes during fast scrolling.

5. **Positioning** — a container div is set to `totalHeight = itemCount * rowHeight` to maintain correct scrollbar size. Each visible row is `position: absolute` with `top = index * rowHeight`.

Only ~20-30 DOM nodes exist at any time, even with 500+ tasks. No virtual scrolling libraries are used.

## Drag-and-Drop Implementation

The drag-and-drop system is in `src/views/KanbanView.tsx` and uses the **Pointer Events API** (no external libraries). Here's how it works:

### Drag Start
- `pointerdown` on a task card captures the pointer and clones the card as a floating ghost element.
- The ghost is appended to `document.body` with `position: fixed`, reduced opacity (0.85), a drop shadow, and a slight rotation for visual feedback.
- A **placeholder** of the same height is inserted at the original card position using a dashed-border div, preventing layout shift.

### During Drag
- `pointermove` on `window` updates the ghost's position to follow the cursor.
- `document.elementFromPoint()` detects which column the cursor is over (temporarily hiding the ghost to avoid self-detection).
- The target column receives a visual highlight (dashed blue border + light background).

### Drop
- `pointerup` checks if the cursor is over a valid column different from the original.
- **Valid drop**: updates the task's status in the Zustand store, which re-renders the Kanban columns instantly.
- **Invalid drop** (outside any column): triggers a snap-back animation — the ghost fades out with a scale-down transition over 300ms.

### Touch Support
- The Pointer Events API inherently supports both mouse and touch. `touch-action: none` on cards prevents browser scroll interference during drag.

### Placeholder Without Layout Shift
- When a card enters drag state, it's set to `opacity: 0` (not `display: none`), so it still occupies its space.
- Simultaneously, a `drag-placeholder` div with `height: 110px` and a dashed border is rendered, visually replacing the card without any content reflow.

## Tech Stack

| Concern | Solution |
|---------|----------|
| Framework | React 19 + TypeScript |
| Styling | Tailwind CSS v4 (no UI libraries) |
| State | Zustand |
| Drag & Drop | Custom (Pointer Events API) |
| Virtual Scrolling | Custom (scroll + rAF) |
| Build Tool | Vite |

## Project Structure

```
src/
├── components/
│   ├── kanban/          # TaskCard, KanbanColumn
│   ├── ui/              # Avatar, Badge, Button, Dropdown, MultiSelect
│   ├── FilterBar.tsx
│   ├── PresenceBar.tsx
│   └── ViewSwitcher.tsx
├── data/
│   └── seedData.ts      # 500-task generator
├── hooks/
│   ├── useCollaboration.ts
│   ├── useFilterSync.ts
│   └── useVirtualScroll.ts
├── store/
│   └── useTaskStore.ts
├── types/
│   └── index.ts
├── utils/
│   └── helpers.ts
├── views/
│   ├── KanbanView.tsx
│   ├── ListView.tsx
│   └── TimelineView.tsx
├── App.tsx
├── index.css
└── main.tsx
```

## Features

- **Three views** of the same data — Kanban, List, Timeline — with instant switching
- **Custom drag-and-drop** with ghost card, placeholder, drop zone highlighting, snap-back animation
- **Virtual scrolling** in List view — only renders visible rows + 5-row buffer
- **Live collaboration** — 3 simulated users move between tasks with animated avatar indicators
- **Filters** — multi-select status/priority/assignee + date range, synced to URL query params
- **Sorting** — clickable column headers with direction indicators in List view
- **Inline status editing** — change task status directly from list rows
- **Empty states** — styled empty states for filtered views and empty Kanban columns
- **Due date intelligence** — "Due Today" labels, overdue day counts for 7+ days overdue
- **Responsive** — works at 1280px+ desktop and 768px tablet
