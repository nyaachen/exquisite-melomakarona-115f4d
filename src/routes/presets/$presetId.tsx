import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { useState, useMemo } from 'react'
import { ArrowLeft, Save, Info, AlertCircle, Globe, Lock } from 'lucide-react'
import { NotFound } from '../../components/NotFound'
import { ARCHITECTURES } from '../../data/architectures'
import { PRESETS } from '../../data/presets'

export const Route = createFileRoute('/presets/$presetId')({
  component: EditPreset,
})

function EditPreset() {
  const { presetId } = Route.useParams()
  const navigate = useNavigate()

  const data = PRESETS.find(p => p.id === presetId)
  if (!data) return <NotFound />

  const [name, setName] = useState(data.name)
  const [description, setDescription] = useState(data.description)
  const [architectureId, setArchitectureId] = useState(data.architectureId)
  const [isActive, setIsActive] = useState(data.isActive)
  const [isPublic, setIsPublic] = useState(data.visibility === 'public')
  const [values, setValues] = useState<Record<string, number | string | boolean>>(data.paramValues || {})
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)

  const architecture = useMemo(() => ARCHITECTURES.find(a => a.id === architectureId), [architectureId])

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
            <h1 className="page-title">编辑训练预设</h1>
          </div>
        </div>
      </div>

      <div className="content-padded" style={{ maxWidth: 720, margin: '0 auto' }}>
        {data.usageCount > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 16px', background: 'rgba(230, 162, 60,0.06)', border: '1px solid rgba(230, 162, 60,0.2)', marginBottom: 20 }}>
            <AlertCircle size={16} style={{ color: 'var(--warning)', flexShrink: 0 }} />
            <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
              该预设已被 <strong style={{ color: 'var(--warning)' }}>{data.usageCount}</strong> 个训练任务使用
            </span>
          </div>
        )}

        <div className="card" style={{ padding: 24 }}>
          <div className="form-section">
            <div className="form-section-header">基本信息</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div className="form-group">
                <label className="form-label">预设名称 *</label>
                <input className="form-input" type="text" value={name} onChange={e => setName(e.target.value)} />
                {errors.name && <div className="error-text">{errors.name}</div>}
              </div>
              <div className="form-group">
                <label className="form-label">关联模型模板</label>
                <select className="form-input" value={architectureId} onChange={e => setArchitectureId(e.target.value)} disabled={data.usageCount > 0}>
                  {ARCHITECTURES.filter(a => a.isActive).map(a => (
                    <option key={a.id} value={a.id}>{a.name}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="form-section">
            <label className="form-label">预设描述</label>
            <textarea className="form-input" rows={2} value={description} onChange={e => setDescription(e.target.value)} />
          </div>

          <div className="form-section">
            <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
              <input type="checkbox" checked={isActive} onChange={e => setIsActive(e.target.checked)} />
              启用状态
            </label>
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
              <div style={{ padding: '10px 14px', background: 'var(--accent-glow)', border: '1px solid rgba(64, 158, 255,0.15)', marginTop: 16, marginBottom: 20, display: 'flex', gap: 8, fontSize: 12, color: 'var(--text-secondary)' }}>
                <Info size={13} style={{ color: 'var(--accent-bright)', flexShrink: 0, marginTop: 1 }} />
                <span>基于「{architecture.name}」模板的参数定义</span>
              </div>

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
                        <select className="form-input" value={String(val)} onChange={e => setValue(param.key, e.target.value === 'true')}>
                          <option value="true">是</option>
                          <option value="false">否</option>
                        </select>
                      ) : param.type === 'range' ? (
                        <div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                            <input className="form-input" type="number" value={Number(val)} min={param.min} max={param.max} step={param.step} onChange={e => setValue(param.key, parseFloat(e.target.value) || 0)} style={{ width: 100 }} />
                          </div>
                          <input type="range" min={param.min || 0} max={param.max || 1} step={param.step || 0.001} value={Number(val)} onChange={e => setValue(param.key, parseFloat(e.target.value))} />
                        </div>
                      ) : (
                        <input className={`form-input ${hasError ? 'error' : ''}`} type={param.type === 'number' ? 'number' : 'text'} value={String(val)} min={param.min} max={param.max} step={param.step} onChange={e => {
                          const v = param.type === 'number' ? (parseFloat(e.target.value) || 0) : e.target.value
                          setValue(param.key, v)
                        }} />
                      )}

                      {param.description && <div className="form-hint">{param.description}</div>}
                      {hasError && <div className="error-text">{hasError}</div>}
                    </div>
                  )
                })}
              </div>
            </>
          )}

          <div style={{ display: 'flex', gap: 10, marginTop: 28 }}>
            <button className="btn btn-secondary" style={{ flex: 1 }} onClick={() => navigate({ to: '/presets' })}>取消</button>
            <button className="btn btn-primary" style={{ flex: 1 }} onClick={handleSubmit} disabled={submitting}>
              {submitting ? <><span className="spinner" /> 保存中…</> : <><Save size={14} /> 保存修改</>}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
