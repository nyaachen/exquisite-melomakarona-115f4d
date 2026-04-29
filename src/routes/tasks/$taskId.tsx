import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { useState, useEffect, useRef } from 'react'
import {
  ArrowLeft,
  RefreshCw,
  CheckCircle2,
  XCircle,
  Clock,
  Terminal,
  BarChart2,
  FlaskConical,
  Package,
  AlertTriangle,
  Cpu,
} from 'lucide-react'

export const Route = createFileRoute('/tasks/$taskId')({
  component: TaskDetail,
})

const TASK_DATA: Record<string, {
  name: string; dataset: string; baseModel: string; status: 'running' | 'completed' | 'failed' | 'pending';
  totalEpochs: number; startEpoch: number; mAP: number; precision: number; recall: number;
  batchSize: number; imgSize: number; optimizer: string; device: string;
  createdAt: string; classes: string[]; trainImages: number; valImages: number;
  errorMsg?: string;
}> = {
  'task-001': {
    name: '道路缺陷检测 v2.3', dataset: '道路缺陷标注集·4872张', baseModel: 'YOLOv8m',
    status: 'running', totalEpochs: 100, startEpoch: 47,
    mAP: 0.782, precision: 0.831, recall: 0.748,
    batchSize: 16, imgSize: 640, optimizer: 'SGD', device: 'A100×2',
    createdAt: '2026-04-29 09:14', classes: ['裂缝', '坑洼', '破损', '剥落', '标线模糊', '积水', '障碍物'],
    trainImages: 3410, valImages: 975,
  },
  'task-002': {
    name: '施工人员安全帽检测', dataset: '安全帽标注集·2391张', baseModel: 'YOLOv8s',
    status: 'completed', totalEpochs: 80, startEpoch: 80,
    mAP: 0.923, precision: 0.941, recall: 0.908,
    batchSize: 32, imgSize: 640, optimizer: 'SGD', device: 'A100×1',
    createdAt: '2026-04-28 14:30', classes: ['安全帽', '无安全帽', '人员'],
    trainImages: 1673, valImages: 478,
  },
  'task-003': {
    name: '车牌识别增强版', dataset: '车牌数据集·7840张', baseModel: 'YOLOv8l',
    status: 'failed', totalEpochs: 120, startEpoch: 23,
    mAP: 0, precision: 0, recall: 0,
    batchSize: 16, imgSize: 640, optimizer: 'AdamW', device: 'A100×4',
    createdAt: '2026-04-27 22:05', classes: ['车牌', '遮挡车牌', '模糊车牌'],
    trainImages: 5488, valImages: 1568,
    errorMsg: 'CUDA out of memory. Tried to allocate 2.73 GiB (GPU 0; 79.20 GiB total capacity). Try reducing batch size or image size.',
  },
  'task-004': {
    name: '工厂设备异常检测', dataset: '设备标注集·1628张', baseModel: 'YOLOv8n',
    status: 'pending', totalEpochs: 60, startEpoch: 0,
    mAP: 0, precision: 0, recall: 0,
    batchSize: 16, imgSize: 640, optimizer: 'SGD', device: 'A100×1',
    createdAt: '2026-04-29 10:47', classes: ['正常设备', '异常设备', '待检修'],
    trainImages: 1139, valImages: 325,
  },
}

// Simulate training log lines
const generateLog = (epoch: number, total: number): string[] => {
  const loss = (1.8 - epoch * 0.012 + Math.random() * 0.05).toFixed(4)
  const valLoss = (1.9 - epoch * 0.011 + Math.random() * 0.06).toFixed(4)
  const map = (0.2 + epoch * 0.006 + Math.random() * 0.01).toFixed(3)
  return [
    `[dim]${new Date().toTimeString().slice(0, 8)}[0m Epoch ${epoch}/${total}`,
    `  train/box_loss: ${loss}  train/cls_loss: ${(parseFloat(loss) * 0.6).toFixed(4)}  train/dfl_loss: ${(parseFloat(loss) * 0.3).toFixed(4)}`,
    `  val/box_loss:   ${valLoss}  val/cls_loss:   ${(parseFloat(valLoss) * 0.6).toFixed(4)}  val/dfl_loss:   ${(parseFloat(valLoss) * 0.3).toFixed(4)}`,
    `  metrics/mAP50: ${map}  metrics/mAP50-95: ${(parseFloat(map) * 0.62).toFixed(3)}`,
  ]
}

const STATUS_CONFIG = {
  running: { label: '训练中', cls: 'badge-running', icon: <RefreshCw size={11} className="spinning" /> },
  completed: { label: '已完成', cls: 'badge-completed', icon: <CheckCircle2 size={11} /> },
  failed: { label: '训练失败', cls: 'badge-failed', icon: <XCircle size={11} /> },
  pending: { label: '等待中', cls: 'badge-pending', icon: <Clock size={11} /> },
}

// Sparkline data (last 20 epochs)
function Sparkline({ data, color, height = 28 }: { data: number[]; color: string; height?: number }) {
  const max = Math.max(...data)
  const min = Math.min(...data)
  const range = max - min || 1
  return (
    <div className="mini-chart" style={{ height, gap: 1.5 }}>
      {data.map((v, i) => (
        <div key={i} className="chart-bar"
          style={{
            height: `${((v - min) / range * 80 + 20)}%`,
            background: color,
            opacity: 0.3 + (i / data.length) * 0.7,
          }} />
      ))}
    </div>
  )
}

function TaskDetail() {
  const { taskId } = Route.useParams()
  const task = TASK_DATA[taskId] ?? TASK_DATA['task-001']
  const navigate = useNavigate()

  const [epoch, setEpoch] = useState(task.startEpoch)
  const [mAP, setMAP] = useState(task.mAP)
  const [precision, setPrecision] = useState(task.precision)
  const [recall, setRecall] = useState(task.recall)
  const [logs, setLogs] = useState<Array<{ text: string; cls: string }>>([])
  const [mapHistory, setMapHistory] = useState<number[]>(
    Array.from({ length: Math.min(task.startEpoch, 20) }, (_, i) =>
      0.2 + (task.startEpoch - 20 + i) * 0.006 + Math.random() * 0.01
    )
  )
  const [lossHistory, setLossHistory] = useState<number[]>(
    Array.from({ length: Math.min(task.startEpoch, 20) }, (_, i) =>
      1.8 - (task.startEpoch - 20 + i) * 0.012 + Math.random() * 0.05
    )
  )
  const logRef = useRef<HTMLDivElement>(null)
  const [activeTab, setActiveTab] = useState<'metrics' | 'log'>('metrics')

  useEffect(() => {
    if (task.status !== 'running') return
    const interval = setInterval(() => {
      setEpoch(prev => {
        if (prev >= task.totalEpochs) { clearInterval(interval); return prev }
        const next = prev + 1
        const newMap = Math.min(0.95, 0.2 + next * 0.006 + Math.random() * 0.01)
        const newPrec = Math.min(0.98, newMap * 1.07 + Math.random() * 0.02)
        const newRecall = Math.min(0.96, newMap * 0.96 + Math.random() * 0.02)
        setMAP(newMap)
        setPrecision(newPrec)
        setRecall(newRecall)
        setMapHistory(h => [...h.slice(-19), newMap])
        setLossHistory(h => [...h.slice(-19), 1.8 - next * 0.012 + Math.random() * 0.05])
        const newLines = generateLog(next, task.totalEpochs)
        setLogs(prev => [...prev.slice(-60), ...newLines.map(t => ({ text: t, cls: 'log-info' }))])
        return next
      })
    }, 1200)
    return () => clearInterval(interval)
  }, [task.status, task.totalEpochs])

  useEffect(() => {
    if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight
  }, [logs])

  const progress = Math.round((epoch / task.totalEpochs) * 100)
  const sc = STATUS_CONFIG[task.status]

  return (
    <div style={{ animation: 'slideIn 0.3s ease-out' }}>
      {/* Header */}
      <div className="page-header">
        <div>
          <div className="breadcrumb">
            <Link to="/">科宝训练平台</Link> ›
            <Link to="/tasks">训练任务</Link> ›
            <span>{task.name}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 4 }}>
            <h1 className="page-title" style={{ marginBottom: 0 }}>{task.name}</h1>
            <span className={`badge ${sc.cls}`}>{sc.icon} {sc.label}</span>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn btn-secondary btn-sm" onClick={() => navigate({ to: '/tasks' })}>
            <ArrowLeft size={14} /> 返回列表
          </button>
          {task.status === 'completed' && (
            <Link to="/models" className="btn btn-success btn-sm">
              <FlaskConical size={14} /> 验证模型
            </Link>
          )}
          {task.status === 'completed' && (
            <Link to="/models" className="btn btn-teal btn-sm">
              <Package size={14} /> 发布模型
            </Link>
          )}
        </div>
      </div>

      <div style={{ padding: '24px 32px' }}>
        {/* Failed error */}
        {task.status === 'failed' && task.errorMsg && (
          <div style={{ background: 'var(--error-glow)', border: '1px solid rgba(255,70,85,0.3)', borderRadius: 10, padding: '14px 18px', marginBottom: 20, display: 'flex', gap: 10 }}>
            <AlertTriangle size={15} style={{ color: 'var(--error)', flexShrink: 0, marginTop: 1 }} />
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--error)', marginBottom: 4 }}>训练失败</div>
              <div style={{ fontFamily: 'JetBrains Mono', fontSize: 11.5, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{task.errorMsg}</div>
            </div>
          </div>
        )}

        {/* Info + Progress row */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
          {/* Task info */}
          <div className="card" style={{ padding: 18 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 12 }}>任务配置</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[
                { label: '数据集', value: task.dataset },
                { label: '基础模型', value: task.baseModel },
                { label: '优化器', value: task.optimizer },
                { label: '批次大小', value: String(task.batchSize) },
                { label: '图像尺寸', value: `${task.imgSize}×${task.imgSize}` },
                { label: '训练设备', value: task.device },
                { label: '创建时间', value: task.createdAt },
              ].map(row => (
                <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12.5, borderBottom: '1px solid var(--border-dim)', paddingBottom: 6 }}>
                  <span style={{ color: 'var(--text-muted)' }}>{row.label}</span>
                  <span style={{ color: 'var(--text-primary)', fontFamily: 'JetBrains Mono', fontSize: 12 }}>{row.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Progress */}
          <div className="card" style={{ padding: 18 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 16 }}>训练进度</div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 8 }}>
              <span style={{ fontFamily: 'JetBrains Mono', fontSize: 32, fontWeight: 700, color: 'var(--text-primary)' }}>
                {epoch}<span style={{ fontSize: 16, color: 'var(--text-muted)', fontWeight: 400 }}>/{task.totalEpochs}</span>
              </span>
              <span style={{ fontFamily: 'JetBrains Mono', fontSize: 20, color: progress === 100 ? 'var(--success)' : 'var(--accent-bright)' }}>{progress}%</span>
            </div>

            <div className="progress-bar" style={{ height: 8, marginBottom: 20 }}>
              <div className={`progress-fill ${task.status === 'failed' ? 'progress-fill-error' : ''}`}
                style={{ width: `${progress}%` }} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
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

            {task.status === 'running' && (
              <div style={{ marginTop: 14, fontSize: 12, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 6 }}>
                <Cpu size={12} style={{ color: 'var(--accent-bright)' }} />
                <span>GPU {task.device} · 已用 {Math.floor(epoch * 1.32)}min · 预计剩余 {Math.ceil((task.totalEpochs - epoch) * 1.32)}min</span>
              </div>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 4, marginBottom: 16, borderBottom: '1px solid var(--border-dim)', paddingBottom: 0 }}>
          {[
            { id: 'metrics' as const, label: '训练曲线', icon: <BarChart2 size={13} /> },
            { id: 'log' as const, label: '训练日志', icon: <Terminal size={13} /> },
          ].map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                padding: '8px 14px',
                fontSize: 13, fontWeight: 600, fontFamily: 'inherit',
                color: activeTab === tab.id ? 'var(--accent-bright)' : 'var(--text-muted)',
                borderBottom: `2px solid ${activeTab === tab.id ? 'var(--accent)' : 'transparent'}`,
                display: 'flex', alignItems: 'center', gap: 6,
                marginBottom: -1,
                transition: 'all 0.15s',
              }}>
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        {/* Metrics tab */}
        {activeTab === 'metrics' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div className="card" style={{ padding: 18 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 12 }}>mAP@0.5 曲线（近 {mapHistory.length} 轮）</div>
              <Sparkline data={mapHistory} color="var(--success)" height={48} />
              <div style={{ marginTop: 8, display: 'flex', justifyContent: 'space-between', fontSize: 11, fontFamily: 'JetBrains Mono', color: 'var(--text-muted)' }}>
                <span>{mapHistory[0]?.toFixed(3) ?? '—'}</span>
                <span style={{ color: 'var(--success)', fontWeight: 600 }}>{mapHistory[mapHistory.length - 1]?.toFixed(3) ?? '—'}</span>
              </div>
            </div>
            <div className="card" style={{ padding: 18 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 12 }}>训练损失曲线（近 {lossHistory.length} 轮）</div>
              <Sparkline data={lossHistory.map(v => -v)} color="var(--accent)" height={48} />
              <div style={{ marginTop: 8, display: 'flex', justifyContent: 'space-between', fontSize: 11, fontFamily: 'JetBrains Mono', color: 'var(--text-muted)' }}>
                <span>{lossHistory[0]?.toFixed(4) ?? '—'}</span>
                <span style={{ color: 'var(--accent-bright)', fontWeight: 600 }}>{lossHistory[lossHistory.length - 1]?.toFixed(4) ?? '—'}</span>
              </div>
            </div>

            {/* Class metrics */}
            <div className="card" style={{ padding: 18, gridColumn: '1 / -1' }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 14 }}>类别检测性能</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 10 }}>
                {task.classes.map((cls, i) => {
                  const classMap = mAP > 0 ? Math.min(0.99, mAP * (0.85 + i * 0.02 + Math.random() * 0.1)) : 0
                  return (
                    <div key={cls} className="metric-chip">
                      <div style={{ fontSize: 12, color: 'var(--text-primary)', fontWeight: 500, marginBottom: 4 }}>{cls}</div>
                      <div style={{ fontFamily: 'JetBrains Mono', fontSize: 14, color: 'var(--success)', fontWeight: 600 }}>
                        {classMap > 0 ? classMap.toFixed(3) : '—'}
                      </div>
                      {classMap > 0 && (
                        <div className="progress-bar" style={{ marginTop: 6 }}>
                          <div className="progress-fill" style={{ width: `${classMap * 100}%` }} />
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        )}

        {/* Log tab */}
        {activeTab === 'log' && (
          <div className="log-terminal" style={{ height: 360 }} ref={logRef}>
            <span className="log-line log-dim"># 科宝训练平台 · 任务 {taskId} · {task.name}</span>
            <span className="log-line log-dim"># 数据集: {task.dataset} · 基础模型: {task.baseModel}</span>
            <span className="log-line log-dim"># ─────────────────────────────────────────</span>
            {task.status === 'pending' && (
              <span className="log-line log-warn">⏳ 任务在队列中等待 GPU 资源…</span>
            )}
            {task.status === 'failed' && (
              <>
                <span className="log-line log-error">✗ 训练进程异常终止 (Epoch {task.startEpoch}/{task.totalEpochs})</span>
                <span className="log-line log-error">{task.errorMsg}</span>
              </>
            )}
            {(task.status === 'completed' || task.status === 'running') && (
              <>
                <span className="log-line log-success">✓ 模型权重加载完成: {task.baseModel}.pt</span>
                <span className="log-line log-info">  训练集: {task.trainImages} 张 · 验证集: {task.valImages} 张</span>
                <span className="log-line log-info">  设备: {task.device} · 批次大小: {task.batchSize} · 图像尺寸: {task.imgSize}</span>
                <span className="log-line log-dim">  ─────────────────────────────────</span>
              </>
            )}
            {logs.map((l, i) => (
              <span key={i} className={`log-line ${l.cls}`}>{l.text}</span>
            ))}
            {task.status === 'completed' && (
              <>
                <span className="log-line log-dim">  ─────────────────────────────────</span>
                <span className="log-line log-success">✓ 训练完成！最佳模型已保存: best.pt</span>
                <span className="log-line log-success">  mAP@0.5: {task.mAP.toFixed(3)}  Precision: {task.precision.toFixed(3)}  Recall: {task.recall.toFixed(3)}</span>
              </>
            )}
            {task.status === 'running' && (
              <span className="log-line log-info">▌<span className="cursor-blink">_</span></span>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
