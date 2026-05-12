import { createFileRoute, Link } from '@tanstack/react-router'
import { useState, useMemo } from 'react'
import {
  ArrowLeft,
  Tag,
  Calendar,
  User,
  MapPin,
  X,
  SplitSquareVertical,
} from 'lucide-react'
import { NotFound } from '../../components/NotFound'
import { ClassDistributionChart } from '../../components/ClassDistributionChart'
import { DatasetSplitManager } from '../../components/DatasetSplitManager'
import { AnnotationPreview } from '../../components/AnnotationPreview'
import { DATASETS } from '../../data/datasets'

export const Route = createFileRoute('/datasets/$datasetId')({
  component: DatasetDetail,
})

// ─── Component ───

function DatasetDetail() {
  const params = Route.useParams()
  const dataset = DATASETS.find(ds => ds.id === params.datasetId)
  if (!dataset) return <NotFound />

  const [showSplitModal, setShowSplitModal] = useState(false)

  // Mutable resources state — updated after split save
  const [adjustedResources, setAdjustedResources] = useState(dataset.resources)

  // 从 resources 推导划分比例
  const resources = adjustedResources
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
                  datasetId={params.datasetId}
                  onSaved={(assignments) => {
                    setAdjustedResources(prev => prev.map(r => ({
                      ...r,
                      set: assignments[r.id] ?? r.set,
                    })))
                  }}
                />
              </div>
            </div>
          </div>
        )}

        {/* Class distribution */}
        <div style={{ marginBottom: 24 }}>
          <ClassDistributionChart
          datasetId={params.datasetId}
          split={split}
          flatContentTags={flatContentTags}
        />
        </div>

        {/* Annotation preview with pagination */}
        <AnnotationPreview datasetId={params.datasetId} />
      </div>
    </div>
  )
}
