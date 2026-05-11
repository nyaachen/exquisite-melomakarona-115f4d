import { createFileRoute, Link } from '@tanstack/react-router'
import { useState } from 'react'
import {
  Search,
  Upload,
  Edit3,
  Globe,
  Shield,
  Layers,
  Save,
  Filter,
  AlertCircle,
  Trash2,
  Plus,
  CheckCircle2,
  XCircle,
  Power,
} from 'lucide-react'
import { PLAZA_MODELS, type PlazaModel } from '../../data/plaza-models'
import { ARCHITECTURES } from '../../data/architectures'

export const Route = createFileRoute('/model-management/')({
  component: ModelManagement,
})

type SourceTab = 'all' | 'platform' | 'public'

function ModelManagement() {
  const [models, setModels] = useState<PlazaModel[]>(PLAZA_MODELS)
  const [activeTab, setActiveTab] = useState<SourceTab>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [filterArch, setFilterArch] = useState('all')
  const [editing, setEditing] = useState<PlazaModel | null>(null)
  const [editForm, setEditForm] = useState({ name: '', description: '', architectureId: '', coverImage: '' })
  const [deleteConfirm, setDeleteConfirm] = useState<PlazaModel | null>(null)

  const filtered = models.filter(m => {
    if (activeTab !== 'all' && m.source !== activeTab) return false
    if (filterArch !== 'all' && m.architectureId !== filterArch) return false
    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      return (
        m.name.toLowerCase().includes(q) ||
        m.description.toLowerCase().includes(q) ||
        m.classes.some(c => c.toLowerCase().includes(q)) ||
        m.architectureName.toLowerCase().includes(q) ||
        (m.sourceLabel || '').toLowerCase().includes(q)
      )
    }
    return true
  })

  function openEdit(model: PlazaModel) {
    setEditing(model)
    setEditForm({
      name: model.name,
      description: model.description,
      architectureId: model.architectureId,
      coverImage: model.coverImage,
    })
  }

  function handleSave() {
    if (!editing) return
    const arch = ARCHITECTURES.find(a => a.id === editForm.architectureId)
    setModels(prev => prev.map(m =>
      m.id === editing.id ? {
        ...m,
        name: editForm.name,
        description: editForm.description,
        architectureId: editForm.architectureId,
        architectureName: arch?.name || m.architectureName,
        coverImage: editForm.coverImage,
      } : m
    ))
    setEditing(null)
  }

  function toggleActive(id: string) {
    setModels(prev => prev.map(m =>
      m.id === id ? { ...m, isActive: !m.isActive } : m
    ))
  }

  function handleDelete() {
    if (!deleteConfirm) return
    setModels(prev => prev.filter(m => m.id !== deleteConfirm.id))
    setDeleteConfirm(null)
  }

  return (
    <div className="slide-in">
      <div className="page-header">
        <div>
          <div className="breadcrumb">科宝训练平台 › 模型管理</div>
          <h1 className="page-title">模型管理</h1>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>
            管理平台模型与公开模型的版本、权重、启用状态及基础信息
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <Link to="/model-management/upload" className="btn btn-secondary">
            <Upload size={14} /> 上传权重
          </Link>
          <Link to="/model-management/upload" className="btn btn-primary">
            <Plus size={14} /> 新建模型
          </Link>
        </div>
      </div>

      <div className="p-content">
        {/* Tabs */}
        <div style={{ display: 'flex', gap: 0, marginBottom: 20, borderBottom: '2px solid var(--border-dim)' }}>
          {([
            { key: 'all', label: '全部模型' },
            { key: 'platform', label: '平台模型' },
            { key: 'public', label: '公开模型' },
          ] as const).map(tab => (
            <button
              key={tab.key}
              className="mgmt-tab"
              style={{
                padding: '10px 20px',
                fontSize: 13,
                fontWeight: activeTab === tab.key ? 600 : 500,
                color: activeTab === tab.key ? 'var(--accent)' : 'var(--text-secondary)',
                background: 'none',
                border: 'none',
                borderBottom: activeTab === tab.key ? '2px solid var(--accent)' : '2px solid transparent',
                cursor: 'pointer',
                marginBottom: -2,
                transition: 'all 0.15s ease',
              }}
              onClick={() => setActiveTab(tab.key)}
            >
              {tab.label}
              <span style={{ marginLeft: 6, fontSize: 11, color: 'var(--text-muted)' }}>
                {tab.key === 'all' ? models.length : models.filter(m => m.source === tab.key).length}
              </span>
            </button>
          ))}
        </div>

        {/* Search + Filters */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 20, alignItems: 'center' }}>
          <div className="search-input" style={{ flex: 1, maxWidth: 360 }}>
            <Search size={14} style={{ color: 'var(--text-muted)' }} />
            <input
              type="text"
              placeholder="搜索模型名称、描述、标签、架构..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input-field"
            />
          </div>
          <div className="filter-select">
            <Filter size={12} style={{ color: 'var(--text-muted)' }} />
            <select
              className="filter-select-field"
              value={filterArch}
              onChange={(e) => setFilterArch(e.target.value)}
            >
              <option value="all">全部架构</option>
              {ARCHITECTURES.map(arch => (
                <option key={arch.id} value={arch.id}>{arch.name}</option>
              ))}
            </select>
          </div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
            共 {filtered.length} 个模型
          </div>
        </div>

        {/* Table */}
        <div className="card" style={{ overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th style={{ width: 60 }}>封面</th>
                  <th>名称</th>
                  <th>架构</th>
                  <th>来源</th>
                  <th>标签</th>
                  <th>版本</th>
                  <th>指标</th>
                  <th>状态</th>
                  <th>作者</th>
                  <th>创建日期</th>
                  <th style={{ width: 220 }}>操作</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(model => {
                  const latestVersion = model.versions[0]
                  const hasMetrics = !!latestVersion.metrics
                  return (
                    <tr key={model.id}>
                      <td>
                        <div style={{ width: 48, height: 30, borderRadius: 3, overflow: 'hidden', background: 'var(--bg-elevated)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <img
                            src={model.coverImage}
                            alt=""
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
                          />
                        </div>
                      </td>
                      <td>
                        <div className="primary" style={{ fontWeight: 500, fontSize: 13 }}>{model.name}</div>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2, maxWidth: 220, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {model.description}
                        </div>
                      </td>
                      <td>
                        <span className="badge badge-secondary" style={{ fontSize: 11 }}>{model.architectureName}</span>
                      </td>
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
                      <td style={{ fontSize: 11, color: 'var(--text-secondary)' }}>
                        <div style={{ display: 'flex', gap: 2, flexWrap: 'wrap', maxWidth: 140 }}>
                          {model.classes.slice(0, 3).map(c => (
                            <span key={c} style={{ background: 'var(--bg-elevated)', padding: '0 4px', borderRadius: 2 }}>{c}</span>
                          ))}
                          {model.classes.length > 3 && <span style={{ color: 'var(--text-muted)' }}>+{model.classes.length - 3}</span>}
                          {model.classes.length === 0 && <span style={{ color: 'var(--text-muted)' }}>—</span>}
                        </div>
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                          <Layers size={11} style={{ color: 'var(--text-muted)' }} />
                          <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{model.versions.length}</span>
                          <span style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: "'JetBrains Mono', monospace" }}>
                            ({latestVersion.version})
                          </span>
                        </div>
                      </td>
                      <td>
                        {hasMetrics ? (
                          <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: 'var(--accent-bright)' }}>
                            mAP {latestVersion.metrics!.mAP.toFixed(3)}
                          </span>
                        ) : (
                          <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>—</span>
                        )}
                      </td>
                      <td>
                        {model.isActive !== false ? (
                          <span className="badge badge-success" style={{ fontSize: 10 }}>
                            <CheckCircle2 size={9} /> 启用
                          </span>
                        ) : (
                          <span className="badge badge-archived" style={{ fontSize: 10 }}>
                            <XCircle size={9} /> 停用
                          </span>
                        )}
                      </td>
                      <td style={{ fontSize: 12 }}>{model.author}</td>
                      <td style={{ fontSize: 12, color: 'var(--text-muted)' }}>{model.createdAt}</td>
                      <td>
                        <div style={{ display: 'flex', gap: 6 }}>
                          <button
                            className="btn btn-ghost btn-sm"
                            onClick={() => openEdit(model)}
                            style={{ gap: 4 }}
                          >
                            <Edit3 size={12} /> 编辑
                          </button>
                          <button
                            className="btn btn-ghost btn-sm"
                            onClick={() => toggleActive(model.id)}
                            style={{ gap: 4, color: model.isActive !== false ? 'var(--success)' : 'var(--text-muted)' }}
                          >
                            <Power size={12} /> {model.isActive !== false ? '停用' : '启用'}
                          </button>
                          <button
                            className="btn btn-ghost btn-sm"
                            onClick={() => setDeleteConfirm(model)}
                            style={{ gap: 4, color: 'var(--error)' }}
                          >
                            <Trash2 size={12} /> 删除
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {filtered.length === 0 && (
            <div className="empty-state">
              <div className="empty-state-icon"><Search size={32} /></div>
              <div className="empty-state-text">未找到匹配的模型</div>
              <div className="empty-state-hint">尝试调整搜索关键词或筛选条件</div>
            </div>
          )}
        </div>

        {/* Business rule notice */}
        <div style={{ marginTop: 16, padding: '12px 16px', background: 'var(--accent-glow)', border: '1px solid rgba(64,158,255,0.15)', borderRadius: 4, display: 'flex', gap: 8, fontSize: 12, color: 'var(--text-secondary)' }}>
          <AlertCircle size={13} style={{ color: 'var(--accent-bright)', flexShrink: 0, marginTop: 1 }} />
          <div>
            <div style={{ fontWeight: 600, marginBottom: 2 }}>模型管理规则</div>
            <div>通过「上传权重」或「新建模型」按钮将模型添加到管理列表。</div>
            <div>启用/停用：停用的模型在创建训练任务时不会出现在可选列表中。</div>
            <div>删除模型将同时移除该模型的所有版本数据，此操作不可撤销。</div>
          </div>
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
              <input
                className="form-input"
                type="text"
                value={editForm.name}
                onChange={e => setEditForm(prev => ({ ...prev, name: e.target.value }))}
              />
            </div>

            <div style={{ marginBottom: 14 }}>
              <label className="form-label">模型描述</label>
              <textarea
                className="form-input"
                rows={3}
                value={editForm.description}
                onChange={e => setEditForm(prev => ({ ...prev, description: e.target.value }))}
              />
            </div>

            <div style={{ marginBottom: 14 }}>
              <label className="form-label">所属架构</label>
              <select
                className="form-input"
                value={editForm.architectureId}
                onChange={e => setEditForm(prev => ({ ...prev, architectureId: e.target.value }))}
              >
                {ARCHITECTURES.map(arch => (
                  <option key={arch.id} value={arch.id}>{arch.name}</option>
                ))}
              </select>
            </div>

            <div style={{ marginBottom: 14 }}>
              <label className="form-label">封面图片 URL</label>
              <input
                className="form-input"
                type="url"
                value={editForm.coverImage}
                onChange={e => setEditForm(prev => ({ ...prev, coverImage: e.target.value }))}
                placeholder="https://..."
              />
              {editForm.coverImage && (
                <div style={{ marginTop: 8, aspectRatio: '16/10', maxWidth: 260, borderRadius: 4, overflow: 'hidden', background: 'var(--bg-elevated)', border: '1px solid var(--border-dim)' }}>
                  <img
                    src={editForm.coverImage}
                    alt="预览"
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
                  />
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

      {/* Delete confirmation modal */}
      {deleteConfirm && (
        <div className="modal-backdrop" onClick={() => setDeleteConfirm(null)}>
          <div className="modal" style={{ maxWidth: 420 }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
              <span style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' }}>确认删除</span>
              <button className="btn btn-ghost btn-sm" onClick={() => setDeleteConfirm(null)}>✕</button>
            </div>
            <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 20 }}>
              确定要删除模型 <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{deleteConfirm.name}</span> 吗？该操作将移除该模型的所有版本数据，且不可撤销。
            </div>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button className="btn btn-secondary" onClick={() => setDeleteConfirm(null)}>取消</button>
              <button
                className="btn btn-danger"
                onClick={handleDelete}
              >
                <Trash2 size={14} /> 确认删除
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
