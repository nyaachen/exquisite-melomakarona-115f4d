import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { useState, useMemo } from 'react'
import { ArrowLeft, Save, Info, Globe, Lock } from 'lucide-react'

export const Route = createFileRoute('/presets/create')({
  component: CreatePreset,
})

interface Param {
  name: string
  key: string
  type: 'number' | 'string' | 'select' | 'boolean' | 'range'
  defaultValue: number | string | boolean
  min?: number
  max?: number
  step?: number
  options?: { label: string; value: string | number }[]
  required: boolean
  description: string
}

interface Architecture {
  id: string
  name: string
  category: string
  baseModel: string
  description: string
  params: Param[]
  isActive: boolean
  usageCount: number
}

const ARCHITECTURES: Architecture[] = [
  {
    id: 'arch-yolov8', name: 'YOLOv8 目标检测', category: 'object-detection', baseModel: 'YOLOv8m',
    description: 'YOLOv8 系列目标检测模型架构', isActive: true, usageCount: 47,
    params: [
      { name: '模型尺寸', key: 'variant', type: 'select', defaultValue: 'm', required: true, description: '模型尺寸变体', options: [{ label: 'YOLOv8n (Nano)', value: 'n' }, { label: 'YOLOv8s (Small)', value: 's' }, { label: 'YOLOv8m (Medium)', value: 'm' }, { label: 'YOLOv8l (Large)', value: 'l' }, { label: 'YOLOv8x (XLarge)', value: 'x' }] },
      { name: '训练轮数', key: 'epochs', type: 'number', defaultValue: 100, min: 1, max: 1000, required: true, description: '模型训练的总轮数' },
      { name: '批次大小', key: 'batchSize', type: 'number', defaultValue: 16, min: 1, max: 128, required: true, description: '每批次训练的样本数量' },
      { name: '输入尺寸', key: 'imgSize', type: 'select', defaultValue: 640, required: true, description: '模型输入图片尺寸', options: [{ label: '416×416', value: 416 }, { label: '512×512', value: 512 }, { label: '640×640', value: 640 }, { label: '800×800', value: 800 }, { label: '1024×1024', value: 1024 }] },
      { name: '初始学习率', key: 'lr0', type: 'range', defaultValue: 0.01, min: 0.0001, max: 0.1, step: 0.0001, required: true, description: '初始学习率' },
      { name: '最终学习率', key: 'lrf', type: 'number', defaultValue: 0.001, min: 0.00001, max: 0.01, required: false, description: '余弦退火终止学习率' },
      { name: '优化器', key: 'optimizer', type: 'select', defaultValue: 'SGD', required: true, description: '优化器类型', options: [{ label: 'SGD（推荐）', value: 'SGD' }, { label: 'Adam', value: 'Adam' }, { label: 'AdamW', value: 'AdamW' }, { label: 'RMSProp', value: 'RMSProp' }] },
      { name: '权重衰减', key: 'weightDecay', type: 'number', defaultValue: 0.0005, min: 0, max: 0.01, required: false, description: '权重衰减系数' },
      { name: '早停轮数', key: 'patience', type: 'number', defaultValue: 10, min: 0, max: 50, required: false, description: '无改善等待轮数' },
      { name: '数据增强策略', key: 'augment', type: 'select', defaultValue: 'default', required: false, description: '数据增强策略', options: [{ label: '默认', value: 'default' }, { label: '强增强', value: 'strong' }, { label: '保守', value: 'conservative' }] },
      { name: '启用 Mosaic', key: 'useMosaic', type: 'boolean', defaultValue: true, required: false, description: 'Mosaic 4图拼接增强' },
      { name: '保存检查点间隔', key: 'saveEvery', type: 'number', defaultValue: 10, min: 1, max: 50, required: false, description: '保存间隔轮数' },
    ],
  },
  {
    id: 'arch-qwen', name: 'Qwen 大语言模型微调', category: 'llm', baseModel: 'Qwen-7B-Chat',
    description: 'Qwen 系列大语言模型的 LoRA/全参数微调架构', isActive: true, usageCount: 18,
    params: [
      { name: '模型版本', key: 'baseModel', type: 'select', defaultValue: 'Qwen-7B-Chat', required: true, description: '预训练模型版本', options: [{ label: 'Qwen-7B-Chat', value: 'Qwen-7B-Chat' }, { label: 'Qwen-14B-Chat', value: 'Qwen-14B-Chat' }, { label: 'Qwen-72B-Chat', value: 'Qwen-72B-Chat' }] },
      { name: '微调方式', key: 'finetuneMode', type: 'select', defaultValue: 'lora', required: true, description: '微调方式', options: [{ label: 'LoRA', value: 'lora' }, { label: '全参数', value: 'full' }] },
      { name: '训练轮数', key: 'epochs', type: 'number', defaultValue: 3, min: 1, max: 20, required: true, description: '训练轮数' },
      { name: '批次大小', key: 'batchSize', type: 'number', defaultValue: 8, min: 1, max: 64, required: true, description: '批次大小' },
      { name: '学习率', key: 'lr0', type: 'range', defaultValue: 0.0001, min: 0.00001, max: 0.001, step: 0.00001, required: true, description: '学习率' },
      { name: '最大序列长度', key: 'maxSeqLen', type: 'number', defaultValue: 2048, min: 512, max: 8192, required: true, description: '最大序列长度' },
    ],
  },
  {
    id: 'arch-llama', name: 'LLaMA 大语言模型微调', category: 'llm', baseModel: 'LLaMA-2-7B-Chat',
    description: 'LLaMA-2 系列大语言模型的 LoRA 微调架构', isActive: true, usageCount: 8,
    params: [
      { name: '模型版本', key: 'baseModel', type: 'select', defaultValue: 'LLaMA-2-7B-Chat', required: true, description: '模型版本', options: [{ label: 'LLaMA-2-7B-Chat', value: 'LLaMA-2-7B-Chat' }, { label: 'LLaMA-2-13B-Chat', value: 'LLaMA-2-13B-Chat' }] },
      { name: '训练轮数', key: 'epochs', type: 'number', defaultValue: 3, min: 1, max: 20, required: true, description: '训练轮数' },
      { name: '批次大小', key: 'batchSize', type: 'number', defaultValue: 8, min: 1, max: 64, required: true, description: '批次大小' },
      { name: '学习率', key: 'lr0', type: 'range', defaultValue: 0.0001, min: 0.00001, max: 0.001, step: 0.00001, required: true, description: '学习率' },
    ],
  },
]

function CreatePreset() {
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [architectureId, setArchitectureId] = useState('arch-yolov8')
  const [values, setValues] = useState<Record<string, number | string | boolean>>({})
  const [isPublic, setIsPublic] = useState(true)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)

  const architecture = useMemo(() => ARCHITECTURES.find(a => a.id === architectureId), [architectureId])

  // Initialize values when architecture changes
  const handleArchChange = (id: string) => {
    setArchitectureId(id)
    const arch = ARCHITECTURES.find(a => a.id === id)
    if (arch) {
      const defaults: Record<string, number | string | boolean> = {}
      arch.params.forEach(p => {
        if (p.defaultValue !== undefined) defaults[p.key] = p.defaultValue
      })
      setValues(defaults)
    }
  }

  function setValue(key: string, value: number | string | boolean) {
    setValues(prev => ({ ...prev, [key]: value }))
  }

  function validate(): boolean {
    const e: Record<string, string> = {}
    if (!name.trim()) e.name = '请输入预设名称'
    if (architecture) {
      architecture.params.forEach(p => {
        if (p.required && (values[p.key] === undefined || values[p.key] === '')) {
          e[p.key] = `请填写「${p.name}」`
        }
      })
    }
    setErrors(e)
    return Object.keys(e).length === 0
  }

  async function handleSubmit() {
    if (!validate()) return
    setSubmitting(true)
    await new Promise(r => setTimeout(r, 1000))
    navigate({ to: '/presets' })
  }

  return (
    <div style={{ animation: 'slideIn 0.3s ease-out' }}>
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Link to="/presets" className="btn btn-ghost btn-sm">
            <ArrowLeft size={14} /> 返回
          </Link>
          <div>
            <div className="breadcrumb">科宝训练平台 › 训练预设</div>
            <h1 className="page-title">创建训练预设</h1>
          </div>
        </div>
      </div>

      <div className="content-padded" style={{ maxWidth: 720, margin: '0 auto' }}>
        <div className="card" style={{ padding: 24 }}>
          <div className="form-section">
            <div className="form-section-header">基本信息</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div className="form-group">
                <label className="form-label">预设名称 *</label>
                <input className="form-input" type="text" value={name} onChange={e => setName(e.target.value)} placeholder="例如：标准训练、快速验证" />
                {errors.name && <div className="error-text">{errors.name}</div>}
              </div>
              <div className="form-group">
                <label className="form-label">关联模型模板 *</label>
                <select className="form-input" value={architectureId} onChange={e => handleArchChange(e.target.value)}>
                  {ARCHITECTURES.filter(a => a.isActive).map(a => (
                    <option key={a.id} value={a.id}>{a.name} ({a.baseModel})</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="form-section">
            <label className="form-label">预设描述</label>
            <textarea className="form-input" rows={2} value={description} onChange={e => setDescription(e.target.value)} placeholder="描述该预设的适用场景" />
          </div>

          <div className="form-section">
            <label className="form-label">可见性</label>
            <div style={{ display: 'flex', gap: 10 }}>
              <button
                type="button"
                className={`btn btn-sm ${isPublic ? 'btn-teal' : 'btn-secondary'}`}
                onClick={() => setIsPublic(true)}
              >
                <Globe size={13} /> 公开
              </button>
              <button
                type="button"
                className={`btn btn-sm ${!isPublic ? 'btn-teal' : 'btn-secondary'}`}
                onClick={() => setIsPublic(false)}
              >
                <Lock size={13} /> 私有
              </button>
            </div>
            <div className="form-hint">{isPublic ? '所有用户可见和使用此预设' : '仅创建者可见和使用此预设'}</div>
          </div>

          {architecture && (
            <>
              <div style={{ padding: '10px 14px', background: 'var(--accent-glow)', border: '1px solid rgba(64, 158, 255,0.15)', marginBottom: 20, display: 'flex', gap: 8, fontSize: 12, color: 'var(--text-secondary)' }}>
                <Info size={13} style={{ color: 'var(--accent-bright)', flexShrink: 0, marginTop: 1 }} />
                <span>基于「{architecture.name}」模板配置参数。以下参数均来自该模板定义，预设值可覆盖默认值。</span>
              </div>

              <div style={{ marginTop: 20 }}>
                <div className="form-section-header" style={{ marginBottom: 16 }}>参数配置</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  {architecture.params.map(param => {
                    const val = values[param.key] ?? param.defaultValue
                    const hasError = errors[param.key]

                    return (
                      <div key={param.key} className="form-group">
                        <label className="form-label">
                          {param.name}
                          {param.required && <span style={{ color: 'var(--error)', marginLeft: 2 }}>*</span>}
                        </label>

                        {param.type === 'select' && param.options ? (
                          <select
                            className={`form-input ${hasError ? 'error' : ''}`}
                            value={String(val)}
                            onChange={e => {
                              const opt = param.options?.find(o => String(o.value) === e.target.value)
                              setValue(param.key, opt?.value ?? e.target.value)
                            }}
                          >
                            {param.options.map(o => (
                              <option key={String(o.value)} value={String(o.value)}>{o.label}</option>
                            ))}
                          </select>
                        ) : param.type === 'boolean' ? (
                          <select
                            className="form-input"
                            value={String(val)}
                            onChange={e => setValue(param.key, e.target.value === 'true')}
                          >
                            <option value="true">是</option>
                            <option value="false">否</option>
                          </select>
                        ) : param.type === 'range' ? (
                          <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                              <input
                                className="form-input"
                                type="number"
                                value={Number(val)}
                                min={param.min}
                                max={param.max}
                                step={param.step}
                                onChange={e => setValue(param.key, parseFloat(e.target.value) || 0)}
                                style={{ width: 100 }}
                              />
                            </div>
                            <input
                              type="range"
                              min={param.min || 0}
                              max={param.max || 1}
                              step={param.step || 0.001}
                              value={Number(val)}
                              onChange={e => setValue(param.key, parseFloat(e.target.value))}
                            />
                          </div>
                        ) : (
                          <input
                            className={`form-input ${hasError ? 'error' : ''}`}
                            type={param.type === 'number' ? 'number' : 'text'}
                            value={String(val)}
                            min={param.min}
                            max={param.max}
                            step={param.step}
                            onChange={e => {
                              const v = param.type === 'number' ? (parseFloat(e.target.value) || 0) : e.target.value
                              setValue(param.key, v)
                            }}
                          />
                        )}

                        {param.description && (
                          <div className="form-hint">{param.description}</div>
                        )}
                        {hasError && <div className="error-text">{hasError}</div>}
                      </div>
                    )
                  })}
                </div>
              </div>
            </>
          )}

          <div style={{ display: 'flex', gap: 10, marginTop: 28 }}>
            <button className="btn btn-secondary" style={{ flex: 1 }} onClick={() => navigate({ to: '/presets' })}>取消</button>
            <button className="btn btn-primary" style={{ flex: 1 }} onClick={handleSubmit} disabled={submitting}>
              {submitting ? <><span className="spinner" /> 保存中…</> : <><Save size={14} /> 保存预设</>}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
