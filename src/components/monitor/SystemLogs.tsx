import { useState, useEffect, useMemo } from 'react'
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
import { MOCK_LOGS, type LogCategory, type LogLevel, type LogEntry } from '../../data/systemLogs'
import { useSimulatedWebSocket } from '../../lib/useSimulatedWebSocket'

// ─── 模拟 API ───

async function fetchSystemLogs(): Promise<LogEntry[]> {
  await new Promise(resolve => setTimeout(resolve, 400 + Math.random() * 400))
  return MOCK_LOGS
}

// ─── WebSocket 模拟数据生成 ───

let logSeq = MOCK_LOGS.length
function simulateNewLog(): LogEntry {
  logSeq++
  const categories: LogCategory[] = ['user', 'system', 'error']
  const levels: LogLevel[] = ['info', 'success', 'warning', 'error']
  const cat = categories[logSeq % 3]
  const level = levels[logSeq % 4]
  const now = new Date()
  const ts = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`

  const messages: Record<LogCategory, string[]> = {
    user: ['创建了新的训练任务', '修改了预设参数', '上传了模型权重', '发布了新模型版本'],
    system: ['GPU 节点资源调度完成', '训练任务自动分配到节点', '模型验证任务已入队', '数据集同步完成'],
    error: ['CUDA out of memory', '数据加载超时', '模型文件损坏，校验失败'],
  }

  return {
    id: `log-ws-${logSeq}`,
    timestamp: ts,
    category: cat,
    level: level,
    actor: cat === 'user' ? '张工' : '系统',
    message: messages[cat][logSeq % messages[cat].length],
    detail: level === 'error' ? `错误代码: ERR_${logSeq}_${cat.toUpperCase()}` : undefined,
  }
}

// ─── 常量 ───

const CATEGORY_CONFIG: Record<LogCategory, { label: string; icon: React.ReactNode; badgeClass: string }> = {
  user:   { label: '用户行为', icon: <User size={12} />,   badgeClass: 'badge badge-teal' },
  system: { label: '系统调度', icon: <Cpu size={12} />,    badgeClass: 'badge badge-running' },
  error:  { label: '任务报错', icon: <AlertTriangle size={12} />, badgeClass: 'badge badge-failed' },
}

const LEVEL_CONFIG: Record<LogLevel, { label: string; color: string }> = {
  info:    { label: 'INFO',    color: 'var(--text-muted)' },
  success: { label: 'SUCCESS', color: 'var(--success)' },
  warning: { label: 'WARN',    color: 'var(--warning)' },
  error:   { label: 'ERROR',   color: 'var(--error)' },
}

// ─── 主组件 ───

export function SystemLogs() {
  const [logs, setLogs] = useState<LogEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<LogCategory | 'all'>('all')
  const [levelFilter, setLevelFilter] = useState<LogLevel | 'all'>('all')
  const [expandedId, setExpandedId] = useState<string | null>(null)

  // WebSocket 连接 — 首次 API 加载完成后建立，接收新日志
  const { status: wsStatus, connect } = useSimulatedWebSocket<LogEntry>({
    generateData: () => simulateNewLog(),
    onData: (newLog) => setLogs(prev => [newLog, ...prev]),
  })

  useEffect(() => {
    fetchSystemLogs().then(data => {
      setLogs(data)
      logSeq = data.length
      setLoading(false)
    })
  }, [])

  useEffect(() => {
    if (!loading && logs.length > 0) {
      connect()
    }
  }, [loading, logs.length, connect])

  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
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
  }, [logs, search, categoryFilter, levelFilter])

  const stats = useMemo(() => {
    return {
      total: logs.length,
      user: logs.filter((l) => l.category === 'user').length,
      system: logs.filter((l) => l.category === 'system').length,
      error: logs.filter((l) => l.category === 'error').length,
    }
  }, [logs])

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '80px 0', gap: 12 }}>
        <div className="spinner" />
        <span style={{ fontSize: 14, color: 'var(--text-muted)' }}>加载中…</span>
      </div>
    )
  }

  return (
    <div>
      <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 16 }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <Clock size={13} />
          <span>最近 {logs.length} 条记录</span>
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <span style={{
            width: 7, height: 7, borderRadius: '50%',
            background: wsStatus === 'connected' ? 'var(--success)' : wsStatus === 'connecting' ? 'var(--warning)' : 'var(--text-muted)',
          }} />
          <span style={{ color: wsStatus === 'connected' ? 'var(--success)' : 'var(--text-muted)' }}>
            {wsStatus === 'connected' ? 'WS 已连接' : wsStatus === 'connecting' ? 'WS 连接中…' : 'WS 未连接'}
          </span>
        </span>
        <span style={{ color: 'var(--text-muted)' }}>每 5s 推送新日志</span>
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
