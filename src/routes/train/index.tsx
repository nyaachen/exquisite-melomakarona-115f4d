import { createFileRoute, Link } from '@tanstack/react-router'
import { Plus, RefreshCw, CheckCircle2, XCircle, Clock, ArrowRight } from 'lucide-react'

export const Route = createFileRoute('/train/')({
  component: TasksList,
})

const ALL_TASKS = [
  { id: 'task-001', name: '道路缺陷检测 v2.3', dataset: '道路缺陷标注集', images: 4872, baseModel: 'YOLOv8m', status: 'running' as const, progress: 47, epoch: '47/100', mAP: 0.782, createdAt: '2026-04-29 09:14', gpu: 'A100×2', duration: '2h 11min' },
  { id: 'task-002', name: '施工人员安全帽检测', dataset: '安全帽标注集', images: 2391, baseModel: 'YOLOv8s', status: 'completed' as const, progress: 100, epoch: '80/80', mAP: 0.923, createdAt: '2026-04-28 14:30', gpu: 'A100×1', duration: '3h 42min' },
  { id: 'task-003', name: '车牌识别增强版', dataset: '车牌数据集', images: 7840, baseModel: 'YOLOv8l', status: 'failed' as const, progress: 23, epoch: '23/120', mAP: 0, createdAt: '2026-04-27 22:05', gpu: 'A100×4', duration: '54min' },
  { id: 'task-004', name: '工厂设备异常检测', dataset: '设备标注集', images: 1628, baseModel: 'YOLOv8n', status: 'pending' as const, progress: 0, epoch: '0/60', mAP: 0, createdAt: '2026-04-29 10:47', gpu: 'A100×1', duration: '—' },
  { id: 'task-005', name: '人员跌倒检测 v1.0', dataset: '跌倒行为数据集', images: 3210, baseModel: 'YOLOv8s', status: 'completed' as const, progress: 100, epoch: '100/100', mAP: 0.887, createdAt: '2026-04-26 11:20', gpu: 'A100×2', duration: '4h 15min' },
  { id: 'task-006', name: '火焰烟雾检测', dataset: '火焰烟雾标注集', images: 5601, baseModel: 'YOLOv8m', status: 'completed' as const, progress: 100, epoch: '120/120', mAP: 0.911, createdAt: '2026-04-25 08:00', gpu: 'A100×2', duration: '6h 03min' },
]

const STATUS_CONFIG = {
  running: { label: '训练中', cls: 'badge-running', icon: <RefreshCw size={10} className="spinning" /> },
  completed: { label: '已完成', cls: 'badge-completed', icon: <CheckCircle2 size={10} /> },
  failed: { label: '训练失败', cls: 'badge-failed', icon: <XCircle size={10} /> },
  pending: { label: '等待中', cls: 'badge-pending', icon: <Clock size={10} /> },
}

function TasksList() {
  return (
    <div className="slide-in">
      <div className="page-header">
        <div>
          <div className="breadcrumb">科宝训练平台 › 训练任务列表</div>
          <h1 className="page-title">训练任务列表</h1>
        </div>
        <Link to="/train/create" className="btn btn-primary">
          <Plus size={15} /> 创建训练任务
        </Link>
      </div>

      <div className="content-padded">
        <div className="card">
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>任务名称</th>
                  <th>数据集</th>
                  <th>图像数</th>
                  <th>基础模型</th>
                  <th>状态</th>
                  <th>训练进度</th>
                  <th>mAP@0.5</th>
                  <th>耗时</th>
                  <th>创建时间</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {ALL_TASKS.map((task) => {
                  const sc = STATUS_CONFIG[task.status]
                  return (
                    <tr key={task.id}>
                      <td className="primary">{task.name}</td>
                      <td className="text-xs">{task.dataset}</td>
                      <td className="mono text-xs">{task.images.toLocaleString()}</td>
                      <td className="mono">{task.baseModel}</td>
                      <td>
                        <span className={`badge ${sc.cls}`}>{sc.icon} {sc.label}</span>
                      </td>
                      <td style={{ minWidth: 140 }}>
                        <div className="flex items-center gap-2">
                          <div className="progress-bar" style={{ flex: 1 }}>
                            <div className={`progress-fill ${task.status === 'failed' ? 'progress-fill-error' : ''}`}
                              style={{ width: `${task.progress}%` }} />
                          </div>
                          <span className="mono text-xs text-muted flex-shrink-0">
                            {task.epoch}
                          </span>
                        </div>
                      </td>
                      <td className={`mono ${task.mAP > 0 ? 'text-success' : 'text-muted'}`}>
                        {task.mAP > 0 ? task.mAP.toFixed(3) : '—'}
                      </td>
                      <td className="text-xs text-secondary">{task.duration}</td>
                      <td className="text-xs">{task.createdAt}</td>
                      <td>
                        <Link to="/train/$taskId" params={{ taskId: task.id }} className="btn btn-ghost btn-sm">
                          详情 <ArrowRight size={11} />
                        </Link>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
