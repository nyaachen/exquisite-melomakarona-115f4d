import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { Activity, ScrollText, Eye } from 'lucide-react'
import { ResourceMonitor } from '../../components/monitor/ResourceMonitor'
import { SystemLogs } from '../../components/monitor/SystemLogs'
import { TaskMonitor } from '../../components/monitor/TaskMonitor'

const TABS = [
  { key: 'resource', label: '资源监控', icon: <Activity size={15} /> },
  { key: 'tasks',   label: '任务监控', icon: <Eye size={15} /> },
  { key: 'logs',    label: '系统日志', icon: <ScrollText size={15} /> },
] as const

type TabKey = typeof TABS[number]['key']

export const Route = createFileRoute('/monitor/')({
  component: MonitorPage,
})

function MonitorPage() {
  const [tab, setTab] = useState<TabKey>('resource')

  return (
    <div className="slide-in">
      <div className="page-header">
        <div>
          <div className="breadcrumb">
            <span>系统配置</span>
            <span>/</span>
            <span>监控中心</span>
          </div>
          <h1 className="page-title">监控中心</h1>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--success)', padding: '6px 12px', background: 'var(--success-glow)', border: '1px solid rgba(103,194,58,0.3)', borderRadius: 4 }}>
          <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--success)' }} className="pulse-ring" />
          实时监控中
        </div>
      </div>

      {/* Tab bar */}
      <div className="monitor-tabs">
        {TABS.map(t => (
          <button
            key={t.key}
            className={`monitor-tab ${tab === t.key ? 'monitor-tab--active' : ''}`}
            onClick={() => setTab(t.key)}
          >
            {t.icon}
            <span>{t.label}</span>
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="content-padded">
        {tab === 'resource' && <ResourceMonitor />}
        {tab === 'tasks' && <TaskMonitor />}
        {tab === 'logs' && <SystemLogs />}
      </div>
    </div>
  )
}
