import { useState, useEffect, useMemo } from 'react'
import { Cpu, Server, Clock, Layers, AlertCircle, Wifi, WifiOff } from 'lucide-react'
import { GPU_SERVERS, type GpuServer } from '../../data/gpuServers'
import { useSimulatedWebSocket } from '../../lib/useSimulatedWebSocket'

// ─── 模拟 API ───

async function fetchResourceData(): Promise<GpuServer[]> {
  await new Promise(resolve => setTimeout(resolve, 400 + Math.random() * 400))
  return GPU_SERVERS
}

// ─── WebSocket 模拟数据生成 ───

function simulateGpuUpdate(servers: GpuServer[]): GpuServer[] {
  return servers.map(s => {
    if (s.status !== 'online') return s
    return {
      ...s,
      gpus: s.gpus.map(g => {
        if (!g.assignedTask) return g
        const task = { ...g.assignedTask }
        task.epoch = Math.min(task.epoch + 1, task.totalEpochs)
        task.etaMinutes = Math.max(1, task.etaMinutes - 1)
        return { ...g, assignedTask: task }
      }),
    }
  })
}

// ─── 子组件 ───

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
  const totalCards = server.gpus.length
  const busyCards = server.gpus.filter(g => g.assignedTask).length
  const uniqueTasks = new Set(server.gpus.filter(g => g.assignedTask).map(g => g.assignedTask!.taskId)).size

  const gpuUtils = useMemo(() =>
    server.gpus.map(g => {
      const h = g.id.split('').reduce((a, c) => a + c.charCodeAt(0), 0)
      return 15 + (h % 65) + Math.round(Math.random() * 10)
    }),
  [server.gpus])

  return (
    <div className="card" style={{ overflow: 'hidden' }}>
      <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--border-dim)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Server size={15} style={{ color: server.status === 'online' ? 'var(--success)' : server.status === 'maintenance' ? 'var(--warning)' : 'var(--text-muted)' }} />
          <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>{server.name}</span>
          <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{server.ram}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontFamily: 'JetBrains Mono', fontSize: 11, color: 'var(--text-secondary)' }}>
            {busyCards}/{totalCards}卡 {uniqueTasks > 0 && `${uniqueTasks}任务`}
          </span>
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
      </div>

      {server.gpus.map((g, i) => {
        const util = gpuUtils[i]
        const t = g.assignedTask
        const runtimeMs = t ? now - t.startedAt : 0
        const progressPct = t ? Math.round((t.epoch / t.totalEpochs) * 100) : 0

        return (
          <div key={g.id} style={{
            display: 'flex', alignItems: 'center', gap: 16,
            padding: '10px 16px',
            borderBottom: i < server.gpus.length - 1 ? '1px solid var(--border-dim)' : undefined,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 240 }}>
              <Cpu size={13} style={{ color: util > 90 ? 'var(--error)' : util > 70 ? 'var(--warning)' : 'var(--success)', flexShrink: 0 }} />
              <span style={{ fontFamily: 'JetBrains Mono', fontSize: 11, color: 'var(--text-muted)', minWidth: 24 }}>#{g.index}</span>
              <span style={{ fontSize: 11.5, color: 'var(--text-secondary)', fontWeight: 500 }}>{g.model}</span>
              <span style={{ fontSize: 10.5, color: 'var(--text-muted)' }}>{g.memory}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, minWidth: 120 }}>
              <div className="progress-bar progress-sm" style={{ flex: 1 }}>
                <div className="progress-fill" style={{
                  width: `${util}%`,
                  background: util > 90 ? 'var(--error)' : util > 70 ? 'var(--warning)' : 'var(--success)',
                }} />
              </div>
              <span style={{ fontFamily: 'JetBrains Mono', fontSize: 10.5, fontWeight: 600, color: util > 90 ? 'var(--error)' : util > 70 ? 'var(--warning)' : 'var(--success)', minWidth: 30, textAlign: 'right' }}>
                {util}%
              </span>
            </div>
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 12 }}>
              {t ? (
                <>
                  <span className="badge" style={{
                    background: t.taskType === 'train' ? 'var(--accent-glow)' : 'rgba(103,194,58,0.12)',
                    color: t.taskType === 'train' ? 'var(--accent)' : 'var(--success)',
                    borderColor: t.taskType === 'train' ? 'rgba(64,158,255,0.3)' : 'rgba(103,194,58,0.3)',
                    fontSize: 10, flexShrink: 0,
                  }}>
                    {t.taskType === 'train' ? '训练' : '验证'}
                  </span>
                  <span style={{ fontSize: 12.5, fontWeight: 500, color: 'var(--text-primary)', minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.taskName}</span>
                  <span style={{ fontFamily: 'JetBrains Mono', fontSize: 10.5, color: 'var(--text-muted)', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: 3 }}>
                    <Clock size={10} />
                    {formatRuntime(runtimeMs)}
                  </span>
                  <span style={{ fontFamily: 'JetBrains Mono', fontSize: 10.5, color: 'var(--text-muted)', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: 3 }}>
                    <Layers size={10} />
                    {t.epoch}/{t.totalEpochs}
                  </span>
                  <span style={{ fontFamily: 'JetBrains Mono', fontSize: 11, fontWeight: 600, color: 'var(--accent-bright)', minWidth: 32 }}>
                    {progressPct}%
                  </span>
                  <div className="progress-bar progress-sm" style={{ flex: 1, minWidth: 50, maxWidth: 100 }}>
                    <div className="progress-fill" style={{ width: `${progressPct}%` }} />
                  </div>
                  <span style={{ fontFamily: 'JetBrains Mono', fontSize: 10, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                    剩余 {formatEta(t.etaMinutes)}
                  </span>
                </>
              ) : (
                <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>空闲中</span>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}

// ─── 主组件 ───

export function ResourceMonitor() {
  const [servers, setServers] = useState<GpuServer[]>([])
  const [loading, setLoading] = useState(true)
  const [now, setNow] = useState(Date.now())

  // WebSocket 连接 — 首次 API 加载完成后建立
  const { status: wsStatus, connect } = useSimulatedWebSocket<GpuServer[]>({
    generateData: () => simulateGpuUpdate(servers),
    onData: (updated) => setServers(updated),
  })

  // 首次通过 API 获取数据
  useEffect(() => {
    fetchResourceData().then(data => {
      setServers(data)
      setLoading(false)
    })
  }, [])

  // API 数据就绪后建立 WebSocket
  useEffect(() => {
    if (!loading && servers.length > 0) {
      connect()
    }
  }, [loading, servers.length, connect])

  // 本地时钟更新（用于任务运行时长显示）
  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 3000)
    return () => clearInterval(interval)
  }, [])

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '80px 0', gap: 12 }}>
        <div className="spinner" />
        <span style={{ fontSize: 14, color: 'var(--text-muted)' }}>加载中…</span>
      </div>
    )
  }

  const onlineCount = servers.filter(s => s.status === 'online').length
  const busyGpuCount = servers.flatMap(s => s.gpus).filter(g => g.assignedTask).length
  const totalGpuCount = servers.flatMap(s => s.gpus).length

  return (
    <div>
      <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 16 }}>
        <span>{onlineCount} 台在线 · {busyGpuCount}/{totalGpuCount} 卡运行中</span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <span style={{
            width: 7, height: 7, borderRadius: '50%',
            background: wsStatus === 'connected' ? 'var(--success)' : wsStatus === 'connecting' ? 'var(--warning)' : 'var(--text-muted)',
          }} />
          <span style={{ color: wsStatus === 'connected' ? 'var(--success)' : 'var(--text-muted)' }}>
            {wsStatus === 'connected' ? 'WS 已连接' : wsStatus === 'connecting' ? 'WS 连接中…' : 'WS 未连接'}
          </span>
        </span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {servers.map(server => (
          <ServerCard key={server.id} server={server} now={now} />
        ))}
      </div>
    </div>
  )
}
