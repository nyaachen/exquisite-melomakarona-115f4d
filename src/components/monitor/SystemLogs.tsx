import { useState, useMemo } from 'react'
import {
  ScrollText,
  Search,
  User,
  Cpu,
  AlertTriangle,
  Clock,
  ChevronDown,
  X,
} from 'lucide-react'
import { MOCK_LOGS, type LogCategory, type LogLevel } from '../../data/systemLogs'

const CATEGORY_CONFIG: Record<LogCategory, { label: string; icon: React.ReactNode; badgeClass: string }> = {
  user:   { label: '用户行为', icon: <User size={12} />,   badgeClass: 'badge badge-teal' },
  system:{ label: '系统调度', icon: <Cpu size={12} />,    badgeClass: 'badge badge-running' },
  error: { label: '任务报错', icon: <AlertTriangle size={12} />, badgeClass: 'badge badge-failed' },
}

const LEVEL_CONFIG: Record<LogLevel, { label: string; color: string }> = {
  info:    { label: 'INFO',    color: 'var(--text-muted)' },
  success: { label: 'SUCCESS', color: 'var(--success)' },
  warning: { label: 'WARN',    color: 'var(--warning)' },
  error:   { label: 'ERROR',   color: 'var(--error)' },
}

export function SystemLogs() {
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<LogCategory | 'all'>('all')
  const [levelFilter, setLevelFilter] = useState<LogLevel | 'all'>('all')
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const filteredLogs = useMemo(() => {
    return MOCK_LOGS.filter((log) => {
      if (categoryFilter !== 'all' && log.category !== categoryFilter) return false
      if (levelFilter !== 'all' && log.level !== levelFilter) return false
      if (search) {
        const s = search.toLowerCase()
        return (
          log.message.toLowerCase().includes(s) ||
          log.actor.toLowerCase().includes(s) ||
          (log.detail && log.detail.toLowerCase().includes(s))
        )
      }
      return true
    })
  }, [search, categoryFilter, levelFilter])

  const stats = useMemo(() => {
    return {
      total: MOCK_LOGS.length,
      user: MOCK_LOGS.filter((l) => l.category === 'user').length,
      system: MOCK_LOGS.filter((l) => l.category === 'system').length,
      error: MOCK_LOGS.filter((l) => l.category === 'error').length,
    }
  }, [])

  return (
    <div>
      <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 6 }}>
        <Clock size={13} />
        <span>最近 {MOCK_LOGS.length} 条记录</span>
      </div>

      {/* Stats */}
      <div className="grid-4 mb-5">
        <div className="stat-card">
          <div className="stat-label">总日志数</div>
          <div className="stat-value">{stats.total}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <User size={12} style={{ color: 'var(--teal)' }} /> 用户行为
          </div>
          <div className="stat-value" style={{ color: 'var(--teal)' }}>{stats.user}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Cpu size={12} style={{ color: 'var(--accent-bright)' }} /> 系统调度
          </div>
          <div className="stat-value" style={{ color: 'var(--accent-bright)' }}>{stats.system}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <AlertTriangle size={12} style={{ color: 'var(--error)' }} /> 任务报错
          </div>
          <div className="stat-value" style={{ color: 'var(--error)' }}>{stats.error}</div>
        </div>
      </div>

      {/* Filters */}
      <div className="card card-padded mb-4">
        <div className="d-flex items-center gap-4 flex-wrap">
          <div className="search-input" style={{ flex: 1, minWidth: 240 }}>
            <Search size={14} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
            <input
              className="search-input-field"
              placeholder="搜索日志内容、操作人或详情…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2, color: 'var(--text-muted)' }}
              >
                <X size={14} />
              </button>
            )}
          </div>
          <div className="filter-select">
            <select
              className="filter-select-field"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value as LogCategory | 'all')}
            >
              <option value="all">全部类别</option>
              <option value="user">用户行为</option>
              <option value="system">系统调度</option>
              <option value="error">任务报错</option>
            </select>
          </div>
          <div className="filter-select">
            <select
              className="filter-select-field"
              value={levelFilter}
              onChange={(e) => setLevelFilter(e.target.value as LogLevel | 'all')}
            >
              <option value="all">全部级别</option>
              <option value="info">INFO</option>
              <option value="success">SUCCESS</option>
              <option value="warning">WARNING</option>
              <option value="error">ERROR</option>
            </select>
          </div>
        </div>
      </div>

      {/* Log List */}
      <div className="card">
        {filteredLogs.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon"><ScrollText size={40} /></div>
            <div className="empty-state-text">没有匹配的日志记录</div>
            <div className="empty-state-hint">尝试调整筛选条件或搜索关键词</div>
          </div>
        ) : (
          <div className="log-list">
            {filteredLogs.map((log) => {
              const catCfg = CATEGORY_CONFIG[log.category]
              const lvlCfg = LEVEL_CONFIG[log.level]
              const isExpanded = expandedId === log.id

              return (
                <div key={log.id} className="log-item">
                  <div
                    className={`log-item-main ${log.detail ? 'cursor-pointer' : ''}`}
                    onClick={() => log.detail && setExpandedId(isExpanded ? null : log.id)}
                  >
                    <span className="log-time">{log.timestamp}</span>
                    <span className={catCfg.badgeClass}>
                      {catCfg.icon}
                      {catCfg.label}
                    </span>
                    <span className="log-actor">{log.actor}</span>
                    <span className="log-msg">{log.message}</span>
                    <span className="log-level" style={{ color: lvlCfg.color }}>[{lvlCfg.label}]</span>
                    {log.detail && (
                      <ChevronDown
                        size={14}
                        className="log-chevron"
                        style={{ transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)' }}
                      />
                    )}
                  </div>
                  {isExpanded && log.detail && (
                    <div className="log-detail">{log.detail}</div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
