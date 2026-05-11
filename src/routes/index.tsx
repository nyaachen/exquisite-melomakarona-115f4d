import { createFileRoute, Link } from '@tanstack/react-router'
import {
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
import { ALL_TASKS } from '../data/train-tasks'
import { STATS, WEEKLY_STATS, LATEST_PUBLISHED } from '../data/dashboard'

export const Route = createFileRoute('/')({
  component: Dashboard,
})

const STATUS_ICONS: Record<string, React.ReactNode> = {
  running: <RefreshCw size={10} className="spinning" />,
  completed: <CheckCircle2 size={10} />,
  failed: <XCircle size={10} />,
  pending: <Clock size={10} />,
}

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
                {ALL_TASKS.map((task) => {
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
            <Link to="/plaza" className="btn btn-ghost btn-sm" style={{ width: '100%', justifyContent: 'center', marginTop: 12 }}>
              管理所有模型
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}