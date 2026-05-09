import { createFileRoute, Link } from '@tanstack/react-router'
import { useState } from 'react'
import { Plus, Edit3, Trash2, Copy, CheckCircle2, XCircle, Zap, Globe, Lock, Search } from 'lucide-react'
import { CATEGORY_MAP } from '../../constants'
import { PRESETS, Preset } from '../../data/presets'

export const Route = createFileRoute('/presets/')({
  component: PresetList,
})

function PresetList() {
  const [presets, setPresets] = useState(PRESETS)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [filterCategory, setFilterCategory] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')

  const filtered = presets.filter(p =>
    (filterCategory === 'all' || p.category === filterCategory) &&
    (p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
     p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
     p.architectureName.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  async function handleDelete(id: string) {
    const preset = presets.find(p => p.id === id)
    if (preset?.usageCount && preset.usageCount > 0) {
      alert('该预设已被训练任务使用，无法删除')
      return
    }
    setDeleting(id)
    await new Promise(r => setTimeout(r, 500))
    setPresets(prev => prev.filter(p => p.id !== id))
    setDeleting(null)
  }

  function handleCopy(id: string) {
    const preset = presets.find(p => p.id === id)
    if (!preset) return
    const newPreset: Preset = {
      ...preset,
      id: `preset-${Date.now()}`,
      name: `${preset.name} (副本)`,
      createdAt: new Date().toLocaleString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }).replace(/\//g, '-'),
      usageCount: 0,
    }
    setPresets(prev => [newPreset, ...prev])
  }

  return (
    <div style={{ animation: 'slideIn 0.3s ease-out' }}>
      <div className="page-header">
        <div>
          <div className="breadcrumb">科宝训练平台 › 训练预设</div>
          <h1 className="page-title">训练预设</h1>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>
            保存常用训练参数配置，创建训练任务时快速应用
          </div>
        </div>
        <Link to="/presets/create" className="btn btn-primary">
          <Plus size={15} /> 创建预设
        </Link>
      </div>

      <div className="content-padded">
        <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
          <button className={`btn btn-sm ${filterCategory === 'all' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setFilterCategory('all')}>
            全部
          </button>
          {Object.entries(CATEGORY_MAP).map(([key, label]) => (
            <button key={key} className={`btn btn-sm ${filterCategory === key ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setFilterCategory(key)}>
              {label}
            </button>
          ))}
        </div>

        <div className="card">
          <div className="card-header">
            <div className="search-input">
              <Search size={14} style={{ color: 'var(--text-muted)' }} />
              <input
                type="text"
                placeholder="搜索预设名称、架构或描述..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input-field"
              />
            </div>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>预设名称</th>
                  <th>关联架构</th>
                  <th>基础模型</th>
                  <th>类别</th>
                  <th>状态</th>
                  <th>可见性</th>
                  <th style={{ textAlign: 'right' }}>使用次数</th>
                  <th>创建人</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(preset => (
                  <tr key={preset.id}>
                    <td>
                      <div className="primary" style={{ fontWeight: 500 }}>{preset.name}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2, maxWidth: 220 }}>
                        {preset.description}
                      </div>
                    </td>
                    <td style={{ fontSize: 12 }}>{preset.architectureName}</td>
                    <td className="mono" style={{ fontSize: 12 }}>{preset.baseModel}</td>
                    <td>
                      <span className="badge badge-secondary">{CATEGORY_MAP[preset.category] || preset.category}</span>
                    </td>
                    <td>
                      {preset.isActive ? (
                        <span className="badge badge-success"><CheckCircle2 size={10} /> 启用</span>
                      ) : (
                        <span className="badge badge-archived"><XCircle size={10} /> 禁用</span>
                      )}
                    </td>
                    <td>
                      {preset.visibility === 'public' ? (
                        <span className="badge badge-teal"><Globe size={10} /> 公开</span>
                      ) : (
                        <span className="badge badge-secondary"><Lock size={10} /> 私有</span>
                      )}
                    </td>
                    <td className="mono" style={{ textAlign: 'right' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 4, justifyContent: 'flex-end' }}>
                        <Zap size={10} style={{ color: 'var(--teal)' }} />
                        {preset.usageCount}
                      </span>
                    </td>
                    <td style={{ fontSize: 12 }}>{preset.author}</td>
                    <td>
                      <div style={{ display: 'flex', gap: 4 }}>
                        <Link to="/presets/$presetId" params={{ presetId: preset.id }} className="btn btn-ghost btn-sm">
                          <Edit3 size={12} />
                        </Link>
                        <button className="btn btn-ghost btn-sm" onClick={() => handleCopy(preset.id)}>
                          <Copy size={12} />
                        </button>
                        <button className="btn btn-ghost btn-sm" onClick={() => handleDelete(preset.id)}
                          disabled={deleting === preset.id || preset.usageCount > 0}>
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filtered.length === 0 && (
            <div className="empty-state">
              <div className="empty-state-icon"><Zap size={32} /></div>
              <div className="empty-state-text">暂无训练预设</div>
              <div className="empty-state-hint">点击右上角"创建预设"保存常用训练参数配置</div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
