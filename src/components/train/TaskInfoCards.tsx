import { Cpu } from 'lucide-react'

interface ConfigRow {
  label: string
  value: string
}

export function TaskInfoCards({
  configRows,
  snapshotRows,
  splitBar,
  epoch,
  totalEpochs,
  progress,
  mAP,
  precision,
  recall,
  isRunning,
  device,
}: {
  configRows: ConfigRow[]
  snapshotRows: ConfigRow[]
  splitBar: React.ReactNode
  epoch: number
  totalEpochs: number
  progress: number
  mAP: number
  precision: number
  recall: number
  isRunning: boolean
  device: string
}) {
  return (
    <div className="grid-2 mb-5">
      {/* Task config */}
      <div className="card card-padded">
        <div className="section-title mb-3">任务配置</div>
        <div className="flex flex-col gap-2">
          {configRows.map(row => (
            <div key={row.label} className="data-row">
              <span className="data-row-label">{row.label}</span>
              <span className="data-row-value">{row.value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Dataset snapshot */}
      <div className="card card-padded">
        <div className="section-title mb-3">数据集快照</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {snapshotRows.map(row => (
            <div key={row.label} className="data-row">
              <span className="data-row-label">{row.label}</span>
              <span className="data-row-value">{row.value}</span>
            </div>
          ))}
          {splitBar}
          <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 2 }}>
            快照保存于任务创建时，记录当时使用的数据集划分状态
          </div>
        </div>
      </div>

      {/* Progress */}
      <div className="card card-padded">
        <div className="section-title mb-4">训练进度</div>

        <div className="progress-info">
          <span className="progress-main">
            {epoch}<span className="progress-sub">/{totalEpochs}轮</span>
          </span>
          <span className={`progress-percent ${progress === 100 ? 'text-success' : 'text-accent'}`}>
            {progress}%
          </span>
        </div>

        <div className="progress-bar progress-lg mb-4">
          <div className="progress-fill" style={{ width: `${progress}%` }} />
        </div>

        <div className="grid-3 mb-4">
          {[
            { label: 'mAP@0.5', value: mAP > 0 ? mAP.toFixed(3) : '—', color: 'var(--success)' },
            { label: 'Precision', value: precision > 0 ? precision.toFixed(3) : '—', color: 'var(--teal)' },
            { label: 'Recall', value: recall > 0 ? recall.toFixed(3) : '—', color: 'var(--warning)' },
          ].map(m => (
            <div key={m.label} className="metric-chip">
              <div className="metric-chip-value" style={{ color: m.color }}>{m.value}</div>
              <div className="metric-chip-label">{m.label}</div>
            </div>
          ))}
        </div>

        {isRunning && (
          <div className="gpu-info">
            <Cpu size={12} className="text-accent" />
            <span>GPU {device} · 已用 {Math.floor(epoch * 1.32)}min · 预计剩余 {Math.ceil((totalEpochs - epoch) * 1.32)}min</span>
          </div>
        )}
      </div>
    </div>
  )
}
