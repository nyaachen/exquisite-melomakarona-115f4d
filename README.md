# 科宝训练平台

科宝训练平台 (Kebao Training Platform) is a professional YOLO model training management system built for computer vision AI pipelines. It enables data scientists and ML engineers to manage the full lifecycle of YOLO object detection models — from dataset ingestion to cloud training to model publishing.

## Key Features

- **Dataset Management** — Import and manage annotated image datasets synchronized from 科宝标注平台 (Kebao Annotation Platform)
- **Training Task Creation** — Multi-step wizard for configuring train/val/test splits, base model selection (YOLOv8 variants), and hyperparameter tuning
- **Cloud Training Execution** — Monitor training jobs running on GPU cloud servers with real-time metrics and logs
- **Model Validation** — Per-class metrics (mAP, Precision, Recall, F1) on validation sets
- **Model Publishing** — One-click publish to 科宝智能体中台 (Kebao Agent Hub) for production inference

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | TanStack Start (SSR + React 19) |
| Routing | TanStack Router v1 (file-based) |
| Build | Vite 7 |
| Styling | Tailwind CSS 4 + custom CSS variables |
| Icons | Lucide React |
| Language | TypeScript 5.7 (strict mode) |
| Deployment | Netlify |

## Getting Started

```bash
# Install dependencies
npm install

# Start development server (port 3000)
npm run dev

# Production build
npm run build
```

The app is also served via Netlify Dev on port 8888 when using the Netlify CLI:

```bash
netlify dev
```

## Navigation

| Route | Description |
|-------|-------------|
| `/` | Training overview dashboard |
| `/tasks` | All training tasks list |
| `/tasks/create` | 4-step training task creation wizard |
| `/tasks/:taskId` | Task detail with live metrics and logs |
| `/models` | Model management, validation, and publishing |
| `/datasets` | Dataset sync from 科宝标注平台 |
| `/monitor` | Real-time GPU resource monitoring |
