import { createFileRoute, Link } from '@tanstack/react-router'
import { useState, useEffect, useCallback } from 'react'
import { Plus, Edit3, Trash2, Server, Search, Cpu, Terminal, ChevronLeft, ChevronRight, RotateCcw } from 'lucide-react'
import { GPU_SERVERS } from '../../data/gpuServers'
import type { GpuServer } from '../../data/gpuServers'

export const Route = createFileRoute('/gpu-servers/')({
  component: GpuServerList,
})

const STATUS_META = {
  online:      { label: '在线',   cls: 'badge-completed', color: 'var(--success)' },
  offline:     { label: '离线',   cls: 'badge-failed',    color: 'var(--error)' },
  maintenance: { label: '维护中', cls: 'badge-pending',   color: 'var(--warning)' },
} as const

function GpuServerList() {
  const [serverList, setServerList] = useState<GpuServer[]>(GPU_SERVERS)
  const [searchInput, setSearchInput] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize] = useState(10)
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState<GpuServer[]>([])
  const [total, setTotal] = useState(0)
  const [deleting, setDeleting] = useState<string | null>(null)

  const loadData = useCallback(async () => {
    setLoading(true)
    // 模拟网络延迟
    await new Promise(resolve => setTimeout(resolve, 350 + Math.random() * 350))

    const filtered = serverList.filter(s =>
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.host.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.description.toLowerCase().includes(searchQuery.toLowerCase())
    )

    const start = (currentPage - 1) * pageSize
    setData(filtered.slice(start, start + pageSize))
    setTotal(filtered.length)
    setLoading(false)
  }, [searchQuery, currentPage, pageSize, serverList])

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
    setDeleting(id)
    await new Promise(r => setTimeout(r, 500))
    setServerList(prev => prev.filter(s => s.id !== id))
    setDeleting(null)
  }

  const totalPages = Math.max(1, Math.ceil(total / pageSize))

  return (
    <div style={{ animation: 'slideIn 0.3s ease-out' }}>
      <div className="page-header">
        <div>
          <div className="breadcrumb">科宝训练平台 › GPU 服务器</div>
          <h1 className="page-title">GPU 服务器</h1>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>
            管理训练和推理所用的 GPU 服务器资源 · 显卡信息由服务器上线后自动获取
          </div>
        </div>
        <Link to="/gpu-servers/create" className="btn btn-primary">
          <Plus size={15} /> 添加服务器
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
                  placeholder="搜索服务器名称、IP、用户名..."
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
                  <th>服务器名称</th>
                  <th>地址</th>
                  <th>显卡列表</th>
                  <th>内存</th>
                  <th>状态</th>
                  <th>创建时间</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {!loading && data.length === 0 ? (
                  <tr>
                    <td colSpan={7}>
                      <div className="empty-state">
                        <Server size={32} className="empty-state-icon" />
                        <div className="empty-state-text">暂无 GPU 服务器</div>
                        <div className="empty-state-hint">点击右上角"添加服务器"录入 GPU 资源</div>
                      </div>
                    </td>
                  </tr>
                ) : (
                  data.map(srv => {
                    const st = STATUS_META[srv.status]
                    return (
                      <tr key={srv.id}>
                        <td>
                          <div className="primary" style={{ fontWeight: 500 }}>{srv.name}</div>
                          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2, maxWidth: 200 }}>
                            {srv.description}
                          </div>
                        </td>
                        <td className="mono" style={{ fontSize: 12 }}>
                          <div>{srv.host}:{srv.port}</div>
                          <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>{srv.username}</div>
                        </td>
                        <td>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                            {srv.gpus.map(g => (
                              <span key={g.id} style={{
                                fontSize: 10, padding: '2px 6px',
                                background: 'var(--bg-elevated)',
                                border: '1px solid var(--border-dim)',
                                fontFamily: 'JetBrains Mono',
                                color: 'var(--text-secondary)',
                              }}>
                                <Cpu size={9} style={{ marginRight: 3, display: 'inline' }} />
                                {g.model.split(' ').pop()} {g.memory}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td style={{ fontSize: 12 }}>{srv.ram}</td>
                        <td>
                          <span className={`badge ${st.cls}`} style={{ color: st.color }}>
                            <div style={{ width: 6, height: 6, borderRadius: '50%', background: st.color, marginRight: 4, display: 'inline-block' }} />
                            {st.label}
                          </span>
                        </td>
                        <td style={{ fontSize: 12 }}>{srv.createdAt}</td>
                        <td>
                          <div style={{ display: 'flex', gap: 4 }}>
                            <Link to="/gpu-servers/$serverId" params={{ serverId: srv.id }} className="btn btn-ghost btn-sm">
                              <Edit3 size={12} /> 编辑
                            </Link>
                            <Link to="/gpu-servers/$serverId/execute" params={{ serverId: srv.id }} className="btn btn-ghost btn-sm">
                              <Terminal size={12} /> 执行
                            </Link>
                            <button className="btn btn-ghost btn-sm" onClick={() => handleDelete(srv.id)}
                              disabled={deleting === srv.id}>
                              <Trash2 size={12} /> 删除
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })
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
