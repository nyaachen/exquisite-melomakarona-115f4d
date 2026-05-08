import { createFileRoute, Link } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { ArrowLeft, CheckCircle2, XCircle, RefreshCw, AlertCircle, Award, Target, Zap, Clock } from 'lucide-react'
import { NotFound } from '../../components/NotFound'
import { getGrade } from '../../constants'

export const Route = createFileRoute('/validate/$taskId')({
  component: ValidateDetail,
})

interface ValidateResult {
  mAP: number
  precision: number
  recall: number
  f1: number
  confusionMatrix: number[][]
  classMetrics: { className: string; precision: number; recall: number; f1: number; support: number }[]
}

interface ValidateTask {
  id: string
  name: string
  modelId: string
  modelName: string
  baseModel: string
  datasetId: string
  datasetName: string
  images: number
  status: 'running' | 'completed' | 'failed' | 'pending'
  progress: number
  result?: ValidateResult
  createdAt: string
  completedAt?: string
  duration?: string
}

const VALIDATE_RESULTS: Record<string, ValidateTask> = {
  'val-001': {
    id: 'val-001',
    name: '道路缺陷检测 v2.3 验证',
    modelId: 'model-001',
    modelName: '道路缺陷检测 v2.3',
    baseModel: 'YOLOv8m',
    datasetId: 'ds-001',
    datasetName: '道路缺陷测试集',
    images: 975,
    status: 'completed',
    progress: 100,
    createdAt: '2026-04-29 14:30',
    completedAt: '2026-04-29 14:45',
    duration: '15分钟',
    result: {
      mAP: 0.765,
      precision: 0.812,
      recall: 0.731,
      f1: 0.770,
      confusionMatrix: [
        [185, 12, 8, 5, 3, 2, 1],
        [8, 165, 15, 6, 4, 3, 2],
        [5, 10, 195, 8, 5, 3, 2],
        [3, 6, 12, 178, 10, 4, 2],
        [2, 4, 6, 8, 155, 12, 3],
        [1, 3, 4, 5, 8, 145, 4],
        [0, 2, 3, 4, 6, 5, 135],
      ],
      classMetrics: [
        { className: '裂缝', precision: 0.892, recall: 0.886, f1: 0.889, support: 216 },
        { className: '坑洼', precision: 0.851, recall: 0.825, f1: 0.838, support: 200 },
        { className: '破损', precision: 0.847, recall: 0.887, f1: 0.867, support: 230 },
        { className: '剥落', precision: 0.796, recall: 0.848, f1: 0.821, support: 215 },
        { className: '标线模糊', precision: 0.784, recall: 0.816, f1: 0.800, support: 190 },
        { className: '积水', precision: 0.869, recall: 0.878, f1: 0.873, support: 170 },
        { className: '障碍物', precision: 0.938, recall: 0.894, f1: 0.915, support: 155 },
      ],
    },
  },
  'val-002': {
    id: 'val-002',
    name: '安全帽检测模型验证',
    modelId: 'model-002',
    modelName: '施工安全帽检测 v1.0',
    baseModel: 'YOLOv8s',
    datasetId: 'ds-002',
    datasetName: '安全帽测试集',
    images: 478,
    status: 'completed',
    progress: 100,
    createdAt: '2026-04-28 16:00',
    completedAt: '2026-04-28 16:12',
    duration: '12分钟',
    result: {
      mAP: 0.918,
      precision: 0.935,
      recall: 0.902,
      f1: 0.918,
      confusionMatrix: [
        [215, 8, 5],
        [6, 185, 8],
        [4, 6, 157],
      ],
      classMetrics: [
        { className: '安全帽', precision: 0.957, recall: 0.943, f1: 0.950, support: 228 },
        { className: '无安全帽', precision: 0.925, recall: 0.925, f1: 0.925, support: 199 },
        { className: '人员', precision: 0.929, recall: 0.940, f1: 0.934, support: 167 },
      ],
    },
  },
  'val-003': {
    id: 'val-003',
    name: '跌倒检测交叉验证',
    modelId: 'model-003',
    modelName: '人员跌倒检测 v1.0',
    baseModel: 'YOLOv8s',
    datasetId: 'ds-003',
    datasetName: '跌倒行为测试集',
    images: 642,
    status: 'running',
    progress: 67,
    createdAt: '2026-04-29 15:00',
  },
  'val-004': {
    id: 'val-004',
    name: '火焰烟雾模型验证',
    modelId: 'model-004',
    modelName: '火焰烟雾检测 v2.1',
    baseModel: 'YOLOv8m',
    datasetId: 'ds-004',
    datasetName: '火焰烟雾测试集',
    images: 1120,
    status: 'failed',
    progress: 45,
    createdAt: '2026-04-27 10:30',
  },
}

function ValidateDetail() {
  const { taskId } = Route.useParams()
  const task = VALIDATE_RESULTS[taskId]
  if (!task) return <NotFound />
  const [isRefreshing, setIsRefreshing] = useState(false)

  useEffect(() => {
    if (task.status === 'running') {
      const interval = setInterval(() => {
        console.log('Simulating progress update...')
      }, 2000)
      return () => clearInterval(interval)
    }
  }, [task.status])

  function RenderIcon({ icon, size = 14, style }: { icon: string; size?: number; style?: React.CSSProperties }) {
    const iconProps = { size, style }
    switch (icon) {
      case 'CheckCircle2': return <CheckCircle2 {...iconProps} />
      case 'AlertCircle': return <AlertCircle {...iconProps} />
      case 'XCircle': return <XCircle {...iconProps} />
      default: return <CheckCircle2 {...iconProps} />
    }
  }

  const overallGrade = task.result ? getGrade(task.result.mAP) : null

  return (
    <div style={{ animation: 'slideIn 0.3s ease-out' }}>
      <div className="page-header">
        <div>
          <div className="breadcrumb">
            <Link to="/">科宝训练平台</Link> ›
            <Link to="/validate">验证任务</Link> ›
            <span>{task.name}</span>
          </div>
          <h1 className="page-title">{task.name}</h1>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {task.status === 'running' && (
            <button className="btn btn-secondary" onClick={() => setIsRefreshing(true)} disabled={isRefreshing}>
              {isRefreshing ? (
                <span className="spinner" style={{ width: 14, height: 14 }} />
              ) : (
                <RefreshCw size={14} />
              )}
              刷新
            </button>
          )}
          <Link to="/validate" className="btn btn-secondary">
            <ArrowLeft size={14} /> 返回列表
          </Link>
        </div>
      </div>

      <div style={{ padding: '24px 32px' }}>
        <div className="card" style={{ padding: 20, marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', gap: 16 }}>
              <div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>验证状态</div>
                <span className={`badge ${
                  task.status === 'completed' ? 'badge-completed' :
                  task.status === 'running' ? 'badge-running' :
                  task.status === 'failed' ? 'badge-failed' : 'badge-pending'
                }`}>
                  {task.status === 'completed' && <CheckCircle2 size={10} />}
                  {task.status === 'running' && <RefreshCw size={10} className="spinning" />}
                  {task.status === 'failed' && <XCircle size={10} />}
                  {task.status === 'pending' && <Clock size={10} />}
                  {task.status === 'completed' ? '已完成' :
                   task.status === 'running' ? '验证中' :
                   task.status === 'failed' ? '验证失败' : '等待中'}
                </span>
              </div>
              <div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>模型</div>
                <span style={{ fontSize: 13, color: 'var(--text-primary)' }}>{task.modelName}</span>
              </div>
              <div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>数据集</div>
                <span style={{ fontSize: 13, color: 'var(--text-primary)' }}>{task.datasetName}</span>
              </div>
              <div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>图片数量</div>
                <span style={{ fontSize: 13, color: 'var(--text-primary)' }}>{task.images.toLocaleString()} 张</span>
              </div>
              <div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>耗时</div>
                <span style={{ fontSize: 13, color: 'var(--text-primary)' }}>{task.duration || '—'}</span>
              </div>
            </div>
            {task.status === 'running' && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 200 }}>
                  <div className="progress-bar">
                    <div className="progress-fill" style={{ width: `${task.progress}%` }} />
                  </div>
                </div>
                <span className="mono" style={{ fontSize: 12, color: 'var(--accent-bright)' }}>{task.progress}%</span>
              </div>
            )}
          </div>
        </div>

        {task.status === 'running' && (
          <div className="card" style={{ padding: 24, textAlign: 'center' }}>
            <div style={{ width: 60, height: 60, margin: '0 auto 16px', border: 4, borderStyle: 'solid', borderColor: 'transparent var(--accent) var(--accent) var(--accent)', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
            <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 8 }}>验证进行中</div>
            <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>正在对 {task.images.toLocaleString()} 张图片进行推理评估...</div>
          </div>
        )}

        {task.status === 'failed' && (
          <div className="card" style={{ padding: 24, background: 'var(--error-glow)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <XCircle size={32} style={{ color: 'var(--error)' }} />
              <div>
                <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--error)', marginBottom: 4 }}>验证失败</div>
                <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>验证过程中发生错误，请检查模型文件和数据集配置后重新验证</div>
              </div>
            </div>
          </div>
        )}

        {task.status === 'completed' && task.result && (
          <>
            <div className="card" style={{ padding: 24, marginBottom: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
                <Award size={18} style={{ color: getGrade(task.result.mAP).color }} />
                <span style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-primary)' }}>验证结果评价</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 16 }}>
                <div style={{ textAlign: 'center', padding: '20px', background: 'var(--bg-elevated)', borderRadius: 12 }}>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 8 }}>mAP@0.5</div>
                  <div style={{ fontSize: 28, fontWeight: 700, color: getGrade(task.result.mAP).color, fontFamily: 'JetBrains Mono' }}>
                    {task.result.mAP.toFixed(3)}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, marginTop: 8 }}>
                    <RenderIcon icon={getGrade(task.result.mAP).icon} size={14} style={{ color: getGrade(task.result.mAP).color }} />
                    <span style={{ fontSize: 12, fontWeight: 600, color: getGrade(task.result.mAP).color }}>{getGrade(task.result.mAP).label}</span>
                  </div>
                </div>
                <div style={{ textAlign: 'center', padding: '20px', background: 'var(--bg-elevated)', borderRadius: 12 }}>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 8 }}>Precision</div>
                  <div style={{ fontSize: 28, fontWeight: 700, color: 'var(--teal)', fontFamily: 'JetBrains Mono' }}>
                    {task.result.precision.toFixed(3)}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, marginTop: 8 }}>
                    <RenderIcon icon={getGrade(task.result.precision).icon} size={14} style={{ color: getGrade(task.result.precision).color }} />
                    <span style={{ fontSize: 12, fontWeight: 600, color: getGrade(task.result.precision).color }}>
                      {getGrade(task.result.precision).label}
                    </span>
                  </div>
                </div>
                <div style={{ textAlign: 'center', padding: '20px', background: 'var(--bg-elevated)', borderRadius: 12 }}>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 8 }}>Recall</div>
                  <div style={{ fontSize: 28, fontWeight: 700, color: 'var(--warning)', fontFamily: 'JetBrains Mono' }}>
                    {task.result.recall.toFixed(3)}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, marginTop: 8 }}>
                    <RenderIcon icon={getGrade(task.result.recall).icon} size={14} style={{ color: getGrade(task.result.recall).color }} />
                    <span style={{ fontSize: 12, fontWeight: 600, color: getGrade(task.result.recall).color }}>
                      {getGrade(task.result.recall).label}
                    </span>
                  </div>
                </div>
                <div style={{ textAlign: 'center', padding: '20px', background: 'var(--bg-elevated)', borderRadius: 12 }}>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 8 }}>F1 Score</div>
                  <div style={{ fontSize: 28, fontWeight: 700, color: 'var(--accent-bright)', fontFamily: 'JetBrains Mono' }}>
                    {task.result.f1.toFixed(3)}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, marginTop: 8 }}>
                    <RenderIcon icon={getGrade(task.result.f1).icon} size={14} style={{ color: getGrade(task.result.f1).color }} />
                    <span style={{ fontSize: 12, fontWeight: 600, color: getGrade(task.result.f1).color }}>
                      {getGrade(task.result.f1).label}
                    </span>
                  </div>
                </div>
                <div style={{ textAlign: 'center', padding: '20px', background: `${overallGrade.color}15`, borderRadius: 12, border: `1px solid ${overallGrade.color}30` }}>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 8 }}>综合评价</div>
                  <div style={{ fontSize: 32, fontWeight: 700, color: overallGrade.color }}>
                    {overallGrade.label}
                  </div>
                  <div style={{ marginTop: 8 }}>
                    <overallGrade.icon size={24} style={{ color: overallGrade.color }} />
                  </div>
                </div>
              </div>
            </div>

            <div className="card" style={{ padding: 24 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
                <Target size={18} style={{ color: 'var(--accent-bright)' }} />
                <span style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-primary)' }}>类别详细指标</span>
              </div>
              <div style={{ overflowX: 'auto' }}>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>类别</th>
                      <th>Precision</th>
                      <th>Recall</th>
                      <th>F1 Score</th>
                      <th>Support</th>
                      <th>评价</th>
                    </tr>
                  </thead>
                  <tbody>
                    {task.result.classMetrics.map((cm) => {
                      const grade = getGrade(cm.f1)
                      return (
                        <tr key={cm.className}>
                          <td className="primary">{cm.className}</td>
                          <td className="mono" style={{ color: 'var(--teal)' }}>{cm.precision.toFixed(3)}</td>
                          <td className="mono" style={{ color: 'var(--warning)' }}>{cm.recall.toFixed(3)}</td>
                          <td className="mono" style={{ color: 'var(--accent-bright)' }}>{cm.f1.toFixed(3)}</td>
                          <td className="mono">{cm.support}</td>
                          <td>
                            <span className="badge" style={{ background: `${grade.color}15`, color: grade.color, borderColor: `${grade.color}30` }}>
                              <RenderIcon icon={grade.icon} size={10} /> {grade.label}
                            </span>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}