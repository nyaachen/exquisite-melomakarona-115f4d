import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { useState, useMemo } from 'react'
import { ArrowLeft, Save, Plus, X, Info } from 'lucide-react'
import type { PublicPretrainedModel } from './index'

export const Route = createFileRoute('/pretrained-models/create')({
  component: CreatePretrainedModel,
})

const ARCHITECTURES = [
  { id: 'arch-yolov8', name: 'YOLOv8 目标检测', variants: ['n', 's', 'm', 'l', 'x'] },
  { id: 'arch-yolov8-fast', name: 'YOLOv8 快速验证', variants: ['n', 's', 'm'] },
  { id: 'arch-qwen', name: 'Qwen 大语言模型微调', variants: ['7B', '14B', '72B'] },
  { id: 'arch-llama', name: 'LLaMA 大语言模型微调', variants: ['7B', '13B', '70B'] },
]

const SOURCES = ['Ultralytics', 'Roboflow', 'HuggingFace', 'Alibaba', 'Meta', 'OpenAI', '其他']

function CreatePretrainedModel() {
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [architectureId, setArchitectureId] = useState('arch-yolov8')
  const [variant, setVariant] = useState('')
  const [source, setSource] = useState('Ultralytics')
  const [sourceUrl, setSourceUrl] = useState('')
  const [fileUrl, setFileUrl] = useState('')
  const [fileSize, setFileSize] = useState('')
  const [fileHash, setFileHash] = useState('')
  const [fileFormat, setFileFormat] = useState<PublicPretrainedModel['fileFormat']>('pt')
  const [inputSize, setInputSize] = useState(640)
  const [numClasses, setNumClasses] = useState(80)
  const [classNamesStr, setClassNamesStr] = useState('')
  const [description, setDescription] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)

  const selectedArch = useMemo(() => ARCHITECTURES.find(a => a.id === architectureId), [architectureId])

  function validate(): boolean {
    const e: Record<string, string> = {}
    if (!name.trim()) e.name = '请输入模型名称'
    if (!sourceUrl.trim()) e.sourceUrl = '请输入来源链接'
    if (!fileSize.trim()) e.fileSize = '请输入文件大小'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  async function handleSubmit() {
    if (!validate()) return
    setSubmitting(true)
    await new Promise(r => setTimeout(r, 1000))
    navigate({ to: '/pretrained-models' })
  }

  return (
    <div style={{ animation: 'slideIn 0.3s ease-out' }}>
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Link to="/pretrained-models" className="btn btn-ghost btn-sm">
            <ArrowLeft size={14} /> 返回
          </Link>
          <div>
            <div className="breadcrumb">科宝训练平台 › 公开模型</div>
            <h1 className="page-title">添加公开预训练模型</h1>
          </div>
        </div>
      </div>

      <div className="content-padded" style={{ maxWidth: 760, margin: '0 auto' }}>
        <div className="card" style={{ padding: 24 }}>
          {/* ─── 基本信息 ─── */}
          <div className="form-section">
            <div className="form-section-header">基本信息</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div className="form-group">
                <label className="form-label">模型名称 *</label>
                <input className="form-input" type="text" value={name} onChange={e => setName(e.target.value)} placeholder="例：YOLOv8n (COCO)" />
                {errors.name && <div className="error-text">{errors.name}</div>}
              </div>
              <div className="form-group">
                <label className="form-label">关联架构 *</label>
                <select className="form-input" value={architectureId} onChange={e => { setArchitectureId(e.target.value); setVariant('') }}>
                  {ARCHITECTURES.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                </select>
              </div>
            </div>
          </div>

          <div className="form-section">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div className="form-group">
                <label className="form-label">变体</label>
                {selectedArch ? (
                  <select className="form-input" value={variant} onChange={e => setVariant(e.target.value)}>
                    <option value="">— 不指定 —</option>
                    {selectedArch.variants.map(v => <option key={v} value={v}>{v}</option>)}
                  </select>
                ) : (
                  <input className="form-input" type="text" value={variant} onChange={e => setVariant(e.target.value)} placeholder="例：n / s / m / l / x" />
                )}
                <div className="form-hint">模型在架构中的尺寸变体，用于匹配预设参数</div>
              </div>
              <div className="form-group">
                <label className="form-label">来源 *</label>
                <select className="form-input" value={source} onChange={e => setSource(e.target.value)}>
                  {SOURCES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>
          </div>

          <div className="form-section">
            <div className="form-group">
              <label className="form-label">来源链接 *</label>
              <input className="form-input" type="url" value={sourceUrl} onChange={e => setSourceUrl(e.target.value)} placeholder="https://..." />
              {errors.sourceUrl && <div className="error-text">{errors.sourceUrl}</div>}
              <div className="form-hint">模型权重的官方发布页面或 HuggingFace 链接</div>
            </div>
          </div>

          <div className="form-section">
            <div className="form-group">
              <label className="form-label">模型描述</label>
              <textarea className="form-input" rows={2} value={description} onChange={e => setDescription(e.target.value)} placeholder="描述该预训练模型的来源、适用场景等" />
            </div>
          </div>

          {/* ─── 模型文件信息（预留，暂不上传） ─── */}
          <div className="form-section">
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
              <div className="form-section-header" style={{ marginBottom: 0 }}>模型文件信息</div>
              <span style={{ fontSize: 10, color: 'var(--text-muted)', background: 'var(--bg-elevated)', padding: '2px 8px', borderRadius: 4 }}>预留字段 · 后续接入文件存储</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div className="form-group">
                <label className="form-label">文件格式</label>
                <select className="form-input" value={fileFormat} onChange={e => setFileFormat(e.target.value as PublicPretrainedModel['fileFormat'])}>
                  <option value="pt">PyTorch (.pt)</option>
                  <option value="onnx">ONNX (.onnx)</option>
                  <option value="safetensors">SafeTensors (.safetensors)</option>
                  <option value="bin">Binary (.bin)</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">文件大小 *</label>
                <input className="form-input" type="text" value={fileSize} onChange={e => setFileSize(e.target.value)} placeholder="例：15.1 MB / 2.3 GB" />
                {errors.fileSize && <div className="error-text">{errors.fileSize}</div>}
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginTop: 12 }}>
              <div className="form-group">
                <label className="form-label">文件下载地址（预留）</label>
                <input className="form-input" type="text" value={fileUrl} onChange={e => setFileUrl(e.target.value)} placeholder="后续接入 Netlify Blobs / CDN 自动填充" disabled />
              </div>
              <div className="form-group">
                <label className="form-label">SHA256 校验值（预留）</label>
                <input className="form-input" type="text" value={fileHash} onChange={e => setFileHash(e.target.value)} placeholder="上传文件后自动计算" disabled />
              </div>
            </div>
          </div>

          {/* ─── 模型规格 ─── */}
          <div className="form-section">
            <div className="form-section-header">模型规格</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div className="form-group">
                <label className="form-label">输入尺寸</label>
                <input className="form-input" type="number" value={inputSize} onChange={e => setInputSize(parseInt(e.target.value) || 0)} />
                <div className="form-hint">YOLO 类模型填图片尺寸（如 640），LLM 类填最大 token 数（如 2048）</div>
              </div>
              <div className="form-group">
                <label className="form-label">输出类别数</label>
                <input className="form-input" type="number" value={numClasses} onChange={e => setNumClasses(parseInt(e.target.value) || 0)} />
                <div className="form-hint">LLM 类模型填 0</div>
              </div>
            </div>
          </div>

          <div className="form-section">
            <div className="form-group">
              <label className="form-label">预训练类别名称</label>
              <input className="form-input" type="text" value={classNamesStr} onChange={e => setClassNamesStr(e.target.value)} placeholder="用逗号分隔，例：person, car, dog, cat" />
              <div className="form-hint">预训练模型原本能识别的类别，供训练时参考类别兼容性</div>
            </div>
          </div>

          <div style={{ padding: '12px 16px', background: 'var(--accent-glow)', border: '1px solid rgba(27,107,239,0.15)', marginTop: 16, display: 'flex', gap: 8, fontSize: 12, color: 'var(--text-secondary)' }}>
            <Info size={13} style={{ color: 'var(--accent-bright)', flexShrink: 0, marginTop: 1 }} />
            <span>添加后将在创建训练任务时可选此预训练权重。文件上传和存储功能后续版本开放。</span>
          </div>

          <div style={{ display: 'flex', gap: 10, marginTop: 28 }}>
            <button className="btn btn-secondary" style={{ flex: 1 }} onClick={() => navigate({ to: '/pretrained-models' })}>取消</button>
            <button className="btn btn-primary" style={{ flex: 1 }} onClick={handleSubmit} disabled={submitting}>
              {submitting ? <><span className="spinner" /> 保存中…</> : <><Save size={14} /> 添加模型</>}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
