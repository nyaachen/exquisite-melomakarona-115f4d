import { createFileRoute, Link } from '@tanstack/react-router'
import { useState } from 'react'
import {
  Upload,
  Edit3,
  Search,
  Globe,
  Shield,
  Save,
} from 'lucide-react'
import { SQUARE_MODELS, type SquareModel } from '../../data/models'

export const Route = createFileRoute('/system/private-models')({
  component: PrivateModels,
})

function PrivateModels() {
  const [models, setModels] = useState<SquareModel[]>(SQUARE_MODELS)
  const [searchQuery, setSearchQuery] = useState('')
  const [editing, setEditing] = useState<SquareModel | null>(null)
  const [editForm, setEditForm] = useState({ name: '', description: '', category: '', coverImage: '' })

  const filtered = models.filter(m =>
    m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.category.toLowerCase().includes(searchQuery.toLowerCase())
  )

  function openEdit(model: SquareModel) {
    setEditing(model)
    setEditForm({
      name: model.name,
      description: model.description,
      category: model.category,
      coverImage: model.coverImage,
    })
  }

  function handleSave() {
    if (!editing) return
    setModels(prev => prev.map(m =>
      m.id === editing.id ? { ...m, ...editForm } : m
    ))
    setEditing(null)
  }

  return (
    <div className="slide-in">
      <div className="page-header">
        <div>
          <div className="breadcrumb">科宝训练平台 › 系统配置</div>
          <h1 className="page-title">私有模型管理</h1>
        </div>
        <Link to="/models/manualUpload" className="btn btn-primary">
          <Upload size={14} /> 上传模型
        </Link>
      </div>

      <div className="content-padded">
        <div style={{ marginBottom: 16 }}>
          <div className="search-input" style={{ maxWidth: 360 }}>
            <Search size={14} style={{ color: 'var(--text-muted)' }} />
            <input
              type="text"
              placeholder="搜索模型名称、描述或类别..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input-field"
            />
          </div>
        </div>

        <div className="card" style={{ overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th style={{ width: 80 }}>封面</th>
                  <th>名称</th>
                  <th>类别</th>
                  <th>来源</th>
                  <th>基础模型</th>
                  <th>类名</th>
                  <th>作者</th>
                  <th>创建日期</th>
                  <th style={{ width: 80 }}></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(model => (
                  <tr key={model.id}>
                    <td>
                      <div style={{ width: 48, height: 30, borderRadius: 3, overflow: 'hidden', background: 'var(--bg-elevated)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <img
                          src={model.coverImage}
                          alt=""
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none'
                            const parent = (e.target as HTMLImageElement).parentElement
                            if (parent && !parent.querySelector('svg')) {
                              const icon = document.createElement('span')
                              icon.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>'
                            }
                          }}
                        />
                      </div>
                    </td>
                    <td>
                      <div className="primary" style={{ fontWeight: 500, fontSize: 13 }}>{model.name}</div>
                    </td>
                    <td><span className="badge badge-secondary" style={{ fontSize: 11 }}>{model.category}</span></td>
                    <td>
                      <span className="badge" style={{
                        background: model.source === 'platform' ? 'var(--accent-glow)' : 'rgba(230, 162, 60, 0.12)',
                        color: model.source === 'platform' ? 'var(--accent)' : 'var(--warning)',
                        borderColor: model.source === 'platform' ? 'rgba(64,158,255,0.3)' : 'rgba(230,162,60,0.3)',
                        fontSize: 10,
                      }}>
                        {model.source === 'platform' ? <Shield size={9} /> : <Globe size={9} />}
                        {model.source === 'platform' ? '平台自有' : model.sourceLabel || '公开模型'}
                      </span>
                    </td>
                    <td className="mono" style={{ fontSize: 12 }}>{model.baseModel}</td>
                    <td style={{ fontSize: 11, color: 'var(--text-secondary)' }}>
                      <div style={{ display: 'flex', gap: 2, flexWrap: 'wrap', maxWidth: 160 }}>
                        {model.classes.slice(0, 3).map(c => (
                          <span key={c} style={{ background: 'var(--bg-elevated)', padding: '0 4px', borderRadius: 2 }}>{c}</span>
                        ))}
                        {model.classes.length > 3 && <span style={{ color: 'var(--text-muted)' }}>+{model.classes.length - 3}</span>}
                      </div>
                    </td>
                    <td style={{ fontSize: 12 }}>{model.author}</td>
                    <td style={{ fontSize: 12, color: 'var(--text-muted)' }}>{model.createdAt}</td>
                    <td>
                      <button className="btn btn-ghost btn-sm" onClick={() => openEdit(model)} title="编辑基础信息">
                        <Edit3 size={12} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filtered.length === 0 && (
            <div className="empty-state">
              <div className="empty-state-icon"><Search size={32} /></div>
              <div className="empty-state-text">未找到匹配的模型</div>
              <div className="empty-state-hint">尝试调整搜索关键词</div>
            </div>
          )}
        </div>
      </div>

      {/* Edit modal */}
      {editing && (
        <div className="modal-backdrop" onClick={() => setEditing(null)}>
          <div className="modal" style={{ maxWidth: 520 }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
              <span style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' }}>编辑模型信息</span>
              <button className="btn btn-ghost btn-sm" onClick={() => setEditing(null)}>✕</button>
            </div>

            <div style={{ marginBottom: 14 }}>
              <label className="form-label">模型名称</label>
              <input className="form-input" type="text" value={editForm.name} onChange={e => setEditForm(prev => ({ ...prev, name: e.target.value }))} />
            </div>

            <div style={{ marginBottom: 14 }}>
              <label className="form-label">模型描述</label>
              <textarea className="form-input" rows={3} value={editForm.description} onChange={e => setEditForm(prev => ({ ...prev, description: e.target.value }))} />
            </div>

            <div style={{ marginBottom: 14 }}>
              <label className="form-label">类别</label>
              <select className="form-input" value={editForm.category} onChange={e => setEditForm(prev => ({ ...prev, category: e.target.value }))}>
                <option value="缺陷检测">缺陷检测</option>
                <option value="安全检测">安全检测</option>
                <option value="行为检测">行为检测</option>
                <option value="目标跟踪">目标跟踪</option>
                <option value="图像分割">图像分割</option>
                <option value="目标检测">目标检测</option>
                <option value="LLM">LLM</option>
                <option value="其他">其他</option>
              </select>
            </div>

            <div style={{ marginBottom: 14 }}>
              <label className="form-label">封面图片 URL</label>
              <input className="form-input" type="url" value={editForm.coverImage} onChange={e => setEditForm(prev => ({ ...prev, coverImage: e.target.value }))} placeholder="https://..." />
              {editForm.coverImage && (
                <div style={{ marginTop: 8, aspectRatio: '16/10', maxWidth: 260, borderRadius: 4, overflow: 'hidden', background: 'var(--bg-elevated)', border: '1px solid var(--border-dim)' }}>
                  <img src={editForm.coverImage} alt="预览" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }} />
                </div>
              )}
            </div>

            <div style={{ display: 'flex', gap: 10, marginTop: 20, justifyContent: 'flex-end' }}>
              <button className="btn btn-secondary" onClick={() => setEditing(null)}>取消</button>
              <button className="btn btn-primary" onClick={handleSave} disabled={!editForm.name.trim()}>
                <Save size={14} /> 保存
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
