import { createFileRoute, Link } from '@tanstack/react-router'
import { RefreshCw, CheckCircle2, Layers, ArrowRight } from 'lucide-react'

export const Route = createFileRoute('/datasets/')({
  component: DatasetsPage,
})

const DATASETS = [
  { id: 'ds-001', name: '道路缺陷检测数据集 v2.3', images: 4872, classes: 8, labeled: 4721, synced: '2026-04-29 08:30', status: 'synced' },
  { id: 'ds-002', name: '施工安全帽检测集', images: 2391, classes: 3, labeled: 2391, synced: '2026-04-28 11:20', status: 'synced' },
  { id: 'ds-003', name: '工厂设备异常检测集', images: 1628, classes: 3, labeled: 1628, synced: '2026-04-29 07:45', status: 'synced' },
  { id: 'ds-004', name: '车牌识别数据集', images: 7840, classes: 3, labeled: 7840, synced: '2026-04-27 20:10', status: 'synced' },
  { id: 'ds-005', name: '人员跌倒检测数据集', images: 3210, classes: 2, labeled: 3101, synced: '2026-04-26 09:00', status: 'partial' },
]

function DatasetsPage() {
  return (
    <div style={{ animation: 'slideIn 0.3s ease-out' }}>
      <div className="page-header">
        <div>
          <div className="breadcrumb">科宝训练平台 › 数据集同步</div>
          <h1 className="page-title">数据集同步</h1>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-secondary btn-sm">
            <RefreshCw size={13} /> 从科宝标注平台同步
          </button>
          <Link to="/tasks/create" className="btn btn-primary btn-sm">
            <ArrowRight size={13} /> 使用数据集训练
          </Link>
        </div>
      </div>

      <div style={{ padding: '24px 32px' }}>
        <div style={{ padding: '12px 16px', background: 'rgba(27,107,239,0.06)', border: '1px solid rgba(27,107,239,0.2)', borderRadius: 10, marginBottom: 20, fontSize: 12.5, color: 'var(--text-secondary)', display: 'flex', gap: 8, alignItems: 'center' }}>
          <Layers size={13} style={{ color: 'var(--accent-bright)' }} />
          <span>数据集从<strong style={{ color: 'var(--text-primary)' }}>科宝标注平台</strong>自动同步，包含标注框、类别和图像。创建训练任务时选择相应数据集即可使用。</span>
        </div>

        <div className="card">
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>数据集名称</th>
                  <th>图像总数</th>
                  <th>已标注</th>
                  <th>类别数</th>
                  <th>状态</th>
                  <th>最后同步</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {DATASETS.map(ds => (
                  <tr key={ds.id}>
                    <td className="primary">{ds.name}</td>
                    <td className="mono">{ds.images.toLocaleString()}</td>
                    <td className="mono">
                      <span style={{ color: ds.labeled === ds.images ? 'var(--success)' : 'var(--warning)' }}>
                        {ds.labeled.toLocaleString()}
                      </span>
                    </td>
                    <td className="mono">{ds.classes}</td>
                    <td>
                      {ds.status === 'synced'
                        ? <span className="badge badge-completed"><CheckCircle2 size={10} /> 已同步</span>
                        : <span className="badge badge-pending">部分标注</span>
                      }
                    </td>
                    <td style={{ fontSize: 12 }}>{ds.synced}</td>
                    <td>
                      <Link to="/tasks/create" className="btn btn-ghost btn-sm">
                        用于训练 <ArrowRight size={11} />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
