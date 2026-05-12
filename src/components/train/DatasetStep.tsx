import { useState, useMemo } from 'react'
import {
  Layers,
  Info,
  Settings2,
  AlertCircle,
  SplitSquareVertical,
  X,
} from 'lucide-react'
import { DatasetPicker, type DatasetEntry } from '../DatasetPicker'
import { DatasetSplitManager } from '../DatasetSplitManager'
import { ClassDistributionChart } from '../ClassDistributionChart'
import { SectionTitle } from './SectionTitle'
import type { Dataset } from '../../data/datasets'

interface ClassDistItem {
  name: string
  '训练集': number
  '验证集': number
  '测试集': number
}

export function DatasetStep({
  datasetId,
  datasetSplit,
  datasetErrors,
  datasetWarnings,
  classDistribution,
  entries,
  selectedDs,
  selectedDataset,
  totalImages,
  trainImageCount,
  valImageCount,
  testImageCount,
  onDatasetChange,
}: {
  datasetId: string
  datasetSplit: { train: number; val: number; test: number }
  datasetErrors: Record<string, string>
  datasetWarnings: string[]
  classDistribution: ClassDistItem[]
  entries: DatasetEntry[]
  selectedDs?: DatasetEntry
  selectedDataset?: Dataset
  totalImages: number
  trainImageCount: number
  valImageCount: number
  testImageCount: number
  onDatasetChange: (id: string) => void
}) {
  const [showSplitModal, setShowSplitModal] = useState(false)

  const flatClassNames = useMemo(() => {
    if (!selectedDataset) return selectedDs?.classes ?? []
    const names: string[] = []
    selectedDataset.contentTagList.forEach(g =>
      g.labelDetails.forEach(d => {
        if (!names.includes(d.labelName)) names.push(d.labelName)
      })
    )
    return names
  }, [selectedDataset, selectedDs])

  return (
    <div>
      <SectionTitle icon={<Layers size={15} />} title="选择数据集" />

      {datasetErrors.dataset && (
        <div style={{ padding: '10px 14px', background: 'var(--error-glow)', border: '1px solid rgba(239,68,68,0.3)', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: 'var(--error)' }}>
          <AlertCircle size={14} /> {datasetErrors.dataset}
        </div>
      )}
      {datasetWarnings.length > 0 && (
        <div style={{ padding: '10px 14px', background: 'rgba(230, 162, 60,0.06)', border: '1px solid rgba(230, 162, 60,0.2)', marginBottom: 12, display: 'flex', gap: 8, fontSize: 12 }}>
          <AlertCircle size={14} style={{ color: 'var(--warning)', flexShrink: 0, marginTop: 1 }} />
          <div style={{ color: 'var(--text-secondary)' }}>
            {datasetWarnings.map((w, i) => <div key={i}>{w}</div>)}
          </div>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        <DatasetPicker
          label="选择数据集"
          color="var(--accent-bright)"
          selectedId={datasetId}
          onChange={onDatasetChange}
          entries={entries}
          imageKey="trainImages"
        />

        {selectedDs && (
          <div className="card" style={{ padding: 14, animation: 'slideIn 0.2s ease-out' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Settings2 size={13} style={{ color: 'var(--accent-bright)' }} />
                <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)' }}>数据划分</span>
              </div>
              <button className="btn btn-secondary btn-sm" onClick={() => setShowSplitModal(true)}>
                <SplitSquareVertical size={12} /> 调整划分
              </button>
            </div>

            <div className="split-bar" style={{ marginBottom: 10 }}>
              <div className="split-bar-train" style={{ flex: datasetSplit.train || 0.1 }}>
                <span className="split-bar-label" style={{ color: '#409eff' }}>训练 {datasetSplit.train}%</span>
              </div>
              <div className="split-bar-val" style={{ flex: datasetSplit.val || 0.1 }}>
                <span className="split-bar-label" style={{ color: '#10b981' }}>验证 {datasetSplit.val}%</span>
              </div>
              <div className="split-bar-test" style={{ flex: datasetSplit.test || 0.1 }}>
                <span className="split-bar-label" style={{ color: '#f59e0b' }}>测试 {datasetSplit.test}%</span>
              </div>
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
              训练 {trainImageCount.toLocaleString()} 张 · 验证 {valImageCount.toLocaleString()} 张 · 测试 {testImageCount.toLocaleString()} 张
            </div>

            <div style={{ marginTop: 10, padding: '8px 10px', background: 'var(--accent-glow)', borderRadius: 4, fontSize: 11, color: 'var(--text-secondary)', display: 'flex', gap: 6, alignItems: 'center' }}>
              <Info size={11} style={{ color: 'var(--accent-bright)', flexShrink: 0 }} />
              当前划分将在创建任务时保存为数据集快照
            </div>
          </div>
        )}
      </div>

      {/* Split adjustment modal */}
      {showSplitModal && selectedDataset && (
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
                resources={selectedDataset.resources}
                classNames={flatClassNames}
              />
            </div>
          </div>
        </div>
      )}

      {/* Summary */}
      {selectedDs && (
        <div className="card" style={{ padding: 16, marginTop: 20 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 12 }}>
            数据集概览 — {selectedDs.name}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
            <div className="metric-chip">
              <div className="metric-chip-value" style={{ color: '#409eff', fontSize: 20 }}>
                {trainImageCount.toLocaleString()}
              </div>
              <div className="metric-chip-label">训练集 ({datasetSplit.train}%)</div>
            </div>
            <div className="metric-chip">
              <div className="metric-chip-value" style={{ color: '#10b981', fontSize: 20 }}>
                {valImageCount.toLocaleString()}
              </div>
              <div className="metric-chip-label">验证集 ({datasetSplit.val}%)</div>
            </div>
            <div className="metric-chip">
              <div className="metric-chip-value" style={{ color: '#f59e0b', fontSize: 20 }}>
                {testImageCount.toLocaleString()}
              </div>
              <div className="metric-chip-label">测试集 ({datasetSplit.test}%)</div>
            </div>
          </div>
          <div style={{ marginTop: 10, fontSize: 11, color: 'var(--text-muted)' }}>
            总计 {totalImages.toLocaleString()} 张图片 · {selectedDs.classes.length} 个类别
          </div>
        </div>
      )}
      {!datasetId && (
        <div style={{ marginTop: 20, fontSize: 12, color: 'var(--error)' }}>
          请选择一个数据集
        </div>
      )}

      {/* Per-class distribution chart */}
      {classDistribution.length > 0 && (
        <div style={{ marginTop: 16 }}>
          <ClassDistributionChart data={classDistribution} showLegend minHeight={200} />
        </div>
      )}

      
    </div>
  )
}
