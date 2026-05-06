import { createFileRoute, Link } from '@tanstack/react-router'
import { useState } from 'react'
import {
  Package,
  Tag,
  Clock,
  CheckCircle2,
  TrendingUp,
  Layers,
  User,
  FlaskConical,
  Rocket,
  Archive,
} from 'lucide-react'

export const Route = createFileRoute('/square/')({
  component: SquareList,
})

interface ModelVersion {
  version: string
  mAP: number
  precision: number
  recall: number
  f1: number
  trainedAt: string
  taskId: string
  status: 'published' | 'archived'
}

interface SquareModel {
  id: string
  name: string
  description: string
  category: string
  baseModel: string
  classes: string[]
  totalVersions: number
  publishedVersions: number
  latestVersion: string
  latestMAP: number
  latestF1: number
  createdAt: string
  author: string
  versions: ModelVersion[]
}

const SQUARE_MODELS: SquareModel[] = [
  {
    id: 'sq-model-001',
    name: '道路缺陷检测',
    description: '支持裂缝、坑洼、破损、剥落、标线模糊、积水、障碍物等道路病害检测',
    category: '缺陷检测',
    baseModel: 'YOLOv8m',
    classes: ['裂缝', '坑洼', '破损', '剥落', '标线模糊', '积水', '障碍物'],
    totalVersions: 3,
    publishedVersions: 2,
    latestVersion: 'v2.3',
    latestMAP: 0.782,
    latestF1: 0.788,
    createdAt: '2026-03-15',
    author: '张工',
    versions: [
      { version: 'v2.3', mAP: 0.782, precision: 0.831, recall: 0.748, f1: 0.788, trainedAt: '2026-04-29 11:30', taskId: 'task-001', status: 'published' },
      { version: 'v2.2', mAP: 0.751, precision: 0.812, recall: 0.701, f1: 0.752, trainedAt: '2026-04-10 09:15', taskId: 'task-old-001', status: 'published' },
      { version: 'v2.1', mAP: 0.698, precision: 0.765, recall: 0.652, f1: 0.704, trainedAt: '2026-03-28 14:20', taskId: 'task-old-002', status: 'archived' },
    ],
  },
  {
    id: 'sq-model-002',
    name: '施工安全帽检测',
    description: '精准检测施工人员安全帽佩戴情况，支持安全帽、无安全帽、人员三类目标',
    category: '安全检测',
    baseModel: 'YOLOv8s',
    classes: ['安全帽', '无安全帽', '人员'],
    totalVersions: 2,
    publishedVersions: 1,
    latestVersion: 'v1.0',
    latestMAP: 0.923,
    latestF1: 0.924,
    createdAt: '2026-04-20',
    author: '李工',
    versions: [
      { version: 'v1.0', mAP: 0.923, precision: 0.941, recall: 0.908, f1: 0.924, trainedAt: '2026-04-28 18:12', taskId: 'task-002', status: 'published' },
    ],
  },
  {
    id: 'sq-model-003',
    name: '人员跌倒检测',
    description: '实时检测人员跌倒行为，适用于监控场景下的安全预警',
    category: '行为检测',
    baseModel: 'YOLOv8s',
    classes: ['正常站立', '跌倒'],
    totalVersions: 2,
    publishedVersions: 1,
    latestVersion: 'v1.0',
    latestMAP: 0.887,
    latestF1: 0.888,
    createdAt: '2026-04-18',
    author: '王工',
    versions: [
      { version: 'v1.0', mAP: 0.887, precision: 0.912, recall: 0.865, f1: 0.888, trainedAt: '2026-04-26 17:40', taskId: 'task-005', status: 'published' },
    ],
  },
  {
    id: 'sq-model-004',
    name: '火焰烟雾检测',
    description: '快速识别火焰和烟雾，及时预警火灾风险',
    category: '安全检测',
    baseModel: 'YOLOv8m',
    classes: ['火焰', '浓烟', '轻烟'],
    totalVersions: 3,
    publishedVersions: 2,
    latestVersion: 'v2.1',
    latestMAP: 0.911,
    latestF1: 0.912,
    createdAt: '2026-04-05',
    author: '赵工',
    versions: [
      { version: 'v2.1', mAP: 0.911, precision: 0.928, recall: 0.897, f1: 0.912, trainedAt: '2026-04-25 14:03', taskId: 'task-006', status: 'published' },
      { version: 'v2.0', mAP: 0.875, precision: 0.895, recall: 0.858, f1: 0.876, trainedAt: '2026-04-12 10:30', taskId: 'task-old-003', status: 'published' },
      { version: 'v1.5', mAP: 0.812, precision: 0.834, recall: 0.791, f1: 0.812, trainedAt: '2026-03-30 16:45', taskId: 'task-old-004', status: 'archived' },
    ],
  },
]

function SquareList() {
  const [expandedModel, setExpandedModel] = useState<string | null>(null)
  const [selectedVersion, setSelectedVersion] = useState<string | null>(null)

  return (
    <div style={{ animation: 'slideIn 0.3s ease-out' }}>
      <div className="page-header">
        <div>
          <div className="breadcrumb">科宝训练平台 › 模型广场</div>
          <h1 className="page-title">模型广场</h1>
        </div>
        <Link to="/square/create" className="btn btn-primary">
          <Rocket size={15} /> 发布模型
        </Link>
      </div>

      <div style={{ padding: '24px 32px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 24 }}>
          {[
            { label: '模型总数', value: SQUARE_MODELS.length, color: 'var(--accent-bright)' },
            { label: '已发布版本', value: SQUARE_MODELS.reduce((s, m) => s + m.publishedVersions, 0), color: 'var(--teal)' },
            { label: '最高 mAP', value: Math.max(...SQUARE_MODELS.map(m => m.latestMAP)).toFixed(3), color: 'var(--success)' },
            { label: '平均 F1', value: (SQUARE_MODELS.reduce((s, m) => s + m.latestF1, 0) / SQUARE_MODELS.length).toFixed(3), color: 'var(--warning)' },
          ].map(s => (
            <div key={s.label} className="stat-card" style={{ padding: 16 }}>
              <div className="stat-label">{s.label}</div>
              <div className="metric-chip-value" style={{ fontFamily: 'JetBrains Mono', fontSize: 26, color: s.color, margin: '6px 0 2px' }}>{s.value}</div>
            </div>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
          {SQUARE_MODELS.map((model) => (
            <div key={model.id} className="model-card published">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{
                    width: 48,
                    height: 48,
                    borderRadius: 10,
                    background: 'var(--accent-glow)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}>
                    <Package size={22} style={{ color: 'var(--accent)' }} />
                  </div>
                  <div>
                    <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 2 }}>{model.name}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: 'var(--text-muted)' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                        <User size={10} /> {model.author}
                      </span>
                      <span>·</span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                        <Clock size={10} /> {model.createdAt}
                      </span>
                    </div>
                  </div>
                </div>
                <span className="badge badge-category">{model.category}</span>
              </div>

              <p style={{ fontSize: 12, color: 'var(--text-secondary)', margin: '0 0 14px 0', lineHeight: 1.5 }}>
                {model.description}
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, marginBottom: 14 }}>
                {[
                  { label: '最新版本', value: model.latestVersion, color: 'var(--accent-bright)' },
                  { label: 'mAP@0.5', value: model.latestMAP.toFixed(3), color: 'var(--success)' },
                  { label: 'F1 Score', value: model.latestF1.toFixed(3), color: 'var(--teal)' },
                  { label: '版本数', value: `${model.publishedVersions}/${model.totalVersions}`, color: 'var(--warning)' },
                ].map(m => (
                  <div key={m.label} className="metric-chip">
                    <div className="metric-chip-value" style={{ color: m.color, fontSize: 13 }}>{m.value}</div>
                    <div className="metric-chip-label">{m.label}</div>
                  </div>
                ))}
              </div>

              <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', marginBottom: 14 }}>
                {model.classes.map(cls => (
                  <span key={cls} style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-default)', borderRadius: 4, padding: '2px 7px', fontSize: 11, color: 'var(--text-secondary)' }}>
                    {cls}
                  </span>
                ))}
              </div>

              <div style={{ display: 'flex', gap: 6, fontSize: 11, color: 'var(--text-muted)', marginBottom: 12, flexWrap: 'wrap' }}>
                <span>基础: <span style={{ color: 'var(--text-secondary)', fontFamily: 'JetBrains Mono' }}>{model.baseModel}</span></span>
              </div>

              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={() => setExpandedModel(expandedModel === model.id ? null : model.id)}
                >
                  <Layers size={13} /> {expandedModel === model.id ? '收起版本' : `版本历史 (${model.versions.length})`}
                </button>
                <Link
                  to="/visual/$modelId"
                  params={{ modelId: model.id }}
                  className="btn btn-sm"
                  style={{ background: 'rgba(10,184,158,0.08)', color: 'var(--teal)', border: '1px solid rgba(10,184,158,0.2)' }}
                >
                  <TrendingUp size={13} /> 在线体验
                </Link>
              </div>

              {expandedModel === model.id && (
                <div style={{ marginTop: 14, paddingTop: 14, borderTop: '1px solid var(--border-dim)', animation: 'slideDown 0.2s ease-out' }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 10 }}>版本详情</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {model.versions.map((ver) => (
                      <div
                        key={ver.version}
                        className="select-card"
                        style={{
                          padding: '10px 12px',
                          cursor: 'pointer',
                          borderColor: selectedVersion === `${model.id}-${ver.version}` ? 'var(--accent)' : undefined,
                          opacity: ver.status === 'archived' ? 0.6 : 1,
                        }}
                        onClick={() => setSelectedVersion(`${model.id}-${ver.version}`)}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <span style={{ fontFamily: 'JetBrains Mono', fontWeight: 600, color: 'var(--text-primary)' }}>
                              {ver.version}
                            </span>
                            <span className={`badge ${ver.status === 'published' ? 'badge-published' : 'badge-archived'}`}>
                              {ver.status === 'published' ? <CheckCircle2 size={8} /> : <Archive size={8} />}
                              {ver.status === 'published' ? '已发布' : '已归档'}
                            </span>
                          </div>
                          <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>{ver.trainedAt}</span>
                        </div>
                        <div style={{ display: 'flex', gap: 12, fontSize: 11, color: 'var(--text-secondary)' }}>
                          <span>mAP: <span style={{ fontFamily: 'JetBrains Mono', color: 'var(--success)' }}>{ver.mAP.toFixed(3)}</span></span>
                          <span>Precision: <span style={{ fontFamily: 'JetBrains Mono', color: 'var(--teal)' }}>{ver.precision.toFixed(3)}</span></span>
                          <span>Recall: <span style={{ fontFamily: 'JetBrains Mono', color: 'var(--warning)' }}>{ver.recall.toFixed(3)}</span></span>
                          <span>F1: <span style={{ fontFamily: 'JetBrains Mono', color: 'var(--accent-bright)' }}>{ver.f1.toFixed(3)}</span></span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}