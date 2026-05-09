import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { useState, useMemo } from 'react'
import { ArrowLeft, Save, Info } from 'lucide-react'
import { NotFound } from '../../components/NotFound'
import type { PublicPretrainedModel } from './index'

export const Route = createFileRoute('/pretrained-models/$modelId')({
  component: EditPretrainedModel,
})

const ARCHITECTURES = [
  { id: 'arch-yolov8', name: 'YOLOv8 目标检测', variants: ['n', 's', 'm', 'l', 'x'] },
  { id: 'arch-yolov8-fast', name: 'YOLOv8 快速验证', variants: ['n', 's', 'm'] },
  { id: 'arch-qwen', name: 'Qwen 大语言模型微调', variants: ['7B', '14B', '72B'] },
  { id: 'arch-llama', name: 'LLaMA 大语言模型微调', variants: ['7B', '13B', '70B'] },
]

const SOURCES = ['Ultralytics', 'Roboflow', 'HuggingFace', 'Alibaba', 'Meta', 'OpenAI', '其他']

const PRETRAINED_MODELS: PublicPretrainedModel[] = [
  {
    id: 'pub-yolov8n-coco', name: 'YOLOv8n (COCO)', architectureId: 'arch-yolov8', architectureName: 'YOLOv8 目标检测',
    variant: 'n', source: 'Ultralytics', sourceUrl: 'https://github.com/ultralytics/assets/releases/download/v8.2.0/yolov8n.pt',
    fileUrl: '', fileSize: '6.2 MB', fileFormat: 'pt',
    inputSize: 640, numClasses: 80, classNames: ['person', 'car', 'dog', 'cat'],
    description: 'YOLOv8 Nano 在 COCO 数据集上预训练的权重', isActive: true,
    createdAt: '2026-04-10', createdBy: '系统管理员',
  },
  {
    id: 'pub-yolov8s-coco', name: 'YOLOv8s (COCO)', architectureId: 'arch-yolov8', architectureName: 'YOLOv8 目标检测',
    variant: 's', source: 'Ultralytics', sourceUrl: 'https://github.com/ultralytics/assets/releases/download/v8.2.0/yolov8s.pt',
    fileUrl: '', fileSize: '21.5 MB', fileFormat: 'pt',
    inputSize: 640, numClasses: 80, classNames: ['person', 'car', 'dog', 'cat'],
    description: 'YOLOv8 Small 在 COCO 数据集上预训练的权重', isActive: true,
    createdAt: '2026-04-10', createdBy: '系统管理员',
  },
  {
    id: 'pub-yolov8m-coco', name: 'YOLOv8m (COCO)', architectureId: 'arch-yolov8', architectureName: 'YOLOv8 目标检测',
    variant: 'm', source: 'Ultralytics', sourceUrl: 'https://github.com/ultralytics/assets/releases/download/v8.2.0/yolov8m.pt',
    fileUrl: '', fileSize: '49.7 MB', fileFormat: 'pt',
    inputSize: 640, numClasses: 80, classNames: ['person', 'car', 'dog', 'cat'],
    description: 'YOLOv8 Medium 在 COCO 数据集上预训练的权重', isActive: true,
    createdAt: '2026-04-10', createdBy: '系统管理员',
  },
  {
    id: 'pub-yolov8n-pothole', name: 'YOLOv8n (道路缺陷)', architectureId: 'arch-yolov8', architectureName: 'YOLOv8 目标检测',
    variant: 'n', source: 'Roboflow', sourceUrl: 'https://universe.roboflow.com/pothole-detection',
    fileUrl: '', fileSize: '6.3 MB', fileFormat: 'pt',
    inputSize: 640, numClasses: 5, classNames: ['pothole', 'crack', 'patch'],
    description: '在道路缺陷数据集上预训练的 YOLOv8 Nano', isActive: true,
    createdAt: '2026-04-22', createdBy: '张工',
  },
  {
    id: 'pub-qwen-7b-base', name: 'Qwen-7B-Chat (原版)', architectureId: 'arch-qwen', architectureName: 'Qwen 大语言模型微调',
    variant: '7B', source: 'Alibaba', sourceUrl: 'https://huggingface.co/Qwen/Qwen-7B-Chat',
    fileUrl: '', fileSize: '14.0 GB', fileFormat: 'safetensors',
    inputSize: 2048, numClasses: 0, classNames: [],
    description: 'Qwen-7B-Chat 官方预训练权重', isActive: true,
    createdAt: '2026-04-15', createdBy: '系统管理员',
  },
  {
    id: 'pub-llama-7b-base', name: 'LLaMA-2-7B-Chat (原版)', architectureId: 'arch-llama', architectureName: 'LLaMA 大语言模型微调',
    variant: '7B', source: 'Meta', sourceUrl: 'https://huggingface.co/meta-llama/Llama-2-7b-chat',
    fileUrl: '', fileSize: '13.5 GB', fileFormat: 'safetensors',
    inputSize: 2048, numClasses: 0, classNames: [],
    description: 'LLaMA-2-7B-Chat 官方预训练权重', isActive: true,
    createdAt: '2026-04-28', createdBy: '系统管理员',
  },
]

function EditPretrainedModel() {
  const { modelId } = Route.useParams()
  const navigate = useNavigate()

  const data = PRETRAINED_MODELS.find(m => m.id === modelId)
  if (!data) return <NotFound />

  const [name, setName] = useState(data.name)
  const [architectureId, setArchitectureId] = useState(data.architectureId)
  const [variant, setVariant] = useState(data.variant || '')
  const [source, setSource] = useState(data.source)
  const [sourceUrl, setSourceUrl] = useState(data.sourceUrl)
  const [fileUrl, setFileUrl] = useState(data.fileUrl)
  const [fileSize, setFileSize] = useState(data.fileSize)
  const [fileHash, setFileHash] = useState(data.fileHash || '')
  const [fileFormat, setFileFormat] = useState(data.fileFormat)
  const [inputSize, setInputSize] = useState(data.inputSize)
  const [numClasses, setNumClasses] = useState(data.numClasses)
  const [classNamesStr, setClassNamesStr] = useState(data.classNames.join(', '))
  const [description, setDescription] = useState(data.description)
  const [isActive, setIsActive] = useState(data.isActive)
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
            <h1 className="page-title">编辑预训练模型</h1>
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
                <input className="form-input" type="text" value={name} onChange={e => setName(e.target.value)} />
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
                  <input className="form-input" type="text" value={variant} onChange={e => setVariant(e.target.value)} />
                )}
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
              <input className="form-input" type="url" value={sourceUrl} onChange={e => setSourceUrl(e.target.value)} />
              {errors.sourceUrl && <div className="error-text">{errors.sourceUrl}</div>}
            </div>
          </div>

          <div className="form-section">
            <div className="form-group">
              <label className="form-label">模型描述</label>
              <textarea className="form-input" rows={2} value={description} onChange={e => setDescription(e.target.value)} />
            </div>
          </div>

          {/* ─── 模型文件信息 ─── */}
          <div className="form-section">
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
              <div className="form-section-header" style={{ marginBottom: 0 }}>模型文件信息</div>
              <span style={{ fontSize: 10, color: 'var(--text-muted)', background: 'var(--bg-elevated)', padding: '2px 8px', borderRadius: 4 }}>预留字段</span>
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
                <input className="form-input" type="text" value={fileSize} onChange={e => setFileSize(e.target.value)} />
                {errors.fileSize && <div className="error-text">{errors.fileSize}</div>}
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginTop: 12 }}>
              <div className="form-group">
                <label className="form-label">文件下载地址（预留）</label>
                <input className="form-input" type="text" value={fileUrl} onChange={e => setFileUrl(e.target.value)} disabled />
              </div>
              <div className="form-group">
                <label className="form-label">SHA256 校验值（预留）</label>
                <input className="form-input" type="text" value={fileHash} onChange={e => setFileHash(e.target.value)} disabled />
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
              </div>
              <div className="form-group">
                <label className="form-label">输出类别数</label>
                <input className="form-input" type="number" value={numClasses} onChange={e => setNumClasses(parseInt(e.target.value) || 0)} />
              </div>
            </div>
          </div>

          <div className="form-section">
            <div className="form-group">
              <label className="form-label">预训练类别名称</label>
              <input className="form-input" type="text" value={classNamesStr} onChange={e => setClassNamesStr(e.target.value)} />
              <div className="form-hint">用逗号分隔，供训练时参考类别兼容性</div>
            </div>
          </div>

          <div className="form-section">
            <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
              <input type="checkbox" checked={isActive} onChange={e => setIsActive(e.target.checked)} />
              启用状态
            </label>
            <div className="form-hint">禁用后，创建训练任务时将不可选此模型</div>
          </div>

          <div style={{ padding: '12px 16px', background: 'var(--accent-glow)', border: '1px solid rgba(64, 158, 255,0.15)', marginTop: 16, display: 'flex', gap: 8, fontSize: 12, color: 'var(--text-secondary)' }}>
            <Info size={13} style={{ color: 'var(--accent-bright)', flexShrink: 0, marginTop: 1 }} />
            <span>修改后将影响新建训练任务时的可用预训练模型选项。</span>
          </div>

          <div style={{ display: 'flex', gap: 10, marginTop: 28 }}>
            <button className="btn btn-secondary" style={{ flex: 1 }} onClick={() => navigate({ to: '/pretrained-models' })}>取消</button>
            <button className="btn btn-primary" style={{ flex: 1 }} onClick={handleSubmit} disabled={submitting}>
              {submitting ? <><span className="spinner" /> 保存中…</> : <><Save size={14} /> 保存修改</>}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
