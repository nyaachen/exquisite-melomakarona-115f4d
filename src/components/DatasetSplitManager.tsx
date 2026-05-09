import { useState, useMemo } from 'react'
import {
  Tag,
  Settings2,
  SplitSquareVertical,
  Grid3X3,
  CheckCircle2,
  Info,
  ChevronLeft,
  ChevronRight,
  Shuffle,
  Save,
  RotateCcw,
  Image,
  Search,
  X,
} from 'lucide-react'
import { SplitAdjuster } from './SplitAdjuster'

// ─── Types ───

interface Annotation {
  id: string
  name: string
  set: 'train' | 'val' | 'test'
  classes: string[]
}

type SplitMode = 'auto' | 'manual'
type SetType = 'train' | 'val' | 'test'

const SET_META = {
  train: { label: '训练集', color: '#409eff', bg: 'rgba(59,130,246,0.08)', badge: '训练' },
  val:   { label: '验证集', color: '#10b981', bg: 'rgba(16,185,129,0.08)', badge: '验证' },
  test:  { label: '测试集', color: '#f59e0b', bg: 'rgba(245,158,11,0.08)', badge: '测试' },
} as const

// ─── Props ───

interface DatasetSplitManagerProps {
  annotations: Annotation[]
  classNames: string[]
  currentSplit: { train: number; val: number; test: number }
  totalCount: number
  datasetName: string
  onSave: (split: { train: number; val: number; test: number }) => void
}

// ─── Component ───

export function DatasetSplitManager({
  annotations,
  classNames,
  currentSplit,
  totalCount,
  datasetName,
  onSave,
}: DatasetSplitManagerProps) {
  const [mode, setMode] = useState<SplitMode>('auto')
  const [currentPage, setCurrentPage] = useState(0)
  const [pageSize] = useState(20)
  const [assignments, setAssignments] = useState<Record<string, SetType>>(() => {
    const init: Record<string, SetType> = {}
    annotations.forEach(a => { init[a.id] = 'train' })
    return init
  })
  const [form, setForm] = useState({
    name: '',
    comment: '',
    trainRatio: currentSplit.train,
    valRatio: currentSplit.val,
    testRatio: currentSplit.test,
    selectedLabels: [] as string[],
  })
  const [labelSearch, setLabelSearch] = useState('')
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle')

  // ─── Derived data ───

  const allAnnotations = useMemo(() =>
    annotations.map(ann => ({ ...ann, set: assignments[ann.id] || 'train' })),
  [annotations, assignments])

  const filteredAnnotations = useMemo(() => {
    if (!labelSearch.trim()) return allAnnotations
    const q = labelSearch.trim().toLowerCase()
    return allAnnotations.filter(a =>
      a.classes.some(c => c.toLowerCase().includes(q)) ||
      a.name.toLowerCase().includes(q)
    )
  }, [allAnnotations, labelSearch])

  const totalPages = Math.ceil(filteredAnnotations.length / pageSize)
  const paginatedAnnotations = useMemo(() => {
    const start = currentPage * pageSize
    return filteredAnnotations.slice(start, start + pageSize)
  }, [filteredAnnotations, currentPage])

  const counts = useMemo(() => {
    const result = { train: 0, val: 0, test: 0 }
    allAnnotations.forEach(a => { result[a.set]++ })
    return result
  }, [allAnnotations])

  // ─── Handlers ───

  function handleSplitChange(split: { train: number; val: number; test: number }) {
    setForm(prev => ({ ...prev, trainRatio: split.train, valRatio: split.val, testRatio: split.test }))
  }

  function toggleLabel(label: string) {
    setForm(prev => {
      if (prev.selectedLabels.includes(label))
        return { ...prev, selectedLabels: prev.selectedLabels.filter(l => l !== label) }
      if (prev.selectedLabels.length >= 3) return prev
      return { ...prev, selectedLabels: [...prev.selectedLabels, label] }
    })
  }

  function autoSplit() {
    const total = allAnnotations.length
    const selected = form.selectedLabels

    let priorityAnns = [...allAnnotations]
    let otherAnns: typeof allAnnotations = []

    if (selected.length > 0) {
      priorityAnns = allAnnotations.filter(a => a.classes.some(c => selected.includes(c)))
      otherAnns = allAnnotations.filter(a => !a.classes.some(c => selected.includes(c)))
    }

    priorityAnns = priorityAnns.sort(() => Math.random() - 0.5)
    otherAnns = otherAnns.sort(() => Math.random() - 0.5)

    const trainCount = Math.round(total * form.trainRatio / 100)
    const valCount = Math.round(total * form.valRatio / 100)

    const newAssignments: Record<string, SetType> = {}
    let ti = 0, vi = 0

    for (const ann of priorityAnns) {
      if (ti < trainCount) { newAssignments[ann.id] = 'train'; ti++ }
      else if (vi < valCount) { newAssignments[ann.id] = 'val'; vi++ }
      else { newAssignments[ann.id] = 'test' }
    }
    for (const ann of otherAnns) {
      if (ti < trainCount) { newAssignments[ann.id] = 'train'; ti++ }
      else if (vi < valCount) { newAssignments[ann.id] = 'val'; vi++ }
      else { newAssignments[ann.id] = 'test' }
    }

    allAnnotations.forEach(a => {
      if (!(a.id in newAssignments)) newAssignments[a.id] = 'train'
    })

    setAssignments(newAssignments)
  }

  function resetToTrain() {
    const init: Record<string, SetType> = {}
    annotations.forEach(a => { init[a.id] = 'train' })
    setAssignments(init)
    setCurrentPage(0)
  }

  function cycleAnnotationSet(annId: string) {
    setAssignments(prev => {
      const cur = prev[annId] || 'train'
      const next: SetType = cur === 'train' ? 'val' : cur === 'val' ? 'test' : 'train'
      return { ...prev, [annId]: next }
    })
  }

  function setPageAnnotations(set: SetType) {
    const updates: Record<string, SetType> = {}
    paginatedAnnotations.forEach(a => { updates[a.id] = set })
    setAssignments(prev => ({ ...prev, ...updates }))
  }

  async function handleSave() {
    setSaveStatus('saving')
    await new Promise(r => setTimeout(r, 800))
    onSave({ train: form.trainRatio, val: form.valRatio, test: form.testRatio })
    setSaveStatus('saved')
    setTimeout(() => setSaveStatus('idle'), 2500)
  }

  // ─── Render ───

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 24, animation: 'slideIn 0.25s ease-out' }}>
      {/* Main area */}
      <div>
        {/* Labels of interest */}
        <div className="card" style={{ padding: 20, marginBottom: 20 }}>
          <SectionTitle icon={<Tag size={15} />} title="感兴趣标签" subtitle="最多选择 3 个，系统优先按比例分配含这些标签的图片（可选）" />
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {classNames.map(cls => {
              const isSelected = form.selectedLabels.includes(cls)
              const disabled = !isSelected && form.selectedLabels.length >= 3
              return (
                <button
                  key={cls}
                  className="class-tag"
                  style={{
                    cursor: disabled ? 'not-allowed' : 'pointer',
                    opacity: disabled ? 0.4 : 1,
                    background: isSelected ? 'var(--accent-glow)' : 'var(--bg-elevated)',
                    color: isSelected ? 'var(--accent-bright)' : 'var(--text-secondary)',
                    border: `1px solid ${isSelected ? 'var(--accent)' : 'var(--border-default)'}`,
                    fontWeight: isSelected ? 600 : 400,
                    padding: '6px 12px',
                    fontSize: 12,
                    transition: 'all 0.15s',
                  }}
                  onClick={() => toggleLabel(cls)}
                  disabled={disabled}
                >
                  {isSelected && <CheckCircle2 size={11} style={{ marginRight: 4 }} />}
                  {cls}
                </button>
              )
            })}
          </div>
          {form.selectedLabels.length > 0 && (
            <div style={{ marginTop: 10, fontSize: 11, color: 'var(--text-muted)' }}>
              已选 {form.selectedLabels.length}/3 个 · 自动划分时优先分配
            </div>
          )}
        </div>

        {/* Mode toggle */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
          <button className={`btn ${mode === 'auto' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setMode('auto')}>
            <Shuffle size={14} /> 自动划分
          </button>
          <button className={`btn ${mode === 'manual' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setMode('manual')}>
            <Grid3X3 size={14} /> 手动调整
          </button>
        </div>

        {/* ═══════════ AUTO MODE ═══════════ */}
        {mode === 'auto' && (
          <div style={{ animation: 'slideIn 0.2s ease-out' }}>
            <SectionTitle icon={<SplitSquareVertical size={15} />} title="自动划分" subtitle="调节滑块或直接输入比例/数量，实时预览" />
            <div className="card" style={{ padding: 24 }}>
              <SplitAdjuster
                totalCount={totalCount}
                split={{ train: form.trainRatio, val: form.valRatio, test: form.testRatio }}
                onChange={handleSplitChange}
                showPercentInputs
                showCountInputs
              />

              {/* Action buttons */}
              <div style={{ marginTop: 18, display: 'flex', gap: 10 }}>
                <button className="btn btn-primary" onClick={autoSplit}>
                  <Shuffle size={14} /> 分配
                </button>
                <button className="btn btn-ghost" onClick={resetToTrain}>
                  <RotateCcw size={14} /> 重置
                </button>
              </div>

              {/* Per-label distribution */}
              {form.selectedLabels.length > 0 && (
                <div style={{ marginTop: 16, padding: 12, background: 'rgba(64, 158, 255,0.06)', border: '1px solid rgba(64, 158, 255,0.15)' }}>
                  <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--teal)', marginBottom: 10 }}>
                    <Tag size={11} style={{ display: 'inline', marginRight: 4 }} />
                    每个标签的分布情况
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {form.selectedLabels.map(label => {
                      const labelCounts = { train: 0, val: 0, test: 0 }
                      allAnnotations.forEach(ann => {
                        if (ann.classes.includes(label)) labelCounts[ann.set]++
                      })
                      const total = labelCounts.train + labelCounts.val + labelCounts.test
                      return (
                        <div key={label}>
                          <div style={{ fontSize: 10, fontWeight: 500, color: 'var(--text-primary)', marginBottom: 3 }}>{label}</div>
                          <div style={{ display: 'flex', gap: 0, height: 14 }}>
                            {(['train', 'val', 'test'] as const).map(set => {
                              const w = total > 0 ? (labelCounts[set] / total) * 100 : 0
                              if (w === 0) return null
                              return (
                                <div key={set} style={{
                                  width: `${w}%`, background: SET_META[set].color,
                                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                                  fontSize: 8, color: '#fff', fontWeight: 600,
                                  minWidth: w > 8 ? 0 : 0,
                                }}>
                                  {w > 12 ? labelCounts[set] : ''}
                                </div>
                              )
                            })}
                          </div>
                          <div style={{ display: 'flex', gap: 10, fontSize: 9, color: 'var(--text-muted)', marginTop: 2 }}>
                            {(['train', 'val', 'test'] as const).map(set => (
                              <span key={set}>{SET_META[set].label} {labelCounts[set]} 张</span>
                            ))}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              <div style={{ marginTop: 16, padding: '10px 14px', background: 'rgba(29,78,216,0.06)', border: '1px solid rgba(29,78,216,0.15)', display: 'flex', gap: 8, fontSize: 12, color: 'var(--text-secondary)' }}>
                <Info size={13} style={{ color: 'var(--accent-bright)', flexShrink: 0, marginTop: 1 }} />
                <span>调节比例或输入期望数量后，点击"随机分配"将按当前比例随机打乱并分配图片到各集合。</span>
              </div>
            </div>
          </div>
        )}

        {/* ═══════════ MANUAL MODE ═══════════ */}
        {mode === 'manual' && (
          <div style={{ animation: 'slideIn 0.2s ease-out' }}>
            <SectionTitle icon={<Grid3X3 size={15} />} title="手动调整" subtitle="逐张图片选择归属集合，支持按标签搜索" />

            {/* Search */}
            <div style={{ marginBottom: 12 }}>
              <div className="search-input" style={{ width: '100%' }}>
                <Search size={14} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
                <input
                  type="text"
                  className="search-input-field"
                  placeholder="按标签搜索图片（输入裂缝、安全帽等）..."
                  value={labelSearch}
                  onChange={e => { setLabelSearch(e.target.value); setCurrentPage(0) }}
                  style={{ width: '100%' }}
                />
                {labelSearch && (
                  <button onClick={() => setLabelSearch('')} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex' }}>
                    <X size={14} style={{ color: 'var(--text-muted)' }} />
                  </button>
                )}
              </div>
            </div>

            <div className="card" style={{ padding: 16, marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12, flexWrap: 'wrap', gap: 8 }}>
                <div style={{ display: 'flex', gap: 6 }}>
                  <button className="btn btn-sm btn-secondary" onClick={() => setPageAnnotations('train')}>本页 → 训练集</button>
                  <button className="btn btn-sm btn-teal" onClick={() => setPageAnnotations('val')}>本页 → 验证集</button>
                  <button className="btn btn-sm btn-warning" onClick={() => setPageAnnotations('test')}>本页 → 测试集</button>
                </div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                  {filteredAnnotations.length === 0 ? '无匹配结果' : `第 ${currentPage * pageSize + 1}–${Math.min((currentPage + 1) * pageSize, filteredAnnotations.length)} / 共 ${filteredAnnotations.length} 张`}
                  {labelSearch && <span style={{ marginLeft: 8, color: 'var(--teal)' }}>（已过滤）</span>}
                </div>
              </div>

              {/* Annotation cards grid */}
              {paginatedAnnotations.length === 0 ? (
                <div style={{ padding: '40px 20px', textAlign: 'center' }}>
                  <Search size={32} style={{ color: 'var(--text-muted)', marginBottom: 8, opacity: 0.5 }} />
                  <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>没有匹配「{labelSearch}」的图片</div>
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 8 }}>
                  {paginatedAnnotations.map(ann => {
                    const meta = SET_META[ann.set]
                    return (
                      <div
                        key={ann.id}
                        style={{
                          background: meta.bg,
                          border: `2px solid ${meta.color}`,
                          padding: '8px 6px',
                          cursor: 'pointer',
                          transition: 'all 0.15s ease',
                        }}
                        onClick={() => cycleAnnotationSet(ann.id)}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 4 }}>
                          <Image size={12} style={{ color: 'var(--text-muted)' }} />
                        </div>
                        <div style={{ fontSize: 10, color: 'var(--text-muted)', textAlign: 'center', fontFamily: 'JetBrains Mono' }}>
                          {ann.name.replace('.jpg', '').replace('image_', '')}
                        </div>
                        {ann.classes.length > 0 && (
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 2, justifyContent: 'center', marginTop: 4 }}>
                            {ann.classes.slice(0, 2).map(cls => (
                              <span key={cls} style={{
                                fontSize: 8, padding: '1px 3px',
                                background: form.selectedLabels.includes(cls) ? 'rgba(64, 158, 255,0.2)' : 'rgba(148,163,184,0.15)',
                                color: form.selectedLabels.includes(cls) ? 'var(--teal)' : 'var(--text-muted)',
                              }}>
                                {cls}
                              </span>
                            ))}
                          </div>
                        )}
                        <div style={{ fontSize: 9, fontWeight: 600, textAlign: 'center', marginTop: 4, padding: '2px 4px', color: meta.color, background: meta.bg }}>
                          {meta.badge}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}

              {/* Pagination */}
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 12, marginTop: 16 }}>
                <button className="btn btn-ghost btn-sm" disabled={currentPage === 0} onClick={() => setCurrentPage(p => p - 1)}>
                  <ChevronLeft size={14} /> 上一页
                </button>
                <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{currentPage + 1} / {totalPages || 1}</span>
                <button className="btn btn-ghost btn-sm" disabled={currentPage >= totalPages - 1} onClick={() => setCurrentPage(p => p + 1)}>
                  下一页 <ChevronRight size={14} />
                </button>
              </div>
            </div>

            <div style={{ padding: '10px 14px', background: 'rgba(64, 158, 255,0.06)', border: '1px solid rgba(64, 158, 255,0.15)', display: 'flex', gap: 8, fontSize: 12, color: 'var(--text-secondary)' }}>
              <Info size={13} style={{ color: 'var(--teal)', flexShrink: 0, marginTop: 1 }} />
              <span>点击单张图片可循环切换（训练→验证→测试→训练）。使用搜索可快速定位特定标签的图片。</span>
            </div>
          </div>
        )}
      </div>

      {/* ═══════════ Right sidebar ═══════════ */}
      <div>
        <div className="card" style={{ padding: 20, position: 'sticky', top: 24 }}>
          <SectionTitle icon={<Settings2 size={15} />} title="配置保存" subtitle="" />

          <div style={{ marginBottom: 16 }}>
            <label className="form-label">子数据集名称</label>
            <input
              type="text"
              className="form-input"
              placeholder={`子数据集_${new Date().toLocaleDateString('zh-CN')}`}
              value={form.name}
              onChange={e => setForm(prev => ({ ...prev, name: e.target.value }))}
            />
          </div>

          <div style={{ marginBottom: 16 }}>
            <label className="form-label">备注</label>
            <input
              type="text"
              className="form-input"
              placeholder="子数据集备注说明（可选）"
              value={form.comment}
              onChange={e => setForm(prev => ({ ...prev, comment: e.target.value }))}
            />
          </div>

          {form.selectedLabels.length > 0 && (
            <div style={{ marginBottom: 16 }}>
              <label className="form-label">感兴趣的标签</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                {form.selectedLabels.map(label => (
                  <span key={label} className="class-tag" style={{ background: 'rgba(64, 158, 255,0.1)', color: 'var(--teal)', borderColor: 'rgba(64, 158, 255,0.3)' }}>
                    <Tag size={9} /> {label}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Live split results */}
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 12 }}>当前划分结果</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {(['train', 'val', 'test'] as const).map(set => (
                <SplitResultRow
                  key={set}
                  label={SET_META[set].label}
                  count={counts[set]}
                  total={allAnnotations.length}
                  color={SET_META[set].color}
                />
              ))}
            </div>
          </div>

          {/* Data preview */}
          <div style={{ padding: 12, background: 'var(--bg-elevated)', border: '1px solid var(--border-dim)', marginBottom: 16, fontSize: 11.5, color: 'var(--text-secondary)' }}>
            <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: 6 }}>数据保存格式</div>
            <div style={{ fontFamily: 'JetBrains Mono', fontSize: 10, color: 'var(--text-muted)', lineHeight: 1.6 }}>
              名称：{form.name || '(自动生成)'}<br />
              数据集：{datasetName}<br />
              标签：{classNames.join('、')}<br />
              训练 {counts.train.toLocaleString()} 张 / 验证 {counts.val.toLocaleString()} 张 / 测试 {counts.test.toLocaleString()} 张
            </div>
          </div>

          <button
            className="btn btn-primary"
            style={{ width: '100%' }}
            onClick={handleSave}
            disabled={saveStatus === 'saving'}
          >
            {saveStatus === 'saving' ? (
              <><span className="spinner" style={{ width: 14, height: 14 }} /> 保存中…</>
            ) : saveStatus === 'saved' ? (
              <><CheckCircle2 size={14} /> 已保存</>
            ) : (
              <><Save size={14} /> 保存划分配置</>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Sub-components ───

function SectionTitle({ icon, title, subtitle }: { icon: React.ReactNode; title: string; subtitle: string }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
        <span style={{ color: 'var(--accent-bright)' }}>{icon}</span>
        <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)' }}>{title}</span>
      </div>
      {subtitle && <div style={{ fontSize: 12, color: 'var(--text-muted)', marginLeft: 24 }}>{subtitle}</div>}
    </div>
  )
}

function SplitResultRow({ label, count, total, color }: { label: string; count: number; total: number; color: string }) {
  const pct = total > 0 ? (count / total) * 100 : 0
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
        <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{label}</span>
        <span style={{ fontSize: 12, fontFamily: 'JetBrains Mono', fontWeight: 600, color }}>{count.toLocaleString()} 张 ({pct.toFixed(1)}%)</span>
      </div>
      <div className="progress-bar">
        <div className="progress-fill" style={{ width: `${pct}%`, background: color }} />
      </div>
    </div>
  )
}
