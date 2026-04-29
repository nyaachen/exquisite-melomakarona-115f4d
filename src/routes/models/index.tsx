import { createFileRoute, Link } from '@tanstack/react-router'
import { useState } from 'react'
import {
  Package,
  FlaskConical,
  Rocket,
  CheckCircle2,
  Download,
  X,
  ArrowRight,
  Shield,
  ExternalLink,
} from 'lucide-react'

export const Route = createFileRoute('/models/')({
  component: ModelsPage,
})

const MODELS = [
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
    status: 'published' as const,
    publishedTo: '科宝智能体中台·工地安全模块',
    publishedAt: '2026-04-28 18:45',
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
    status: 'ready' as const,
    publishedTo: null,
    publishedAt: null,
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
    status: 'published' as const,
    publishedTo: '科宝智能体中台·安全监控模块',
    publishedAt: '2026-04-27 09:15',
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
    status: 'ready' as const,
    publishedTo: null,
    publishedAt: null,
    trainedAt: '2026-04-25 14:03',
    valImages: 1120,
    format: 'PT',
  },
]

const PUBLISH_TARGETS = [
  { id: 'safety', name: '工地安全模块', path: '科宝智能体中台 › 工地安全模块' },
  { id: 'traffic', name: '交通分析模块', path: '科宝智能体中台 › 交通分析模块' },
  { id: 'monitor', name: '安全监控模块', path: '科宝智能体中台 › 安全监控模块' },
  { id: 'factory', name: '工厂巡检模块', path: '科宝智能体中台 › 工厂巡检模块' },
  { id: 'road', name: '道路检测模块', path: '科宝智能体中台 › 道路检测模块' },
]

function ModelsPage() {
  const [publishModal, setPublishModal] = useState<string | null>(null)
  const [validateModal, setValidateModal] = useState<string | null>(null)
  const [publishTarget, setPublishTarget] = useState('safety')
  const [publishFormat, setPublishFormat] = useState('pt')
  const [publishing, setPublishing] = useState(false)
  const [published, setPublished] = useState<Record<string, boolean>>({})

  const publishModel = publishModal ? MODELS.find(m => m.id === publishModal) : null
  const validateModel = validateModal ? MODELS.find(m => m.id === validateModal) : null

  async function handlePublish() {
    setPublishing(true)
    await new Promise(r => setTimeout(r, 1800))
    setPublished(prev => ({ ...prev, [publishModal!]: true }))
    setPublishing(false)
    setPublishModal(null)
  }

  return (
    <div style={{ animation: 'slideIn 0.3s ease-out' }}>
      <div className="page-header">
        <div>
          <div className="breadcrumb">科宝训练平台 › 模型管理</div>
          <h1 className="page-title">模型管理</h1>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', padding: '6px 12px', background: 'var(--bg-card)', border: '1px solid var(--border-dim)', borderRadius: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
            <Shield size={12} style={{ color: 'var(--teal)' }} />
            已连接科宝智能体中台
          </div>
        </div>
      </div>

      <div style={{ padding: '24px 32px' }}>
        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 24 }}>
          {[
            { label: '模型总数', value: MODELS.length, color: 'var(--accent-bright)' },
            { label: '已发布', value: MODELS.filter(m => m.status === 'published' || published[m.id]).length, color: 'var(--teal)' },
            { label: '最高 mAP', value: Math.max(...MODELS.map(m => m.mAP)).toFixed(3), color: 'var(--success)' },
            { label: '平均 mAP', value: (MODELS.reduce((s, m) => s + m.mAP, 0) / MODELS.length).toFixed(3), color: 'var(--warning)' },
          ].map(s => (
            <div key={s.label} className="stat-card" style={{ padding: 16 }}>
              <div className="stat-label">{s.label}</div>
              <div className="metric-chip-value" style={{ fontFamily: 'JetBrains Mono', fontSize: 26, color: s.color, margin: '6px 0 2px' }}>{s.value}</div>
            </div>
          ))}
        </div>

        {/* Model Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          {MODELS.map(model => {
            const isPublished = model.status === 'published' || published[model.id]
            return (
              <div key={model.id} className={`model-card ${isPublished ? 'published' : ''}`}>
                {/* Card header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
                  <div>
                    <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>{model.name}</div>
                    <div style={{ fontSize: 11.5, color: 'var(--text-muted)' }}>
                      来自任务：<Link to="/tasks/$taskId" params={{ taskId: model.taskId }} style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>{model.taskName}</Link>
                    </div>
                  </div>
                  {isPublished ? (
                    <span className="badge badge-published">
                      <CheckCircle2 size={10} /> 已发布
                    </span>
                  ) : (
                    <span className="badge" style={{ background: 'var(--bg-elevated)', color: 'var(--text-secondary)', borderColor: 'var(--border-default)' }}>
                      就绪
                    </span>
                  )}
                </div>

                {/* Metrics */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, marginBottom: 14 }}>
                  {[
                    { label: 'mAP@0.5', value: model.mAP.toFixed(3), color: 'var(--success)' },
                    { label: 'Precision', value: model.precision.toFixed(3), color: 'var(--teal)' },
                    { label: 'Recall', value: model.recall.toFixed(3), color: 'var(--warning)' },
                    { label: 'F1-Score', value: model.f1.toFixed(3), color: 'var(--accent-bright)' },
                  ].map(m => (
                    <div key={m.label} className="metric-chip">
                      <div className="metric-chip-value" style={{ color: m.color, fontSize: 14 }}>{m.value}</div>
                      <div className="metric-chip-label">{m.label}</div>
                    </div>
                  ))}
                </div>

                {/* Info row */}
                <div style={{ display: 'flex', gap: 16, fontSize: 11.5, color: 'var(--text-muted)', marginBottom: 12, flexWrap: 'wrap' }}>
                  <span>基础: <span style={{ color: 'var(--text-secondary)', fontFamily: 'JetBrains Mono' }}>{model.baseModel}</span></span>
                  <span>大小: <span style={{ color: 'var(--text-secondary)', fontFamily: 'JetBrains Mono' }}>{model.size}</span></span>
                  <span>格式: <span style={{ color: 'var(--text-secondary)', fontFamily: 'JetBrains Mono' }}>{model.format}</span></span>
                  <span>验证集: <span style={{ color: 'var(--text-secondary)', fontFamily: 'JetBrains Mono' }}>{model.valImages}张</span></span>
                </div>

                {/* Classes */}
                <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', marginBottom: 14 }}>
                  {model.classes.map(cls => (
                    <span key={cls} style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-default)', borderRadius: 4, padding: '2px 7px', fontSize: 11, color: 'var(--text-secondary)' }}>
                      {cls}
                    </span>
                  ))}
                </div>

                {/* Published info */}
                {isPublished && (model.publishedTo || published[model.id]) && (
                  <div style={{ padding: '8px 12px', background: 'rgba(10,184,158,0.06)', borderRadius: 8, border: '1px solid rgba(10,184,158,0.15)', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6, fontSize: 12 }}>
                    <ExternalLink size={11} style={{ color: 'var(--teal)', flexShrink: 0 }} />
                    <span style={{ color: 'var(--teal)' }}>{model.publishedTo ?? (publishTarget && PUBLISH_TARGETS.find(t => t.id === publishTarget)?.path)}</span>
                    {model.publishedAt && <span style={{ color: 'var(--text-muted)', marginLeft: 'auto' }}>{model.publishedAt}</span>}
                  </div>
                )}

                {/* Actions */}
                <div style={{ display: 'flex', gap: 8 }}>
                  <button className="btn btn-secondary btn-sm" onClick={() => setValidateModal(model.id)}>
                    <FlaskConical size={13} /> 模型验证
                  </button>
                  {!isPublished && (
                    <button className="btn btn-teal btn-sm" onClick={() => setPublishModal(model.id)}>
                      <Rocket size={13} /> 发布到智能体中台
                    </button>
                  )}
                  <button className="btn btn-ghost btn-sm" style={{ marginLeft: 'auto' }}>
                    <Download size={13} /> 导出
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Publish Modal */}
      {publishModal && publishModel && (
        <div className="modal-backdrop" onClick={e => e.target === e.currentTarget && setPublishModal(null)}>
          <div className="modal">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                  <Rocket size={16} style={{ color: 'var(--teal)' }} />
                  <span style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' }}>发布模型</span>
                </div>
                <div style={{ fontSize: 12.5, color: 'var(--text-muted)' }}>{publishModel.name}</div>
              </div>
              <button onClick={() => setPublishModal(null)} className="btn btn-ghost btn-sm" style={{ padding: '4px 8px' }}>
                <X size={15} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label className="form-label">发布目标模块</label>
                <select className="form-input" value={publishTarget} onChange={e => setPublishTarget(e.target.value)}>
                  {PUBLISH_TARGETS.map(t => (
                    <option key={t.id} value={t.id}>{t.path}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="form-label">导出格式</label>
                <select className="form-input" value={publishFormat} onChange={e => setPublishFormat(e.target.value)}>
                  <option value="pt">PyTorch (.pt) — 推荐</option>
                  <option value="onnx">ONNX (.onnx) — 跨平台</option>
                  <option value="tensorrt">TensorRT — GPU 加速</option>
                  <option value="tflite">TensorFlow Lite — 移动端</option>
                </select>
              </div>

              {/* Model summary */}
              <div style={{ background: 'var(--bg-elevated)', borderRadius: 8, padding: '12px 14px', fontSize: 12 }}>
                <div style={{ color: 'var(--text-muted)', marginBottom: 6, fontWeight: 600 }}>模型信息</div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span style={{ color: 'var(--text-muted)' }}>mAP@0.5</span>
                  <span style={{ fontFamily: 'JetBrains Mono', color: 'var(--success)' }}>{publishModel.mAP.toFixed(3)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span style={{ color: 'var(--text-muted)' }}>模型大小</span>
                  <span style={{ fontFamily: 'JetBrains Mono', color: 'var(--text-primary)' }}>{publishModel.size}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>检测类别</span>
                  <span style={{ color: 'var(--text-primary)' }}>{publishModel.classes.join(', ')}</span>
                </div>
              </div>

              <div style={{ padding: '10px 12px', background: 'rgba(10,184,158,0.06)', borderRadius: 8, border: '1px solid rgba(10,184,158,0.15)', fontSize: 12, color: 'var(--text-secondary)', display: 'flex', gap: 7 }}>
                <ExternalLink size={12} style={{ color: 'var(--teal)', flexShrink: 0, marginTop: 1 }} />
                <span>发布后，模型将在科宝智能体中台对应模块中立即生效，可用于实时推理和智能体调用。</span>
              </div>

              <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
                <button className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setPublishModal(null)}>
                  取消
                </button>
                <button className="btn btn-teal" style={{ flex: 1 }} onClick={handlePublish} disabled={publishing}>
                  {publishing ? (
                    <>
                      <div className="spinning" style={{ width: 13, height: 13, border: '2px solid rgba(10,184,158,0.3)', borderTopColor: 'var(--teal)', borderRadius: '50%' }} />
                      正在发布…
                    </>
                  ) : (
                    <><Rocket size={14} /> 确认发布</>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Validate Modal */}
      {validateModal && validateModel && (
        <div className="modal-backdrop" onClick={e => e.target === e.currentTarget && setValidateModal(null)}>
          <div className="modal" style={{ maxWidth: 560 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                  <FlaskConical size={16} style={{ color: 'var(--success)' }} />
                  <span style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' }}>模型验证报告</span>
                </div>
                <div style={{ fontSize: 12.5, color: 'var(--text-muted)' }}>{validateModel.name} · 验证集 {validateModel.valImages} 张</div>
              </div>
              <button onClick={() => setValidateModal(null)} className="btn btn-ghost btn-sm" style={{ padding: '4px 8px' }}>
                <X size={15} />
              </button>
            </div>

            {/* Overall metrics */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginBottom: 18 }}>
              {[
                { label: 'mAP@0.5', value: validateModel.mAP.toFixed(3), color: 'var(--success)' },
                { label: 'mAP@0.5:0.95', value: (validateModel.mAP * 0.624).toFixed(3), color: 'var(--accent-bright)' },
                { label: 'Precision', value: validateModel.precision.toFixed(3), color: 'var(--teal)' },
                { label: 'Recall', value: validateModel.recall.toFixed(3), color: 'var(--warning)' },
              ].map(m => (
                <div key={m.label} className="metric-chip">
                  <div className="metric-chip-value" style={{ color: m.color }}>{m.value}</div>
                  <div className="metric-chip-label">{m.label}</div>
                </div>
              ))}
            </div>

            {/* Per-class */}
            <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 10 }}>各类别指标</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 18 }}>
              {validateModel.classes.map((cls, i) => {
                const classMap = Math.min(0.99, validateModel.mAP * (0.85 + i * 0.03))
                const classPrec = Math.min(0.99, validateModel.precision * (0.88 + i * 0.02))
                const classRecall = Math.min(0.99, validateModel.recall * (0.87 + i * 0.025))
                return (
                  <div key={cls} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ fontSize: 12, color: 'var(--text-secondary)', width: 90, flexShrink: 0 }}>{cls}</span>
                    <div className="progress-bar" style={{ flex: 1 }}>
                      <div className="progress-fill" style={{ width: `${classMap * 100}%` }} />
                    </div>
                    <span style={{ fontFamily: 'JetBrains Mono', fontSize: 11.5, color: 'var(--success)', width: 40, textAlign: 'right' }}>
                      {classMap.toFixed(3)}
                    </span>
                    <span style={{ fontFamily: 'JetBrains Mono', fontSize: 11.5, color: 'var(--teal)', width: 40, textAlign: 'right' }}>
                      P:{classPrec.toFixed(2)}
                    </span>
                    <span style={{ fontFamily: 'JetBrains Mono', fontSize: 11.5, color: 'var(--warning)', width: 40, textAlign: 'right' }}>
                      R:{classRecall.toFixed(2)}
                    </span>
                  </div>
                )
              })}
            </div>

            <div style={{ display: 'flex', gap: 10 }}>
              <button className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setValidateModal(null)}>
                关闭
              </button>
              {validateModel.status !== 'published' && !published[validateModel.id] && (
                <button className="btn btn-teal" style={{ flex: 1 }}
                  onClick={() => { setValidateModal(null); setPublishModal(validateModel.id) }}>
                  <Rocket size={13} /> 发布此模型 <ArrowRight size={12} />
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
