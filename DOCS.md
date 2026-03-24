# Project Tracker — Technical Documentation

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [State Management](#state-management)
3. [Custom Drag-and-Drop System](#custom-drag-and-drop-system)
4. [Virtual Scrolling Engine](#virtual-scrolling-engine)
5. [Live Collaboration Simulation](#live-collaboration-simulation)
6. [URL-Synced Filters](#url-synced-filters)
7. [Seed Data Generator](#seed-data-generator)
8. [Edge Cases & Date Handling](#edge-cases--date-handling)
9. [Responsive Design Strategy](#responsive-design-strategy)
10. [Project Structure](#project-structure)
11. [Setup & Development](#setup--development)
12. [Explanation Write-Up](#explanation-write-up)

---

## Architecture Overview

The application is a single-page React + TypeScript project built with Vite and styled entirely with Tailwind CSS v4. No external UI component libraries, drag-and-drop libraries, or virtual scrolling libraries are used — every interactive element is hand-built.

### Core Principle

One shared dataset powers three completely independent views. The `useTaskStore` (Zustand) holds all 500+ tasks in memory. Switching between Kanban, List, and Timeline views reads from the same filtered/sorted state — no data re-fetching, no view-specific transformations. This makes view switching instant and ensures all three views always reflect the same truth.

### Tech Stack

| Layer | Choice | Rationale |
|-------|--------|-----------|
| Framework | React 19 + TypeScript | Type safety, component model, ecosystem |
| Build Tool | Vite | Fast HMR, native ESM, minimal config |
| Styling | Tailwind CSS v4 | Utility-first, no runtime cost, custom theme support |
| State | Zustand | Minimal boilerplate, selector-based subscriptions |
| Drag & Drop | Custom (Pointer Events API) | No library dependency, full control over UX |
| Virtual Scrolling | Custom (scroll + rAF) | No library dependency, optimised for fixed-height rows |

---

## State Management

### Why Zustand Over Context + useReducer

**Zustand** was chosen over React Context + `useReducer` for four specific reasons:

1. **No Provider Wrapper Required**
   Zustand stores are created outside the React tree. Any component can import and subscribe directly — no `<Provider>` needed. This simplifies the component hierarchy:
   ```tsx
   // Any component, anywhere
   const tasks = useTaskStore((s) => s.tasks);
   ```

2. **Granular Subscriptions via Selectors**
   Each component subscribes to exactly the slice of state it needs. When a single task's status changes (e.g., after a drag-and-drop), only the components rendering that specific data re-render — not every consumer of the store.
   
   With Context, any state change re-renders **all** consumers unless you manually split state into multiple contexts.

3. **External Access Without Hooks**
   `useTaskStore.getState()` allows reading and writing state from outside React components. This was critical for:
   - The drag-and-drop system (pointer event handlers that run outside React's lifecycle)
   - The URL filter sync hook (reading state in `popstate` event listeners)
   - The empty-state "Clear filters" button in List view

4. **Performance at Scale**
   With 500+ tasks, Zustand's subscription model means that updating one task's status only re-renders the affected Kanban column — not the entire board, not the list view, not the timeline. Context would force a re-render cascade through the entire tree.

### Store Structure

```
useTaskStore
├── tasks: Task[]              — 500 generated tasks
├── activeView: ViewType       — 'kanban' | 'list' | 'timeline'
├── filters: FilterState       — status[], priority[], assignee[], dateFrom, dateTo
├── sortConfig: SortConfig     — { field, direction }
├── setView()                  — switches active view
├── updateTaskStatus()         — moves a task to a new status column
├── setFilters()               — partial filter updates
├── clearFilters()             — resets all filters
├── setSort()                  — toggles sort field/direction
├── getFilteredTasks()         — derived: applies all active filters
└── getSortedTasks()           — derived: sorts filtered results
```

---

## Custom Drag-and-Drop System

### Overview

The entire drag-and-drop system is implemented in `src/views/KanbanView.tsx` using the **Pointer Events API** (`pointerdown`, `pointermove`, `pointerup`). No external libraries — no `react-beautiful-dnd`, no `dnd-kit`, no `SortableJS`.

Pointer Events were chosen over HTML Drag & Drop API because they:
- Work identically on **mouse and touch** devices
- Give full control over the visual feedback (ghost element, drop zone highlighting)
- Don't trigger the browser's built-in drag image or drop handling

### Phase 1: Drag Start (`pointerdown`)

When the user presses down on a task card:

1. **Ghost Creation**: The card's DOM node is cloned via `cloneNode(true)`. The clone is appended to `document.body` with:
   - `position: fixed` at the card's current bounding rect
   - `opacity: 0.85` for visual distinction
   - `box-shadow` for depth
   - `transform: rotate(2deg) scale(1.02)` for a "lifted" feel
   - `pointer-events: none` so it doesn't interfere with drop detection

2. **Placeholder Insertion**: The original card is set to `opacity: 0` (it still occupies its space in the layout). A `drag-placeholder` div with the same height and a dashed border is rendered above it. This prevents any layout shift — surrounding cards don't jump.

3. **Offset Calculation**: The cursor's offset within the card is stored (`clientX - rect.left`, `clientY - rect.top`) so the ghost tracks the cursor from the exact grab point, not snapping to the corner.

### Phase 2: During Drag (`pointermove`)

On every pointer move:

1. **Ghost Positioning**: The ghost element's `left` and `top` are updated to `clientX - offsetX` and `clientY - offsetY`.

2. **Drop Zone Detection**: To find which column the cursor is over:
   - The ghost is temporarily hidden (`display: none`)
   - `document.elementFromPoint(clientX, clientY)` finds the element under the cursor
   - The ghost is immediately shown again
   - The found element is traversed upward via `.closest('[data-column-status]')` to find the parent column
   
3. **Visual Feedback**: The detected column receives the `drop-zone-active` CSS class — a dashed indigo border and light blue background. All other columns lose this class.

### Phase 3: Drop (`pointerup`)

When the user releases:

- **Valid Drop** (cursor over a different column): `updateTaskStatus(taskId, newColumn)` is called on the Zustand store. The ghost is removed. The Kanban view re-renders instantly with the card in its new column, and the column task counts update.

- **Invalid Drop** (cursor outside any column, or same column): A snap-back animation plays:
  ```css
  transition: all 0.3s cubic-bezier(0.2, 0, 0, 1);
  opacity: 0;
  transform: scale(0.95);
  ```
  After 300ms, the ghost element is removed from the DOM.

### Placeholder Without Layout Shift

This was the hardest sub-problem. The solution:

- The dragged card is **not removed from the DOM** — it's set to `opacity: 0`, keeping its space occupied.
- A `drag-placeholder` div is rendered **above** the invisible card, with matching height (`110px`) and a dashed border visual.
- This means surrounding cards never move. There's zero reflow, zero jitter.

### Touch Support

The Pointer Events API handles both mouse and touch natively. The only additional requirement is `touch-action: none` on each card element, which prevents the browser from intercepting the touch for scrolling during a drag.

---

## Virtual Scrolling Engine

### Location

`src/hooks/useVirtualScroll.ts` — a reusable custom hook.

### Problem

The List view must display 500+ task rows. Rendering all of them as DOM nodes would cause:
- Slow initial render (500+ DOM elements)
- Janky scrolling (browser must layout and paint all rows)
- High memory usage

### Solution: Windowed Rendering

Only the rows visible in the viewport (plus a buffer) are rendered. All other rows exist only as data — no DOM nodes.

### How It Works

**Inputs:**
- `itemCount`: total number of items (e.g., 500)
- `itemHeight`: fixed height per row (52px)
- `containerHeight`: viewport height of the scroll container
- `overscan`: number of extra rows above/below viewport (5)

**Scroll Tracking:**
```tsx
const onScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
  const target = e.currentTarget;
  if (rafRef.current) cancelAnimationFrame(rafRef.current);
  rafRef.current = requestAnimationFrame(() => {
    setScrollTop(target.scrollTop);
  });
}, []);
```
- The scroll event fires on every pixel of scroll movement.
- Instead of updating state on every event (which would trigger a React re-render per pixel), the update is batched into a `requestAnimationFrame` callback.
- This ensures at most one state update per animation frame (~60/s), keeping scrolling smooth.

**Visible Window Calculation:**
```
startIndex = max(0, floor(scrollTop / itemHeight) - overscan)
endIndex   = min(itemCount - 1, startIndex + ceil(containerHeight / itemHeight) + 2 * overscan)
```

For a 600px container with 52px rows and 5-row overscan:
- Visible rows: ~12
- Total rendered rows: ~22 (12 + 5 above + 5 below)
- DOM nodes saved: ~478 out of 500

**Layout Strategy:**
- A container `<div>` is given `height = itemCount * itemHeight` (e.g., 26,000px for 500 rows). This makes the scrollbar behave correctly.
- Each visible row is `position: absolute` with `top = index * itemHeight`. Rows that scroll out of view are simply not rendered — no need to destroy/recreate them, React handles this via its reconciliation.

### Why Fixed Row Height

Variable row heights require either:
- Measuring every row before rendering (expensive)
- Accumulating offsets in a prefix-sum array (complex)

Fixed 52px height enables O(1) offset calculation (`index * 52`) and simple scroll-to-index arithmetic.

---

## Live Collaboration Simulation

### Location

`src/hooks/useCollaboration.ts`

### How It Works

Since there's no backend, collaboration is simulated using `setInterval`:

1. **Three simulated users** are created with unique names, colours, and initials:
   - Dana Wu (red), Liam Fox (blue), Priya Nair (purple)

2. **Initial placement**: On mount, each user is randomly assigned to one of the first 50 tasks.

3. **Movement loop** (every 4 seconds): Each user has a 40% chance of moving to a different random task. This creates a natural-feeling pattern where users don't all move at once.

4. **State output**: `activeCollabs` is an array of `{ user, taskId, action }` objects. Components use `getCollabsForTask(taskId)` to check if any simulated users are on a given card.

### Visual Indicators

- **Task Cards**: Stacked coloured avatar circles appear in the top-right corner of any card a simulated user is viewing. If 2+ users are on the same card, they stack with `-space-x-2` (overlapping) and a `+N` overflow badge.
- **Presence Bar**: At the top of the screen, an animated "3 people are viewing this board" bar shows all active simulated users with a pulsing green dot.
- **Transitions**: Avatars use `avatar-enter` / `avatar-exit` CSS animations (scale + fade) when appearing/leaving a card.

---

## URL-Synced Filters

### Location

`src/hooks/useFilterSync.ts`

### Behaviour

1. **On Mount**: Reads URL search params and hydrates the Zustand filter state:
   ```
   ?statuses=Todo,InProgress&priorities=Critical&assignees=u1,u3
   ```
   becomes `{ statuses: ['Todo', 'InProgress'], priorities: ['Critical'], assignees: ['u1', 'u3'] }`

2. **On Filter Change**: Subscribes to Zustand filter state. When any filter changes, writes back to the URL using `window.history.replaceState()` — no page reload, URL updates silently.

3. **On Browser Back/Forward**: Listens for `popstate` events and restores the filter state from the URL. This makes the filtered view truly bookmarkable and shareable.

### Filter Controls

- **Status**: Multi-select dropdown (To Do, In Progress, In Review, Done)
- **Priority**: Multi-select dropdown (Critical, High, Medium, Low)
- **Assignee**: Multi-select dropdown (6 users)
- **Due Date Range**: Two native date inputs (from / to)
- **Clear All**: Appears only when at least one filter is active

All filters apply **instantly** — no submit button. The three views immediately reflect the filtered dataset.

---

## Seed Data Generator

### Location

`src/data/seedData.ts`

### Output

`generateTasks(500)` produces 500 task objects with:

- **Randomised titles**: Combination of 20 action verbs × 50 subjects = 1,000 possible titles
- **Randomised assignees**: Drawn from a pool of 6 named users, each with a unique colour
- **Randomised priorities**: Uniform distribution across Critical, High, Medium, Low
- **Randomised statuses**: Uniform across Todo, InProgress, InReview, Done
- **Date edge cases**:
  - ~5% of tasks are due **today** (tests "Due Today" label)
  - ~20% of tasks are **overdue** by 1–20 days (tests red highlighting and "Xd overdue" label)
  - ~15% of tasks have **no start date** (tests single-day marker in Timeline view)
  - Remaining tasks span the current month ±10 days

---

## Edge Cases & Date Handling

### Due Date Display Logic (`src/utils/helpers.ts`)

| Condition | Display |
|-----------|---------|
| Due date = today | "Due Today" (brand colour) |
| Overdue by 1–7 days | Date in red (e.g., "Mar 15") |
| Overdue by 8+ days | "Xd overdue" in red (e.g., "15d overdue") |
| Future date | Date in muted grey (e.g., "Apr 2") |

### Empty States

| View | Trigger | Display |
|------|---------|---------|
| Kanban column | No tasks in that status | Icon + "No tasks here" + "Drag tasks here to change their status" |
| List view | Filters exclude all tasks | Icon + "No tasks match your filters" + clickable "Clear filters" CTA |
| Timeline view | Filters exclude all tasks | Icon + "No tasks to display" + "Adjust your filters to see tasks on the timeline" |

---

## Responsive Design Strategy

The application uses Tailwind's responsive prefixes (`sm:`, `md:`) to adapt across three breakpoints:

### Mobile (< 640px)
- Header stacks vertically (logo above view switcher)
- Subtitle hidden to save space
- Filter bar wraps with smaller gaps
- Kanban columns: `min-w-[240px]`, horizontally scrollable
- List table: `min-w-[640px]`, horizontally scrollable within its container
- Timeline: already horizontally scrollable by design
- Reduced padding throughout (`px-3` → `px-4 sm:px-6`)

### Tablet (640px – 1279px)
- Header returns to horizontal layout
- 2–3 Kanban columns visible with horizontal scroll
- Full list table layout visible
- Filters wrap into two rows with date inputs below dropdowns

### Desktop (1280px+)
- All 4 Kanban columns visible without scrolling
- Spacious list table with all columns
- Full timeline with day columns

---

## Project Structure

```
d:\Project_Task/
├── index.html                  — SEO-optimised entry with Inter font
├── vite.config.ts              — Vite + React + Tailwind plugins
├── tsconfig.app.json           — TypeScript config (strict, bundler mode)
├── package.json
├── README.md                   — Setup + decision justifications
├── DOCS.md                     — This document
└── src/
    ├── main.tsx                — React root render
    ├── App.tsx                 — App shell: header, presence bar, filters, view router
    ├── index.css               — Tailwind directives, custom theme, animations
    ├── types/
    │   └── index.ts            — Task, User, Priority, Status, FilterState, SortConfig
    ├── data/
    │   └── seedData.ts         — 500-task generator, 6 users
    ├── store/
    │   └── useTaskStore.ts     — Zustand store: tasks, filters, sort, view
    ├── utils/
    │   └── helpers.ts          — Priority colours, date formatting, column colours
    ├── hooks/
    │   ├── useCollaboration.ts — Simulated 3-user collaboration with interval
    │   ├── useFilterSync.ts    — URL ↔ filter state bidirectional sync
    │   └── useVirtualScroll.ts — Custom virtual scrolling engine
    ├── components/
    │   ├── FilterBar.tsx       — Multi-select dropdowns + date range
    │   ├── PresenceBar.tsx     — "N people viewing" + avatar stack
    │   ├── ViewSwitcher.tsx    — Board / List / Timeline tabs
    │   ├── ui/
    │   │   ├── Avatar.tsx      — Initials avatar + AvatarStack with +N overflow
    │   │   ├── Badge.tsx       — Priority-coloured badges
    │   │   ├── Button.tsx      — Primary / secondary / ghost variants
    │   │   ├── Dropdown.tsx    — Click-outside-to-close dropdown
    │   │   └── MultiSelect.tsx — Checkbox-based multi-select dropdown
    │   └── kanban/
    │       ├── TaskCard.tsx    — Card with priority, assignee, due date, collab dots
    │       └── KanbanColumn.tsx— Column with count header, empty state, drop zone
    └── views/
        ├── KanbanView.tsx      — 4-column board + custom drag-and-drop engine
        ├── ListView.tsx        — Virtual-scrolled sortable table + inline status
        └── TimelineView.tsx    — Horizontal Gantt with today marker + task bars
```

---

## Setup & Development

```bash
# Clone and install
git clone <repository-url>
cd Project_Task
npm install

# Development (hot reload)
npm run dev
# → http://localhost:5173/

# Production build
npm run build

# Preview production
npm run preview
```

### Requirements
- Node.js 18+
- npm 9+

### No additional configuration needed
- Tailwind CSS is configured via `@tailwindcss/vite` plugin
- TypeScript is configured in `tsconfig.app.json`
- All 500 tasks are generated at runtime — no database or API required

---

## Explanation 


**Hardest UI problem solved:** The custom drag-and-drop system without any library was the most challenging part. The core difficulty wasn't making a card follow the cursor — it was making `document.elementFromPoint()` work correctly while a ghost element was under the pointer. The ghost had to be temporarily hidden (`display: none`) for each `pointermove` event to detect the column underneath, then immediately shown again. Getting this hide-detect-show cycle to feel seamless at 60fps, without any visual flicker, required precise ordering of style mutations and using `requestAnimationFrame`-like batching.

**Drag placeholder without layout shift:** The dragged card is set to `opacity: 0` rather than being removed from the DOM. It continues to occupy its exact space in the layout. A dashed-border placeholder div of the same height is rendered above the invisible card, providing visual feedback without causing surrounding cards to reflow. This means zero jitter — no cards jump, no column heights change, no scrollbar position shifts during the drag.

**One thing to refactor with more time:** The virtual scrolling hook assumes fixed row heights (52px). With more time, I'd implement a dynamic measurement approach using `ResizeObserver` on rendered rows, storing measured heights in a prefix-sum array for O(log n) offset lookup. This would enable variable-height rows with rich content like expandable descriptions or inline comments.
