import { createFileRoute, Link } from '@tanstack/react-router'
import { useState } from 'react'
import { Plus, CheckCircle2, XCircle, Clock, RefreshCw, ArrowRight, Target, Search } from 'lucide-react'
import { VALIDATE_STATUS } from '../../constants'
import { VALIDATE_TASKS } from '../../data/validate'

export const Route = createFileRoute('/validate/')({
  component: ValidateList,
})

const STATUS_ICONS: Record<string, React.ReactNode> = {
  running: <RefreshCw size={10} className="spinning" />,
  completed: <CheckCircle2 size={10} />,
  failed: <XCircle size={10} />,
  pending: <Clock size={10} />,
}

function ValidateList() {
  const [searchQuery, setSearchQuery] = useState('')

  const tasks = Object.values(VALIDATE_TASKS)

  const filtered = tasks.filter(t =>
    t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.modelName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.datasetName.toLowerCase().includes(searchQuery.toLowerCase())
  )

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
          <div className="card-header">
            <div className="search-input">
              <Search size={14} style={{ color: 'var(--text-muted)' }} />
              <input
                type="text"
                placeholder="搜索任务名称、模型或数据集..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input-field"
              />
            </div>
          </div>
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
                {filtered.map((task) => {
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
                      <td className="mono" style={{ color: task.result?.mAP ? 'var(--success)' : 'var(--text-muted)' }}>
                        {task.result?.mAP ? task.result.mAP.toFixed(3) : '—'}
                      </td>
                      <td className="mono" style={{ color: task.result?.f1 ? 'var(--accent-bright)' : 'var(--text-muted)' }}>
                        {task.result?.f1 ? task.result.f1.toFixed(3) : '—'}
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