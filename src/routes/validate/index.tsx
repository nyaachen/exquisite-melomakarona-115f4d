import { createFileRoute, Link } from '@tanstack/react-router'
import { Plus, CheckCircle2, XCircle, Clock, RefreshCw, ArrowRight, Target } from 'lucide-react'
import { VALIDATE_STATUS } from '../../constants'

export const Route = createFileRoute('/validate/')({
  component: ValidateList,
})

interface ValidateTask {
  id: string
  name: string
  modelId: string
  modelName: string
  datasetId: string
  datasetName: string
  status: 'running' | 'completed' | 'failed' | 'pending'
  progress: number
  mAP?: number
  precision?: number
  recall?: number
  f1?: number
  createdAt: string
  completedAt?: string
}

const VALIDATE_TASKS: ValidateTask[] = [
  {
    id: 'val-001',
    name: '道路缺陷检测 v2.3 验证',
    modelId: 'model-001',
    modelName: '道路缺陷检测 v2.3',
    datasetId: 'ds-001',
    datasetName: '道路缺陷测试集',
    status: 'completed',
    progress: 100,
    mAP: 0.765,
    precision: 0.812,
    recall: 0.731,
    f1: 0.770,
    createdAt: '2026-04-29 14:30',
    completedAt: '2026-04-29 14:45',
  },
  {
    id: 'val-002',
    name: '安全帽检测模型验证',
    modelId: 'model-002',
    modelName: '施工安全帽检测 v1.0',
    datasetId: 'ds-002',
    datasetName: '安全帽测试集',
    status: 'completed',
    progress: 100,
    mAP: 0.918,
    precision: 0.935,
    recall: 0.902,
    f1: 0.918,
    createdAt: '2026-04-28 16:00',
    completedAt: '2026-04-28 16:12',
  },
  {
    id: 'val-003',
    name: '跌倒检测交叉验证',
    modelId: 'model-003',
    modelName: '人员跌倒检测 v1.0',
    datasetId: 'ds-003',
    datasetName: '跌倒行为测试集',
    status: 'running',
    progress: 67,
    createdAt: '2026-04-29 15:00',
  },
  {
    id: 'val-004',
    name: '火焰烟雾模型验证',
    modelId: 'model-004',
    modelName: '火焰烟雾检测 v2.1',
    datasetId: 'ds-004',
    datasetName: '火焰烟雾测试集',
    status: 'failed',
    progress: 45,
    createdAt: '2026-04-27 10:30',
  },
  {
    id: 'val-005',
    name: '道路缺陷检测 v2.2 验证',
    modelId: 'model-old-001',
    modelName: '道路缺陷检测 v2.2',
    datasetId: 'ds-001',
    datasetName: '道路缺陷测试集',
    status: 'completed',
    progress: 100,
    mAP: 0.742,
    precision: 0.795,
    recall: 0.708,
    f1: 0.750,
    createdAt: '2026-04-10 09:15',
    completedAt: '2026-04-10 09:28',
  },
]

const STATUS_ICONS: Record<string, React.ReactNode> = {
  running: <RefreshCw size={10} className="spinning" />,
  completed: <CheckCircle2 size={10} />,
  failed: <XCircle size={10} />,
  pending: <Clock size={10} />,
}

function ValidateList() {
  return (
    <div style={{ animation: 'slideIn 0.3s ease-out' }}>
      <div className="page-header">
        <div>
          <div className="breadcrumb">科宝训练平台 › 验证任务</div>
          <h1 className="page-title">验证任务列表</h1>
        </div>
        <Link to="/validate/create" className="btn btn-primary">
          <Plus size={15} /> 创建验证任务
        </Link>
      </div>

      <div style={{ padding: '24px 32px' }}>
        <div className="card">
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>任务名称</th>
                  <th>模型</th>
                  <th>数据集</th>
                  <th>状态</th>
                  <th>进度</th>
                  <th>mAP@0.5</th>
                  <th>F1 Score</th>
                  <th>创建时间</th>
                  <th>完成时间</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {VALIDATE_TASKS.map((task) => {
                  const sc = VALIDATE_STATUS[task.status]
                  const ic = STATUS_ICONS[task.status]
                  return (
                    <tr key={task.id}>
                      <td className="primary">{task.name}</td>
                      <td style={{ fontSize: 12 }}>{task.modelName}</td>
                      <td style={{ fontSize: 12 }}>{task.datasetName}</td>
                      <td>
                        <span className={`badge ${sc.cls}`}>{ic} {sc.label}</span>
                      </td>
                      <td style={{ minWidth: 120 }}>
                        <div className="progress-bar" style={{ flex: 1 }}>
                          <div className={`progress-fill ${task.status === 'failed' ? 'progress-fill-error' : ''}`}
                            style={{ width: `${task.progress}%` }} />
                        </div>
                        <span className="mono" style={{ fontSize: 11, color: 'var(--text-muted)', marginLeft: 8 }}>
                          {task.progress}%
                        </span>
                      </td>
                      <td className="mono" style={{ color: task.mAP ? 'var(--success)' : 'var(--text-muted)' }}>
                        {task.mAP ? task.mAP.toFixed(3) : '—'}
                      </td>
                      <td className="mono" style={{ color: task.f1 ? 'var(--accent-bright)' : 'var(--text-muted)' }}>
                        {task.f1 ? task.f1.toFixed(3) : '—'}
                      </td>
                      <td style={{ fontSize: 12 }}>{task.createdAt}</td>
                      <td style={{ fontSize: 12 }}>{task.completedAt || '—'}</td>
                      <td>
                        <Link to="/validate/$taskId" params={{ taskId: task.id }} className="btn btn-ghost btn-sm">
                          {task.status === 'completed' ? '查看结果' : '详情'}
                          <ArrowRight size={11} />
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