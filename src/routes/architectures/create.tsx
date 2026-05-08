import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import { ArrowLeft, Save, Plus, X, HelpCircle } from 'lucide-react'
import { CATEGORY_OPTIONS } from '../../constants'

export const Route = createFileRoute('/architectures/create')({
  component: CreateArchitecture,
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

function CreateArchitecture() {
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [category, setCategory] = useState('object-detection')
  const [baseModel, setBaseModel] = useState('')
  const [description, setDescription] = useState('')
  const [params, setParams] = useState<Param[]>([])
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
            <h1 className="page-title">创建模型模板</h1>
          </div>
        </div>
      </div>

      <div className="content-padded" style={{ maxWidth: 800, margin: '0 auto' }}>
        <div className="card" style={{ padding: 24 }}>
          <div className="form-section">
            <div className="form-section-header">基本信息</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div className="form-group">
                <label className="form-label">模板名称 *</label>
                <input className="form-input" type="text" value={name} onChange={e => setName(e.target.value)} placeholder="例如：YOLOv8 目标检测" />
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
              <input className="form-input" type="text" value={baseModel} onChange={e => setBaseModel(e.target.value)} placeholder="例如：YOLOv8m、Qwen-7B-Chat" />
              <div className="form-hint">该架构对应的预训练基础模型名称</div>
              {errors.baseModel && <div className="error-text">{errors.baseModel}</div>}
            </div>
          </div>

          <div className="form-section">
            <div className="form-group">
              <label className="form-label">模板描述</label>
              <textarea className="form-input" rows={3} value={description} onChange={e => setDescription(e.target.value)} placeholder="描述该模型架构的适用场景和特点" />
            </div>
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
                      <input className="form-input" type="text" value={param.name} onChange={e => updateParam(index, 'name', e.target.value)} placeholder="如：训练轮数" />
                    </div>
                    <div className="form-group">
                      <label className="form-label">键名</label>
                      <input className="form-input" type="text" value={param.key} onChange={e => updateParam(index, 'key', e.target.value)} placeholder="如：epochs" />
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
                        <input
                          className="form-input"
                          type={param.type === 'number' || param.type === 'range' ? 'number' : 'text'}
                          value={String(param.defaultValue)}
                          onChange={e => {
                            const val = param.type === 'number' || param.type === 'range' ? parseFloat(e.target.value) || 0 : e.target.value
                            updateParam(index, 'defaultValue', val)
                          }}
                        />
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
                        }}>
                          <Plus size={11} /> 添加
                        </button>
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
                    <input className="form-input" type="text" value={param.description} onChange={e => updateParam(index, 'description', e.target.value)} placeholder="说明该参数的作用" />
                  </div>
                </div>
              ))}

              {params.length === 0 && (
                <div style={{ textAlign: 'center', padding: 32, background: 'var(--bg-elevated)', border: '1px solid var(--border-dim)' }}>
                  <HelpCircle size={32} style={{ color: 'var(--text-muted)', marginBottom: 8 }} />
                  <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>暂无参数，请点击"添加参数"定义此模型架构的训练参数</div>
                </div>
              )}
            </div>
          </div>

          <div style={{ display: 'flex', gap: 10, marginTop: 28 }}>
            <button className="btn btn-secondary" style={{ flex: 1 }} onClick={() => navigate({ to: '/architectures' })}>取消</button>
            <button className="btn btn-primary" style={{ flex: 1 }} onClick={handleSubmit} disabled={submitting}>
              {submitting ? (
                <><span className="spinner" /> 保存中…</>
              ) : (
                <><Save size={14} /> 保存模板</>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
