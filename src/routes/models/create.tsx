import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import { Package, Plus, Copy, ArrowLeft, CheckCircle2, AlertCircle, Layers } from 'lucide-react'

export const Route = createFileRoute('/models/create')({
  component: PublishModel,
})

type PublishMode = 'existing' | 'new'

interface Task {
  id: string
  name: string
  dataset: string
  baseModel: string
  mAP: number
  precision: number
  recall: number
  f1: number
  trainedAt: string
  status: 'completed' | 'ready'
}

interface SquareModel {
  id: string
  name: string
  existingVersions: string[]
}

const COMPLETED_TASKS: Task[] = [
  { id: 'task-001', name: '道路缺陷检测 v2.3', dataset: '道路缺陷标注集', baseModel: 'YOLOv8m', mAP: 0.782, precision: 0.831, recall: 0.748, f1: 0.788, trainedAt: '2026-04-29 11:30', status: 'completed' },
  { id: 'task-002', name: '施工人员安全帽检测', dataset: '安全帽标注集', baseModel: 'YOLOv8s', mAP: 0.923, precision: 0.941, recall: 0.908, f1: 0.924, trainedAt: '2026-04-28 18:12', status: 'ready' },
  { id: 'task-005', name: '人员跌倒检测 v1.0', dataset: '跌倒行为数据集', baseModel: 'YOLOv8s', mAP: 0.887, precision: 0.912, recall: 0.865, f1: 0.888, trainedAt: '2026-04-26 17:40', status: 'completed' },
  { id: 'task-006', name: '火焰烟雾检测', dataset: '火焰烟雾标注集', baseModel: 'YOLOv8m', mAP: 0.911, precision: 0.928, recall: 0.897, f1: 0.912, trainedAt: '2026-04-25 14:03', status: 'ready' },
]

const SQUARE_MODELS: SquareModel[] = [
  { id: 'sq-model-001', name: '道路缺陷检测', existingVersions: ['v2.3', 'v2.2', 'v2.1'] },
  { id: 'sq-model-002', name: '施工安全帽检测', existingVersions: ['v1.0'] },
  { id: 'sq-model-003', name: '人员跌倒检测', existingVersions: ['v1.0'] },
  { id: 'sq-model-004', name: '火焰烟雾检测', existingVersions: ['v2.1', 'v2.0', 'v1.5'] },
]

function PublishModel() {
  const navigate = useNavigate()
  const [publishMode, setPublishMode] = useState<PublishMode>('new')
  const [selectedTask, setSelectedTask] = useState<string>('')
  const [selectedModel, setSelectedModel] = useState<string>('')
  const [version, setVersion] = useState('')
  const [newModelName, setNewModelName] = useState('')
  const [newModelDesc, setNewModelDesc] = useState('')
  const [newModelCategory, setNewModelCategory] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const task = COMPLETED_TASKS.find(t => t.id === selectedTask)
  const model = SQUARE_MODELS.find(m => m.id === selectedModel)
  const existingVersions = model?.existingVersions || []

  function validate(): boolean {
    const newErrors: Record<string, string> = {}

    if (!selectedTask) {
      newErrors.selectedTask = '请选择要发布的训练任务'
    }

    if (publishMode === 'existing') {
      if (!selectedModel) {
        newErrors.selectedModel = '请选择要发布的已有模型'
      }
      if (!version) {
        newErrors.version = '请输入版本号'
      } else if (existingVersions.includes(version)) {
        newErrors.version = '该版本号已存在，请输入新的版本号'
      } else if (!/^v\d+\.\d+/.test(version) && !/^\d+\.\d+/.test(version)) {
        newErrors.version = '版本号格式不正确，建议格式：v1.0 或 1.0'
      }
    } else {
      if (!newModelName.trim()) {
        newErrors.newModelName = '请输入模型名称'
      }
      if (!version) {
        newErrors.version = '请输入版本号'
      } else if (!/^v\d+\.\d+/.test(version) && !/^\d+\.\d+/.test(version)) {
        newErrors.version = '版本号格式不正确，建议格式：v1.0 或 1.0'
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  async function handleSubmit() {
    if (!validate()) return

    setIsSubmitting(true)
    await new Promise(r => setTimeout(r, 1500))

    const publishedModelName = publishMode === 'existing' 
      ? model?.name 
      : newModelName

    alert(`模型「${publishedModelName}」${version} 发布成功！`)
    navigate({ to: '/models' })
  }

  return (
    <div style={{ animation: 'slideIn 0.3s ease-out' }}>
      <div className="page-header">
        <div>
          <div className="breadcrumb">
            <Link to="/">科宝训练平台</Link> ›
            <Link to="/models">模型广场</Link> ›
            <span>发布模型</span>
          </div>
          <h1 className="page-title">发布模型到广场</h1>
        </div>
        <Link to="/models" className="btn btn-secondary">
          <ArrowLeft size={14} /> 返回列表
        </Link>
      </div>

      <div style={{ padding: '24px 32px', maxWidth: 800 }}>
        <div className="card" style={{ padding: 24 }}>
          <div style={{ marginBottom: 24 }}>
            <label className="form-label">选择训练任务</label>
            <select
              className="form-input"
              value={selectedTask}
              onChange={e => {
                setSelectedTask(e.target.value)
                setErrors({})
              }}
            >
              <option value="">请选择已完成或已就绪的训练任务</option>
              {COMPLETED_TASKS.map(t => (
                <option key={t.id} value={t.id}>
                  {t.name} (mAP: {t.mAP.toFixed(3)}) - {t.trainedAt}
                </option>
              ))}
            </select>
            {errors.selectedTask && (
              <div style={{ fontSize: 12, color: 'var(--error)', marginTop: 4 }}>{errors.selectedTask}</div>
            )}
          </div>

          {task && (
            <div style={{
              padding: 16,
              background: 'var(--bg-elevated)',
              borderRadius: 8,
              marginBottom: 24,
              border: '1px solid var(--border-dim)',
            }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 12 }}>
                任务信息
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
                <div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 2 }}>数据集</div>
                  <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{task.dataset}</div>
                </div>
                <div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 2 }}>基础模型</div>
                  <div style={{ fontSize: 12, color: 'var(--text-secondary)', fontFamily: 'JetBrains Mono' }}>{task.baseModel}</div>
                </div>
                <div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 2 }}>mAP@0.5</div>
                  <div style={{ fontSize: 12, color: 'var(--success)', fontFamily: 'JetBrains Mono' }}>{task.mAP.toFixed(3)}</div>
                </div>
                <div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 2 }}>F1 Score</div>
                  <div style={{ fontSize: 12, color: 'var(--accent-bright)', fontFamily: 'JetBrains Mono' }}>{task.f1.toFixed(3)}</div>
                </div>
              </div>
            </div>
          )}

          <div style={{ marginBottom: 24 }}>
            <label className="form-label">发布方式</label>
            <div style={{ display: 'flex', gap: 12 }}>
              <button
                className={`btn ${publishMode === 'new' ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => { setPublishMode('new'); setErrors({}) }}
              >
                <Plus size={14} /> 创建新模型
              </button>
              <button
                className={`btn ${publishMode === 'existing' ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => { setPublishMode('existing'); setErrors({}) }}
              >
                <Copy size={14} /> 发布到已有模型
              </button>
            </div>
          </div>

          {publishMode === 'existing' ? (
            <div style={{ animation: 'slideDown 0.2s ease-out' }}>
              <div style={{ marginBottom: 20 }}>
                <label className="form-label">选择已有模型</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
                  {SQUARE_MODELS.map(m => (
                    <div
                      key={m.id}
                      className="select-card"
                      style={{
                        padding: 14,
                        cursor: 'pointer',
                        borderColor: selectedModel === m.id ? 'var(--accent)' : undefined,
                      }}
                      onClick={() => {
                        setSelectedModel(m.id)
                        setErrors({})
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{
                          width: 40,
                          height: 40,
                          borderRadius: 8,
                          background: 'var(--accent-glow)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}>
                          <Package size={18} style={{ color: 'var(--accent)' }} />
                        </div>
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{m.name}</div>
                          <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                            已有版本: {m.existingVersions.join(', ')}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                {errors.selectedModel && (
                  <div style={{ fontSize: 12, color: 'var(--error)', marginTop: 4 }}>{errors.selectedModel}</div>
                )}
              </div>

              {model && (
                <div style={{
                  padding: 14,
                  background: 'var(--bg-surface)',
                  borderRadius: 8,
                  marginBottom: 20,
                  border: '1px solid var(--border-dim)',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                    <Layers size={14} style={{ color: 'var(--accent-bright)' }} />
                    <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)' }}>
                      {model.name}
                    </span>
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                    当前已有版本：{model.existingVersions.join('、')}，发布新版本后将成为第 {model.existingVersions.length + 1} 个版本
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div style={{ animation: 'slideDown 0.2s ease-out' }}>
              <div style={{ marginBottom: 20 }}>
                <label className="form-label">模型名称</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="例如：道路缺陷检测"
                  value={newModelName}
                  onChange={e => {
                    setNewModelName(e.target.value)
                    setErrors({})
                  }}
                />
                {errors.newModelName && (
                  <div style={{ fontSize: 12, color: 'var(--error)', marginTop: 4 }}>{errors.newModelName}</div>
                )}
              </div>

              <div style={{ marginBottom: 20 }}>
                <label className="form-label">模型描述（选填）</label>
                <textarea
                  className="form-input"
                  placeholder="简要描述模型的功能和适用场景..."
                  value={newModelDesc}
                  onChange={e => setNewModelDesc(e.target.value)}
                  style={{ minHeight: 80, resize: 'vertical' }}
                />
              </div>

              <div style={{ marginBottom: 20 }}>
                <label className="form-label">模型类别</label>
                <select
                  className="form-input"
                  value={newModelCategory}
                  onChange={e => setNewModelCategory(e.target.value)}
                >
                  <option value="">请选择模型类别</option>
                  <option value="缺陷检测">缺陷检测</option>
                  <option value="安全检测">安全检测</option>
                  <option value="行为检测">行为检测</option>
                  <option value="目标跟踪">目标跟踪</option>
                  <option value="图像分割">图像分割</option>
                  <option value="其他">其他</option>
                </select>
              </div>
            </div>
          )}

          <div style={{ marginBottom: 24 }}>
            <label className="form-label">
              {publishMode === 'existing' ? '新版本号' : '初始版本号'}
            </label>
            <input
              type="text"
              className="form-input"
              placeholder="例如：v1.0 或 1.0"
              value={version}
              onChange={e => {
                setVersion(e.target.value)
                setErrors({})
              }}
              style={{ fontFamily: 'JetBrains Mono' }}
            />
            {errors.version && (
              <div style={{ fontSize: 12, color: 'var(--error)', marginTop: 4 }}>{errors.version}</div>
            )}
            {publishMode === 'existing' && !errors.version && version && !existingVersions.includes(version) && (
              <div style={{ fontSize: 12, color: 'var(--success)', marginTop: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
                <CheckCircle2 size={12} /> 版本号可用
              </div>
            )}
          </div>

          <div style={{
            padding: 16,
            background: 'var(--bg-surface)',
            borderRadius: 8,
            marginBottom: 24,
            border: '1px solid var(--border-dim)',
          }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 8 }}>
              发布确认
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              {task ? (
                <>
                  将训练任务「<span style={{ color: 'var(--text-primary)' }}>{task.name}</span>」的模型发布到模型广场。
                  {publishMode === 'existing' && model ? (
                    <> 将作为「<span style={{ color: 'var(--accent)' }}>{model.name}</span>」的新版本 <span style={{ fontFamily: 'JetBrains Mono', color: 'var(--accent-bright)' }}>{version}</span> 发布。</>
                  ) : (
                    <> 将创建新模型「<span style={{ color: 'var(--accent)' }}>{newModelName || '待输入'}</span>」，初始版本为 <span style={{ fontFamily: 'JetBrains Mono', color: 'var(--accent-bright)' }}>{version || '待输入'}</span>。</>
                  )}
                </>
              ) : (
                '请先选择要发布的训练任务'
              )}
            </div>
          </div>

          <button
            className="btn btn-primary"
            style={{ width: '100%' }}
            onClick={handleSubmit}
            disabled={!selectedTask || !version || isSubmitting}
          >
            {isSubmitting ? (
              <>
                <span className="spinner" style={{ width: 14, height: 14 }} />
                发布中...
              </>
            ) : (
              <>
                <CheckCircle2 size={14} /> 确认发布
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}