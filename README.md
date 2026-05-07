# 科宝训练平台

科宝训练平台 (Kebao Training Platform) is a professional YOLO model training management system built for computer vision AI pipelines. It enables data scientists and ML engineers to manage the full lifecycle of YOLO object detection models — from dataset ingestion to cloud training to model publishing.

## Key Features

- **模型广场 (Model Hub)** — Browse, validate, and publish trained YOLO models to the 科宝智能体中台 (Kebao Agent Hub)
- **数据集管理 (Dataset Management)** — Import and manage annotated image datasets synchronized from 科宝标注平台 (Kebao Annotation Platform)
- **数据切分 (Data Splitting)** — Configure train/val/test split ratios with visual distribution bars
- **训练预设 (Training Templates)** — Reusable hyperparameter and base model configuration presets for training jobs
- **训练任务 (Training Tasks)** — Launch and monitor GPU cloud training jobs with real-time metrics and logs
- **验证任务 (Validation Tasks)** — Run validation against trained models with per-class metrics (mAP, Precision, Recall, F1)
- **资源监控 (Resource Monitoring)** — Real-time GPU utilization and cloud server status dashboard
- **FAQ** — Frequently asked questions and troubleshooting guide

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | TanStack Start (SSR + React 19) |
| Routing | TanStack Router v1 (file-based) |
| Build | Vite 7 |
| Styling | Tailwind CSS 4 + custom CSS variables |
| Charts | Recharts |
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
| `/` | Dashboard — training overview, stats, and recent tasks |
| `/models` | Model hub — browse, validate, and publish models |
| `/models/create` | Create a new model entry |
| `/models/manualUpload` | Manually upload a model file |
| `/models/:modelId` | Model detail with validation reports and publish actions |
| `/datasets` | Dataset management — sync from 科宝标注平台 |
| `/datasets/:datasetId` | Dataset detail view |
| `/split` | Data split configurations for train/val/test |
| `/split/create` | Create a new split configuration |
| `/template` | Training template presets |
| `/template/create` | Create a new training template |
| `/template/:templateId` | Template detail view |
| `/train` | Training task list and management |
| `/train/create` | Launch a new training task |
| `/train/:taskId` | Training task detail — live metrics, logs, and progress |
| `/validate` | Validation task list |
| `/validate/create` | Create a new validation task |
| `/validate/:taskId` | Validation task detail with per-class metrics |
| `/monitor` | Real-time GPU resource monitoring |
| `/faq` | Frequently asked questions |
| `/system/user` | User profile and settings |
