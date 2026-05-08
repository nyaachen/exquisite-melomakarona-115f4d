import { createFileRoute, Link } from '@tanstack/react-router'
import { useState } from 'react'
import {
  Plus,
  Search,
  Filter,
  RefreshCw,
  CheckCircle2,
  XCircle,
  Clock,
  Cpu,
  ArrowRight,
} from 'lucide-react'
import { TRAIN_STATUS } from '../../constants'

export const Route = createFileRoute('/train/')({
  component: TasksList,
})

const ALL_TASKS = [
  { id: 'task-001', name: '道路缺陷检测 v2.3', dataset: '道路缺陷标注集', images: 4872, baseModel: 'YOLOv8m', status: 'running' as const, progress: 47, epoch: '47/100', mAP: 0.782, createdAt: '2026-04-29 09:14', gpu: 'A100×2', eta: '预计 2小时15分' },
  { id: 'task-002', name: '施工人员安全帽检测', dataset: '安全帽标注集', images: 2391, baseModel: 'YOLOv8s', status: 'completed' as const, progress: 100, epoch: '80/80', mAP: 0.923, createdAt: '2026-04-28 14:30', gpu: 'A100×1', eta: '-' },
  { id: 'task-003', name: '车牌识别增强版', dataset: '车牌数据集', images: 7840, baseModel: 'YOLOv8l', status: 'failed' as const, progress: 23, epoch: '23/120', mAP: 0, createdAt: '2026-04-27 22:05', gpu: 'A100×4', eta: '-' },
  { id: 'task-004', name: '工厂设备异常检测', dataset: '设备标注集', images: 1628, baseModel: 'YOLOv8n', status: 'pending' as const, progress: 0, epoch: '0/60', mAP: 0, createdAt: '2026-04-29 10:47', gpu: 'A100×1', eta: '排队中' },
  { id: 'task-005', name: '人员跌倒检测 v1.0', dataset: '跌倒行为数据集', images: 3210, baseModel: 'YOLOv8s', status: 'completed' as const, progress: 100, epoch: '100/100', mAP: 0.887, createdAt: '2026-04-26 11:20', gpu: 'A100×2', eta: '-' },
  { id: 'task-006', name: '火焰烟雾检测', dataset: '火焰烟雾标注集', images: 5601, baseModel: 'YOLOv8m', status: 'completed' as const, progress: 100, epoch: '120/120', mAP: 0.911, createdAt: '2026-04-25 08:00', gpu: 'A100×2', eta: '-' },
]

const STATUS_ICONS: Record<string, React.ReactNode> = {
  running: <RefreshCw size={10} className="spinning" />,
  completed: <CheckCircle2 size={10} />,
  failed: <XCircle size={10} />,
  pending: <Clock size={10} />,
}

function TasksList() {
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')

  const filteredTasks = ALL_TASKS.filter(task => {
    const matchesSearch = task.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.dataset.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === 'all' || task.status === statusFilter
    return matchesSearch && matchesStatus
  })

  return (
    <div className="slide-in">
      <div className="page-header">
        <div>
          <div className="breadcrumb">科宝训练平台 › 训练任务</div>
          <h1 className="page-title">训练任务</h1>
        </div>
        <Link to="/train/create" className="btn btn-primary">
          <Plus size={15} /> 创建训练任务
        </Link>
      </div>

      <div className="p-content">
        <div className="card">
          <div className="card-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div className="search-input">
                <Search size={14} style={{ color: 'var(--text-muted)' }} />
                <input
                  type="text"
                  placeholder="搜索任务名称或数据集..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="search-input-field"
                />
              </div>
              <div className="filter-select">
                <Filter size={14} style={{ color: 'var(--text-muted)' }} />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="filter-select-field"
                >
                  <option value="all">全部状态</option>
                  <option value="running">训练中</option>
                  <option value="completed">已完成</option>
                  <option value="pending">等待中</option>
                  <option value="failed">训练失败</option>
                </select>
              </div>
            </div>
            <button className="btn btn-ghost btn-sm">
              <RefreshCw size={14} /> 刷新
            </button>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>任务名称</th>
                  <th>数据集</th>
                  <th>基础模型</th>
                  <th>GPU</th>
                  <th>状态</th>
                  <th>训练进度</th>
                  <th>mAP@0.5</th>
                  <th>预计完成</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {filteredTasks.map((task) => {
                  const sc = TRAIN_STATUS[task.status]
                  const ic = STATUS_ICONS[task.status]
                  return (
                    <tr key={task.id}>
                      <td className="primary">{task.name}</td>
                      <td style={{ fontSize: 12 }}>{task.dataset}</td>
                      <td className="mono">{task.baseModel}</td>
                      <td className="mono" style={{ fontSize: 12 }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                          <Cpu size={12} style={{ color: 'var(--accent)' }} />
                          {task.gpu}
                        </span>
                      </td>
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
                      <td className="mono" style={{ color: task.mAP > 0 ? 'var(--success)' : 'var(--text-muted)' }}>
                        {task.mAP > 0 ? task.mAP.toFixed(3) : '—'}
                      </td>
                      <td style={{ fontSize: 12 }}>{task.eta}</td>
                      <td>
                        <Link
                          to="/train/$taskId"
                          params={{ taskId: task.id }}
                          className="btn btn-ghost btn-sm"
                        >
                          详情 <ArrowRight size={12} />
                        </Link>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {filteredTasks.length === 0 && (
            <div className="empty-state">
              <div className="empty-state-icon">
                <Search size={32} />
              </div>
              <div className="empty-state-text">没有找到匹配的任务</div>
              <div className="empty-state-hint">尝试调整搜索关键词或筛选条件</div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
