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
  AlertCircle,
  RefreshCw,
} from 'lucide-react'

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

const STATUS_CONFIG = {
  running: { label: '训练中', cls: 'badge-running', icon: <RefreshCw size={10} className="spinning" /> },
  completed: { label: '已完成', cls: 'badge-completed', icon: <CheckCircle2 size={10} /> },
  failed: { label: '训练失败', cls: 'badge-failed', icon: <XCircle size={10} /> },
  pending: { label: '等待中', cls: 'badge-pending', icon: <Clock size={10} /> },
}

function Dashboard() {
  return (
    <div style={{ animation: 'slideIn 0.3s ease-out' }}>
      {/* Header */}
      <div className="page-header">
        <div>
          <div className="breadcrumb">
            <span>科宝训练平台</span>
            <span>›</span>
            <span>训练概览</span>
          </div>
          <h1 className="page-title">训练概览</h1>
        </div>
        <Link to="/tasks/create" className="btn btn-primary">
          <Plus size={15} />
          创建训练任务
        </Link>
      </div>

      <div style={{ padding: '24px 32px' }}>
        {/* Stat Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 28 }}>
          {STATS.map((s) => (
            <div key={s.label} className="stat-card">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span className="stat-label">{s.label}</span>
                <div className="stat-icon" style={{ background: `${s.color}22`, color: s.color }}>
                  {s.icon}
                </div>
              </div>
              <div className="stat-value" style={{ color: s.color }}>{s.value}</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>{s.delta}</div>
            </div>
          ))}
        </div>

        {/* Alert for running task */}
        <div style={{
          background: 'rgba(27,107,239,0.07)',
          border: '1px solid rgba(27,107,239,0.2)',
          borderRadius: 10,
          padding: '12px 16px',
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          marginBottom: 24,
          fontSize: 13,
        }}>
          <AlertCircle size={15} style={{ color: 'var(--accent-bright)', flexShrink: 0 }} />
          <span style={{ color: 'var(--text-secondary)' }}>
            任务 <strong style={{ color: 'var(--text-primary)' }}>道路缺陷检测 v2.3</strong> 正在 A100×2 上训练，当前 Epoch 47/100，预计剩余时间 <strong style={{ color: 'var(--text-primary)' }}>2h 34min</strong>
          </span>
          <Link to="/tasks/$taskId" params={{ taskId: 'task-001' }}
            className="btn btn-ghost btn-sm" style={{ marginLeft: 'auto', flexShrink: 0 }}>
            查看详情 <ArrowRight size={12} />
          </Link>
        </div>

        {/* Task Table */}
        <div className="card">
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-dim)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>最近训练任务</span>
            <Link to="/tasks" style={{ fontSize: 12, color: 'var(--accent-bright)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4 }}>
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
                  const sc = STATUS_CONFIG[task.status]
                  return (
                    <tr key={task.id}>
                      <td className="primary">{task.name}</td>
                      <td style={{ fontSize: 12 }}>{task.dataset}</td>
                      <td className="mono">{task.baseModel}</td>
                      <td>
                        <span className={`badge ${sc.cls}`}>
                          {sc.icon} {sc.label}
                        </span>
                      </td>
                      <td style={{ minWidth: 140 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <div className="progress-bar" style={{ flex: 1 }}>
                            <div
                              className={`progress-fill ${task.status === 'failed' ? 'progress-fill-error' : ''}`}
                              style={{ width: `${task.progress}%` }}
                            />
                          </div>
                          <span className="mono" style={{ fontSize: 11, color: 'var(--text-muted)', flexShrink: 0 }}>
                            {task.epoch}
                          </span>
                        </div>
                      </td>
                      <td className="mono" style={{ color: task.mAP > 0 ? 'var(--success)' : 'var(--text-muted)' }}>
                        {task.mAP > 0 ? task.mAP.toFixed(3) : '—'}
                      </td>
                      <td style={{ fontSize: 12 }}>{task.createdAt}</td>
                      <td>
                        <Link
                          to="/tasks/$taskId"
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

        {/* Quick Info */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginTop: 20 }}>
          <div className="card" style={{ padding: 20 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
              <TrendingUp size={14} style={{ color: 'var(--accent-bright)' }} />
              本周训练统计
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
              {[
                { label: '训练时长', value: '38.4h', unit: '' },
                { label: 'GPU 使用', value: '87.2', unit: '%' },
                { label: '数据量', value: '16.2', unit: 'k张' },
              ].map((m) => (
                <div key={m.label} className="metric-chip">
                  <div className="metric-chip-value">{m.value}<span style={{ fontSize: 11 }}>{m.unit}</span></div>
                  <div className="metric-chip-label">{m.label}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="card" style={{ padding: 20 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Package size={14} style={{ color: 'var(--teal)' }} />
              最新发布模型
            </div>
            {[
              { name: '安全帽检测 v1.2', map: 0.923, target: '智能体中台·工地安全', time: '昨天 16:22' },
              { name: '车辆检测 v3.1', map: 0.891, target: '智能体中台·交通分析', time: '4月27日' },
            ].map((m) => (
              <div key={m.name} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border-dim)' }}>
                <div>
                  <div style={{ fontSize: 13, color: 'var(--text-primary)', fontWeight: 500 }}>{m.name}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{m.target}</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontFamily: 'JetBrains Mono', fontSize: 12, color: 'var(--success)' }}>{m.map}</span>
                  <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>{m.time}</span>
                </div>
              </div>
            ))}
            <Link to="/models" className="btn btn-ghost btn-sm" style={{ marginTop: 12, width: '100%', justifyContent: 'center' }}>
              管理所有模型
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
