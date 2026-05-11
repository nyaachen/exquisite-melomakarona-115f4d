import { createFileRoute, Link } from '@tanstack/react-router'
import { useState, useMemo } from 'react'
import {
  ArrowLeft,
  Tag,
  Images,
  Calendar,
  User,
  MapPin,
  X,
  SplitSquareVertical,
} from 'lucide-react'
import { NotFound } from '../../components/NotFound'
import { ClassDistributionChart } from '../../components/ClassDistributionChart'
import { DatasetSplitManager } from '../../components/DatasetSplitManager'
import { DATASETS } from '../../data/datasets'

export const Route = createFileRoute('/datasets/$datasetId')({
  component: DatasetDetail,
})

// ─── Component ───

function DatasetDetail() {
  const params = Route.useParams()
  const dataset = DATASETS.find(ds => ds.id === params.datasetId)
  if (!dataset) return <NotFound />

  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [showSplitModal, setShowSplitModal] = useState(false)

  // 从 resources 推导划分比例
  const resources = dataset.resources
  const split = useMemo(() => {
    const total = resources.length
    if (total === 0) return { train: 70, val: 15, test: 15 }
    const counts = { train: 0, val: 0, test: 0 }
    resources.forEach(r => { counts[r.set]++ })
    return {
      train: Math.round((counts.train / total) * 100),
      val: Math.round((counts.val / total) * 100),
      test: 100 - Math.round((counts.train / total) * 100) - Math.round((counts.val / total) * 100),
    }
  }, [resources])

  // 从 contentTagList 推导扁平标签名列表
  const flatContentTags = useMemo(() => {
    const names: string[] = []
    dataset.contentTagList.forEach(g =>
      g.labelDetails.forEach(d => {
        if (!names.includes(d.labelName)) names.push(d.labelName)
      })
    )
    return names
  }, [dataset.contentTagList])

  const classDistribution = useMemo(() => {
    const hash = (s: string) => { let h = 0; for (let i = 0; i < s.length; i++) h = ((h << 5) - h + s.charCodeAt(i)) | 0; return Math.abs(h) }
    return flatContentTags.map(cls => {
      const h = hash(cls)
      const base = 100 + (h % 600)
      const t = Math.round(base * (split.train / 100))
      const v = Math.round(base * (split.val / 100))
      return { name: cls, 训练集: t, 验证集: v, 测试集: Math.max(0, base - t - v) }
    })
  }, [flatContentTags, split])

  const handleSaveSplit = (_split: { train: number; val: number; test: number }, _assignments: Record<string, 'train' | 'val' | 'test'>) => {
    // 划分调整结果：_split 为比例，_assignments 为每张图片的归属
    setShowSplitModal(false)
  }

  return (
    <div>
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Link to="/datasets" className="btn btn-ghost btn-sm">
            <ArrowLeft size={14} /> 返回
          </Link>
          <div>
            <div className="breadcrumb">
              <Link to="/">科宝训练平台</Link> ›
              <Link to="/datasets">数据集管理</Link> ›
              <span>{dataset.datasetName}</span>
            </div>
            <h1 className="page-title">{dataset.datasetName}</h1>
          </div>
        </div>
      </div>

      <div className="content-padded" style={{ maxWidth: 1200, margin: '0 auto' }}>
        {/* Dataset Info Cards */}
        <div className="card" style={{ padding: 24, marginBottom: 24 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 24 }}>
            <div>
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>标注数据数量</div>
                <div style={{ fontSize: 36, fontWeight: 700, color: 'var(--accent-bright)', fontFamily: 'JetBrains Mono' }}>
                  {dataset.dataCount.toLocaleString()}
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <User size={16} style={{ color: 'var(--text-muted)' }} />
                  <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>创建人: {dataset.createBy}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Calendar size={16} style={{ color: 'var(--text-muted)' }} />
                  <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>创建时间: {dataset.createTime}</span>
                </div>
              </div>
            </div>
            <div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>数据集备注</div>
              <div style={{ fontSize: 14, color: 'var(--text-primary)', lineHeight: '1.6' }}>
                {dataset.description ?? '暂无备注'}
              </div>
            </div>
          </div>
        </div>

        {/* Content tags */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 24 }}>
          <div className="card" style={{ padding: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12 }}>
              <Tag size={14} style={{ color: 'var(--accent-bright)' }} />
              <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>内容标签</span>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {flatContentTags.map(tag => (
                <span key={tag} style={{ background: 'rgba(64,158,255,0.1)', color: 'var(--accent-bright)', fontSize: 12, padding: '4px 12px', borderRadius: 20, fontWeight: 500 }}>
                  {tag}
                </span>
              ))}
            </div>
          </div>
          <div className="card" style={{ padding: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12 }}>
              <MapPin size={14} style={{ color: 'var(--teal)' }} />
              <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>场景标签</span>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {dataset.sceneTags ? (
                <span style={{ background: 'rgba(64,158,255,0.1)', color: 'var(--teal)', fontSize: 12, padding: '4px 12px', borderRadius: 20, fontWeight: 500 }}>
                  {dataset.sceneTags}
                </span>
              ) : (
                <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>暂无场景标签</span>
              )}
            </div>
          </div>
        </div>

        {/* Data split section */}
        <div className="card" style={{ padding: 24, marginBottom: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <SplitSquareVertical size={14} style={{ color: 'var(--accent-bright)' }} />
              <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>数据划分</span>
            </div>
            <button className="btn btn-secondary btn-sm" onClick={() => setShowSplitModal(true)}>
              <SplitSquareVertical size={12} /> 调整划分
            </button>
          </div>

          <div>
            <div className="split-bar" style={{ marginBottom: 10 }}>
              <div className="split-bar-train" style={{ flex: split.train }}>
                <span className="split-bar-label" style={{ color: '#409eff' }}>训练 {split.train}%</span>
              </div>
              <div className="split-bar-val" style={{ flex: split.val }}>
                <span className="split-bar-label" style={{ color: '#10b981' }}>验证 {split.val}%</span>
              </div>
              <div className="split-bar-test" style={{ flex: split.test }}>
                <span className="split-bar-label" style={{ color: '#f59e0b' }}>测试 {split.test}%</span>
              </div>
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
              训练 {Math.round(dataset.dataCount * split.train / 100).toLocaleString()} 张 · 验证 {Math.round(dataset.dataCount * split.val / 100).toLocaleString()} 张 · 测试 {Math.round(dataset.dataCount * split.test / 100).toLocaleString()} 张
            </div>
          </div>
        </div>

        {/* Split adjustment modal */}
        {showSplitModal && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', zIndex: 1000, paddingTop: '5vh', animation: 'fadeIn 0.2s ease-out', overflowY: 'auto' }}>
            <div style={{ background: 'var(--bg-base)', borderRadius: 12, width: '100%', maxWidth: 960, maxHeight: '85vh', overflowY: 'auto', boxShadow: '0 20px 60px rgba(0,0,0,0.3)', animation: 'slideIn 0.25s ease-out' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 24px', borderBottom: '1px solid var(--border-dim)', position: 'sticky', top: 0, background: 'var(--bg-base)', zIndex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <SplitSquareVertical size={18} style={{ color: 'var(--accent-bright)' }} />
                  <span style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' }}>调整数据划分</span>
                </div>
                <button
                  className="btn btn-ghost btn-sm"
                  onClick={() => setShowSplitModal(false)}
                  style={{ width: 36, height: 36, padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                  <X size={18} />
                </button>
              </div>
              <div style={{ padding: 24 }}>
                <DatasetSplitManager
                  resources={resources}
                  classNames={flatContentTags}
                  currentSplit={split}
                  totalCount={dataset.dataCount}
                  datasetName={dataset.datasetName}
                  onSave={handleSaveSplit}
                />
              </div>
            </div>
          </div>
        )}

        {/* Class distribution */}
        <div style={{ marginBottom: 24 }}>
          <ClassDistributionChart data={classDistribution} />
        </div>

        {/* Image preview */}
        <div className="card" style={{ padding: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Images size={16} style={{ color: 'var(--accent-bright)' }} />
              <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>标注数据预览</span>
            </div>
            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>共 {resources.length} 张预览图</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
            {resources.map((res) => {
              const firstShape = res.labelResultJson.shapes[0]
              const w = res.labelResultJson.imageWidth || 1920
              const h = res.labelResultJson.imageHeight || 1080
              const boxes = firstShape?.boxes
              return (
                <div key={res.id} className="select-card" style={{ padding: 0, overflow: 'hidden', cursor: 'pointer', position: 'relative' }}
                  onClick={() => setSelectedImage(res.id)}>
                  <div style={{ position: 'relative', aspectRatio: '4/3' }}>
                    <img src={res.url} alt={res.fileName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
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
        </div>
      </div>

      {/* Image zoom modal */}
      {selectedImage && (() => {
        const res = resources.find(r => r.id === selectedImage)
        if (!res) return null
        const firstShape = res.labelResultJson.shapes[0]
        const w = res.labelResultJson.imageWidth || 1920
        const h = res.labelResultJson.imageHeight || 1080
        const boxes = firstShape?.boxes
        return (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, animation: 'fadeIn 0.2s ease-out' }}
            onClick={() => setSelectedImage(null)}>
            <button style={{ position: 'absolute', top: 20, right: 20, width: 40, height: 40, background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '50%', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              onClick={() => setSelectedImage(null)}>
              <X size={20} />
            </button>
            <div style={{ position: 'relative', maxWidth: '80vw', maxHeight: '80vh' }}>
              <img src={res.url} alt={res.fileName} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
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
