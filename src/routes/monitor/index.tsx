import { createFileRoute } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { Cpu, Activity, HardDrive, Thermometer } from 'lucide-react'

export const Route = createFileRoute('/monitor/')({
  component: MonitorPage,
})

function MonitorPage() {
  const [gpuUtil, setGpuUtil] = useState([89, 91, 87, 92, 88, 90, 93, 89, 91, 94])
  const [gpuMem, setGpuMem] = useState(71.4)
  const [temp, setTemp] = useState(72)

  useEffect(() => {
    const interval = setInterval(() => {
      setGpuUtil(prev => {
        const next = [...prev.slice(1), Math.round(84 + Math.random() * 12)]
        return next
      })
      setGpuMem(prev => Math.round((prev + (Math.random() - 0.5) * 2) * 10) / 10)
      setTemp(prev => Math.round(prev + (Math.random() - 0.5) * 2))
    }, 2000)
    return () => clearInterval(interval)
  }, [])

  const currentUtil = gpuUtil[gpuUtil.length - 1]

  return (
    <div style={{ animation: 'slideIn 0.3s ease-out' }}>
      <div className="page-header">
        <div>
          <div className="breadcrumb">科宝训练平台 › 资源监控</div>
          <h1 className="page-title">资源监控</h1>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--success)', padding: '6px 12px', background: 'var(--success-glow)', border: '1px solid rgba(18,217,122,0.3)', borderRadius: 8 }}>
          <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--success)' }} className="pulse-ring" />
          实时监控中
        </div>
      </div>

      <div style={{ padding: '24px 32px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 24 }}>
          {[
            { label: 'GPU 利用率', value: `${currentUtil}%`, icon: <Cpu size={16} />, color: currentUtil > 90 ? 'var(--warning)' : 'var(--accent-bright)', sub: 'A100×4 · 当前训练任务 ×1' },
            { label: 'GPU 显存', value: `${gpuMem}%`, icon: <Activity size={16} />, color: 'var(--teal)', sub: `${(gpuMem * 79.2 / 100).toFixed(1)} / 79.2 GiB` },
            { label: 'GPU 温度', value: `${temp}°C`, icon: <Thermometer size={16} />, color: temp > 80 ? 'var(--error)' : 'var(--success)', sub: '目标 < 85°C' },
            { label: '磁盘使用', value: '2.34 TB', icon: <HardDrive size={16} />, color: 'var(--text-secondary)', sub: '/ 8.00 TB 总容量' },
          ].map(s => (
            <div key={s.label} className="stat-card">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span className="stat-label">{s.label}</span>
                <div style={{ color: s.color }}>{s.icon}</div>
              </div>
              <div className="stat-value" style={{ color: s.color, fontSize: 26 }}>{s.value}</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>{s.sub}</div>
            </div>
          ))}
        </div>

        <div className="card" style={{ padding: 20 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 14 }}>GPU 利用率历史（最近 10 次采样）</div>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, height: 80 }}>
            {gpuUtil.map((v, i) => (
              <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, height: '100%', justifyContent: 'flex-end' }}>
                <div style={{
                  width: '100%',
                  height: `${v}%`,
                  background: v > 90 ? 'var(--warning)' : 'var(--accent)',
                  opacity: 0.3 + (i / gpuUtil.length) * 0.7,
                  borderRadius: '3px 3px 0 0',
                  transition: 'height 0.5s ease',
                }} />
                <span style={{ fontFamily: 'JetBrains Mono', fontSize: 10, color: 'var(--text-muted)' }}>{v}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
