import {
  Layers,
  Info,
  Settings2,
  AlertCircle,
} from 'lucide-react'
import { DatasetPicker, type DatasetEntry } from '../DatasetPicker'
import { SplitAdjuster } from '../SplitAdjuster'
import { ClassDistributionChart } from '../ClassDistributionChart'
import { SectionTitle } from './SectionTitle'

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
  totalImages,
  trainImageCount,
  valImageCount,
  testImageCount,
  onDatasetChange,
  onSplitChange,
}: {
  datasetId: string
  datasetSplit: { train: number; val: number; test: number }
  datasetErrors: Record<string, string>
  datasetWarnings: string[]
  classDistribution: ClassDistItem[]
  entries: DatasetEntry[]
  selectedDs?: DatasetEntry
  totalImages: number
  trainImageCount: number
  valImageCount: number
  testImageCount: number
  onDatasetChange: (id: string) => void
  onSplitChange: (split: { train: number; val: number; test: number }) => void
}) {
  return (
    <div>
      <SectionTitle icon={<Layers size={15} />} title="选择训练/验证/测试数据集"
        subtitle="为每个集合独立选择数据集或子数据集" />

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
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
              <Settings2 size={13} style={{ color: 'var(--accent-bright)' }} />
              <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)' }}>数据划分</span>
            </div>
            <SplitAdjuster
              totalCount={totalImages}
              split={datasetSplit}
              onChange={onSplitChange}
              showPercentInputs
              showCountInputs
              showCountSummary={false}
            />
            <div style={{ marginTop: 10, padding: '8px 10px', background: 'var(--accent-glow)', borderRadius: 4, fontSize: 11, color: 'var(--text-secondary)', display: 'flex', gap: 6, alignItems: 'center' }}>
              <Info size={11} style={{ color: 'var(--accent-bright)', flexShrink: 0 }} />
              当前划分将在创建任务时保存为数据集快照
            </div>
          </div>
        )}
      </div>

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

      <div style={{ marginTop: 16, padding: '10px 14px', background: 'rgba(64, 158, 255,0.06)', border: '1px solid rgba(64, 158, 255,0.15)', display: 'flex', gap: 8, fontSize: 12, color: 'var(--text-secondary)' }}>
        <Info size={13} style={{ color: 'var(--accent-bright)', flexShrink: 0, marginTop: 1 }} />
        <span>选择一个数据集后，可通过拖拽滑块调整训练/验证/测试的划分比例。创建任务时当前划分将保存为数据集快照，可在任务详情中查看。</span>
      </div>
    </div>
  )
}
