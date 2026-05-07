# AGENTS.md — 科宝训练平台

This document describes the project architecture, conventions, and non-obvious decisions for AI agents and developers working on this codebase.

## Project Overview

A YOLO model training management platform built with TanStack Start, deployed on Netlify. The platform covers the ML lifecycle: dataset import → training configuration → cloud training → validation → publishing to the 科宝智能体中台 (Kebao Agent Hub).

## Tech Stack

| Layer      | Technology                         |
| ---------- | ---------------------------------- |
| Framework  | TanStack Start (SSR + React 19)    |
| Routing    | TanStack Router v1 (file-based)    |
| Build      | Vite 7                             |
| Styling    | Tailwind CSS 4 + plain CSS classes |
| Icons      | Lucide React                       |
| Language   | TypeScript 5.7 (strict mode)       |
| Deployment | Netlify                            |

## Directory Structure

```
src/
├── routes/
│   ├── __root.tsx          # Root layout: sidebar nav + Outlet
│   ├── index.tsx           # Dashboard (training overview, stats, recent tasks)
│   ├── tasks/
│   │   ├── index.tsx       # All training tasks list table
│   │   ├── create.tsx      # 4-step wizard (split → base model → params → review)
│   │   └── $taskId.tsx     # Task detail: live metrics, training log, validate/publish
│   ├── models/
│   │   └── index.tsx       # Model grid: validation report modal, publish modal
│   ├── datasets/
│   │   └── index.tsx       # Dataset sync from 科宝标注平台
│   └── monitor/
│       └── index.tsx       # Real-time GPU usage monitoring
├── styles.css              # All styling: CSS variables, component classes, animations
└── router.tsx              # TanStack Router setup
```

## Architecture Decisions

### Styling Approach

All styles are in `src/styles.css` using plain CSS classes — **not Tailwind utility classes** (except `@import "tailwindcss"`). The design uses a CSS variable system for the dark tech theme. Component-specific class names (`.card`, `.btn`, `.badge`, `.nav-link`, etc.) are defined there. This makes it easy to maintain a cohesive visual system without class pollution.

### Color System

CSS variables define the entire palette (see `:root` in `styles.css`). The theme is dark navy (`--bg-base: #030912`) with electric blue (`--accent`) and teal (`--teal`) accents. All status colors (running, completed, failed, pending, published) have dedicated variables.

### Mock Data

All data is currently **in-memory mock data** defined directly in each route file. There is no backend or database. Task IDs `task-001` through `task-006` and model IDs `model-001` through `model-004` are pre-defined. The create task wizard navigates to `task-001` after submission.

### Real-time Simulation

`tasks/$taskId.tsx` uses `useEffect` with `setInterval` to simulate live training progress when `status === 'running'`. The interval fires every 1200ms, incrementing epoch count and updating metrics/logs.

### Root Layout

`__root.tsx` uses both `shellComponent` (HTML shell) and `component` (sidebar layout). The `RootLayout` component renders `<Sidebar />` + `<Outlet />`. The `NavLink` component uses `useRouterState` to determine the active route for highlighting.

## Conventions

### Naming

- Route files: `kebab-case` or TanStack dynamic params (`$taskId`)
- Components: `PascalCase`
- CSS classes: `kebab-case` (`.model-card`, `.log-terminal`, etc.)

### TypeScript

- All route components use `createFileRoute` from `@tanstack/react-router`
- Strict mode enabled; prefer explicit types over inference for props

### Fonts

`JetBrains Mono` is used for all numeric/code/metric values. `Sora` (with `Noto Sans SC` CJK fallback) for UI text. Applied via Google Fonts `@import` in `styles.css`.

### Adding New Routes

1. Create the file in `src/routes/` following the naming convention
2. Export `Route = createFileRoute('/path')({ component: ... })`
3. Add a `NavLink` entry in `__root.tsx` if it needs sidebar navigation
4. TanStack Router auto-generates the route tree — no manual registration needed

### Adding Real Backend

To add real backend persistence, use Netlify Database (Postgres) via the `general-database` skill. Replace mock arrays in route files with server functions from `@tanstack/react-start/server`.

## Non-obvious Decisions

- **`select-card`** **pattern**: The model variant picker in the create wizard uses a custom `.select-card` CSS class with conditional border/background styles instead of radio inputs, for richer visual design.
- **Split bar visualization**: The train/val/test split is shown as a CSS flexbox bar with `flex: <ratio>` on each segment — no canvas or SVG needed.
- **Log terminal**: Simulated with a div + `useRef` scroll-to-bottom, styled with `.log-terminal` monospace class and color helper classes (`.log-info`, `.log-success`, etc.).
- **Sidebar** **`position: sticky`**: The sidebar is `sticky` with `height: 100vh` so it stays in view during page scroll without `fixed` positioning breaking document flow.

