import { createFileRoute } from '@tanstack/react-router'
import { useState, useEffect, useMemo } from 'react'
import { Cpu, Activity, Server, Clock, Layers, AlertCircle, Wifi, WifiOff } from 'lucide-react'
import { GPU_SERVERS, type GpuServer } from '../../data/gpuServers'

export const Route = createFileRoute('/monitor/')({
  component: MonitorPage,
})

function formatRuntime(ms: number): string {
  const h = Math.floor(ms / 3600000)
  const m = Math.floor((ms % 3600000) / 60000)
  if (h > 0) return `${h}h ${m}m`
  return `${m}m`
}

function formatEta(minutes: number): string {
  if (minutes < 60) return `${minutes} 分钟`
  return `${Math.floor(minutes / 60)}h ${minutes % 60}m`
}

function ServerCard({ server, now }: { server: GpuServer; now: number }) {
  // Simulated per-GPU utilization
  const gpuUtils = useMemo(() =>
    server.gpus.map(g => {
      const h = g.id.split('').reduce((a, c) => a + c.charCodeAt(0), 0)
      return 15 + (h % 65) + Math.round(Math.random() * 10)
    }),
  [server.gpus])

  const runtimeMs = server.assignedTask ? now - server.assignedTask.startedAt : 0
  const progressPct = server.assignedTask
    ? Math.round((server.assignedTask.epoch / server.assignedTask.totalEpochs) * 100)
    : 0

  return (
    <div className="card" style={{ overflow: 'hidden' }}>
      {/* Header */}
      <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--border-dim)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Server size={15} style={{ color: server.status === 'online' ? 'var(--success)' : server.status === 'maintenance' ? 'var(--warning)' : 'var(--text-muted)' }} />
          <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>{server.name}</span>
          <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{server.spec}</span>
        </div>
        <span className="badge" style={{
          background: server.status === 'online' ? 'var(--success-glow)' : server.status === 'maintenance' ? 'var(--warning-glow)' : 'var(--bg-elevated)',
          color: server.status === 'online' ? 'var(--success)' : server.status === 'maintenance' ? 'var(--warning)' : 'var(--text-muted)',
          borderColor: server.status === 'online' ? 'rgba(103,194,58,0.3)' : server.status === 'maintenance' ? 'rgba(230,162,60,0.3)' : 'var(--border-dim)',
          fontSize: 10,
        }}>
          {server.status === 'online' ? <Wifi size={9} /> : server.status === 'maintenance' ? <AlertCircle size={9} /> : <WifiOff size={9} />}
          {server.status === 'online' ? '在线' : server.status === 'maintenance' ? '维护中' : '离线'}
        </span>
      </div>

      {/* GPU list */}
      <div style={{ padding: '10px 16px', borderBottom: '1px solid var(--border-dim)' }}>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          {server.gpus.map((g, i) => {
            const util = gpuUtils[i]
            return (
              <div key={g.id} style={{
                flex: '1 1 120px', minWidth: 100, maxWidth: 160,
                padding: '8px 10px', background: 'var(--bg-elevated)', borderRadius: 4,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 4 }}>
                  <Cpu size={11} style={{ color: util > 90 ? 'var(--error)' : util > 70 ? 'var(--warning)' : 'var(--success)' }} />
                  <span style={{ fontFamily: 'JetBrains Mono', fontSize: 10, color: 'var(--text-muted)' }}>#{g.index}</span>
                  <span style={{ fontSize: 10, color: 'var(--text-secondary)', fontWeight: 500 }}>{g.model}</span>
                </div>
                <div style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 3 }}>{g.memory}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <div className="progress-bar progress-sm" style={{ flex: 1 }}>
                    <div className="progress-fill" style={{
                      width: `${util}%`,
                      background: util > 90 ? 'var(--error)' : util > 70 ? 'var(--warning)' : 'var(--success)',
                    }} />
                  </div>
                  <span style={{ fontFamily: 'JetBrains Mono', fontSize: 10, fontWeight: 600, color: util > 90 ? 'var(--error)' : util > 70 ? 'var(--warning)' : 'var(--success)', minWidth: 28, textAlign: 'right' }}>
                    {util}%
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Task info */}
      <div style={{ padding: '12px 16px' }}>
        {server.assignedTask ? (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span className="badge" style={{
                  background: server.assignedTask.taskType === 'train' ? 'var(--accent-glow)' : 'rgba(103,194,58,0.12)',
                  color: server.assignedTask.taskType === 'train' ? 'var(--accent)' : 'var(--success)',
                  borderColor: server.assignedTask.taskType === 'train' ? 'rgba(64,158,255,0.3)' : 'rgba(103,194,58,0.3)',
                  fontSize: 9,
                }}>
                  {server.assignedTask.taskType === 'train' ? '训练' : '验证'}
                </span>
                <span style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-primary)' }}>{server.assignedTask.taskName}</span>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, marginBottom: 8 }}>
              {[
                { label: '已运行', value: formatRuntime(runtimeMs), icon: <Clock size={10} /> },
                { label: '当前轮次', value: `${server.assignedTask.epoch}/${server.assignedTask.totalEpochs}`, icon: <Layers size={10} /> },
                { label: '进度', value: `${progressPct}%`, icon: <Activity size={10} /> },
                { label: '预计剩余', value: formatEta(server.assignedTask.etaMinutes), icon: <Clock size={10} /> },
              ].map(m => (
                <div key={m.label} style={{ fontSize: 10, color: 'var(--text-muted)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 3, marginBottom: 1 }}>{m.icon} {m.label}</div>
                  <div style={{ fontFamily: 'JetBrains Mono', fontSize: 11, fontWeight: 600, color: 'var(--text-primary)' }}>{m.value}</div>
                </div>
              ))}
            </div>

            <div className="progress-bar progress-sm">
              <div className="progress-fill" style={{ width: `${progressPct}%` }} />
            </div>
          </div>
        ) : (
          <div style={{ fontSize: 12, color: 'var(--text-muted)', textAlign: 'center', padding: '12px 0' }}>
            空闲中
          </div>
        )}
      </div>
    </div>
  )
}

function MonitorPage() {
  const [now, setNow] = useState(Date.now())

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 3000)
    return () => clearInterval(interval)
  }, [])

  const onlineCount = GPU_SERVERS.filter(s => s.status === 'online').length
  const busyCount = GPU_SERVERS.filter(s => s.assignedTask).length

  return (
    <div className="slide-in">
      <div className="page-header">
        <div>
          <div className="breadcrumb">科宝训练平台 › 系统配置</div>
          <h1 className="page-title">资源监控</h1>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
            {onlineCount} 台在线 · {busyCount} 台运行中
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--success)', padding: '6px 12px', background: 'var(--success-glow)', border: '1px solid rgba(103,194,58,0.3)', borderRadius: 4 }}>
          <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--success)' }} className="pulse-ring" />
          实时监控中
        </div>
      </div>

      <div className="content-padded">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {GPU_SERVERS.map(server => (
            <ServerCard key={server.id} server={server} now={now} />
          ))}
        </div>
      </div>
    </div>
  )
}
