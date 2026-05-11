import { useState, useEffect } from 'react'
import { Link } from '@tanstack/react-router'
import {
  Eye,
  Search,
  Pause,
  Square,
  RotateCcw,
  Play,
  RefreshCw,
  CheckCircle2,
  XCircle,
  Clock,
  Cpu,
  AlertTriangle,
  ArrowRight,
  Filter,
} from 'lucide-react'
import { MOCK_TASKS } from '../../data/monitorTasks'

const STATUS_ICONS: Record<string, React.ReactNode> = {
  running: <RefreshCw size={11} className="spinning" />,
  completed: <CheckCircle2 size={11} />,
  failed: <XCircle size={11} />,
  pending: <Clock size={11} />,
  paused: <Pause size={11} />,
}

const STATUS_CLASS: Record<string, string> = {
  running: 'badge badge-running',
  completed: 'badge badge-completed',
  failed: 'badge badge-failed',
  pending: 'badge badge-pending',
  paused: 'badge badge-warning',
}

const STATUS_LABELS: Record<string, string> = {
  running: '运行中',
  completed: '已完成',
  failed: '异常',
  pending: '等待中',
  paused: '已暂停',
}

const TYPE_CONFIG = {
  train: { label: '训练', cls: 'badge badge-teal' },
  validate: { label: '验证', cls: 'badge' },
}

export function TaskMonitor() {
  const [tasks, setTasks] = useState(MOCK_TASKS)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [typeFilter, setTypeFilter] = useState<string>('all')

  useEffect(() => {
    const interval = setInterval(() => {
      setTasks(prev => prev.map(task => {
        if (task.status !== 'running') return task
        const maxEpoch = parseInt(task.epoch.split('/')[1]) || 100
        const current = parseInt(task.epoch.split('/')[0]) || 0
        const newEpoch = Math.min(current + 1, maxEpoch)
        const newProgress = Math.round((newEpoch / maxEpoch) * 100)
        return {
          ...task,
          progress: newProgress,
          epoch: task.type === 'train' ? `${newEpoch}/${maxEpoch}` : task.epoch,
        }
      }))
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  const handlePause = (id: string) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, status: 'paused' as const } : t))
  }

  const handleResume = (id: string) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, status: 'running' as const } : t))
  }

  const handleStop = (id: string) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, status: 'failed' as const, errorMessage: '用户手动停止' } : t))
  }

  const handleRerun = (id: string) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, status: 'pending' as const, progress: 0, epoch: t.type === 'train' ? `0/${t.epoch.split('/')[1]}` : t.epoch, errorMessage: undefined } : t))
  }

  const filtered = tasks.filter(t => {
    if (statusFilter !== 'all' && t.status !== statusFilter) return false
    if (typeFilter !== 'all' && t.type !== typeFilter) return false
    if (search) {
      const s = search.toLowerCase()
      return t.name.toLowerCase().includes(s) || t.modelName.toLowerCase().includes(s) || t.datasetName.toLowerCase().includes(s)
    }
    return true
  })

  const stats = {
    total: tasks.length,
    running: tasks.filter(t => t.status === 'running').length,
    pending: tasks.filter(t => t.status === 'pending').length,
    failed: tasks.filter(t => t.status === 'failed').length,
    paused: tasks.filter(t => t.status === 'paused').length,
  }

  return (
    <div>
      {/* Stats */}
      <div className="grid-4 mb-5">
        <div className="stat-card">
          <div className="stat-label">任务总数</div>
          <div className="stat-value">{stats.total}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <RefreshCw size={12} style={{ color: 'var(--accent-bright)' }} /> 运行中
          </div>
          <div className="stat-value" style={{ color: 'var(--accent-bright)' }}>{stats.running}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Clock size={12} style={{ color: 'var(--warning)' }} /> 等待中
          </div>
          <div className="stat-value" style={{ color: 'var(--warning)' }}>{stats.pending}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <AlertTriangle size={12} style={{ color: 'var(--error)' }} /> 异常/暂停
          </div>
          <div className="stat-value" style={{ color: 'var(--error)' }}>{stats.failed + stats.paused}</div>
        </div>
      </div>

      {/* Filters */}
      <div className="card card-padded mb-4">
        <div className="d-flex items-center gap-4 flex-wrap">
          <div className="search-input" style={{ flex: 1, minWidth: 240 }}>
            <Search size={14} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
            <input
              className="search-input-field"
              placeholder="搜索任务名称、模型或数据集…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="filter-select">
            <Filter size={14} style={{ color: 'var(--text-muted)' }} />
            <select className="filter-select-field" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="all">全部状态</option>
              <option value="running">运行中</option>
              <option value="pending">等待中</option>
              <option value="paused">已暂停</option>
              <option value="failed">异常</option>
              <option value="completed">已完成</option>
            </select>
          </div>
          <div className="filter-select">
            <Filter size={14} style={{ color: 'var(--text-muted)' }} />
            <select className="filter-select-field" value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
              <option value="all">全部类型</option>
              <option value="train">训练任务</option>
              <option value="validate">验证任务</option>
            </select>
          </div>
        </div>
      </div>

      {/* Task list */}
      <div className="card">
        {filtered.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon"><Eye size={40} /></div>
            <div className="empty-state-text">没有匹配的任务</div>
            <div className="empty-state-hint">尝试调整筛选条件或搜索关键词</div>
          </div>
        ) : (
          <div className="task-monitor-list">
            {filtered.map(task => {
              const sc = STATUS_CLASS[task.status]
              const ic = STATUS_ICONS[task.status]
              const tc = TYPE_CONFIG[task.type]

              return (
                <div key={task.id} className={`task-monitor-item ${task.status === 'running' ? 'task-monitor-item--active' : ''}`}>
                  <div className="task-monitor-row">
                    <div className="task-monitor-info">
                      <div className="d-flex items-center gap-3">
                        <span className={tc.cls} style={{ fontSize: 10, padding: '2px 8px' }}>
                          {tc.label}
                        </span>
                        <span className="task-monitor-name">{task.name}</span>
                        <span className={`${sc}`}>
                          {ic} {STATUS_LABELS[task.status]}
                        </span>
                      </div>
                      <div className="task-monitor-meta">
                        <span className="font-mono" style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{task.modelName}</span>
                        <span style={{ color: 'var(--border-bright)' }}>·</span>
                        <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{task.datasetName}</span>
                        <span style={{ color: 'var(--border-bright)' }}>·</span>
                        <span style={{ fontSize: 12, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 3 }}>
                          <Cpu size={11} /> {task.gpu}
                        </span>
                        <span style={{ color: 'var(--border-bright)' }}>·</span>
                        <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{task.createdAt}</span>
                      </div>
                    </div>

                    <div className="task-monitor-progress">
                      {(task.status === 'running' || task.status === 'paused') && (
                        <div className="d-flex items-center gap-3" style={{ minWidth: 140 }}>
                          <div className="progress-bar" style={{ flex: 1, minWidth: 80 }}>
                            <div
                              className="progress-fill"
                              style={{ width: `${task.progress}%`, background: task.status === 'paused' ? 'var(--warning)' : undefined }}
                            />
                          </div>
                          <span className="font-mono" style={{ fontSize: 10, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                            {task.epoch} {task.progress}%
                          </span>
                        </div>
                      )}
                      {task.status === 'failed' && task.errorMessage && (
                        <div className="task-monitor-error">
                          <AlertTriangle size={12} style={{ color: 'var(--error)', flexShrink: 0 }} />
                          <span>{task.errorMessage}</span>
                        </div>
                      )}
                      {task.status === 'pending' && (
                        <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{task.eta}</span>
                      )}
                    </div>

                    <div className="task-monitor-actions">
                      <Link
                        to={task.type === 'train' ? '/train/$taskId' : '/validate/$taskId'}
                        params={{ taskId: task.id } as any}
                        className="btn btn-ghost btn-sm"
                      >
                        详情 <ArrowRight size={11} />
                      </Link>

                      {(task.status === 'running') && (
                        <>
                          <button className="btn btn-warning btn-sm" onClick={() => handlePause(task.id)}>
                            <Pause size={12} /> 暂停
                          </button>
                          <button className="btn btn-danger btn-sm" onClick={() => handleStop(task.id)}>
                            <Square size={12} /> 停止
                          </button>
                        </>
                      )}
                      {task.status === 'paused' && (
                        <>
                          <button className="btn btn-success btn-sm" onClick={() => handleResume(task.id)}>
                            <Play size={12} /> 继续
                          </button>
                          <button className="btn btn-danger btn-sm" onClick={() => handleStop(task.id)}>
                            <Square size={12} /> 停止
                          </button>
                        </>
                      )}
                      {task.status === 'failed' && (
                        <button className="btn btn-primary btn-sm" onClick={() => handleRerun(task.id)}>
                          <RotateCcw size={12} /> 重新运行
                        </button>
                      )}
                      {task.status === 'pending' && (
                        <button className="btn btn-danger btn-sm" onClick={() => handleStop(task.id)}>
                          <Square size={12} /> 取消
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
