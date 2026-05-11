import { createFileRoute, Link } from '@tanstack/react-router'
import { useState } from 'react'
import { RefreshCw, Layers, ArrowRight, Search } from 'lucide-react'
import { DATASETS } from '../../data/datasets'

export const Route = createFileRoute('/datasets/')({
  component: DatasetsPage,
})

function DatasetsPage() {
  const [searchQuery, setSearchQuery] = useState('')

  const filteredDatasets = DATASETS.filter(ds =>
    ds.datasetName.toLowerCase().includes(searchQuery.toLowerCase())
  )

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
        <div style={{ padding: '12px 16px', background: 'rgba(64, 158, 255,0.06)', border: '1px solid rgba(64, 158, 255,0.2)', borderRadius: 10, marginBottom: 20, fontSize: 12.5, color: 'var(--text-secondary)', display: 'flex', gap: 8, alignItems: 'center' }}>
          <Layers size={13} style={{ color: 'var(--accent-bright)' }} />
          <span>数据集从<strong style={{ color: 'var(--text-primary)' }}>科宝标注平台</strong>自动同步，包含图像和标注数据。创建训练任务之前需要创建对应的划分。</span>
        </div>

        <div className="card">
          <div className="card-header">
            <div className="search-input">
              <Search size={14} style={{ color: 'var(--text-muted)' }} />
              <input
                type="text"
                placeholder="搜索数据集名称..."
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
                  <th>数据集名称</th>
                  <th>来源</th>
                  <th>标签组</th>
                  <th>类别数</th>
                  <th>数据数量</th>
                  <th>创建时间</th>
                  <th>操作</th>
                </tr>
              </thead>
              <tbody>
                {filteredDatasets.map(ds => {
                  const classCount = ds.contentTagList.reduce(
                    (sum, g) => sum + g.labelDetails.length, 0
                  )
                  return (
                    <tr key={ds.id}>
                      <td className="primary">{ds.datasetName}</td>
                      <td>{ds.sourceTypeName}</td>
                      <td>{ds.contentTagList.map(g => g.name).join(', ') || '-'}</td>
                      <td className="mono">{classCount}</td>
                      <td className="mono">{ds.dataCount.toLocaleString()}</td>
                      <td style={{ fontSize: 12 }}>{ds.createTime}</td>
                      <td>
                        <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', marginBottom: 0 }}>
                          <Link to={`/datasets/${ds.id}`} className="btn btn-ghost btn-sm">
                            查看详情 <ArrowRight size={11} />
                          </Link>
                          <Link to="/train/create" className="btn btn-ghost btn-sm">
                            创建训练任务 <ArrowRight size={11} />
                          </Link>
                        </div>
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
