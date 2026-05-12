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
│   ├── __root.tsx             # Root layout: sidebar nav + Outlet
│   ├── index.tsx              # Redirect / → /plaza
│   ├── plaza/
│   │   ├── index.tsx          # Model plaza: published model grid
│   │   └── $modelId.tsx       # Model detail: metrics, prediction, publish
│   ├── model-management/
│   │   ├── index.tsx          # Model management: version history list
│   │   └── upload.tsx         # Manual .pt model file upload
│   ├── train/
│   │   ├── index.tsx          # All training tasks list table
│   │   ├── create.tsx         # 3-step wizard (datasets → model/params → review)
│   │   └── $taskId.tsx        # Task detail: live metrics, charts, log, publish
│   ├── architectures/
│   │   ├── index.tsx          # Model architecture templates list
│   │   ├── create.tsx         # Create architecture with dynamic params
│   │   └── $architectureId.tsx # Edit architecture template
│   ├── presets/
│   │   ├── index.tsx          # Training presets list (public/private)
│   │   ├── create.tsx         # Create preset from architecture template
│   │   └── $presetId.tsx      # Edit preset parameters and visibility
│   ├── datasets/
│   │   ├── index.tsx          # Dataset sync from 科宝标注平台
│   │   └── $datasetId.tsx     # Dataset detail: labels, image preview, bounding boxes
│   ├── validate/
│   │   ├── index.tsx          # Validation tasks list
│   │   ├── create.tsx         # Create validation task (model + dataset)
│   │   └── $taskId.tsx        # Validation detail: per-class metrics, grading
│   ├── gpu-servers/
│   │   ├── index.tsx          # GPU server list
│   │   ├── create.tsx         # Add GPU server
│   │   └── $serverId/
│   │       ├── index.tsx      # Server detail
│   │       └── execute.tsx    # Remote command execution terminal
│   ├── monitor/
│   │   └── index.tsx          # Resource monitoring dashboard
│   └── system/
│       └── user.tsx           # User profile page (stub)
├── components/
│   ├── train/                 # Training-related components
│   │   ├── DatasetStep.tsx    # Step 1: dataset selection
│   │   ├── ModelConfigStep.tsx # Step 2: model & hyperparameter config
│   │   ├── ReviewStep.tsx     # Step 3: review & launch
│   │   ├── CreateStepper.tsx  # 3-step progress indicator
│   │   ├── CreateBottomBar.tsx # Bottom action bar for wizard
│   │   ├── SectionTitle.tsx   # Section header with icon
│   │   ├── TaskHeader.tsx     # Training task detail header
│   │   ├── TaskInfoCards.tsx  # Task status/info card grid
│   │   ├── TrainingChartsSection.tsx # Metric charts
│   │   ├── TrainingLogPanel.tsx # Real-time log terminal
│   │   ├── ReLineChart.tsx    # Recharts line chart wrapper
│   │   ├── CompletedTaskPanel.tsx # Post-training actions
│   │   ├── PublishModelModal.tsx # Publish-to-hub modal
│   │   └── ModelValidationPanel.tsx # Validation panel within task detail
│   ├── monitor/               # Monitor components
│   │   ├── ResourceMonitor.tsx # GPU/CPU/Memory charts
│   │   ├── TaskMonitor.tsx    # Active task monitoring
│   │   └── SystemLogs.tsx     # System log viewer
│   ├── DatasetPicker.tsx      # Reusable dataset picker with grouping
│   ├── DatasetSplitManager.tsx # Train/val/test split configurator
│   ├── SplitAdjuster.tsx      # Ratio slider adjuster
│   ├── SearchableDropdown.tsx # Searchable dropdown with keyboard nav
│   ├── AnnotationPreview.tsx  # Bounding box overlay preview
│   ├── ClassDistributionChart.tsx # Per-class distribution chart
│   └── NotFound.tsx           # 404 page component
├── data/                      # Mock data modules
│   ├── userinfo.ts
│   ├── gpuServers.ts
│   ├── train-tasks.ts
│   ├── validate.ts
│   ├── plaza-models.ts
│   └── architectures.ts
├── lib/                       # Utility modules
├── styles.css                 # All styling: CSS variables, component classes, animations
└── router.tsx                 # TanStack Router setup
```

## Architecture Decisions

### Styling Approach

All styles are in `src/styles.css` using plain CSS classes — **not Tailwind utility classes** (except `@import "tailwindcss"`). The design uses a CSS variable system for the light theme. Component-specific class names (`.card`, `.btn`, `.badge`, `.nav-link`, etc.) are defined there. This makes it easy to maintain a cohesive visual system without class pollution.

### Color System

CSS variables define the entire palette (see `:root` in `styles.css`). The theme is light (`--bg-base: #ffffff`) with blue (`--accent: #1d4ed8`) and teal (`--teal: #0d9488`) accents. All status colors (running, completed, failed, pending, published) have dedicated variables.

### Mock Data

All data is **in-memory mock data** defined in `src/data/` modules and consumed by route files. There is no backend or database. Task IDs `task-001` through `task-006` and model IDs `model-001` through `model-004` are pre-defined. The create task wizard navigates to `task-001` after submission.

### Real-time Simulation

- `train/$taskId.tsx` uses `useEffect` with `setInterval` to simulate live training progress when `status === 'running'`. The interval fires every 1200ms, incrementing epoch count and updating metrics/logs.
- `validate/$taskId.tsx` uses a similar interval pattern to poll validation progress.
- `gpu-servers/$serverId/execute.tsx` uses `useSimulatedWebSocket` to simulate WebSocket-based remote command execution with log streaming.

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
- **Icon-as-string pattern in constants**: `GRADE_THRESHOLDS` stores icon names as strings (`'CheckCircle2'`, `'AlertCircle'`, `'XCircle'`). Route files use a local `RenderIcon` switch function to map these strings back to Lucide components at render time.
- **WebSocket simulation**: `lib/useSimulatedWebSocket.ts` provides a hook that mimics WebSocket lifecycle (connect, disconnect, data events) using `setInterval` timers — no real network connection.
- **Plaza vs Model Management**: `/plaza` is the public-facing model hub for browsing and publishing; `/model-management` is the internal model registry for version tracking and manual uploads.

