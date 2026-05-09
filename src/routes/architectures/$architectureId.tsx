import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import { ArrowLeft, Save, Plus, X, HelpCircle, AlertCircle } from 'lucide-react'
import { NotFound } from '../../components/NotFound'
import { CATEGORY_OPTIONS } from '../../constants'

export const Route = createFileRoute('/architectures/$architectureId')({
  component: EditArchitecture,
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

// Shared data (in real app this would be a server function)
const ARCHITECTURES: Architecture[] = [
  {
    id: 'arch-yolov8', name: 'YOLOv8 目标检测', category: 'object-detection', baseModel: 'YOLOv8m',
    description: 'YOLOv8 系列目标检测模型架构', isActive: true, params: [
      { name: '模型尺寸', key: 'variant', type: 'select', defaultValue: 'm', required: true, description: '模型尺寸变体', options: [{ label: 'YOLOv8n', value: 'n' }, { label: 'YOLOv8s', value: 's' }, { label: 'YOLOv8m', value: 'm' }, { label: 'YOLOv8l', value: 'l' }, { label: 'YOLOv8x', value: 'x' }] },
      { name: '训练轮数', key: 'epochs', type: 'number', defaultValue: 100, min: 1, max: 1000, required: true, description: '模型训练的总轮数' },
      { name: '批次大小', key: 'batchSize', type: 'number', defaultValue: 16, min: 1, max: 128, required: true, description: '每批次训练的样本数量' },
      { name: '输入尺寸', key: 'imgSize', type: 'select', defaultValue: 640, required: true, description: '模型输入图片尺寸', options: [{ label: '416×416', value: 416 }, { label: '640×640', value: 640 }, { label: '1024×1024', value: 1024 }] },
      { name: '初始学习率', key: 'lr0', type: 'range', defaultValue: 0.01, min: 0.0001, max: 0.1, step: 0.0001, required: true, description: '初始学习率' },
    ],
    usageCount: 47,
  },
  {
    id: 'arch-qwen', name: 'Qwen 大语言模型微调', category: 'llm', baseModel: 'Qwen-7B-Chat',
    description: 'Qwen 系列大语言模型的 LoRA/全参数微调架构', isActive: true, params: [
      { name: '模型版本', key: 'baseModel', type: 'select', defaultValue: 'Qwen-7B-Chat', required: true, description: '预训练模型版本', options: [{ label: 'Qwen-7B-Chat', value: 'Qwen-7B-Chat' }, { label: 'Qwen-14B-Chat', value: 'Qwen-14B-Chat' }] },
      { name: '训练轮数', key: 'epochs', type: 'number', defaultValue: 3, min: 1, max: 20, required: true, description: '训练轮数' },
      { name: '批次大小', key: 'batchSize', type: 'number', defaultValue: 8, min: 1, max: 64, required: true, description: '批次大小' },
      { name: '学习率', key: 'lr0', type: 'range', defaultValue: 0.0001, min: 0.00001, max: 0.001, step: 0.00001, required: true, description: '学习率' },
    ],
    usageCount: 18,
  },
  {
    id: 'arch-llama', name: 'LLaMA 大语言模型微调', category: 'llm', baseModel: 'LLaMA-2-7B-Chat',
    description: 'LLaMA-2 系列大语言模型的 LoRA 微调架构', isActive: true, params: [
      { name: '模型版本', key: 'baseModel', type: 'select', defaultValue: 'LLaMA-2-7B-Chat', required: true, description: '预训练模型版本', options: [{ label: 'LLaMA-2-7B-Chat', value: 'LLaMA-2-7B-Chat' }, { label: 'LLaMA-2-13B-Chat', value: 'LLaMA-2-13B-Chat' }] },
      { name: '训练轮数', key: 'epochs', type: 'number', defaultValue: 3, min: 1, max: 20, required: true, description: '训练轮数' },
    ],
    usageCount: 8,
  },
]

function EditArchitecture() {
  const { architectureId } = Route.useParams()
  const navigate = useNavigate()

  const data = ARCHITECTURES.find(a => a.id === architectureId)
  if (!data) return <NotFound />

  const [name, setName] = useState(data.name)
  const [category, setCategory] = useState(data.category)
  const [baseModel, setBaseModel] = useState(data.baseModel)
  const [description, setDescription] = useState(data.description)
  const [isActive, setIsActive] = useState(data.isActive)
  const [params, setParams] = useState<Param[]>(data.params)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)

  function addParam() {
    setParams([...params, { name: '', key: '', type: 'number', defaultValue: 0, required: false, description: '' }])
  }

  function removeParam(index: number) {
    setParams(params.filter((_, i) => i !== index))
  }

  function updateParam(index: number, field: keyof Param, value: unknown) {
    const next = [...params]
    next[index] = { ...next[index], [field]: value }
    setParams(next)
  }

  function updateParamOptions(index: number, options: { label: string; value: string | number }[]) {
    const next = [...params]
    next[index] = { ...next[index], options }
    setParams(next)
  }

  function validate(): boolean {
    const e: Record<string, string> = {}
    if (!name.trim()) e.name = '请输入模板名称'
    if (!baseModel.trim()) e.baseModel = '请输入基础模型名称'
    for (let i = 0; i < params.length; i++) {
      const p = params[i]
      if (!p.name.trim()) e[`p${i}-name`] = `请输入参数名称`
      if (!p.key.trim()) e[`p${i}-key`] = `请输入参数键名`
      if (p.type === 'select' && (!p.options || p.options.length === 0)) e[`p${i}-opts`] = `请添加选项`
    }
    setErrors(e)
    return Object.keys(e).length === 0
  }

  async function handleSubmit() {
    if (!validate()) return
    setSubmitting(true)
    await new Promise(r => setTimeout(r, 1000))
    navigate({ to: '/architectures' })
  }

  return (
    <div style={{ animation: 'slideIn 0.3s ease-out' }}>
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Link to="/architectures" className="btn btn-ghost btn-sm">
            <ArrowLeft size={14} /> 返回
          </Link>
          <div>
            <div className="breadcrumb">科宝训练平台 › 模型模板</div>
            <h1 className="page-title">编辑模型模板</h1>
          </div>
        </div>
      </div>

      <div className="content-padded" style={{ maxWidth: 800, margin: '0 auto' }}>
        {data.usageCount > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 16px', background: 'rgba(230, 162, 60,0.06)', border: '1px solid rgba(230, 162, 60,0.2)', marginBottom: 20 }}>
            <AlertCircle size={16} style={{ color: 'var(--warning)', flexShrink: 0 }} />
            <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
              该模板已被 <strong style={{ color: 'var(--warning)' }}>{data.usageCount}</strong> 个训练预设引用，修改参数定义将影响所有关联预设
            </span>
          </div>
        )}

        <div className="card" style={{ padding: 24 }}>
          <div className="form-section">
            <div className="form-section-header">基本信息</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div className="form-group">
                <label className="form-label">模板名称 *</label>
                <input className="form-input" type="text" value={name} onChange={e => setName(e.target.value)} />
                {errors.name && <div className="error-text">{errors.name}</div>}
              </div>
              <div className="form-group">
                <label className="form-label">模型类别</label>
                <select className="form-input" value={category} onChange={e => setCategory(e.target.value)}>
                  {CATEGORY_OPTIONS.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                </select>
              </div>
            </div>
          </div>

          <div className="form-section">
            <div className="form-group">
              <label className="form-label">基础模型 *</label>
              <input className="form-input" type="text" value={baseModel} onChange={e => setBaseModel(e.target.value)} />
              {errors.baseModel && <div className="error-text">{errors.baseModel}</div>}
            </div>
          </div>

          <div className="form-section">
            <div className="form-group">
              <label className="form-label">模板描述</label>
              <textarea className="form-input" rows={3} value={description} onChange={e => setDescription(e.target.value)} />
            </div>
          </div>

          <div className="form-section">
            <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
              <input type="checkbox" checked={isActive} onChange={e => setIsActive(e.target.checked)} />
              启用状态
            </label>
            <div className="form-hint">启用后此模板可在创建训练预设时选择</div>
          </div>

          <div style={{ marginTop: 28 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>参数定义</span>
                <span className="badge badge-secondary">{params.length} 个参数</span>
              </div>
              <button className="btn btn-sm btn-secondary" onClick={addParam}>
                <Plus size={13} /> 添加参数
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {params.map((param, index) => (
                <div key={index} className="card" style={{ padding: 16, background: 'var(--bg-elevated)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                    <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)' }}>参数 {index + 1}</span>
                    <button className="btn btn-ghost btn-sm" onClick={() => removeParam(index)}><X size={12} /></button>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
                    <div className="form-group">
                      <label className="form-label">参数名称</label>
                      <input className="form-input" type="text" value={param.name} onChange={e => updateParam(index, 'name', e.target.value)} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">键名</label>
                      <input className="form-input" type="text" value={param.key} onChange={e => updateParam(index, 'key', e.target.value)} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">参数类型</label>
                      <select className="form-input" value={param.type} onChange={e => updateParam(index, 'type', e.target.value)}>
                        <option value="number">数字</option>
                        <option value="string">文本</option>
                        <option value="select">下拉选择</option>
                        <option value="boolean">布尔值</option>
                        <option value="range">滑块</option>
                      </select>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 12 }}>
                    <div className="form-group">
                      <label className="form-label">默认值</label>
                      {param.type === 'boolean' ? (
                        <select className="form-input" value={String(param.defaultValue)} onChange={e => updateParam(index, 'defaultValue', e.target.value === 'true')}>
                          <option value="true">是</option>
                          <option value="false">否</option>
                        </select>
                      ) : (
                        <input className="form-input" type={param.type === 'number' || param.type === 'range' ? 'number' : 'text'} value={String(param.defaultValue)} onChange={e => {
                          const val = param.type === 'number' || param.type === 'range' ? parseFloat(e.target.value) || 0 : e.target.value
                          updateParam(index, 'defaultValue', val)
                        }} />
                      )}
                    </div>
                    <div className="form-group" style={{ justifyContent: 'flex-end' }}>
                      <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
                        <input type="checkbox" checked={param.required} onChange={e => updateParam(index, 'required', e.target.checked)} />
                        必填参数
                      </label>
                    </div>
                  </div>

                  {(param.type === 'number' || param.type === 'range') && (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginTop: 12 }}>
                      <div className="form-group">
                        <label className="form-label">最小值</label>
                        <input className="form-input" type="number" value={param.min ?? ''} onChange={e => updateParam(index, 'min', e.target.value ? parseFloat(e.target.value) : undefined)} />
                      </div>
                      <div className="form-group">
                        <label className="form-label">最大值</label>
                        <input className="form-input" type="number" value={param.max ?? ''} onChange={e => updateParam(index, 'max', e.target.value ? parseFloat(e.target.value) : undefined)} />
                      </div>
                      <div className="form-group">
                        <label className="form-label">步长</label>
                        <input className="form-input" type="number" value={param.step ?? ''} onChange={e => updateParam(index, 'step', e.target.value ? parseFloat(e.target.value) : undefined)} />
                      </div>
                    </div>
                  )}

                  {param.type === 'select' && (
                    <div style={{ marginTop: 12 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                        <label className="form-label" style={{ marginBottom: 0 }}>选项列表</label>
                        <button className="btn btn-xs btn-secondary" onClick={() => {
                          const opts = param.options || []
                          opts.push({ label: '', value: '' })
                          updateParamOptions(index, opts)
                        }}><Plus size={11} /> 添加</button>
                      </div>
                      {(param.options || []).map((opt, oi) => (
                        <div key={oi} style={{ display: 'flex', gap: 8, marginBottom: 6 }}>
                          <input className="form-input" type="text" value={opt.label} onChange={e => {
                            const opts = [...(param.options || [])]
                            opts[oi] = { ...opts[oi], label: e.target.value }
                            updateParamOptions(index, opts)
                          }} placeholder="显示文本" />
                          <input className="form-input" type="text" value={String(opt.value)} onChange={e => {
                            const opts = [...(param.options || [])]
                            opts[oi] = { ...opts[oi], value: e.target.value }
                            updateParamOptions(index, opts)
                          }} placeholder="值" />
                          <button className="btn btn-ghost btn-sm" onClick={() => {
                            const opts = (param.options || []).filter((_, i) => i !== oi)
                            updateParamOptions(index, opts)
                          }}><X size={12} /></button>
                        </div>
                      ))}
                    </div>
                  )}

                  <div style={{ marginTop: 12 }}>
                    <label className="form-label">参数说明</label>
                    <input className="form-input" type="text" value={param.description} onChange={e => updateParam(index, 'description', e.target.value)} />
                  </div>
                </div>
              ))}

              {params.length === 0 && (
                <div style={{ textAlign: 'center', padding: 32, background: 'var(--bg-elevated)', border: '1px solid var(--border-dim)' }}>
                  <HelpCircle size={32} style={{ color: 'var(--text-muted)', marginBottom: 8 }} />
                  <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>暂无参数配置</div>
                </div>
              )}
            </div>
          </div>

          <div style={{ display: 'flex', gap: 10, marginTop: 28 }}>
            <button className="btn btn-secondary" style={{ flex: 1 }} onClick={() => navigate({ to: '/architectures' })}>取消</button>
            <button className="btn btn-primary" style={{ flex: 1 }} onClick={handleSubmit} disabled={submitting}>
              {submitting ? <><span className="spinner" /> 保存中…</> : <><Save size={14} /> 保存修改</>}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
