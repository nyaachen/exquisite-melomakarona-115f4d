import { createFileRoute, Link } from '@tanstack/react-router'
import {
  Cpu,
  CheckCircle2,
  XCircle,
  Clock,
  Package,
  Plus,
  ArrowRight,
  TrendingUp,
  RefreshCw,
} from 'lucide-react'
import { TRAIN_STATUS } from '../constants'

export const Route = createFileRoute('/')({
  component: Dashboard,
})

const MOCK_TASKS = [
  {
    id: 'task-001',
    name: '道路缺陷检测 v2.3',
    dataset: '道路缺陷标注集·4872张',
    baseModel: 'YOLOv8m',
    status: 'running' as const,
    progress: 47,
    epoch: '47/100',
    mAP: 0.782,
    createdAt: '2026-04-29 09:14',
    gpu: 'A100×2',
  },
  {
    id: 'task-002',
    name: '施工人员安全帽检测',
    dataset: '安全帽标注集·2391张',
    baseModel: 'YOLOv8s',
    status: 'completed' as const,
    progress: 100,
    epoch: '80/80',
    mAP: 0.923,
    createdAt: '2026-04-28 14:30',
    gpu: 'A100×1',
  },
  {
    id: 'task-003',
    name: '车牌识别增强版',
    dataset: '车牌数据集·7840张',
    baseModel: 'YOLOv8l',
    status: 'failed' as const,
    progress: 23,
    epoch: '23/120',
    mAP: 0,
    createdAt: '2026-04-27 22:05',
    gpu: 'A100×4',
  },
  {
    id: 'task-004',
    name: '工厂设备异常检测',
    dataset: '设备标注集·1628张',
    baseModel: 'YOLOv8n',
    status: 'pending' as const,
    progress: 0,
    epoch: '0/60',
    mAP: 0,
    createdAt: '2026-04-29 10:47',
    gpu: 'A100×1',
  },
]

const STATS = [
  { label: '训练任务总数', value: '17', delta: '+3 本周', icon: <Cpu size={16} />, color: 'var(--accent)' },
  { label: '正在训练', value: '1', delta: 'GPU 利用率 89%', icon: <RefreshCw size={16} />, color: 'var(--warning)' },
  { label: '已完成任务', value: '12', delta: '成功率 92.3%', icon: <CheckCircle2 size={16} />, color: 'var(--success)' },
  { label: '已发布模型', value: '5', delta: '至科宝智能体中台', icon: <Package size={16} />, color: 'var(--teal)' },
]

const STATUS_ICONS: Record<string, React.ReactNode> = {
  running: <RefreshCw size={10} className="spinning" />,
  completed: <CheckCircle2 size={10} />,
  failed: <XCircle size={10} />,
  pending: <Clock size={10} />,
}

const WEEKLY_STATS = [
  { label: '训练时长', value: '38.4', unit: 'h' },
  { label: '数据量', value: '16.2', unit: 'k张' },
]

const LATEST_PUBLISHED = [
  { name: '安全帽检测 v1.2', map: 0.923, target: '智能体中台·工地安全', time: '昨天 16:22' },
  { name: '车辆检测 v3.1', map: 0.891, target: '智能体中台·交通分析', time: '4月27日' },
]

function Dashboard() {
  return (
    <div className="slide-in">
      <div className="page-header">
        <div>
          <div className="breadcrumb">
            <span>科宝训练平台</span>
            <span>›</span>
            <span>训练概览</span>
          </div>
          <h1 className="page-title">训练概览</h1>
        </div>
        <Link to="/train/create" className="btn btn-primary">
          <Plus size={15} />
          创建训练任务
        </Link>
      </div>

      <div className="p-content">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, marginBottom: 16 }}>
          {STATS.map((s) => (
            <div key={s.label} className="stat-card">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span className="stat-label">{s.label}</span>
                <div className="stat-icon" style={{ background: `${s.color}22`, color: s.color }}>
                  {s.icon}
                </div>
              </div>
              <div className="stat-value" style={{ color: s.color }}>{s.value}</div>
            </div>
          ))}
        </div>

        <div className="card">
          <div className="card-header">
            <span style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-primary)' }}>最近训练任务</span>
            <Link to="/train" style={{ fontSize: 12, color: 'var(--accent-bright)', display: 'flex', alignItems: 'center', gap: 4 }}>
              查看全部 <ArrowRight size={12} />
            </Link>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>任务名称</th>
                  <th>数据集</th>
                  <th>基础模型</th>
                  <th>状态</th>
                  <th>训练进度</th>
                  <th>mAP@0.5</th>
                  <th>创建时间</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {MOCK_TASKS.map((task) => {
                  const sc = TRAIN_STATUS[task.status]
                  const ic = STATUS_ICONS[task.status]
                  return (
                    <tr key={task.id}>
                      <td className="primary">{task.name}</td>
                      <td style={{ fontSize: 12 }}>{task.dataset}</td>
                      <td className="mono">{task.baseModel}</td>
                      <td>
                        <span className={`badge ${sc.cls}`}>
                          {ic} {sc.label}
                        </span>
                      </td>
                      <td style={{ minWidth: 128 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <div className="progress-bar" style={{ flex: 1 }}>
                            <div
                              className={`progress-fill ${task.status === 'failed' ? 'progress-fill-error' : ''}`}
                              style={{ width: `${task.progress}%` }}
                            />
                          </div>
                          <span className="mono" style={{ fontSize: 10, color: 'var(--text-muted)', flexShrink: 0 }}>
                            {task.epoch}
                          </span>
                        </div>
                      </td>
                      <td className={`mono ${task.mAP > 0 ? '' : ''}`} style={{ color: task.mAP > 0 ? 'var(--success)' : 'var(--text-muted)' }}>
                        {task.mAP > 0 ? task.mAP.toFixed(3) : '—'}
                      </td>
                      <td style={{ fontSize: 12 }}>{task.createdAt}</td>
                      <td>
                        <Link
                          to="/train/$taskId"
                          params={{ taskId: task.id }}
                          className="btn btn-ghost btn-sm"
                        >
                          详情
                        </Link>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16, marginTop: 20 }}>
          <div className="card card-padded">
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
              <TrendingUp size={14} style={{ color: 'var(--accent-bright)' }} />
              <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)' }}>本周训练统计</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
              {WEEKLY_STATS.map((m) => (
                <div key={m.label} className="metric-chip">
                  <div className="metric-chip-value">{m.value}<span style={{ fontSize: 10 }}>{m.unit}</span></div>
                  <div className="metric-chip-label">{m.label}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="card card-padded">
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
              <Package size={14} style={{ color: 'var(--teal)' }} />
              <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)' }}>最新发布模型</span>
            </div>
            {LATEST_PUBLISHED.map((m) => (
              <div key={m.name} className="data-row">
                <div>
                  <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-primary)' }}>{m.name}</div>
                  <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 2 }}>{m.target}</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: 'var(--success)' }}>{m.map}</span>
                  <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>{m.time}</span>
                </div>
              </div>
            ))}
            <Link to="/models" className="btn btn-ghost btn-sm" style={{ width: '100%', justifyContent: 'center', marginTop: 12 }}>
              管理所有模型
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}