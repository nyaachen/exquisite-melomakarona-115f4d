import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import { ArrowLeft, CheckCircle2, Package, Target, AlertCircle, Server, Cpu } from 'lucide-react'
import { SearchableDropdown } from '../../components/SearchableDropdown'

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

interface GpuCardOption {
  id: string
  index: number
  model: string
  memory: string
}

const GPU_SERVER_OPTIONS = [
  { id: 'gpu-001', name: '训练节点-A', spec: '512GB RAM', status: 'online', gpus: [
    { id: 'gpu-001-0', index: 0, model: 'A100', memory: '80GB' },
    { id: 'gpu-001-1', index: 1, model: 'A100', memory: '80GB' },
    { id: 'gpu-001-2', index: 2, model: 'A100', memory: '80GB' },
    { id: 'gpu-001-3', index: 3, model: 'A100', memory: '80GB' },
  ]},
  { id: 'gpu-002', name: '训练节点-B', spec: '256GB RAM', status: 'online', gpus: [
    { id: 'gpu-002-0', index: 0, model: 'A100', memory: '80GB' },
    { id: 'gpu-002-1', index: 1, model: 'A100', memory: '80GB' },
  ]},
  { id: 'gpu-003', name: '推理节点-A', spec: '128GB RAM', status: 'online', gpus: [
    { id: 'gpu-003-0', index: 0, model: 'V100', memory: '32GB' },
    { id: 'gpu-003-1', index: 1, model: 'V100', memory: '32GB' },
  ]},
  { id: 'gpu-004', name: '备用节点', spec: '384GB RAM', status: 'maintenance', gpus: [
    { id: 'gpu-004-0', index: 0, model: 'A6000', memory: '48GB' },
    { id: 'gpu-004-1', index: 1, model: 'A6000', memory: '48GB' },
    { id: 'gpu-004-2', index: 2, model: 'A6000', memory: '48GB' },
    { id: 'gpu-004-3', index: 3, model: 'A6000', memory: '48GB' },
  ]},
  { id: 'gpu-005', name: '开发测试节点', spec: '64GB RAM', status: 'offline', gpus: [
    { id: 'gpu-005-0', index: 0, model: 'RTX 4090', memory: '24GB' },
  ]},
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
  const [selectedServerId, setSelectedServerId] = useState<string>('')
  const [selectedGpuIds, setSelectedGpuIds] = useState<string[]>([])
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
            <SearchableDropdown
              label="选择模型"
              color="var(--accent-bright)"
              selectedId={selectedModel}
              onChange={(id) => { setSelectedModel(id); setErrors({}) }}
              items={MODELS.map(m => ({
                id: m.id,
                name: m.name,
                subtitle: `${m.baseModel}`,
                tags: m.classes,
                count: m.mAP,
                countLabel: 'mAP',
              }))}
              placeholder="选择要验证的模型..."
            />
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
            <SearchableDropdown
              label="选择验证数据集"
              color="var(--success)"
              selectedId={selectedDataset}
              onChange={(id) => { setSelectedDataset(id); setErrors({}) }}
              items={DATASETS.map(ds => ({
                id: ds.id,
                name: ds.name,
                tags: ds.classes,
                count: ds.images,
                countLabel: '张',
              }))}
              placeholder="选择验证数据集..."
            />
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

          {/* Server selection */}
          <div style={{ marginBottom: 24 }}>
            <SearchableDropdown
              label="选择 GPU 服务器"
              color="var(--accent-bright)"
              selectedId={selectedServerId}
              onChange={(id) => { setSelectedServerId(id); setSelectedGpuIds([]) }}
              items={GPU_SERVER_OPTIONS.map(srv => ({
                id: srv.id,
                name: srv.name,
                subtitle: `${srv.gpus.length} 张 GPU · ${srv.spec}`,
                count: srv.gpus.length,
                countLabel: 'GPU',
              }))}
              placeholder="选择执行验证任务的服务器..."
            />

            {selectedServerId && (() => {
              const server = GPU_SERVER_OPTIONS.find(s => s.id === selectedServerId)
              if (!server) return null
              return (
                <div style={{ marginTop: 16, padding: '12px', background: 'var(--bg-elevated)', border: '1px solid var(--border-dim)' }}>
                  <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 8 }}>
                    选择显卡 <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>（可多选 · 已选 {selectedGpuIds.length}/{server.gpus.length} 张）</span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                    {server.gpus.map(g => {
                      const selected = selectedGpuIds.includes(g.id)
                      return (
                        <label key={g.id} style={{
                          display: 'flex', alignItems: 'center', gap: 8,
                          padding: '6px 10px', cursor: 'pointer', fontSize: 12,
                          background: selected ? 'var(--accent-glow)' : 'var(--bg-surface)',
                          border: `1px solid ${selected ? 'var(--accent)' : 'var(--border-dim)'}`,
                        }}>
                          <input type="checkbox" checked={selected}
                            onChange={() => setSelectedGpuIds(prev => prev.includes(g.id) ? prev.filter(id => id !== g.id) : [...prev, g.id])}
                            style={{ accentColor: 'var(--accent)' }} />
                          <Cpu size={12} style={{ color: selected ? 'var(--accent-bright)' : 'var(--text-muted)' }} />
                          <span style={{ fontFamily: 'JetBrains Mono', fontSize: 10, color: 'var(--text-muted)' }}>#{g.index}</span>
                          <span style={{ color: 'var(--text-primary)' }}>{g.model}</span>
                          <span style={{ color: 'var(--text-muted)', fontFamily: 'JetBrains Mono', fontSize: 11 }}>{g.memory}</span>
                        </label>
                      )
                    })}
                  </div>
                  <div style={{ marginTop: 6, display: 'flex', gap: 6 }}>
                    <button className="btn btn-ghost btn-sm" onClick={() => setSelectedGpuIds(server.gpus.map(g => g.id))}>全选</button>
                    <button className="btn btn-ghost btn-sm" onClick={() => setSelectedGpuIds([])}>取消全选</button>
                  </div>
                </div>
              )
            })()}
          </div>

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
                  {selectedServerId ? (() => {
                    const srv = GPU_SERVER_OPTIONS.find(s => s.id === selectedServerId)
                    const gpuNames = srv ? selectedGpuIds.map(id => srv.gpus.find(g => g.id === id)).filter(Boolean).map(g => `#${g!.index} ${g!.model}`).join('、') : ''
                    return <>在<span style={{ color: 'var(--accent)' }}>{srv?.name}</span>（{gpuNames || '未选择显卡'}）上使用数据集「<span style={{ color: 'var(--text-primary)' }}>{dataset.name}</span>」对模型「<span style={{ color: 'var(--accent)' }}>{model.name}</span>」进行验证。</>
                  })() : (
                    <>使用数据集「<span style={{ color: 'var(--text-primary)' }}>{dataset.name}</span>」对模型「<span style={{ color: 'var(--accent)' }}>{model.name}</span>」进行验证。</>
                  )}
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