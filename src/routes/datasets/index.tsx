import { createFileRoute, Link } from '@tanstack/react-router'
import { RefreshCw, Layers, ArrowRight } from 'lucide-react'

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
          <div className="breadcrumb">科宝训练平台 › 数据集</div>
          <h1 className="page-title">数据集</h1>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-secondary btn-sm">
            <RefreshCw size={13} /> 从科宝标注平台同步
          </button>
        </div>
      </div>

      <div style={{ padding: '24px 32px' }}>
        <div style={{ padding: '12px 16px', background: 'rgba(27,107,239,0.06)', border: '1px solid rgba(27,107,239,0.2)', borderRadius: 10, marginBottom: 20, fontSize: 12.5, color: 'var(--text-secondary)', display: 'flex', gap: 8, alignItems: 'center' }}>
          <Layers size={13} style={{ color: 'var(--accent-bright)' }} />
          <span>数据集从<strong style={{ color: 'var(--text-primary)' }}>科宝标注平台</strong>自动同步，包含图像和标注数据。创建训练任务之前需要创建对应的划分。</span>
        </div>

        <div className="card">
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>数据集名称</th>
                  <th>数据集描述</th>
                  <th>标注资源格式</th>
                  <th>标注信息类型</th>
                  <th>场景标签</th>
                  <th>数据数量</th>
                  <th>操作</th>
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
                        ? <span className="badge badge-completed">高速公路</span>
                        : <span className="badge badge-pending">开车</span>
                      }
                    </td>
                    <td style={{ fontSize: 12 }}>{ds.images.toLocaleString()}</td>
                    <td>
                      <Link to={`/datasets/${ds.id}`}  className="btn btn-ghost btn-sm">
                        查看详情 <ArrowRight size={11} />
                      </Link>
                      <Link to="/subdatasets/create" className="btn btn-ghost btn-sm">
                        创建子数据集 <ArrowRight size={11} />
                      </Link>
                      <Link to="/train/create" className="btn btn-ghost btn-sm">
                        创建训练任务 <ArrowRight size={11} />
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
