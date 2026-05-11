import { createFileRoute, Link } from '@tanstack/react-router'
import { useState, useEffect, useCallback, useRef } from 'react'
import { Search, Globe, Shield, ImageIcon, Layers, Clock, User, RotateCcw } from 'lucide-react'
import { PLAZA_MODELS, type PlazaModel } from '../../data/plaza-models'

export const Route = createFileRoute('/plaza/')({
  component: PlazaList,
})

const BATCH_SIZE = 6

// ─── 模拟分页 API ───

async function fetchPlazaModels(query: string, page: number): Promise<{ data: PlazaModel[]; hasMore: boolean }> {
  await new Promise(resolve => setTimeout(resolve, 400 + Math.random() * 400))

  const filtered = PLAZA_MODELS.filter(m =>
    m.name.toLowerCase().includes(query.toLowerCase()) ||
    m.description.toLowerCase().includes(query.toLowerCase()) ||
    m.classes.some(c => c.toLowerCase().includes(query.toLowerCase())) ||
    m.architectureName.toLowerCase().includes(query.toLowerCase())
  )

  const start = (page - 1) * BATCH_SIZE
  const end = start + BATCH_SIZE
  return {
    data: filtered.slice(start, end),
    hasMore: end < filtered.length,
  }
}

// ─── 页面组件 ───

function PlazaList() {
  const [searchInput, setSearchInput] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [data, setData] = useState<PlazaModel[]>([])
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(false)
  const [loadingMore, setLoadingMore] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [imgErrors, setImgErrors] = useState<Set<string>>(new Set())
  const sentinelRef = useRef<HTMLDivElement>(null)

  // 初始加载 / 搜索条件变化
  const loadFirst = useCallback(async (query: string) => {
    setLoading(true)
    setHasMore(true)
    const result = await fetchPlazaModels(query, 1)
    setData(result.data)
    setHasMore(result.hasMore)
    setPage(1)
    setLoading(false)
  }, [])

  useEffect(() => {
    loadFirst(searchQuery)
  }, [searchQuery, loadFirst])

  // 加载更多
  const loadMore = useCallback(async () => {
    if (loadingMore || !hasMore) return
    setLoadingMore(true)
    const nextPage = page + 1
    const result = await fetchPlazaModels(searchQuery, nextPage)
    setData(prev => [...prev, ...result.data])
    setHasMore(result.hasMore)
    setPage(nextPage)
    setLoadingMore(false)
  }, [searchQuery, page, loadingMore, hasMore])

  // IntersectionObserver — 当 sentinel 进入视口时触发加载更多
  useEffect(() => {
    const sentinel = sentinelRef.current
    if (!sentinel) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loadingMore && !loading) {
          loadMore()
        }
      },
      { threshold: 0.1 },
    )

    observer.observe(sentinel)
    return () => observer.disconnect()
  }, [hasMore, loadingMore, loading, loadMore])

  const handleSearch = () => {
    setSearchQuery(searchInput)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSearch()
  }

  const handleReset = () => {
    setSearchInput('')
  }

  return (
    <div className="slide-in">
      <div className="page-header">
        <div>
          <div className="breadcrumb">科宝训练平台 › 模型</div>
          <h1 className="page-title">模型广场</h1>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>
            浏览所有可用模型，包含平台训练产出与公开预训练模型
          </div>
        </div>
      </div>

      <div className="p-content">
        <div style={{ marginBottom: 20, display: 'flex', gap: 8, alignItems: 'center' }}>
          <div className="search-input" style={{ maxWidth: 420, flex: 1 }}>
            <Search size={14} style={{ color: 'var(--text-muted)' }} />
            <input
              type="text"
              placeholder="搜索模型名称、描述、标签或架构..."
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

        {/* 瀑布流卡片网格 */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
          {data.map((model) => (
            <Link
              key={model.id}
              to="/plaza/$modelId"
              params={{ modelId: model.id }}
              className="no-underline"
            >
              <div className="model-card" style={{ cursor: 'pointer', padding: 0, overflow: 'hidden' }}>
                {/* Cover image */}
                <div style={{ width: '100%', aspectRatio: '16/10', background: 'var(--bg-elevated)', position: 'relative', overflow: 'hidden' }}>
                  {!imgErrors.has(model.id) ? (
                    <img
                      src={model.coverImage}
                      alt={model.name}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      onError={() => setImgErrors(prev => new Set(prev).add(model.id))}
                    />
                  ) : (
                    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', gap: 8 }}>
                      <ImageIcon size={32} />
                      <span style={{ fontSize: 11 }}>{model.name}</span>
                    </div>
                  )}
                  {/* Source badge */}
                  <div style={{ position: 'absolute', top: 8, right: 8 }}>
                    <span className="badge" style={{
                      background: model.source === 'platform' ? 'var(--accent-glow)' : 'rgba(230, 162, 60, 0.12)',
                      color: model.source === 'platform' ? 'var(--accent)' : 'var(--warning)',
                      borderColor: model.source === 'platform' ? 'rgba(64,158,255,0.3)' : 'rgba(230,162,60,0.3)',
                      fontSize: 10,
                    }}>
                      {model.source === 'platform' ? <Shield size={9} /> : <Globe size={9} />}
                      {model.source === 'platform' ? '平台自有' : model.sourceLabel || '公开模型'}
                    </span>
                  </div>
                  {/* Architecture badge at bottom */}
                  <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '6px 10px', background: 'linear-gradient(transparent, rgba(0,0,0,0.6))' }}>
                    <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.85)', fontWeight: 500 }}>{model.architectureName}</span>
                  </div>
                </div>

                {/* Card body */}
                <div style={{ padding: 14 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>{model.name}</div>
                  <p style={{ fontSize: 11.5, color: 'var(--text-secondary)', marginBottom: 10, lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {model.description}
                  </p>

                  {model.classes.length > 0 && (
                    <div style={{ display: 'flex', gap: 3, flexWrap: 'wrap', marginBottom: 10 }}>
                      {model.classes.slice(0, 5).map(cls => (
                        <span key={cls} className="class-tag" style={{ fontSize: 10 }}>{cls}</span>
                      ))}
                      {model.classes.length > 5 && (
                        <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>+{model.classes.length - 5}</span>
                      )}
                    </div>
                  )}

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 10, color: 'var(--text-muted)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Layers size={10} />
                      <span style={{ fontFamily: "'JetBrains Mono', monospace", color: 'var(--text-secondary)' }}>
                        {model.versions.length} 个版本
                      </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                        <User size={9} /> {model.author}
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                        <Clock size={9} /> {model.createdAt}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* 空状态 */}
        {!loading && data.length === 0 && (
          <div className="empty-state">
            <div className="empty-state-icon"><Search size={32} /></div>
            <div className="empty-state-text">未找到匹配的模型</div>
            <div className="empty-state-hint">尝试调整搜索关键词</div>
          </div>
        )}

        {/* 加载更多中的 loading */}
        {loadingMore && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px 0', gap: 10 }}>
            <div className="spinner" />
            <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>加载中…</span>
          </div>
        )}

        {/* 已到底提示 */}
        {!hasMore && data.length > 0 && !loading && (
          <div style={{ textAlign: 'center', padding: '24px 0', fontSize: 12, color: 'var(--text-muted)' }}>
            — 已加载全部模型 —
          </div>
        )}

        {/* 滚动哨兵 — IntersectionObserver 监听此元素 */}
        <div ref={sentinelRef} style={{ height: 1 }} />
      </div>
    </div>
  )
}
