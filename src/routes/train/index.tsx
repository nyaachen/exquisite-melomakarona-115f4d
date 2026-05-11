import { createFileRoute, Link } from '@tanstack/react-router'
import { useState, useEffect, useCallback } from 'react'
import {
  Plus,
  Search,
  Filter,
  RefreshCw,
  CheckCircle2,
  XCircle,
  Clock,
  Cpu,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
} from 'lucide-react'
import { TRAIN_STATUS } from '../../constants'
import { ALL_TASKS, type TrainingTaskSummary } from '../../data/train-tasks'

export const Route = createFileRoute('/train/')({
  component: TasksList,
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
  status: string
  page: number
  pageSize: number
}

async function fetchTasks(params: FetchParams): Promise<{ data: TrainingTaskSummary[]; total: number }> {
  await new Promise(resolve => setTimeout(resolve, 350 + Math.random() * 350))

  const filtered = ALL_TASKS.filter(task => {
    const matchesSearch =
      task.name.toLowerCase().includes(params.query.toLowerCase()) ||
      task.dataset.toLowerCase().includes(params.query.toLowerCase())
    const matchesStatus = params.status === 'all' || task.status === params.status
    return matchesSearch && matchesStatus
  })

  const start = (params.page - 1) * params.pageSize
  return {
    data: filtered.slice(start, start + params.pageSize),
    total: filtered.length,
  }
}

// ─── 页面组件 ───

function TasksList() {
  const [searchInput, setSearchInput] = useState('')
  const [statusInput, setStatusInput] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [appliedStatus, setAppliedStatus] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize] = useState(10)
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState<TrainingTaskSummary[]>([])
  const [total, setTotal] = useState(0)

  const loadData = useCallback(async () => {
    setLoading(true)
    const result = await fetchTasks({ query: searchQuery, status: appliedStatus, page: currentPage, pageSize })
    setData(result.data)
    setTotal(result.total)
    setLoading(false)
  }, [searchQuery, appliedStatus, currentPage, pageSize])

  useEffect(() => {
    loadData()
  }, [loadData])

  const handleSearch = () => {
    setSearchQuery(searchInput)
    setAppliedStatus(statusInput)
    setCurrentPage(1)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSearch()
  }

  const handleReset = () => {
    setSearchInput('')
    setStatusInput('all')
  }

  const totalPages = Math.max(1, Math.ceil(total / pageSize))

  return (
    <div className="slide-in">
      <div className="page-header">
        <div>
          <div className="breadcrumb">科宝训练平台 › 训练任务</div>
          <h1 className="page-title">训练任务</h1>
        </div>
        <Link to="/train/create" className="btn btn-primary">
          <Plus size={15} /> 创建训练任务
        </Link>
      </div>

      <div className="p-content">
        <div className="card">
          <div className="card-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div className="search-input">
                <Search size={14} style={{ color: 'var(--text-muted)' }} />
                <input
                  type="text"
                  placeholder="搜索任务名称或数据集..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="search-input-field"
                />
              </div>
              <div className="filter-select">
                <Filter size={14} style={{ color: 'var(--text-muted)' }} />
                <select
                  value={statusInput}
                  onChange={(e) => setStatusInput(e.target.value)}
                  className="filter-select-field"
                >
                  <option value="all">全部状态</option>
                  <option value="running">训练中</option>
                  <option value="completed">已完成</option>
                  <option value="pending">等待中</option>
                  <option value="failed">训练失败</option>
                </select>
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
                  <th>数据集</th>
                  <th>基础模型</th>
                  <th>GPU</th>
                  <th>状态</th>
                  <th>训练进度</th>
                  <th>mAP@0.5</th>
                  <th>预计完成</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {!loading && data.length === 0 ? (
                  <tr>
                    <td colSpan={9}>
                      <div className="empty-state">
                        <Search size={32} className="empty-state-icon" />
                        <div className="empty-state-text">没有找到匹配的任务</div>
                        <div className="empty-state-hint">尝试调整搜索关键词或筛选条件</div>
                      </div>
                    </td>
                  </tr>
                ) : (
                  data.map((task) => {
                    const sc = TRAIN_STATUS[task.status]
                    const ic = STATUS_ICONS[task.status]
                    return (
                      <tr key={task.id}>
                        <td className="primary">{task.name}</td>
                        <td style={{ fontSize: 12 }}>{task.dataset}</td>
                        <td className="mono">{task.baseModel}</td>
                        <td className="mono" style={{ fontSize: 12 }}>
                          <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                            <Cpu size={12} style={{ color: 'var(--accent)' }} />
                            {task.gpu}
                          </span>
                        </td>
                        <td>
                          <span className={`badge ${sc.cls}`}>
                            {ic} {sc.label}
                          </span>
                        </td>
                        <td style={{ minWidth: 128 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <div className="progress-bar" style={{ flex: 1 }}>
                              <div
                                className={`progress-fill ${task.status === 'failed' ? 'progress-fill-error' : ''}`}
                                style={{ width: `${task.progress}%` }}
                              />
                            </div>
                            <span className="mono" style={{ fontSize: 10, color: 'var(--text-muted)', flexShrink: 0 }}>
                              {task.epoch}
                            </span>
                          </div>
                        </td>
                        <td className="mono" style={{ color: task.mAP > 0 ? 'var(--success)' : 'var(--text-muted)' }}>
                          {task.mAP > 0 ? task.mAP.toFixed(3) : '—'}
                        </td>
                        <td style={{ fontSize: 12 }}>{task.eta}</td>
                        <td>
                          <Link
                            to="/train/$taskId"
                            params={{ taskId: task.id }}
                            className="btn btn-ghost btn-sm"
                          >
                            详情 <ArrowRight size={12} />
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
