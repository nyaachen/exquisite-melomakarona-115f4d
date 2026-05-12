import { useState, useEffect, useCallback } from 'react'
import { Images, X, ChevronLeft, ChevronRight } from 'lucide-react'
import {
  simulateFetchAnnotationResources,
  type DatasetResource,
} from '../data/datasets'

const PAGE_SIZE = 6

interface Props {
  datasetId: string
}

export function AnnotationPreview({ datasetId }: Props) {
  const [resources, setResources] = useState<DatasetResource[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedImage, setSelectedImage] = useState<string | null>(null)

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))

  const fetchResources = useCallback(async (p: number) => {
    setLoading(true)
    setError(null)
    try {
      const res = await simulateFetchAnnotationResources(datasetId, p, PAGE_SIZE)
      if (res.code === 200) {
        setResources(res.data.resources)
        setTotal(res.data.total)
      } else {
        setError(res.msg ?? '获取数据失败')
      }
    } catch {
      setError('网络请求失败')
    } finally {
      setLoading(false)
    }
  }, [datasetId])

  useEffect(() => {
    fetchResources(page)
  }, [page, fetchResources])

  const selectedResource = selectedImage
    ? resources.find(r => r.id === selectedImage)
    : null

  return (
    <div className="card" style={{ padding: 24 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <Images size={16} style={{ color: 'var(--accent-bright)' }} />
          <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>标注数据预览</span>
        </div>
        <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>共 {total} 张预览图</span>
      </div>

      {/* Loading */}
      {loading && (
        <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)', fontSize: 13 }}>
          加载中...
        </div>
      )}

      {/* Error */}
      {!loading && error && (
        <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--danger)', fontSize: 13 }}>
          {error}
        </div>
      )}

      {/* Image Grid */}
      {!loading && !error && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
          {resources.map((res) => {
            const firstShape = res.labelResultJson.shapes[0]
            const w = res.labelResultJson.imageWidth || 1920
            const h = res.labelResultJson.imageHeight || 1080
            const boxes = firstShape?.boxes
            return (
              <div
                key={res.id}
                className="select-card"
                style={{ padding: 0, overflow: 'hidden', cursor: 'pointer', position: 'relative' }}
                onClick={() => setSelectedImage(res.id)}
              >
                <div style={{ position: 'relative', aspectRatio: '4/3' }}>
                  <img
                    src={res.url}
                    alt={res.fileName}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                  {boxes && (
                    <>
                      <div style={{
                        position: 'absolute',
                        left: `${(Number(boxes[0]) / w) * 100}%`,
                        top: `${(Number(boxes[1]) / h) * 100}%`,
                        width: `${((Number(boxes[2]) - Number(boxes[0])) / w) * 100}%`,
                        height: `${((Number(boxes[3]) - Number(boxes[1])) / h) * 100}%`,
                        border: '3px solid #409eff',
                        backgroundColor: 'rgba(0, 85, 213, 0.2)',
                      }} />
                      <div style={{
                        position: 'absolute',
                        top: `${(Number(boxes[1]) / h) * 100 - 24}px`,
                        left: `${(Number(boxes[0]) / w) * 100}%`,
                        color: 'white',
                        fontSize: 10,
                        padding: '2px 6px',
                        background: '#0055d5',
                        borderRadius: 2,
                        whiteSpace: 'nowrap',
                      }}>
                        {firstShape.labelInfo.name}
                      </div>
                    </>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Pagination */}
      {!loading && !error && totalPages > 1 && (
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12,
          marginTop: 20, paddingTop: 16, borderTop: '1px solid var(--border-dim)',
        }}>
          <button
            className="btn btn-ghost btn-sm"
            disabled={page <= 1}
            onClick={() => setPage(p => Math.max(1, p - 1))}
            style={{ display: 'flex', alignItems: 'center', gap: 4 }}
          >
            <ChevronLeft size={14} /> 上一页
          </button>
          <span style={{ fontSize: 13, color: 'var(--text-secondary)', fontFamily: 'JetBrains Mono' }}>
            {page} / {totalPages}
          </span>
          <button
            className="btn btn-ghost btn-sm"
            disabled={page >= totalPages}
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            style={{ display: 'flex', alignItems: 'center', gap: 4 }}
          >
            下一页 <ChevronRight size={14} />
          </button>
        </div>
      )}

      {/* Image zoom modal */}
      {selectedImage && selectedResource && (() => {
        const firstShape = selectedResource.labelResultJson.shapes[0]
        const w = selectedResource.labelResultJson.imageWidth || 1920
        const h = selectedResource.labelResultJson.imageHeight || 1080
        const boxes = firstShape?.boxes
        return (
          <div
            style={{
              position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              zIndex: 1000, animation: 'fadeIn 0.2s ease-out',
            }}
            onClick={() => setSelectedImage(null)}
          >
            <button
              style={{
                position: 'absolute', top: 20, right: 20, width: 40, height: 40,
                background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '50%',
                color: 'white', cursor: 'pointer', display: 'flex',
                alignItems: 'center', justifyContent: 'center',
              }}
              onClick={() => setSelectedImage(null)}
            >
              <X size={20} />
            </button>
            <div style={{ position: 'relative', maxWidth: '80vw', maxHeight: '80vh' }}>
              <img
                src={selectedResource.url}
                alt={selectedResource.fileName}
                style={{ width: '100%', height: '100%', objectFit: 'contain' }}
              />
              {boxes && (
                <>
                  <div style={{
                    position: 'absolute',
                    left: `${(Number(boxes[0]) / w) * 100}%`,
                    top: `${(Number(boxes[1]) / h) * 100}%`,
                    width: `${((Number(boxes[2]) - Number(boxes[0])) / w) * 100}%`,
                    height: `${((Number(boxes[3]) - Number(boxes[1])) / h) * 100}%`,
                    border: '3px solid #409eff',
                    backgroundColor: 'rgba(0,85,213,0.15)',
                  }} />
                  <div style={{
                    position: 'absolute',
                    top: `${(Number(boxes[1]) / h) * 100 - 28}px`,
                    left: `${(Number(boxes[0]) / w) * 100}%`,
                    color: 'white',
                    fontSize: 14,
                    padding: '4px 12px',
                    background: '#0055d5',
                    borderRadius: 6,
                    fontWeight: 600,
                  }}>
                    {firstShape.labelInfo.name}
                  </div>
                </>
              )}
            </div>
          </div>
        )
      })()}
    </div>
  )
}
