import { createFileRoute, Link } from '@tanstack/react-router'
import { useState, useEffect, useCallback } from 'react'
import { Layers, ArrowRight, Search, ChevronLeft, ChevronRight, Database, RotateCcw } from 'lucide-react'
import { DATASETS, type Dataset } from '../../data/datasets'

export const Route = createFileRoute('/datasets/')({
  component: DatasetsPage,
})

// ─── 模拟分页 API ───
// 返回 Promise，模拟网络延迟，为接入真实 API 做准备

interface FetchDatasetsParams {
  query: string
  page: number
  pageSize: number
}

interface FetchDatasetsResult {
  data: Dataset[]
  total: number
}

async function fetchDatasets(params: FetchDatasetsParams): Promise<FetchDatasetsResult> {
  // 模拟网络延迟 400–800ms
  await new Promise(resolve => setTimeout(resolve, 400 + Math.random() * 400))

  const filtered = DATASETS.filter(ds =>
    ds.datasetName.toLowerCase().includes(params.query.toLowerCase())
  )

  const start = (params.page - 1) * params.pageSize
  return {
    data: filtered.slice(start, start + params.pageSize),
    total: filtered.length,
  }
}

// ─── 页面组件 ───

function DatasetsPage() {
  const [searchInput, setSearchInput] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize] = useState(10)
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState<Dataset[]>([])
  const [total, setTotal] = useState(0)

  const loadData = useCallback(async () => {
    setLoading(true)
    const result = await fetchDatasets({ query: searchQuery, page: currentPage, pageSize })
    setData(result.data)
    setTotal(result.total)
    setLoading(false)
  }, [searchQuery, currentPage, pageSize])

  useEffect(() => {
    loadData()
  }, [loadData])

  const handleSearch = () => {
    setSearchQuery(searchInput)
    setCurrentPage(1)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSearch()
  }

  const handleReset = () => {
    setSearchInput('')
  }

  const totalPages = Math.max(1, Math.ceil(total / pageSize))

  return (
    <div style={{ animation: 'slideIn 0.3s ease-out' }}>
      <div className="page-header">
        <div>
          <div className="breadcrumb">科宝训练平台 › 数据集</div>
          <h1 className="page-title">数据集</h1>
        </div>
      </div>

      <div style={{ padding: '24px 32px' }}>
        <div style={{ padding: '12px 16px', background: 'rgba(64, 158, 255,0.06)', border: '1px solid rgba(64, 158, 255,0.2)', borderRadius: 10, marginBottom: 20, fontSize: 12.5, color: 'var(--text-secondary)', display: 'flex', gap: 8, alignItems: 'center' }}>
          <Layers size={13} style={{ color: 'var(--accent-bright)' }} />
          <span>数据集从<strong style={{ color: 'var(--text-primary)' }}>科宝标注平台</strong>自动同步，包含图像、标注数据和图片划分。</span>
        </div>

        <div className="card">
          <div className="card-header">
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <div className="search-input">
                <Search size={14} style={{ color: 'var(--text-muted)' }} />
                <input
                  type="text"
                  placeholder="搜索数据集名称..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="search-input-field"
                />
              </div>
              <button className="btn btn-primary btn-sm" onClick={handleSearch} disabled={loading}>
                <Search size={12} /> 查询
              </button>
              <button className="btn btn-ghost btn-sm" onClick={handleReset} disabled={loading}>
                <RotateCcw size={12} /> 重置
              </button>
            </div>
            <span className="text-xs text-muted">
              共 {total} 条
            </span>
          </div>

          {/* ─── 表格区域 ─── */}
          <div style={{ overflowX: 'auto', minHeight: 200, position: 'relative' }}>
            {loading && (
              <div style={{
                position: 'absolute', inset: 0, background: 'rgba(255,255,255,0.6)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2,
              }}>
                <div className="spinner" />
                <span style={{ marginLeft: 10, fontSize: 13, color: 'var(--text-muted)' }}>加载中…</span>
              </div>
            )}

            <table className="data-table" style={{ minWidth: 1100 }}>
              <thead>
                <tr>
                  <th>数据集名称</th>
                  <th>来源</th>
                  <th>内容标签</th>
                  <th>场景标签</th>
                  <th>类别数</th>
                  <th>数据数量</th>
                  <th>训练集</th>
                  <th>验证集</th>
                  <th>测试集</th>
                  <th>创建时间</th>
                  <th className="sticky-col">操作</th>
                </tr>
              </thead>
              <tbody>
                {!loading && data.length === 0 ? (
                  <tr>
                    <td colSpan={11}>
                      <div className="empty-state">
                        <Database size={32} className="empty-state-icon" />
                        <div className="empty-state-text">
                          {searchQuery ? '未找到匹配的数据集' : '暂无数据集'}
                        </div>
                        <div className="empty-state-hint">
                          {searchQuery ? '请尝试其他搜索关键词' : '数据集将从科宝标注平台自动同步'}
                        </div>
                      </div>
                    </td>
                  </tr>
                ) : (
                  data.map(ds => {
                    const classCount = ds.contentTagList.reduce(
                      (sum, g) => sum + g.labelDetails.length, 0
                    )
                    const allLabels = ds.contentTagList.flatMap(g =>
                      g.labelDetails.map(d => d.labelName)
                    )
                    const sceneTags = ds.sceneTags
                      ? ds.sceneTags.split(',').map(s => s.trim()).filter(Boolean)
                      : []
                    const resourceTotal = ds.resources.length || 1
                    const trainCount = ds.resources.filter(r => r.set === 'train').length
                    const valCount = ds.resources.filter(r => r.set === 'val').length
                    const testCount = ds.resources.filter(r => r.set === 'test').length
                    return (
                      <tr key={ds.id}>
                        <td className="primary">
                          <div style={{ fontWeight: 600 }}>{ds.datasetName}</div>
                          {ds.description && (
                            <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 2, maxWidth: 180 }}>{ds.description}</div>
                          )}
                        </td>
                        <td style={{ whiteSpace: 'nowrap' }}>{ds.sourceTypeName}</td>
                        <td>
                          {allLabels.length > 0 ? (
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, maxWidth: 200 }}>
                              {allLabels.map(label => (
                                <span key={label} className="class-tag" style={{ fontSize: 10, padding: '2px 8px' }}>{label}</span>
                              ))}
                            </div>
                          ) : '-'}
                        </td>
                        <td>
                          {sceneTags.length > 0 ? (
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, maxWidth: 140 }}>
                              {sceneTags.map(tag => (
                                <span key={tag} className="class-tag" style={{ fontSize: 10, padding: '2px 8px', background: 'rgba(13,148,136,0.08)', color: 'var(--teal)', borderColor: 'rgba(13,148,136,0.2)' }}>{tag}</span>
                              ))}
                            </div>
                          ) : '-'}
                        </td>
                        <td className="mono">{classCount}</td>
                        <td className="mono">{ds.dataCount.toLocaleString()}</td>
                        <td className="mono" style={{ fontSize: 11 }}>
                          <span style={{ color: '#409eff', fontWeight: 600 }}>{trainCount.toLocaleString()}</span>
                          <span style={{ color: 'var(--text-muted)', marginLeft: 4 }}>({(trainCount / resourceTotal * 100).toFixed(1)}%)</span>
                        </td>
                        <td className="mono" style={{ fontSize: 11 }}>
                          <span style={{ color: '#10b981', fontWeight: 600 }}>{valCount.toLocaleString()}</span>
                          <span style={{ color: 'var(--text-muted)', marginLeft: 4 }}>({(valCount / resourceTotal * 100).toFixed(1)}%)</span>
                        </td>
                        <td className="mono" style={{ fontSize: 11 }}>
                          <span style={{ color: '#f59e0b', fontWeight: 600 }}>{testCount.toLocaleString()}</span>
                          <span style={{ color: 'var(--text-muted)', marginLeft: 4 }}>({(testCount / resourceTotal * 100).toFixed(1)}%)</span>
                        </td>
                        <td style={{ fontSize: 12, whiteSpace: 'nowrap' }}>{ds.createTime}</td>
                        <td className="sticky-col">
                          <div style={{ display: 'flex', gap: 5, flexWrap: 'nowrap' }}>
                            <Link to={`/datasets/${ds.id}` as any} className="btn btn-ghost btn-sm">
                              查看详情 <ArrowRight size={11} />
                            </Link>
                            <Link to="/train/create" className="btn btn-ghost btn-sm">
                              创建训练任务 <ArrowRight size={11} />
                            </Link>
                          </div>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* ─── 分页 ─── */}
          {total > 0 && (
            <div className="pagination-bar">
              <div className="pagination-info">
                第 {(currentPage - 1) * pageSize + 1}–{Math.min(currentPage * pageSize, total)} 条 / 共 {total} 条
              </div>
              <div className="pagination-controls">
                <button
                  className="btn btn-ghost btn-sm"
                  disabled={currentPage <= 1 || loading}
                  onClick={() => setCurrentPage(p => p - 1)}
                >
                  <ChevronLeft size={14} /> 上一页
                </button>
                <span className="pagination-current">{currentPage} / {totalPages}</span>
                <button
                  className="btn btn-ghost btn-sm"
                  disabled={currentPage >= totalPages || loading}
                  onClick={() => setCurrentPage(p => p + 1)}
                >
                  下一页 <ChevronRight size={14} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
