import { createFileRoute, Link } from '@tanstack/react-router'
import { useState, useEffect, useCallback } from 'react'
import { Plus, Edit3, Trash2, Copy, CheckCircle2, XCircle, Search, ChevronLeft, ChevronRight, RotateCcw } from 'lucide-react'
import { CATEGORY_MAP } from '../../constants'
import { ARCHITECTURES } from '../../data/architectures'
import type { Architecture } from '../../data/architectures'

export const Route = createFileRoute('/architectures/')({
  component: ArchitectureList,
})

function ArchitectureList() {
  const [architectures, setArchitectures] = useState<Architecture[]>(ARCHITECTURES)
  const [searchInput, setSearchInput] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize] = useState(10)
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState<Architecture[]>([])
  const [total, setTotal] = useState(0)
  const [deleting, setDeleting] = useState<string | null>(null)

  const loadData = useCallback(async () => {
    setLoading(true)
    await new Promise(resolve => setTimeout(resolve, 350 + Math.random() * 350))

    const filtered = architectures.filter(a =>
      a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.baseModel.toLowerCase().includes(searchQuery.toLowerCase())
    )

    const start = (currentPage - 1) * pageSize
    setData(filtered.slice(start, start + pageSize))
    setTotal(filtered.length)
    setLoading(false)
  }, [searchQuery, currentPage, pageSize, architectures])

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
    const arch = architectures.find(a => a.id === id)
    if (arch?.usageCount && arch.usageCount > 0) {
      alert('该模型模板已被训练预设引用，无法删除')
      return
    }
    setDeleting(id)
    await new Promise(r => setTimeout(r, 500))
    setArchitectures(prev => prev.filter(a => a.id !== id))
    setDeleting(null)
  }

  function handleCopy(id: string) {
    const arch = architectures.find(a => a.id === id)
    if (!arch) return
    const newArch: Architecture = {
      ...arch,
      id: `arch-${Date.now()}`,
      name: `${arch.name} (副本)`,
      createdAt: new Date().toLocaleString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }).replace(/\//g, '-'),
      usageCount: 0,
    }
    setArchitectures(prev => [newArch, ...prev])
  }

  const totalPages = Math.max(1, Math.ceil(total / pageSize))

  return (
    <div style={{ animation: 'slideIn 0.3s ease-out' }}>
      <div className="page-header">
        <div>
          <div className="breadcrumb">科宝训练平台 › 模型模板</div>
          <h1 className="page-title">模型模板</h1>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>
            配置平台支持的模型架构及其参数定义
          </div>
        </div>
        <Link to="/architectures/create" className="btn btn-primary">
          <Plus size={15} /> 创建模板
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
                  placeholder="搜索模板名称、基础模型或描述..."
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
                  <th>模板名称</th>
                  <th>基础模型</th>
                  <th>类别</th>
                  <th>状态</th>
                  <th style={{ textAlign: 'right' }}>参数数量</th>
                  <th style={{ textAlign: 'right' }}>预设引用</th>
                  <th>创建人</th>
                  <th>创建时间</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {!loading && data.length === 0 ? (
                  <tr>
                    <td colSpan={9}>
                      <div className="empty-state">
                        <Plus size={32} className="empty-state-icon" />
                        <div className="empty-state-text">暂无模型模板</div>
                        <div className="empty-state-hint">点击右上角"创建模板"添加新的模型架构配置</div>
                      </div>
                    </td>
                  </tr>
                ) : (
                  data.map(arch => (
                    <tr key={arch.id}>
                      <td>
                        <div className="primary" style={{ fontWeight: 500 }}>{arch.name}</div>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2, maxWidth: 260 }}>
                          {arch.description}
                        </div>
                      </td>
                      <td className="mono" style={{ fontSize: 12 }}>{arch.baseModel}</td>
                      <td>
                        <span className="badge badge-secondary">{CATEGORY_MAP[arch.category] || arch.category}</span>
                      </td>
                      <td>
                        {arch.isActive ? (
                          <span className="badge badge-success"><CheckCircle2 size={10} /> 启用</span>
                        ) : (
                          <span className="badge badge-archived"><XCircle size={10} /> 禁用</span>
                        )}
                      </td>
                      <td className="mono" style={{ textAlign: 'right' }}>{arch.params.length}</td>
                      <td className="mono" style={{ textAlign: 'right' }}>{arch.usageCount}</td>
                      <td style={{ fontSize: 12 }}>{arch.author}</td>
                      <td style={{ fontSize: 12 }}>{arch.createdAt}</td>
                      <td>
                        <div style={{ display: 'flex', gap: 4 }}>
                          <Link to="/architectures/$architectureId" params={{ architectureId: arch.id }} className="btn btn-ghost btn-sm">
                            <Edit3 size={12} /> 编辑
                          </Link>
                          <button className="btn btn-ghost btn-sm" onClick={() => handleCopy(arch.id)}>
                            <Copy size={12} /> 复制
                          </button>
                          <button className="btn btn-ghost btn-sm" onClick={() => handleDelete(arch.id)}
                            disabled={deleting === arch.id || arch.usageCount > 0}>
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
