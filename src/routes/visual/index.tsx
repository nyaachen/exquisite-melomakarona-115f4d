import { createFileRoute, Link } from '@tanstack/react-router'
import { Eye, Package, TrendingUp, CheckCircle2, Layers, Clock, Target } from 'lucide-react'

export const Route = createFileRoute('/visual/')({
  component: VisualList,
})

interface VisualModel {
  id: string
  name: string
  taskId: string
  taskName: string
  baseModel: string
  mAP: number
  precision: number
  recall: number
  f1: number
  size: string
  classes: string[]
  imgSize: number
  status: 'ready' | 'published'
  trainedAt: string
  valImages: number
  format: string
}

const VISUAL_MODELS: VisualModel[] = [
  {
    id: 'model-002',
    name: '施工安全帽检测 v1.0',
    taskId: 'task-002',
    taskName: '施工人员安全帽检测',
    baseModel: 'YOLOv8s',
    mAP: 0.923,
    precision: 0.941,
    recall: 0.908,
    f1: 0.924,
    size: '22.4 MB',
    classes: ['安全帽', '无安全帽', '人员'],
    imgSize: 640,
    status: 'published',
    trainedAt: '2026-04-28 18:12',
    valImages: 478,
    format: 'PT + ONNX',
  },
  {
    id: 'model-001',
    name: '道路缺陷检测 v2.3',
    taskId: 'task-001',
    taskName: '道路缺陷检测 v2.3',
    baseModel: 'YOLOv8m',
    mAP: 0.782,
    precision: 0.831,
    recall: 0.748,
    f1: 0.788,
    size: '51.7 MB',
    classes: ['裂缝', '坑洼', '破损', '剥落', '标线模糊', '积水', '障碍物'],
    imgSize: 640,
    status: 'ready',
    trainedAt: '2026-04-29 11:30',
    valImages: 975,
    format: 'PT',
  },
  {
    id: 'model-003',
    name: '人员跌倒检测 v1.0',
    taskId: 'task-005',
    taskName: '人员跌倒检测 v1.0',
    baseModel: 'YOLOv8s',
    mAP: 0.887,
    precision: 0.912,
    recall: 0.865,
    f1: 0.888,
    size: '22.1 MB',
    classes: ['正常站立', '跌倒'],
    imgSize: 640,
    status: 'published',
    trainedAt: '2026-04-26 17:40',
    valImages: 642,
    format: 'PT + ONNX + TensorRT',
  },
  {
    id: 'model-004',
    name: '火焰烟雾检测 v2.1',
    taskId: 'task-006',
    taskName: '火焰烟雾检测',
    baseModel: 'YOLOv8m',
    mAP: 0.911,
    precision: 0.928,
    recall: 0.897,
    f1: 0.912,
    size: '52.3 MB',
    classes: ['火焰', '浓烟', '轻烟'],
    imgSize: 640,
    status: 'ready',
    trainedAt: '2026-04-25 14:03',
    valImages: 1120,
    format: 'PT',
  },
]

function VisualList() {
  return (
    <div style={{ animation: 'slideIn 0.3s ease-out' }}>
      <div className="page-header">
        <div>
          <div className="breadcrumb">科宝训练平台 › 模型可视化</div>
          <h1 className="page-title">模型可视化</h1>
        </div>
      </div>

      <div style={{ padding: '24px 32px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 20 }}>
          {VISUAL_MODELS.map((model) => (
            <Link
              key={model.id}
              to="/visual/$modelId"
              params={{ modelId: model.id }}
              style={{ textDecoration: 'none', display: 'block' }}
            >
              <div className="card" style={{ padding: 20, transition: 'all 0.2s ease', cursor: 'pointer' }}>
                <div style={{ display: 'flex', gap: 16 }}>
                  <div style={{
                    width: 64,
                    height: 64,
                    borderRadius: 12,
                    background: 'var(--accent-glow)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}>
                    <Eye size={28} style={{ color: 'var(--accent)' }} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                      <h3 style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
                        {model.name}
                      </h3>
                      <span className={`badge ${model.status === 'published' ? 'badge-published' : 'badge-pending'}`}>
                        {model.status === 'published' ? '已发布' : '待发布'}
                      </span>
                    </div>
                    <p style={{ fontSize: 12, color: 'var(--text-secondary)', margin: '0 0 8px 0' }}>
                      {model.taskName}
                    </p>
                    <div style={{ display: 'flex', gap: 12, fontSize: 11, color: 'var(--text-muted)' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <Layers size={10} /> {model.baseModel}
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <Package size={10} /> {model.classes.length} 类
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <Clock size={10} /> {model.trainedAt}
                      </span>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 12, marginTop: 16, paddingTop: 16, borderTop: '1px solid var(--border-dim)' }}>
                  <div style={{ flex: 1, textAlign: 'center', padding: '10px 12px', background: 'var(--bg-elevated)', borderRadius: 8 }}>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>mAP@0.5</div>
                    <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--success)', fontFamily: 'JetBrains Mono' }}>
                      {model.mAP.toFixed(3)}
                    </div>
                  </div>
                  <div style={{ flex: 1, textAlign: 'center', padding: '10px 12px', background: 'var(--bg-elevated)', borderRadius: 8 }}>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>Precision</div>
                    <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--teal)', fontFamily: 'JetBrains Mono' }}>
                      {model.precision.toFixed(3)}
                    </div>
                  </div>
                  <div style={{ flex: 1, textAlign: 'center', padding: '10px 12px', background: 'var(--bg-elevated)', borderRadius: 8 }}>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>Recall</div>
                    <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--warning)', fontFamily: 'JetBrains Mono' }}>
                      {model.recall.toFixed(3)}
                    </div>
                  </div>
                  <div style={{ flex: 1, textAlign: 'center', padding: '10px 12px', background: 'var(--bg-elevated)', borderRadius: 8 }}>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>F1 Score</div>
                    <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--accent-bright)', fontFamily: 'JetBrains Mono' }}>
                      {model.f1.toFixed(3)}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 16, paddingTop: 16, borderTop: '1px solid var(--border-dim)' }}>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                    <span>输入: {model.imgSize}×{model.imgSize}</span>
                    <span style={{ margin: '0 8px' }}>•</span>
                    <span>验证: {model.valImages} 张</span>
                    <span style={{ margin: '0 8px' }}>•</span>
                    <span>大小: {model.size}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--accent-bright)', fontWeight: 600 }}>
                    <Target size={14} /> 在线体验
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}