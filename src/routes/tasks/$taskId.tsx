import { createFileRoute, useRouter } from '@tanstack/react-router'
import { useState, useEffect, useRef } from 'react'
import {
  ArrowLeft,
  RefreshCw,
  CheckCircle2,
  XCircle,
  Clock,
  Cpu,
  Zap,
  Settings,
  Download,
  Rocket,
  TrendingUp,
  AlertTriangle,
} from 'lucide-react'

export const Route = createFileRoute('/tasks/$taskId')({
  component: TaskDetail,
})

const TASK_DATA = {
  'task-001': {
    id: 'task-001',
    name: '道路缺陷检测 v2.3',
    description: '使用YOLOv8m训练道路缺陷检测模型，支持7类目标识别',
    status: 'running' as const,
    progress: 47,
    epoch: 47,
    totalEpochs: 100,
    baseModel: 'YOLOv8m',
    dataset: '道路缺陷标注集',
    datasetSize: 4872,
    gpu: 'A100×2',
    batchSize: 16,
    learningRate: 0.01,
    startTime: '2026-04-29 09:14:32',
    eta: '预计 2小时15分',
    metrics: {
      mAP: 0.782,
      precision: 0.831,
      recall: 0.748,
      f1: 0.788,
      trainLoss: 0.321,
      valLoss: 0.456,
    },
  },
  'task-002': {
    id: 'task-002',
    name: '施工人员安全帽检测',
    description: '检测施工人员安全帽佩戴情况',
    status: 'completed' as const,
    progress: 100,
    epoch: 80,
    totalEpochs: 80,
    baseModel: 'YOLOv8s',
    dataset: '安全帽标注集',
    datasetSize: 2391,
    gpu: 'A100×1',
    batchSize: 32,
    learningRate: 0.01,
    startTime: '2026-04-28 14:30:00',
    endTime: '2026-04-28 18:45:12',
    eta: '-',
    metrics: {
      mAP: 0.923,
      precision: 0.941,
      recall: 0.908,
      f1: 0.924,
      trainLoss: 0.123,
      valLoss: 0.234,
    },
  },
  'task-003': {
    id: 'task-003',
    name: '车牌识别增强版',
    description: '高精度车牌识别模型',
    status: 'failed' as const,
    progress: 23,
    epoch: 23,
    totalEpochs: 120,
    baseModel: 'YOLOv8l',
    dataset: '车牌数据集',
    datasetSize: 7840,
    gpu: 'A100×4',
    batchSize: 8,
    learningRate: 0.001,
    startTime: '2026-04-27 22:05:00',
    error: 'GPU内存不足，训练中断',
    eta: '-',
    metrics: {
      mAP: 0,
      precision: 0,
      recall: 0,
      f1: 0,
      trainLoss: 0,
      valLoss: 0,
    },
  },
  'task-004': {
    id: 'task-004',
    name: '工厂设备异常检测',
    description: '检测工厂设备运行异常',
    status: 'pending' as const,
    progress: 0,
    epoch: 0,
    totalEpochs: 60,
    baseModel: 'YOLOv8n',
    dataset: '设备标注集',
    datasetSize: 1628,
    gpu: 'A100×1',
    batchSize: 32,
    learningRate: 0.01,
    startTime: '-',
    eta: '排队中',
    metrics: {
      mAP: 0,
      precision: 0,
      recall: 0,
      f1: 0,
      trainLoss: 0,
      valLoss: 0,
    },
  },
}

function TaskDetail() {
  const router = useRouter()
  const { taskId } = router.params
  const task = TASK_DATA[taskId as keyof typeof TASK_DATA] || TASK_DATA['task-001']
  const [logs, setLogs] = useState<string[]>([])
  const logsRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (task.status !== 'running') return

    const interval = setInterval(() => {
      const logMessages = [
        `[INFO] Epoch ${task.epoch + Math.floor(Math.random() * 3)}/100: train_loss=0.${Math.floor(Math.random() * 500 + 200)} val_loss=0.${Math.floor(Math.random() * 600 + 300)}`,
        `[INFO] mAP@0.5: 0.${Math.floor(Math.random() * 900 + 700)}`,
        `[DEBUG] Batch ${Math.floor(Math.random() * 300) + 100}/305: loss=0.${Math.floor(Math.random() * 400 + 200)}`,
        `[INFO] Precision: 0.${Math.floor(Math.random() * 900 + 800)} Recall: 0.${Math.floor(Math.random() * 900 + 700)}`,
        `[INFO] Saving checkpoint to /models/task-001/epoch_${task.epoch}.pt`,
      ]
      const newLog = logMessages[Math.floor(Math.random() * logMessages.length)]
      setLogs(prev => [...prev.slice(-50), newLog])
    }, 1500)

    return () => clearInterval(interval)
  }, [task.status, task.epoch])

  useEffect(() => {
    if (logsRef.current) {
      logsRef.current.scrollTop = logsRef.current.scrollHeight
    }
  }, [logs])

  const STATUS_CONFIG = {
    running: { label: '训练中', cls: 'badge-running', icon: <RefreshCw size={10} className="spinning" /> },
    completed: { label: '已完成', cls: 'badge-completed', icon: <CheckCircle2 size={10} /> },
    failed: { label: '训练失败', cls: 'badge-failed', icon: <XCircle size={10} /> },
    pending: { label: '等待中', cls: 'badge-pending', icon: <Clock size={10} /> },
  }

  const sc = STATUS_CONFIG[task.status]

  return (
    <div className="slide-in">
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button onClick={() => router.back()} className="btn btn-ghost btn-sm">
            <ArrowLeft size={16} />
          </button>
          <div>
            <div className="breadcrumb">科宝训练平台 › 训练任务</div>
            <h1 className="page-title">{task.name}</h1>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {task.status === 'completed' && (
            <>
              <button className="btn btn-secondary">
                <Download size={14} /> 下载模型
              </button>
              <button className="btn btn-primary">
                <Rocket size={14} /> 发布到中台
              </button>
            </>
          )}
          {task.status === 'failed' && (
            <button className="btn btn-primary">
              <RefreshCw size={14} /> 重新训练
            </button>
          )}
        </div>
      </div>

      <div className="p-content">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
          <div style={{ gridColumn: 'span 2' }}>
            <div className="card">
              <div className="card-header">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <span className={`badge ${sc.cls}`} style={{ marginRight: 8 }}>
                      {sc.icon} {sc.label}
                    </span>
                    {task.status === 'running' && (
                      <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{task.eta}</span>
                    )}
                  </div>
                  {task.status === 'running' && (
                    <button className="btn btn-ghost btn-sm">
                      <RefreshCw size={14} className="spinning" />
                    </button>
                  )}
                </div>
              </div>
              <div style={{ padding: 24 }}>
                <div className="progress-section">
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                    <span style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-primary)' }}>训练进度</span>
                    <span className="mono" style={{ fontSize: 12 }}>{task.progress}%</span>
                  </div>
                  <div className="progress-bar-lg">
                    <div
                      className={`progress-fill ${task.status === 'failed' ? 'progress-fill-error' : ''}`}
                      style={{ width: `${task.progress}%` }}
                    />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8, fontSize: 10, color: 'var(--text-muted)' }}>
                    <span>Epoch {task.epoch}/{task.totalEpochs}</span>
                    <span>{task.startTime}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="card" style={{ marginTop: 16 }}>
              <div className="card-header">
                <span style={{ fontSize: 12, fontWeight: 600 }}>训练日志</span>
              </div>
              <div ref={logsRef} className="log-terminal">
                {logs.length === 0 ? (
                  <div className="log-empty">
                    {task.status === 'running' ? '等待日志输出...' : '暂无日志'}
                  </div>
                ) : (
                  logs.map((log, i) => (
                    <div key={i} className={`log-line ${log.includes('[ERROR]') ? 'log-error' : log.includes('[WARN]') ? 'log-warning' : log.includes('[INFO]') ? 'log-info' : 'log-default'}`}>
                      {log}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div className="card">
              <div className="card-header">
                <span style={{ fontSize: 12, fontWeight: 600 }}>任务信息</span>
              </div>
              <div className="card-padded">
                <div className="data-row">
                  <span className="data-label">任务ID</span>
                  <span className="mono" style={{ fontSize: 12, color: 'var(--accent)' }}>{task.id}</span>
                </div>
                <div className="data-row">
                  <span className="data-label">基础模型</span>
                  <span className="mono" style={{ fontSize: 12 }}>{task.baseModel}</span>
                </div>
                <div className="data-row">
                  <span className="data-label">数据集</span>
                  <span style={{ fontSize: 12 }}>{task.dataset} ({task.datasetSize}张)</span>
                </div>
                <div className="data-row">
                  <span className="data-label">GPU配置</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12 }}>
                    <Cpu size={12} style={{ color: 'var(--accent)' }} />
                    {task.gpu}
                  </span>
                </div>
                <div className="data-row">
                  <span className="data-label">开始时间</span>
                  <span style={{ fontSize: 12 }}>{task.startTime}</span>
                </div>
                {task.endTime && (
                  <div className="data-row">
                    <span className="data-label">完成时间</span>
                    <span style={{ fontSize: 12 }}>{task.endTime}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="card">
              <div className="card-header">
                <span style={{ fontSize: 12, fontWeight: 600 }}>训练参数</span>
              </div>
              <div className="card-padded">
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
                  {[
                    { label: 'Batch Size', value: task.batchSize, icon: <Settings size={12} /> },
                    { label: 'Learning Rate', value: task.learningRate, icon: <Zap size={12} /> },
                    { label: 'Epochs', value: `${task.epoch}/${task.totalEpochs}`, icon: <TrendingUp size={12} /> },
                  ].map((p) => (
                    <div key={p.label} className="metric-chip">
                      <div className="metric-chip-icon">{p.icon}</div>
                      <div className="metric-chip-value">{p.value}</div>
                      <div className="metric-chip-label">{p.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="card">
              <div className="card-header">
                <span style={{ fontSize: 12, fontWeight: 600 }}>评估指标</span>
              </div>
              <div className="card-padded">
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {[
                    { label: 'mAP@0.5', value: task.metrics.mAP, color: 'var(--success)' },
                    { label: 'Precision', value: task.metrics.precision, color: 'var(--teal)' },
                    { label: 'Recall', value: task.metrics.recall, color: 'var(--warning)' },
                    { label: 'F1 Score', value: task.metrics.f1, color: 'var(--accent-bright)' },
                  ].map((m) => (
                    <div key={m.label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{m.label}</span>
                      <span className="mono" style={{ fontSize: 12, color: m.color }}>
                        {m.value > 0 ? m.value.toFixed(3) : '-'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {task.status === 'failed' && (
              <div className="card card-error">
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                  <AlertTriangle size={14} style={{ color: 'var(--error)' }} />
                  <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--error)' }}>训练失败</span>
                </div>
                <p style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{task.error}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}