import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import { ArrowLeft, CheckCircle2, Package, Target, AlertCircle } from 'lucide-react'

export const Route = createFileRoute('/validate/create')({
  component: CreateValidate,
})

interface Model {
  id: string
  name: string
  baseModel: string
  mAP: number
  classes: string[]
}

interface Dataset {
  id: string
  name: string
  images: number
  classes: string[]
}

const MODELS: Model[] = [
  { id: 'model-001', name: '道路缺陷检测 v2.3', baseModel: 'YOLOv8m', mAP: 0.782, classes: ['裂缝', '坑洼', '破损', '剥落', '标线模糊', '积水', '障碍物'] },
  { id: 'model-002', name: '施工安全帽检测 v1.0', baseModel: 'YOLOv8s', mAP: 0.923, classes: ['安全帽', '无安全帽', '人员'] },
  { id: 'model-003', name: '人员跌倒检测 v1.0', baseModel: 'YOLOv8s', mAP: 0.887, classes: ['正常站立', '跌倒'] },
  { id: 'model-004', name: '火焰烟雾检测 v2.1', baseModel: 'YOLOv8m', mAP: 0.911, classes: ['火焰', '浓烟', '轻烟'] },
]

const DATASETS: Dataset[] = [
  { id: 'ds-001', name: '道路缺陷测试集', images: 975, classes: ['裂缝', '坑洼', '破损', '剥落', '标线模糊', '积水', '障碍物'] },
  { id: 'ds-002', name: '安全帽测试集', images: 478, classes: ['安全帽', '无安全帽', '人员'] },
  { id: 'ds-003', name: '跌倒行为测试集', images: 642, classes: ['正常站立', '跌倒'] },
  { id: 'ds-004', name: '火焰烟雾测试集', images: 1120, classes: ['火焰', '浓烟', '轻烟'] },
  { id: 'ds-005', name: '混合测试集', images: 2000, classes: ['裂缝', '坑洼', '安全帽', '火焰', '人员'] },
]

function CreateValidate() {
  const navigate = useNavigate()
  const [selectedModel, setSelectedModel] = useState<string>('')
  const [selectedDataset, setSelectedDataset] = useState<string>('')
  const [taskName, setTaskName] = useState('')
  const [isCreating, setIsCreating] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const model = MODELS.find(m => m.id === selectedModel)
  const dataset = DATASETS.find(d => d.id === selectedDataset)

  function validate(): boolean {
    const newErrors: Record<string, string> = {}

    if (!selectedModel) {
      newErrors.selectedModel = '请选择要验证的模型'
    }
    if (!selectedDataset) {
      newErrors.selectedDataset = '请选择验证数据集'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  async function handleSubmit() {
    if (!validate()) return

    setIsCreating(true)
    await new Promise(r => setTimeout(r, 1500))
    
    const name = taskName || `${model?.name} 验证`
    alert(`验证任务「${name}」创建成功！`)
    navigate({ to: '/validate' })
  }

  const hasClassMismatch = model && dataset && 
    model.classes.length !== dataset.classes.length

  return (
    <div style={{ animation: 'slideIn 0.3s ease-out' }}>
      <div className="page-header">
        <div>
          <div className="breadcrumb">
            <Link to="/">科宝训练平台</Link> ›
            <Link to="/validate">验证任务</Link> ›
            <span>创建验证任务</span>
          </div>
          <h1 className="page-title">创建验证任务</h1>
        </div>
        <Link to="/validate" className="btn btn-secondary">
          <ArrowLeft size={14} /> 返回列表
        </Link>
      </div>

      <div style={{ padding: '24px 32px', maxWidth: 800 }}>
        <div className="card" style={{ padding: 24 }}>
          <div style={{ marginBottom: 24 }}>
            <label className="form-label">验证任务名称（选填）</label>
            <input
              type="text"
              className="form-input"
              placeholder="例如：道路缺陷检测模型验证"
              value={taskName}
              onChange={e => setTaskName(e.target.value)}
            />
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>
              不填写将自动生成名称
            </div>
          </div>

          <div style={{ marginBottom: 24 }}>
            <label className="form-label">选择模型</label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
              {MODELS.map(m => (
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
                      <Target size={18} style={{ color: 'var(--accent)' }} />
                    </div>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{m.name}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                        {m.baseModel} · mAP: {m.mAP.toFixed(3)}
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
              background: 'var(--bg-elevated)',
              borderRadius: 8,
              marginBottom: 24,
              border: '1px solid var(--border-dim)',
            }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 8 }}>
                模型信息
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
                <div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 2 }}>基础模型</div>
                  <div style={{ fontSize: 12, color: 'var(--text-secondary)', fontFamily: 'JetBrains Mono' }}>{model.baseModel}</div>
                </div>
                <div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 2 }}>训练 mAP</div>
                  <div style={{ fontSize: 12, color: 'var(--success)', fontFamily: 'JetBrains Mono' }}>{model.mAP.toFixed(3)}</div>
                </div>
                <div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 2 }}>类别数</div>
                  <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{model.classes.length} 类</div>
                </div>
              </div>
              <div style={{ marginTop: 8, fontSize: 11, color: 'var(--text-muted)' }}>
                类别：{model.classes.join('、')}
              </div>
            </div>
          )}

          <div style={{ marginBottom: 24 }}>
            <label className="form-label">选择验证数据集</label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
              {DATASETS.map(ds => (
                <div
                  key={ds.id}
                  className="select-card"
                  style={{
                    padding: 14,
                    cursor: 'pointer',
                    background: selectedDataset === ds.id ? 'var(--accent)' : undefined,
                    borderColor: selectedDataset === ds.id ? 'var(--accent)' : (hasClassMismatch && selectedDataset === ds.id ? 'var(--warning)' : undefined),
                  }}
                  onClick={() => {
                    setSelectedDataset(ds.id)
                    setErrors({})
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{
                      width: 40,
                      height: 40,
                      borderRadius: 8,
                      background: 'var(--success-glow)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}>
                      <Package size={18} style={{ color: 'var(--success)' }} />
                    </div>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{ds.name}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                        {ds.images} 张图片 · {ds.classes.length} 类
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {errors.selectedDataset && (
              <div style={{ fontSize: 12, color: 'var(--error)', marginTop: 4 }}>{errors.selectedDataset}</div>
            )}
          </div>

          {dataset && (
            <div style={{
              padding: 14,
              background: hasClassMismatch ? 'var(--warning-glow)' : 'var(--bg-elevated)',
              borderRadius: 8,
              marginBottom: 24,
              border: `1px solid ${hasClassMismatch ? 'var(--warning)' : 'var(--border-dim)'}`,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                {hasClassMismatch ? (
                  <AlertCircle size={14} style={{ color: 'var(--warning)' }} />
                ) : (
                  <CheckCircle2 size={14} style={{ color: 'var(--success)' }} />
                )}
                <span style={{ fontSize: 12, fontWeight: 600, color: hasClassMismatch ? 'var(--warning)' : 'var(--text-primary)' }}>
                  {hasClassMismatch ? '类别不匹配警告' : '数据集信息'}
                </span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
                <div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 2 }}>图片数量</div>
                  <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{dataset.images.toLocaleString()} 张</div>
                </div>
                <div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 2 }}>类别数</div>
                  <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{dataset.classes.length} 类</div>
                </div>
              </div>
              <div style={{ marginTop: 8, fontSize: 11, color: hasClassMismatch ? 'var(--warning)' : 'var(--text-muted)' }}>
                类别：{dataset.classes.join('、')}
              </div>
              {hasClassMismatch && (
                <div style={{ marginTop: 8, padding: 8, background: 'rgba(245,158,11,0.1)', borderRadius: 6 }}>
                  <div style={{ fontSize: 11, color: 'var(--warning)' }}>
                    ⚠️ 数据集类别与模型类别数量不一致，可能影响验证结果准确性
                  </div>
                </div>
              )}
            </div>
          )}

          <div style={{
            padding: 16,
            background: 'var(--bg-surface)',
            borderRadius: 8,
            marginBottom: 24,
            border: '1px solid var(--border-dim)',
          }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 8 }}>
              验证任务配置
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              {model && dataset ? (
                <>
                  使用数据集「<span style={{ color: 'var(--text-primary)' }}>{dataset.name}</span>」对模型「<span style={{ color: 'var(--accent)' }}>{model.name}</span>」进行验证。
                </>
              ) : (
                '请选择模型和数据集'
              )}
            </div>
          </div>

          <button
            className="btn btn-primary"
            style={{ width: '100%' }}
            onClick={handleSubmit}
            disabled={!selectedModel || !selectedDataset || isCreating}
          >
            {isCreating ? (
              <>
                <span className="spinner" style={{ width: 14, height: 14 }} />
                创建中...
              </>
            ) : (
              <>
                <CheckCircle2 size={14} /> 创建验证任务
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}