import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import { ArrowLeft, Save, Plus, X, HelpCircle } from 'lucide-react'

export const Route = createFileRoute('/template/create')({
  component: CreateTemplate,
})

interface TemplateParam {
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

const MODEL_TYPES = [
  { value: 'YOLO', label: 'YOLO 目标检测' },
  { value: 'QWEN', label: 'Qwen 大语言模型' },
  { value: 'LLaMA', label: 'LLaMA 大语言模型' },
  { value: 'OTHER', label: '其他模型' },
]

const BASE_MODELS: Record<string, { label: string; value: string }[]> = {
  YOLO: [
    { label: 'YOLOv8n', value: 'YOLOv8n' },
    { label: 'YOLOv8s', value: 'YOLOv8s' },
    { label: 'YOLOv8m', value: 'YOLOv8m' },
    { label: 'YOLOv8l', value: 'YOLOv8l' },
    { label: 'YOLOv8x', value: 'YOLOv8x' },
  ],
  QWEN: [
    { label: 'Qwen-7B-Chat', value: 'Qwen-7B-Chat' },
    { label: 'Qwen-14B-Chat', value: 'Qwen-14B-Chat' },
    { label: 'Qwen-72B-Chat', value: 'Qwen-72B-Chat' },
    { label: 'Qwen-VL-Chat', value: 'Qwen-VL-Chat' },
  ],
  LLaMA: [
    { label: 'LLaMA-2-7B-Chat', value: 'LLaMA-2-7B-Chat' },
    { label: 'LLaMA-2-13B-Chat', value: 'LLaMA-2-13B-Chat' },
    { label: 'LLaMA-2-70B-Chat', value: 'LLaMA-2-70B-Chat' },
  ],
  OTHER: [
    { label: '自定义', value: 'custom' },
  ],
}

function CreateTemplate() {
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [modelType, setModelType] = useState('YOLO')
  const [baseModel, setBaseModel] = useState('YOLOv8m')
  const [description, setDescription] = useState('')
  const [isActive, setIsActive] = useState(true)
  const [params, setParams] = useState<TemplateParam[]>([])
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleAddParam = () => {
    const newParam: TemplateParam = {
      name: '',
      key: '',
      type: 'number',
      defaultValue: 0,
      required: false,
      description: '',
    }
    setParams([...params, newParam])
  }

  const handleRemoveParam = (index: number) => {
    setParams(params.filter((_, i) => i !== index))
  }

  const handleUpdateParam = (index: number, field: keyof TemplateParam, value: unknown) => {
    const newParams = [...params]
    newParams[index] = { ...newParams[index], [field]: value }
    setParams(newParams)
  }

  const handleUpdateParamOptions = (index: number, options: { label: string; value: string | number }[]) => {
    const newParams = [...params]
    newParams[index] = { ...newParams[index], options }
    setParams(newParams)
  }

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!name.trim()) {
      newErrors.name = '请输入模板名称'
    }

    if (!baseModel) {
      newErrors.baseModel = '请选择基础模型'
    }

    for (let i = 0; i < params.length; i++) {
      const param = params[i]
      if (!param.name.trim()) {
        newErrors[`param-${i}-name`] = `请输入第 ${i + 1} 个参数的名称`
      }
      if (!param.key.trim()) {
        newErrors[`param-${i}-key`] = `请输入第 ${i + 1} 个参数的键名`
      }
      if (param.type === 'select' && (!param.options || param.options.length === 0)) {
        newErrors[`param-${i}-options`] = `请为第 ${i + 1} 个参数添加选项`
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async () => {
    if (!validate()) return

    setIsSubmitting(true)
    await new Promise(r => setTimeout(r, 1000))
    setIsSubmitting(false)
    navigate({ to: '/template' })
  }

  return (
    <div style={{ animation: 'slideIn 0.3s ease-out', padding: '24px 32px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
        <Link to="/template" className="btn btn-ghost btn-sm">
          <ArrowLeft size={14} /> 返回
        </Link>
        <div>
          <div className="breadcrumb">科宝训练平台 › 训练模板</div>
          <h1 className="page-title">创建训练模板</h1>
        </div>
      </div>

      <div className="card" style={{ maxWidth: 800, margin: '0 auto' }}>
        <div style={{ padding: 24 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
            <div>
              <label className="form-label">模板名称 *</label>
              <input
                className={`form-input ${errors.name ? 'error' : ''}`}
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="请输入模板名称"
              />
              {errors.name && <div className="error-text">{errors.name}</div>}
            </div>
            <div>
              <label className="form-label">模型类型 *</label>
              <select
                className="form-input"
                value={modelType}
                onChange={e => {
                  setModelType(e.target.value)
                  setBaseModel(BASE_MODELS[e.target.value]?.[0]?.value || '')
                }}
              >
                {MODEL_TYPES.map(m => (
                  <option key={m.value} value={m.value}>{m.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div style={{ marginBottom: 20 }}>
            <label className="form-label">基础模型 *</label>
            <select
              className={`form-input ${errors.baseModel ? 'error' : ''}`}
              value={baseModel}
              onChange={e => setBaseModel(e.target.value)}
            >
              {BASE_MODELS[modelType]?.map(m => (
                <option key={m.value} value={m.value}>{m.label}</option>
              ))}
            </select>
            {errors.baseModel && <div className="error-text">{errors.baseModel}</div>}
          </div>

          <div style={{ marginBottom: 20 }}>
            <label className="form-label">模板描述</label>
            <textarea
              className="form-input"
              rows={3}
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="请输入模板描述（可选）"
            />
          </div>

          <div style={{ marginBottom: 28 }}>
            <label className="form-label">
              <input
                type="checkbox"
                checked={isActive}
                onChange={e => setIsActive(e.target.checked)}
                style={{ marginRight: 8 }}
              />
              启用状态
            </label>
            <span style={{ fontSize: 12, color: 'var(--text-muted)', marginLeft: 8 }}>
              启用后可在创建训练任务时选择此模板
            </span>
          </div>

          <div style={{ marginBottom: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <h3 style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>训练参数配置</h3>
                <span className="badge badge-secondary">{params.length} 个参数</span>
              </div>
              <button
                className="btn btn-sm btn-secondary"
                onClick={handleAddParam}
              >
                <Plus size={13} /> 添加参数
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {params.map((param, index) => (
                <div
                  key={index}
                  className="select-card"
                  style={{ padding: 16 }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                    <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)' }}>
                      参数 {index + 1}
                    </span>
                    <button
                      className="btn btn-ghost btn-sm"
                      onClick={() => handleRemoveParam(index)}
                    >
                      <X size={12} />
                    </button>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
                    <div>
                      <label className="form-label">参数名称 {param.required ? '*' : ''}</label>
                      <input
                        className={`form-input ${errors[`param-${index}-name`] ? 'error' : ''}`}
                        type="text"
                        value={param.name}
                        onChange={e => handleUpdateParam(index, 'name', e.target.value)}
                        placeholder="如：训练轮数"
                      />
                    </div>
                    <div>
                      <label className="form-label">键名 {param.required ? '*' : ''}</label>
                      <input
                        className={`form-input ${errors[`param-${index}-key`] ? 'error' : ''}`}
                        type="text"
                        value={param.key}
                        onChange={e => handleUpdateParam(index, 'key', e.target.value)}
                        placeholder="如：epochs"
                      />
                    </div>
                    <div>
                      <label className="form-label">参数类型</label>
                      <select
                        className="form-input"
                        value={param.type}
                        onChange={e => handleUpdateParam(index, 'type', e.target.value)}
                      >
                        <option value="number">数字输入</option>
                        <option value="string">文本输入</option>
                        <option value="select">下拉选择</option>
                        <option value="boolean">布尔值</option>
                        <option value="range">滑块</option>
                      </select>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 12 }}>
                    <div>
                      <label className="form-label">默认值</label>
                      {param.type === 'boolean' ? (
                        <select
                          className="form-input"
                          value={String(param.defaultValue)}
                          onChange={e => handleUpdateParam(index, 'defaultValue', e.target.value === 'true')}
                        >
                          <option value="true">是</option>
                          <option value="false">否</option>
                        </select>
                      ) : param.type === 'select' ? (
                        <div>
                          <input
                            className="form-input"
                            type="text"
                            value={(param.defaultValue as string) || ''}
                            onChange={e => handleUpdateParam(index, 'defaultValue', e.target.value)}
                            placeholder="默认选中的选项值"
                          />
                        </div>
                      ) : (
                        <input
                          className="form-input"
                          type={param.type === 'number' || param.type === 'range' ? 'number' : 'text'}
                          value={String(param.defaultValue)}
                          onChange={e => {
                            const val = param.type === 'number' || param.type === 'range' 
                              ? parseFloat(e.target.value) || 0 
                              : e.target.value
                            handleUpdateParam(index, 'defaultValue', val)
                          }}
                        />
                      )}
                    </div>
                    <div>
                      <label className="form-label">
                        <input
                          type="checkbox"
                          checked={param.required}
                          onChange={e => handleUpdateParam(index, 'required', e.target.checked)}
                          style={{ marginRight: 8 }}
                        />
                        必填参数
                      </label>
                    </div>
                  </div>

                  {(param.type === 'number' || param.type === 'range') && (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginTop: 12 }}>
                      <div>
                        <label className="form-label">最小值</label>
                        <input
                          className="form-input"
                          type="number"
                          value={param.min || ''}
                          onChange={e => handleUpdateParam(index, 'min', parseFloat(e.target.value) || undefined)}
                        />
                      </div>
                      <div>
                        <label className="form-label">最大值</label>
                        <input
                          className="form-input"
                          type="number"
                          value={param.max || ''}
                          onChange={e => handleUpdateParam(index, 'max', parseFloat(e.target.value) || undefined)}
                        />
                      </div>
                      <div>
                        <label className="form-label">步长</label>
                        <input
                          className="form-input"
                          type="number"
                          value={param.step || ''}
                          onChange={e => handleUpdateParam(index, 'step', parseFloat(e.target.value) || undefined)}
                        />
                      </div>
                    </div>
                  )}

                  {param.type === 'select' && (
                    <div style={{ marginTop: 12 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                        <label className="form-label">选项列表</label>
                        <button
                          className="btn btn-xs btn-secondary"
                          onClick={() => {
                            const newOptions = param.options || []
                            newOptions.push({ label: '', value: '' })
                            handleUpdateParamOptions(index, newOptions)
                          }}
                        >
                          <Plus size={11} /> 添加选项
                        </button>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                        {(param.options || []).map((opt, optIndex) => (
                          <div key={optIndex} style={{ display: 'flex', gap: 8 }}>
                            <input
                              className="form-input"
                              type="text"
                              value={opt.label}
                              onChange={(e) => {
                                const newOptions = param.options || []
                                newOptions[optIndex] = { ...opt, label: e.target.value }
                                handleUpdateParamOptions(index, newOptions)
                              }}
                              placeholder="显示文本"
                            />
                            <input
                              className="form-input"
                              type="text"
                              value={String(opt.value)}
                              onChange={(e) => {
                                const newOptions = param.options || []
                                newOptions[optIndex] = { ...opt, value: e.target.value }
                                handleUpdateParamOptions(index, newOptions)
                              }}
                              placeholder="值"
                            />
                            <button
                              className="btn btn-ghost btn-sm"
                              onClick={() => {
                                const newOptions = (param.options || []).filter((_, i) => i !== optIndex)
                                handleUpdateParamOptions(index, newOptions)
                              }}
                            >
                              <X size={12} />
                            </button>
                          </div>
                        ))}
                      </div>
                      {errors[`param-${index}-options`] && (
                        <div className="error-text">{errors[`param-${index}-options`]}</div>
                      )}
                    </div>
                  )}

                  <div style={{ marginTop: 12 }}>
                    <label className="form-label">参数说明</label>
                    <input
                      className="form-input"
                      type="text"
                      value={param.description}
                      onChange={e => handleUpdateParam(index, 'description', e.target.value)}
                      placeholder="说明该参数的作用（可选）"
                    />
                  </div>
                </div>
              ))}
            </div>

            {params.length === 0 && (
              <div style={{ textAlign: 'center', padding: 32, background: 'var(--bg-elevated)', borderRadius: 8 }}>
                <HelpCircle size={32} style={{ color: 'var(--text-muted)', marginBottom: 8 }} />
                <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                  暂无训练参数，请点击上方按钮添加
                </div>
              </div>
            )}
          </div>

          <div style={{ display: 'flex', gap: 10, marginTop: 24 }}>
            <button className="btn btn-secondary" style={{ flex: 1 }} onClick={() => navigate({ to: '/template' })}>
              取消
            </button>
            <button className="btn btn-primary" style={{ flex: 1 }} onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <div className="spinning" style={{ width: 14, height: 14, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%' }} />
                  保存中…
                </>
              ) : (
                <>
                  <Save size={14} /> 保存模板
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}