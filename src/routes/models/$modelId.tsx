import { createFileRoute, Link } from '@tanstack/react-router'
import {
  Package,
  Tag,
  Clock,
  CheckCircle2,
  ArrowLeft,
  User,
  Layers,
  ExternalLink,
  Zap,
} from 'lucide-react'
import { NotFound } from '../../components/NotFound'
import { ModelValidationPanel } from '../../components/train/ModelValidationPanel'

export const Route = createFileRoute('/models/$modelId')({
  component: ModelDetail,
})

interface SquareModel {
  id: string
  name: string
  description: string
  category: string
  baseModel: string
  classes: string[]
  classColors: string[]
  totalVersions: number
  publishedVersions: number
  latestVersion: string
  latestMAP: number
  latestF1: number
  latestPrecision: number
  latestRecall: number
  createdAt: string
  author: string
  size?: string
  imgSize?: number
  valImages?: number
}

const SQUARE_MODELS: SquareModel[] = [
  {
    id: 'sq-model-001',
    name: '道路缺陷检测',
    description: '支持裂缝、坑洼、破损、剥落、标线模糊、积水、障碍物等道路病害检测',
    category: '缺陷检测',
    baseModel: 'YOLOv8m',
    classes: ['裂缝', '坑洼', '破损', '剥落', '标线模糊', '积水', '障碍物'],
    classColors: ['#409eff', '#f56c6c', '#e6a23c', '#8b5cf6', '#67c23a', '#06b6d4', '#6366f1'],
    totalVersions: 3,
    publishedVersions: 2,
    latestVersion: 'v2.3',
    latestMAP: 0.782,
    latestF1: 0.788,
    latestPrecision: 0.831,
    latestRecall: 0.748,
    createdAt: '2026-03-15',
    author: '张工',
    size: '51.7 MB',
    imgSize: 640,
    valImages: 975,
  },
  {
    id: 'sq-model-002',
    name: '施工安全帽检测',
    description: '精准检测施工人员安全帽佩戴情况，支持安全帽、无安全帽、人员三类目标',
    category: '安全检测',
    baseModel: 'YOLOv8s',
    classes: ['安全帽', '无安全帽', '人员'],
    classColors: ['#409eff', '#f56c6c', '#67c23a'],
    totalVersions: 2,
    publishedVersions: 1,
    latestVersion: 'v1.0',
    latestMAP: 0.923,
    latestF1: 0.924,
    latestPrecision: 0.941,
    latestRecall: 0.908,
    createdAt: '2026-04-20',
    author: '李工',
    size: '22.4 MB',
    imgSize: 640,
    valImages: 478,
  },
  {
    id: 'sq-model-003',
    name: '人员跌倒检测',
    description: '实时检测人员跌倒行为，适用于监控场景下的安全预警',
    category: '行为检测',
    baseModel: 'YOLOv8s',
    classes: ['正常站立', '跌倒'],
    classColors: ['#67c23a', '#f56c6c'],
    totalVersions: 2,
    publishedVersions: 1,
    latestVersion: 'v1.0',
    latestMAP: 0.887,
    latestF1: 0.888,
    latestPrecision: 0.912,
    latestRecall: 0.865,
    createdAt: '2026-04-18',
    author: '王工',
    size: '22.1 MB',
    imgSize: 640,
    valImages: 642,
  },
  {
    id: 'sq-model-004',
    name: '火焰烟雾检测',
    description: '快速识别火焰和烟雾，及时预警火灾风险',
    category: '安全检测',
    baseModel: 'YOLOv8m',
    classes: ['火焰', '浓烟', '轻烟'],
    classColors: ['#f56c6c', '#6b7280', '#9ca3af'],
    totalVersions: 3,
    publishedVersions: 2,
    latestVersion: 'v2.1',
    latestMAP: 0.911,
    latestF1: 0.912,
    latestPrecision: 0.928,
    latestRecall: 0.897,
    createdAt: '2026-04-05',
    author: '赵工',
    size: '51.2 MB',
    imgSize: 640,
    valImages: 856,
  },
]

const TEST_IMAGES = [
  { id: 'test-001', name: 'test_0001.jpg', width: 640, height: 480 },
  { id: 'test-002', name: 'test_0002.jpg', width: 640, height: 480 },
  { id: 'test-003', name: 'test_0003.jpg', width: 640, height: 480 },
  { id: 'test-004', name: 'test_0004.jpg', width: 640, height: 480 },
  { id: 'test-005', name: 'test_0005.jpg', width: 640, height: 480 },
]

function ModelDetail() {
  const { modelId } = Route.useParams()
  const model = SQUARE_MODELS.find(m => m.id === modelId)
  if (!model) return <NotFound />

  return (
    <div className="slide-in">
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Link to="/models" className="btn btn-ghost btn-sm">
            <ArrowLeft size={14} /> 返回
          </Link>
          <div>
            <div className="breadcrumb">
              <Link to="/">科宝训练平台</Link> ›
              <Link to="/models">模型管理</Link> ›
              <span>{model.name}</span>
            </div>
            <h1 className="page-title">{model.name}</h1>
          </div>
        </div>
      </div>

      <div className="p-content">
        <div className="model-detail-grid">
          <div>
            <div className="card" style={{ padding: 24 }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16, marginBottom: 20 }}>
                <div className="model-icon">
                  <Package size={28} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 24, fontWeight: 700, color: 'var(--text-primary)' }}>{model.name}</div>
                  <p style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{model.description}</p>
                </div>
                <span className="badge badge-published">
                  <CheckCircle2 size={10} /> 已发布
                </span>
              </div>

              <div style={{ display: 'flex', gap: 24, paddingBottom: 20, borderBottom: '1px solid var(--border-dim)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 10, color: 'var(--text-muted)' }}>
                  <User size={12} />
                  <span>{model.author}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 10, color: 'var(--text-muted)' }}>
                  <Clock size={12} />
                  <span>创建于 {model.createdAt}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 10, color: 'var(--text-muted)' }}>
                  <Tag size={12} />
                  <span>{model.category}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 10, color: 'var(--text-muted)' }}>
                  <Layers size={12} />
                  <span>基础: {model.baseModel}</span>
                </div>
              </div>

              <div style={{ marginTop: 20 }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 12 }}>最新版本 {model.latestVersion} · 评估指标</div>
                <div className="card card-padded">
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
                    <MetricCard label="mAP@0.5" value={model.latestMAP.toFixed(3)} color="var(--accent-bright)" />
                    <MetricCard label="Precision" value={model.latestPrecision.toFixed(3)} color="var(--teal)" />
                    <MetricCard label="Recall" value={model.latestRecall.toFixed(3)} color="var(--warning)" />
                    <MetricCard label="F1 Score" value={model.latestF1.toFixed(3)} color="var(--success)" />
                  </div>
                </div>
              </div>
            </div>

            <div className="card" style={{ padding: 24, marginTop: 24 }}>
              <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 16 }}>检测类别</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                {model.classes.map((cls, index) => (
                  <div key={cls} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div
                      className="class-color"
                      style={{ background: model.classColors[index] || `hsl(${(index * 50) % 360}, 70%, 50%)` }}
                    />
                    <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{cls}</span>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ marginTop: 24 }}>
              <ModelValidationPanel
                prefix={model.id}
                classes={model.classes}
                classColors={model.classColors}
                testImages={TEST_IMAGES}
              />
            </div>
          </div>

          <div className="model-detail-sidebar">
            <div className="card card-padded">
              <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 16 }}>快速操作</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <Link to="/train/create" className="btn btn-primary">
                  <Zap size={14} /> 以此模型开始训练
                </Link>
                <Link to="/validate/create" className="btn btn-teal">
                  <CheckCircle2 size={14} /> 验证该模型
                </Link>
                <a href="https://kebao-platform.example.com" className="btn btn-accent" target="_blank" rel="noopener noreferrer">
                  <ExternalLink size={14} /> 前往科宝平台使用模型
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function MetricCard({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="stat-card metric-card">
      <div style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 4 }}>{label}</div>
      <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 24, fontWeight: 600, color }}>{value}</div>
    </div>
  )
}
