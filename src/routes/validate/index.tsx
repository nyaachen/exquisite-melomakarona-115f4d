import { createFileRoute, Link } from '@tanstack/react-router'
import { useState, useEffect, useCallback } from 'react'
import { Plus, CheckCircle2, XCircle, Clock, RefreshCw, ArrowRight, Search, ChevronLeft, ChevronRight, RotateCcw } from 'lucide-react'
import { VALIDATE_STATUS } from '../../constants'
import { VALIDATE_TASKS, type ValidateTask } from '../../data/validate'

export const Route = createFileRoute('/validate/')({
  component: ValidateList,
})

const STATUS_ICONS: Record<string, React.ReactNode> = {
  running: <RefreshCw size={10} className="spinning" />,
  completed: <CheckCircle2 size={10} />,
  failed: <XCircle size={10} />,
  pending: <Clock size={10} />,
}

// ─── 模拟分页 API ───

interface FetchParams {
  query: string
  page: number
  pageSize: number
}

async function fetchValidateTasks(params: FetchParams): Promise<{ data: ValidateTask[]; total: number }> {
  await new Promise(resolve => setTimeout(resolve, 350 + Math.random() * 350))

  const tasks = Object.values(VALIDATE_TASKS)
  const filtered = tasks.filter(t =>
    t.name.toLowerCase().includes(params.query.toLowerCase()) ||
    t.modelName.toLowerCase().includes(params.query.toLowerCase()) ||
    t.datasetName.toLowerCase().includes(params.query.toLowerCase())
  )

  const start = (params.page - 1) * params.pageSize
  return {
    data: filtered.slice(start, start + params.pageSize),
    total: filtered.length,
  }
}

// ─── 页面组件 ───

function ValidateList() {
  const [searchInput, setSearchInput] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize] = useState(10)
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState<ValidateTask[]>([])
  const [total, setTotal] = useState(0)

  const loadData = useCallback(async () => {
    setLoading(true)
    const result = await fetchValidateTasks({ query: searchQuery, page: currentPage, pageSize })
    setData(result.data)
    setTotal(result.total)
    setLoading(false)
  }, [searchQuery, currentPage, pageSize])

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

  const totalPages = Math.max(1, Math.ceil(total / pageSize))

  return (
    <div style={{ animation: 'slideIn 0.3s ease-out' }}>
      <div className="page-header">
        <div>
          <div className="breadcrumb">科宝训练平台 › 验证任务</div>
          <h1 className="page-title">验证任务列表</h1>
        </div>
        <Link to="/validate/create" className="btn btn-primary">
          <Plus size={15} /> 创建验证任务
        </Link>
      </div>

      <div style={{ padding: '24px 32px' }}>
        <div className="card">
          <div className="card-header">
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <div className="search-input">
                <Search size={14} style={{ color: 'var(--text-muted)' }} />
                <input
                  type="text"
                  placeholder="搜索任务名称、模型或数据集..."
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
                  <th>任务名称</th>
                  <th>模型</th>
                  <th>数据集</th>
                  <th>状态</th>
                  <th>进度</th>
                  <th>mAP@0.5</th>
                  <th>F1 Score</th>
                  <th>创建时间</th>
                  <th>完成时间</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {!loading && data.length === 0 ? (
                  <tr>
                    <td colSpan={10}>
                      <div className="empty-state">
                        <Search size={32} className="empty-state-icon" />
                        <div className="empty-state-text">没有找到匹配的任务</div>
                        <div className="empty-state-hint">尝试调整搜索关键词</div>
                      </div>
                    </td>
                  </tr>
                ) : (
                  data.map((task) => {
                    const sc = VALIDATE_STATUS[task.status]
                    const ic = STATUS_ICONS[task.status]
                    return (
                      <tr key={task.id}>
                        <td className="primary">{task.name}</td>
                        <td style={{ fontSize: 12 }}>{task.modelName}</td>
                        <td style={{ fontSize: 12 }}>{task.datasetName}</td>
                        <td>
                          <span className={`badge ${sc.cls}`}>{ic} {sc.label}</span>
                        </td>
                        <td style={{ minWidth: 120 }}>
                          <div className="progress-bar" style={{ flex: 1 }}>
                            <div className={`progress-fill ${task.status === 'failed' ? 'progress-fill-error' : ''}`}
                              style={{ width: `${task.progress}%` }} />
                          </div>
                          <span className="mono" style={{ fontSize: 11, color: 'var(--text-muted)', marginLeft: 8 }}>
                            {task.progress}%
                          </span>
                        </td>
                        <td className="mono" style={{ color: task.result?.mAP ? 'var(--success)' : 'var(--text-muted)' }}>
                          {task.result?.mAP ? task.result.mAP.toFixed(3) : '—'}
                        </td>
                        <td className="mono" style={{ color: task.result?.f1 ? 'var(--accent-bright)' : 'var(--text-muted)' }}>
                          {task.result?.f1 ? task.result.f1.toFixed(3) : '—'}
                        </td>
                        <td style={{ fontSize: 12 }}>{task.createdAt}</td>
                        <td style={{ fontSize: 12 }}>{task.completedAt || '—'}</td>
                        <td>
                          <Link to="/validate/$taskId" params={{ taskId: task.id }} className="btn btn-ghost btn-sm">
                            {task.status === 'completed' ? '查看结果' : '详情'}
                            <ArrowRight size={11} />
                          </Link>
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
