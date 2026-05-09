import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { useState, useRef } from 'react'
import { Upload, File, Package, ArrowLeft, CheckCircle2, XCircle, Plus, Layers, Info } from 'lucide-react'
import { ARCHITECTURES } from '../../data/architectures'
import { PLAZA_MODELS } from '../../data/plaza-models'

export const Route = createFileRoute('/model-management/upload')({
  component: UploadModelPage,
})

function UploadModelPage() {
  const navigate = useNavigate()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [uploadMode, setUploadMode] = useState<'new' | 'existing'>('new')
  const [selectedModelId, setSelectedModelId] = useState<string>('')
  const [modelName, setModelName] = useState('')
  const [modelVersion, setModelVersion] = useState('1.0.0')
  const [modelDesc, setModelDesc] = useState('')
  const [architectureId, setArchitectureId] = useState('arch-yolov8')
  const [source, setSource] = useState('platform')
  const [classNamesStr, setClassNamesStr] = useState('')
  const [coverImage, setCoverImage] = useState('')
  const [isUploading, setIsUploading] = useState(false)
  const [uploadSuccess, setUploadSuccess] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const selectedModel = PLAZA_MODELS.find(m => m.id === selectedModelId)

  function validate(): boolean {
    const newErrors: Record<string, string> = {}

    if (!uploadedFile) {
      newErrors.file = '请选择要上传的模型文件'
    } else if (!uploadedFile.name.endsWith('.pt')) {
      newErrors.file = '仅支持 .pt 格式的模型文件'
    }

    if (uploadMode === 'new') {
      if (!modelName.trim()) {
        newErrors.modelName = '请输入模型名称'
      }
      if (!architectureId) {
        newErrors.architecture = '请选择所属架构'
      }
    } else {
      if (!selectedModelId) {
        newErrors.existingModel = '请选择要添加版本的模型'
      }
    }

    if (!modelVersion) {
      newErrors.version = '请输入版本号'
    } else if (!/^v?\d+/.test(modelVersion)) {
      newErrors.version = '版本号格式不正确，建议格式：v1.0 或 1.0'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  async function handleUpload() {
    if (!validate()) return

    setIsUploading(true)
    await new Promise(r => setTimeout(r, 2000))

    setIsUploading(false)
    setUploadSuccess(true)

    setTimeout(() => {
      navigate({ to: '/model-management' })
    }, 2000)
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) {
      setUploadedFile(file)
      setErrors({})
      if (!modelName && uploadMode === 'new') {
        setModelName(file.name.replace('.pt', '').replace(/_/g, ' '))
      }
    }
  }

  function handleDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault()
    const file = e.dataTransfer.files?.[0]
    if (file) {
      setUploadedFile(file)
      setErrors({})
      if (!modelName && uploadMode === 'new') {
        setModelName(file.name.replace('.pt', '').replace(/_/g, ' '))
      }
    }
  }

  function handleDragOver(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault()
  }

  function handleArchitectureChange(newArchId: string) {
    setArchitectureId(newArchId)
    const arch = ARCHITECTURES.find(a => a.id === newArchId)
    if (arch && arch.category === 'llm') {
      setModelVersion('1.0.0')
    }
  }

  return (
    <div style={{ animation: 'slideIn 0.3s ease-out' }}>
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Link to="/model-management" className="btn btn-ghost btn-sm">
            <ArrowLeft size={14} /> 返回
          </Link>
          <div>
            <div className="breadcrumb">
              <Link to="/">科宝训练平台</Link> ›
              <Link to="/model-management">模型管理</Link> ›
              <span>上传模型</span>
            </div>
            <h1 className="page-title">上传模型权重</h1>
          </div>
        </div>
      </div>

      <div style={{ padding: '24px 32px', maxWidth: 760 }}>
        {!uploadSuccess ? (
          <div className="card" style={{ padding: 24 }}>
            {/* File upload */}
            <div
              className="card-padded"
              style={{
                background: 'var(--bg-elevated)',
                border: '2px dashed var(--border-dim)',
                textAlign: 'center',
                padding: '40px 24px',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
              onClick={() => fileInputRef.current?.click()}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".pt"
                onChange={handleFileChange}
                style={{ display: 'none' }}
              />
              <div
                style={{
                  width: 72,
                  height: 72,
                  borderRadius: 16,
                  background: uploadedFile ? 'var(--success-glow)' : 'var(--accent-glow)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 16px',
                  transition: 'all 0.2s',
                }}
              >
                {uploadedFile ? (
                  <CheckCircle2 size={36} style={{ color: 'var(--success)' }} />
                ) : (
                  <Upload size={36} style={{ color: 'var(--accent)' }} />
                )}
              </div>
              <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 8 }}>
                {uploadedFile ? '文件已选择' : '点击或拖拽上传模型文件'}
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                支持 .pt 格式的 PyTorch 模型文件
              </div>
              {uploadedFile && (
                <div style={{ marginTop: 16, padding: 12, background: 'var(--bg-surface)', borderRadius: 8 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <File size={18} style={{ color: 'var(--accent)' }} />
                    <div style={{ flex: 1, textAlign: 'left' }}>
                      <div style={{ fontSize: 13, color: 'var(--text-primary)' }}>{uploadedFile.name}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                        {(uploadedFile.size / (1024 * 1024)).toFixed(2)} MB
                      </div>
                    </div>
                    <button
                      className="btn btn-icon btn-danger btn-sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        setUploadedFile(null)
                        if (fileInputRef.current) {
                          fileInputRef.current.value = ''
                        }
                      }}
                    >
                      <XCircle size={14} />
                    </button>
                  </div>
                </div>
              )}
              {errors.file && (
                <div style={{ fontSize: 12, color: 'var(--error)', marginTop: 8 }}>{errors.file}</div>
              )}
            </div>

            {/* Upload mode */}
            <div style={{ marginBottom: 20, marginTop: 20 }}>
              <label className="form-label">上传方式</label>
              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  className={`btn ${uploadMode === 'new' ? 'btn-primary' : 'btn-secondary'}`}
                  onClick={() => {
                    setUploadMode('new')
                    setSelectedModelId('')
                    setErrors({})
                  }}
                  style={{ flex: 1 }}
                >
                  <Plus size={14} /> 新建模型
                </button>
                <button
                  className={`btn ${uploadMode === 'existing' ? 'btn-primary' : 'btn-secondary'}`}
                  onClick={() => {
                    setUploadMode('existing')
                    setErrors({})
                  }}
                  style={{ flex: 1 }}
                >
                  <Layers size={14} /> 添加到已有模型
                </button>
              </div>
            </div>

            {uploadMode === 'existing' && (
              <div style={{ marginBottom: 20 }}>
                <label className="form-label">选择目标模型</label>
                <select
                  className="form-input"
                  value={selectedModelId}
                  onChange={(e) => {
                    setSelectedModelId(e.target.value)
                    setErrors({})
                    if (e.target.value) {
                      const model = PLAZA_MODELS.find(m => m.id === e.target.value)
                      if (model) {
                        setArchitectureId(model.architectureId)
                        setSource(model.source)
                      }
                    }
                  }}
                >
                  <option value="">请选择目标模型</option>
                  {PLAZA_MODELS.map(model => (
                    <option key={model.id} value={model.id}>
                      {model.name} - {model.source === 'platform' ? '平台' : '公开'}
                    </option>
                  ))}
                </select>
                {errors.existingModel && (
                  <div style={{ fontSize: 12, color: 'var(--error)', marginTop: 4 }}>{errors.existingModel}</div>
                )}
              </div>
            )}

            {/* New model fields */}
            {uploadMode === 'new' && (
              <>
                <div style={{ marginBottom: 20 }}>
                  <label className="form-label">模型名称 *</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="例如：安全帽检测模型"
                    value={modelName}
                    onChange={(e) => {
                      setModelName(e.target.value)
                      setErrors({})
                    }}
                  />
                  {errors.modelName && (
                    <div style={{ fontSize: 12, color: 'var(--error)', marginTop: 4 }}>{errors.modelName}</div>
                  )}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
                  <div>
                    <label className="form-label">所属架构 *</label>
                    <select
                      className="form-input"
                      value={architectureId}
                      onChange={(e) => {
                        handleArchitectureChange(e.target.value)
                        setErrors({})
                      }}
                    >
                      {ARCHITECTURES.map(arch => (
                        <option key={arch.id} value={arch.id}>{arch.name}</option>
                      ))}
                    </select>
                    {errors.architecture && (
                      <div style={{ fontSize: 12, color: 'var(--error)', marginTop: 4 }}>{errors.architecture}</div>
                    )}
                  </div>
                  <div>
                    <label className="form-label">模型来源</label>
                    <select
                      className="form-input"
                      value={source}
                      onChange={(e) => setSource(e.target.value)}
                    >
                      <option value="platform">平台自有</option>
                      <option value="public">公开模型</option>
                    </select>
                  </div>
                </div>

                <div style={{ marginBottom: 20 }}>
                  <label className="form-label">模型描述（选填）</label>
                  <textarea
                    className="form-input"
                    placeholder="简要描述模型的功能和适用场景..."
                    value={modelDesc}
                    onChange={(e) => setModelDesc(e.target.value)}
                    style={{ minHeight: 80, resize: 'vertical' }}
                  />
                </div>

                <div style={{ marginBottom: 20 }}>
                  <label className="form-label">预训练类别名称</label>
                  <input
                    className="form-input"
                    type="text"
                    value={classNamesStr}
                    onChange={(e) => setClassNamesStr(e.target.value)}
                    placeholder="用逗号分隔，例：person, car, dog, cat"
                  />
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>
                    模型原本能识别的类别，供训练时参考类别兼容性
                  </div>
                </div>

                <div style={{ marginBottom: 20 }}>
                  <label className="form-label">封面图片 URL（选填）</label>
                  <input
                    className="form-input"
                    type="url"
                    value={coverImage}
                    onChange={(e) => setCoverImage(e.target.value)}
                    placeholder="https://... 模型封面图片链接"
                  />
                  {coverImage && (
                    <div style={{ marginTop: 8, aspectRatio: '16/10', maxWidth: 260, borderRadius: 4, overflow: 'hidden', background: 'var(--bg-elevated)', border: '1px solid var(--border-dim)' }}>
                      <img
                        src={coverImage}
                        alt="预览"
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
                      />
                    </div>
                  )}
                </div>
              </>
            )}

            {/* Version */}
            <div style={{ marginBottom: 20 }}>
              <label className="form-label">版本号</label>
              <input
                type="text"
                className="form-input"
                placeholder="例如：v1.0 或 1.0"
                value={modelVersion}
                onChange={(e) => {
                  setModelVersion(e.target.value)
                  setErrors({})
                }}
                style={{ fontFamily: 'JetBrains Mono' }}
              />
              {errors.version && (
                <div style={{ fontSize: 12, color: 'var(--error)', marginTop: 4 }}>{errors.version}</div>
              )}
            </div>

            {uploadMode === 'existing' && selectedModel && (
              <div className="card" style={{ padding: 16, background: 'var(--accent-glow)', border: '1px solid var(--accent)', marginBottom: 24 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Layers size={14} style={{ color: 'var(--accent)' }} />
                  <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                    将作为新版本 <span style={{ fontFamily: 'JetBrains Mono', color: 'var(--accent-bright)' }}>{modelVersion}</span> 添加到模型 <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{selectedModel.name}</span>
                  </span>
                </div>
              </div>
            )}

            {/* Info notice */}
            <div className="card card-padded" style={{ background: 'var(--accent-glow)', borderColor: 'var(--accent)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Info size={14} style={{ color: 'var(--accent)' }} />
                <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                  上传的模型将进行验证后发布到模型管理列表，请确保模型文件完整且格式正确
                </span>
              </div>
            </div>

            <button
              className="btn btn-primary"
              style={{ width: '100%', marginTop: 24 }}
              onClick={handleUpload}
              disabled={!uploadedFile || (uploadMode === 'new' && !modelName.trim()) || (uploadMode === 'existing' && !selectedModelId) || isUploading}
            >
              {isUploading ? (
                <>
                  <span className="spinner" style={{ width: 14, height: 14 }} />
                  上传中...
                </>
              ) : (
                <>
                  <Package size={14} /> {uploadMode === 'new' ? '上传并发布' : '上传新版本'}
                </>
              )}
            </button>
          </div>
        ) : (
          <div className="card" style={{ padding: '60px 24px', textAlign: 'center' }}>
            <div
              style={{
                width: 80,
                height: 80,
                background: 'var(--success-glow)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 20px',
              }}
            >
              <CheckCircle2 size={40} style={{ color: 'var(--success)' }} />
            </div>
            <div style={{ fontSize: 20, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 8 }}>
              上传成功！
            </div>
            <div style={{ fontSize: 14, color: 'var(--text-secondary)' }}>
              {uploadMode === 'new'
                ? `模型「${modelName}」${modelVersion} 已发布到模型管理`
                : `新版本 ${modelVersion} 已添加到「${selectedModel?.name || ''}」`
              }
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
