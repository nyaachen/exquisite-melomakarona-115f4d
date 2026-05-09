import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { useState, useMemo } from 'react'
import { ArrowLeft, Save, Info, Globe, Lock } from 'lucide-react'
import { ARCHITECTURES } from '../../data/architectures'

export const Route = createFileRoute('/presets/create')({
  component: CreatePreset,
})

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
