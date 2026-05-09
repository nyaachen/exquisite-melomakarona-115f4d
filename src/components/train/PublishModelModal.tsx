import { useState } from 'react'
import {
  CheckCircle2,
  Plus,
  Copy,
} from 'lucide-react'
import { SearchableDropdown } from '../SearchableDropdown'
import type { PublishableModel } from '../../data/train-tasks'

export function PublishModelModal({
  show,
  taskName,
  baseModel,
  mAP,
  publishableModels,
  onClose,
}: {
  show: boolean
  taskName: string
  baseModel: string
  mAP: number
  publishableModels: PublishableModel[]
  onClose: () => void
}) {
  const [publishMode, setPublishMode] = useState<'new' | 'existing'>('new')
  const [publishModelId, setPublishModelId] = useState('')
  const [publishVersion, setPublishVersion] = useState('')
  const [publishModelName, setPublishModelName] = useState('')
  const [publishModelDesc, setPublishModelDesc] = useState('')
  const [publishModelCategory, setPublishModelCategory] = useState('')
  const [publishErrors, setPublishErrors] = useState<Record<string, string>>({})
  const [publishSubmitting, setPublishSubmitting] = useState(false)

  const publishSelectedModel = publishableModels.find(m => m.id === publishModelId)
  const publishExistingVersions = publishSelectedModel?.existingVersions || []

  function resetForm() {
    setPublishMode('new')
    setPublishModelId('')
    setPublishVersion('')
    setPublishModelName('')
    setPublishModelDesc('')
    setPublishModelCategory('')
    setPublishErrors({})
  }

  function validatePublish(): boolean {
    const e: Record<string, string> = {}
    if (publishMode === 'existing') {
      if (!publishModelId) e.publishModelId = '请选择已有模型'
    } else {
      if (!publishModelName.trim()) e.publishModelName = '请输入模型名称'
    }
    if (!publishVersion) {
      e.publishVersion = '请输入版本号'
    } else if (publishMode === 'existing' && publishExistingVersions.includes(publishVersion)) {
      e.publishVersion = '该版本号已存在'
    } else if (!/^v?\d+\.\d+/.test(publishVersion)) {
      e.publishVersion = '版本号格式不正确，建议格式：v1.0'
    }
    setPublishErrors(e)
    return Object.keys(e).length === 0
  }

  async function handlePublish() {
    if (!validatePublish()) return
    setPublishSubmitting(true)
    await new Promise(r => setTimeout(r, 1500))
    const name = publishMode === 'existing' ? publishSelectedModel?.name : publishModelName
    alert(`模型「${name}」${publishVersion} 发布成功！`)
    resetForm()
    onClose()
    setPublishSubmitting(false)
  }

  function handleClose() {
    resetForm()
    onClose()
  }

  if (!show) return null

  return (
    <div className="modal-backdrop" onClick={handleClose}>
      <div className="modal" style={{ maxWidth: 540 }} onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <span style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' }}>发布模型</span>
          <button className="btn btn-ghost btn-sm" onClick={handleClose}>✕</button>
        </div>

        {/* Current task info */}
        <div style={{ padding: 12, background: 'var(--bg-elevated)', border: '1px solid var(--border-dim)', marginBottom: 16, fontSize: 12 }}>
          <div style={{ color: 'var(--text-muted)', marginBottom: 4 }}>发布任务</div>
          <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{taskName}</div>
          <div style={{ color: 'var(--text-secondary)', marginTop: 2 }}>
            {baseModel} · mAP: {mAP > 0 ? mAP.toFixed(3) : '—'}
          </div>
        </div>

        {/* Publish mode toggle */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
          <button
            className={`btn btn-sm ${publishMode === 'new' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => { setPublishMode('new'); setPublishErrors({}) }}
          >
            <Plus size={13} /> 创建新模型
          </button>
          <button
            className={`btn btn-sm ${publishMode === 'existing' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => { setPublishMode('existing'); setPublishErrors({}) }}
          >
            <Copy size={13} /> 发布到已有模型
          </button>
        </div>

        {publishMode === 'existing' ? (
          <div style={{ animation: 'slideDown 0.15s ease-out' }}>
            <div style={{ marginBottom: 14 }}>
              <SearchableDropdown
                label="选择已有模型"
                color="var(--accent-bright)"
                selectedId={publishModelId}
                onChange={(id) => { setPublishModelId(id); setPublishErrors({}) }}
                items={publishableModels.map(m => ({
                  id: m.id,
                  name: m.name,
                  subtitle: `已有版本: ${m.existingVersions.join('、')}`,
                  tags: m.existingVersions,
                }))}
                placeholder="选择要追加版本的已有模型..."
              />
              {publishErrors.publishModelId && <div className="error-text">{publishErrors.publishModelId}</div>}
            </div>
            {publishSelectedModel && (
              <div style={{ padding: 10, background: 'var(--bg-elevated)', border: '1px solid var(--border-dim)', marginBottom: 14, fontSize: 11, color: 'var(--text-secondary)' }}>
                当前已有版本：{publishSelectedModel.existingVersions.join('、')}，发布后将成为第 {publishSelectedModel.existingVersions.length + 1} 个版本
              </div>
            )}
          </div>
        ) : (
          <div style={{ animation: 'slideDown 0.15s ease-out' }}>
            <div style={{ marginBottom: 14 }}>
              <label className="form-label">模型名称</label>
              <input
                className="form-input"
                type="text"
                value={publishModelName}
                onChange={e => { setPublishModelName(e.target.value); setPublishErrors({}) }}
                placeholder="例如：道路缺陷检测"
              />
              {publishErrors.publishModelName && <div className="error-text">{publishErrors.publishModelName}</div>}
            </div>
            <div style={{ marginBottom: 14 }}>
              <label className="form-label">模型描述（选填）</label>
              <textarea
                className="form-input"
                value={publishModelDesc}
                onChange={e => setPublishModelDesc(e.target.value)}
                placeholder="简要描述模型的功能和适用场景..."
                style={{ minHeight: 60, resize: 'vertical' }}
              />
            </div>
            <div style={{ marginBottom: 14 }}>
              <label className="form-label">模型类别</label>
              <select className="form-input" value={publishModelCategory} onChange={e => setPublishModelCategory(e.target.value)}>
                <option value="">请选择模型类别</option>
                <option value="缺陷检测">缺陷检测</option>
                <option value="安全检测">安全检测</option>
                <option value="行为检测">行为检测</option>
                <option value="目标跟踪">目标跟踪</option>
                <option value="图像分割">图像分割</option>
                <option value="其他">其他</option>
              </select>
            </div>
          </div>
        )}

        <div style={{ marginBottom: 16 }}>
          <label className="form-label">{publishMode === 'existing' ? '新版本号' : '初始版本号'}</label>
          <input
            className="form-input"
            type="text"
            value={publishVersion}
            onChange={e => { setPublishVersion(e.target.value); setPublishErrors({}) }}
            placeholder="例如：v1.0"
            style={{ fontFamily: 'JetBrains Mono' }}
          />
          {publishErrors.publishVersion && <div className="error-text">{publishErrors.publishVersion}</div>}
          {publishMode === 'existing' && !publishErrors.publishVersion && publishVersion && !publishExistingVersions.includes(publishVersion) && (
            <div style={{ fontSize: 12, color: 'var(--success)', marginTop: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
              <CheckCircle2 size={12} /> 版本号可用
            </div>
          )}
        </div>

        <button className="btn btn-primary" style={{ width: '100%' }} onClick={handlePublish} disabled={publishSubmitting}>
          {publishSubmitting ? <><span className="spinner" /> 发布中…</> : <><CheckCircle2 size={14} /> 确认发布</>}
        </button>
      </div>
    </div>
  )
}
