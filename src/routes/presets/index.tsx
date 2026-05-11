import { createFileRoute, Link } from '@tanstack/react-router'
import { useState, useEffect, useCallback } from 'react'
import { Plus, Edit3, Trash2, Copy, CheckCircle2, XCircle, Zap, Globe, Lock, Search, ChevronLeft, ChevronRight, RotateCcw } from 'lucide-react'
import { CATEGORY_MAP } from '../../constants'
import { PRESETS } from '../../data/presets'
import type { Preset } from '../../data/presets'

export const Route = createFileRoute('/presets/')({
  component: PresetList,
})

function PresetList() {
  const [presets, setPresets] = useState<Preset[]>(PRESETS)
  const [searchInput, setSearchInput] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize] = useState(10)
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState<Preset[]>([])
  const [total, setTotal] = useState(0)
  const [deleting, setDeleting] = useState<string | null>(null)

  const loadData = useCallback(async () => {
    setLoading(true)
    await new Promise(resolve => setTimeout(resolve, 350 + Math.random() * 350))

    const filtered = presets.filter(p =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.architectureName.toLowerCase().includes(searchQuery.toLowerCase())
    )

    const start = (currentPage - 1) * pageSize
    setData(filtered.slice(start, start + pageSize))
    setTotal(filtered.length)
    setLoading(false)
  }, [searchQuery, currentPage, pageSize, presets])

  useEffect(() => {
    loadData()
  }, [loadData])

  const handleSearch = () => {
    setSearchQuery(searchInput)
    setCurrentPage(1)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSearch()
  }

  const handleReset = () => {
    setSearchInput('')
  }

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

  const totalPages = Math.max(1, Math.ceil(total / pageSize))

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
        <div className="card">
          <div className="card-header">
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <div className="search-input">
                <Search size={14} style={{ color: 'var(--text-muted)' }} />
                <input
                  type="text"
                  placeholder="搜索预设名称、架构或描述..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="search-input-field"
                />
              </div>
              <button className="btn btn-primary btn-sm" onClick={handleSearch} disabled={loading}>
                <Search size={12} /> 查询
              </button>
              <button className="btn btn-ghost btn-sm" onClick={handleReset} disabled={loading}>
                <RotateCcw size={12} /> 重置
              </button>
            </div>
            <span className="text-xs text-muted">共 {total} 条</span>
          </div>

          <div style={{ overflowX: 'auto', minHeight: 200, position: 'relative' }}>
            {loading && (
              <div style={{
                position: 'absolute', inset: 0, background: 'rgba(255,255,255,0.6)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2,
              }}>
                <div className="spinner" />
                <span style={{ marginLeft: 10, fontSize: 13, color: 'var(--text-muted)' }}>加载中…</span>
              </div>
            )}

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
                {!loading && data.length === 0 ? (
                  <tr>
                    <td colSpan={9}>
                      <div className="empty-state">
                        <Zap size={32} className="empty-state-icon" />
                        <div className="empty-state-text">暂无训练预设</div>
                        <div className="empty-state-hint">点击右上角"创建预设"保存常用训练参数配置</div>
                      </div>
                    </td>
                  </tr>
                ) : (
                  data.map(preset => (
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
                            <Edit3 size={12} /> 编辑
                          </Link>
                          <button className="btn btn-ghost btn-sm" onClick={() => handleCopy(preset.id)}>
                            <Copy size={12} /> 复制
                          </button>
                          <button className="btn btn-ghost btn-sm" onClick={() => handleDelete(preset.id)}
                            disabled={deleting === preset.id || preset.usageCount > 0}>
                            <Trash2 size={12} /> 删除
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {total > 0 && (
            <div className="pagination-bar">
              <div className="pagination-info">
                第 {(currentPage - 1) * pageSize + 1}–{Math.min(currentPage * pageSize, total)} 条 / 共 {total} 条
              </div>
              <div className="pagination-controls">
                <button className="btn btn-ghost btn-sm" disabled={currentPage <= 1 || loading} onClick={() => setCurrentPage(p => p - 1)}>
                  <ChevronLeft size={14} /> 上一页
                </button>
                <span className="pagination-current">{currentPage} / {totalPages}</span>
                <button className="btn btn-ghost btn-sm" disabled={currentPage >= totalPages || loading} onClick={() => setCurrentPage(p => p + 1)}>
                  下一页 <ChevronRight size={14} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
