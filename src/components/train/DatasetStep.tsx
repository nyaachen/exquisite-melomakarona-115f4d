import {
  Layers,
  Info,
  Image,
  Contrast,
  Sun,
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
  preprocessing,
  augmentation,
  classDistribution,
  entries,
  selectedDs,
  totalImages,
  trainImageCount,
  valImageCount,
  testImageCount,
  onDatasetChange,
  onSplitChange,
  onPreprocessingChange,
  onAugmentationChange,
}: {
  datasetId: string
  datasetSplit: { train: number; val: number; test: number }
  datasetErrors: Record<string, string>
  datasetWarnings: string[]
  preprocessing: string[]
  augmentation: string[]
  classDistribution: ClassDistItem[]
  entries: DatasetEntry[]
  selectedDs?: DatasetEntry
  totalImages: number
  trainImageCount: number
  valImageCount: number
  testImageCount: number
  onDatasetChange: (id: string) => void
  onSplitChange: (split: { train: number; val: number; test: number }) => void
  onPreprocessingChange: (ops: string[]) => void
  onAugmentationChange: (ops: string[]) => void
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

      {/* Image Processing */}
      <ImageProcessingCard
        preprocessing={preprocessing}
        augmentation={augmentation}
        onPreprocessingChange={onPreprocessingChange}
        onAugmentationChange={onAugmentationChange}
      />

      <div style={{ marginTop: 16, padding: '10px 14px', background: 'rgba(64, 158, 255,0.06)', border: '1px solid rgba(64, 158, 255,0.15)', display: 'flex', gap: 8, fontSize: 12, color: 'var(--text-secondary)' }}>
        <Info size={13} style={{ color: 'var(--accent-bright)', flexShrink: 0, marginTop: 1 }} />
        <span>选择一个数据集后，可通过拖拽滑块调整训练/验证/测试的划分比例。创建任务时当前划分将保存为数据集快照，可在任务详情中查看。</span>
      </div>
    </div>
  )
}

function ImageProcessingCard({
  preprocessing,
  augmentation,
  onPreprocessingChange,
  onAugmentationChange,
}: {
  preprocessing: string[]
  augmentation: string[]
  onPreprocessingChange: (ops: string[]) => void
  onAugmentationChange: (ops: string[]) => void
}) {
  return (
    <div className="card" style={{ padding: 16, marginTop: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
        <Image size={14} style={{ color: 'var(--accent-bright)' }} />
        <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)' }}>图像处理</span>
      </div>

      <div style={{
        padding: '10px 14px', background: 'var(--accent-glow)',
        border: '1px solid rgba(64,158,255,0.15)', borderRadius: 4,
        marginBottom: 16, display: 'flex', gap: 8, fontSize: 12, color: 'var(--text-secondary)',
      }}>
        <Info size={13} style={{ color: 'var(--accent-bright)', flexShrink: 0, marginTop: 1 }} />
        <span>建议首先<strong>不使用</strong>增强处理训练模型，然后再添加合适的增强处理用来提高模型泛化程度。</span>
      </div>

      {/* Preprocessing */}
      <div style={{ marginBottom: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
          <Contrast size={13} style={{ color: 'var(--teal)' }} />
          <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)' }}>预处理</span>
          <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>— 应用于所有图像（训练集 + 验证集 + 测试集）</span>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {[
            { id: 'resize', label: '调整大小', desc: '统一至输入尺寸' },
            { id: 'contrast', label: '调整对比度', desc: '直方图均衡化' },
            { id: 'grayscale', label: '纯灰度模式', desc: '丢弃颜色通道' },
            { id: 'normalize', label: '亮度归一化', desc: '均值 0 / 标准差 1' },
          ].map(op => {
            const active = preprocessing.includes(op.id)
            return (
              <button key={op.id}
                className="btn btn-sm"
                style={{
                  background: active ? 'var(--accent-glow)' : 'var(--bg-elevated)',
                  color: active ? 'var(--accent)' : 'var(--text-secondary)',
                  borderColor: active ? 'rgba(64,158,255,0.3)' : 'var(--border-dim)',
                }}
                onClick={() => onPreprocessingChange(
                  active ? preprocessing.filter(p => p !== op.id) : [...preprocessing, op.id]
                )}
                title={op.desc}
              >
                {op.label}
              </button>
            )
          })}
        </div>
      </div>

      {/* Augmentation */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
          <Sun size={13} style={{ color: 'var(--warning)' }} />
          <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)' }}>增强处理</span>
          <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>— 仅应用于训练集，产生额外副本以提高泛化能力</span>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {[
            { id: 'flip', label: '图片翻转', desc: '水平/垂直翻转' },
            { id: 'rotate', label: '图片旋转', desc: '随机角度旋转' },
            { id: 'brightness', label: '亮度饱和度', desc: '色彩抖动' },
            { id: 'blur', label: '模糊', desc: '高斯模糊/运动模糊' },
            { id: 'noise', label: '噪声', desc: '高斯噪声/椒盐噪声' },
            { id: 'crop', label: '随机裁剪', desc: '随机区域裁剪' },
            { id: 'scale', label: '缩放', desc: '随机缩放变换' },
            { id: 'mosaic', label: '拼接', desc: '多图拼接增强' },
          ].map(op => {
            const active = augmentation.includes(op.id)
            return (
              <button key={op.id}
                className="btn btn-sm"
                style={{
                  background: active ? 'rgba(230, 162, 60, 0.12)' : 'var(--bg-elevated)',
                  color: active ? 'var(--warning)' : 'var(--text-secondary)',
                  borderColor: active ? 'rgba(230,162,60,0.3)' : 'var(--border-dim)',
                }}
                onClick={() => onAugmentationChange(
                  active ? augmentation.filter(p => p !== op.id) : [...augmentation, op.id]
                )}
                title={op.desc}
              >
                {op.label}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
