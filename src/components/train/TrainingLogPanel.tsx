import { useRef, useEffect } from 'react'
import { Terminal, ChevronRight } from 'lucide-react'

interface LogEntry {
  text: string
  cls: string
}

export function TrainingLogPanel({
  logs,
  taskId,
  taskName,
  dataset,
  baseModel,
  trainImages,
  valImages,
  device,
  batchSize,
  imgSize,
  status,
  totalEpochs,
  mAP,
  precision,
  recall,
  startEpoch,
  errorMsg,
  logExpanded,
  onToggle,
}: {
  logs: LogEntry[]
  taskId: string
  taskName: string
  dataset: string
  baseModel: string
  trainImages: number
  valImages: number
  device: string
  batchSize: number
  imgSize: number
  status: 'running' | 'completed' | 'failed' | 'pending'
  totalEpochs: number
  mAP: number
  precision: number
  recall: number
  startEpoch: number
  errorMsg?: string
  logExpanded: boolean
  onToggle: () => void
}) {
  const logRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight
  }, [logs])

  return (
    <div className="card">
      <button
        style={{
          width: '100%', padding: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          cursor: 'pointer', background: 'transparent', transition: 'background 0.15s',
        }}
        onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = 'var(--bg-hover)' }}
        onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = 'transparent' }}
        onClick={onToggle}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Terminal size={15} style={{ color: 'var(--accent-bright)' }} />
          <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>训练日志</span>
          <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>({logs.length} 条)</span>
        </div>
        <div style={{ transform: logExpanded ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}>
          <ChevronRight size={15} style={{ color: 'var(--text-muted)' }} />
        </div>
      </button>

      {logExpanded && (
        <div className="log-terminal" style={{ height: 300, borderTop: '1px solid var(--border-dim)' }} ref={logRef}>
          <span className="log-line log-dim"># 科宝训练平台 · 任务 {taskId} · {taskName}</span>
          <span className="log-line log-dim"># 数据集: {dataset} · 基础模型: {baseModel}</span>
          <span className="log-line log-dim"># ─────────────────────────────────────────</span>
          {status === 'pending' && (
            <span className="log-line log-warn">⏳ 任务在队列中等待 GPU 资源…</span>
          )}
          {status === 'failed' && (
            <>
              <span className="log-line log-error">✗ 训练进程异常终止 (Epoch {startEpoch}/{totalEpochs})</span>
              <span className="log-line log-error">{errorMsg}</span>
            </>
          )}
          {(status === 'completed' || status === 'running') && (
            <>
              <span className="log-line log-success">✓ 模型权重加载完成: {baseModel}.pt</span>
              <span className="log-line log-info">  训练集: {trainImages} 张 · 验证集: {valImages} 张</span>
              <span className="log-line log-info">  设备: {device} · 批次大小: {batchSize} · 图像尺寸: {imgSize}</span>
              <span className="log-line log-dim">  ─────────────────────────────────</span>
            </>
          )}
          {logs.map((l, i) => (
            <span key={i} className={`log-line ${l.cls}`}>{l.text}</span>
          ))}
          {status === 'completed' && (
            <>
              <span className="log-line log-dim">  ─────────────────────────────────</span>
              <span className="log-line log-success">✓ 训练完成！最佳模型已保存: best.pt</span>
              <span className="log-line log-success">  mAP@0.5: {mAP.toFixed(3)}  Precision: {precision.toFixed(3)}  Recall: {recall.toFixed(3)}</span>
            </>
          )}
          {status === 'running' && (
            <span className="log-line log-info">▌<span className="cursor-blink">_</span></span>
          )}
        </div>
      )}
    </div>
  )
}
