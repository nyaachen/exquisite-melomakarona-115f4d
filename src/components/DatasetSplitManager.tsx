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
  Image,
  Search,
  X,
} from 'lucide-react'
import type { DatasetResource } from '../data/datasets'
import { SplitAdjuster } from './SplitAdjuster'
import { ClassDistributionChart, type ClassDistribution } from './ClassDistributionChart'

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

function resourceToAnnotation(r: DatasetResource): Annotation {
  return {
    id: r.id,
    name: r.fileName,
    set: r.set,
    classes: [...new Set(r.labelResultJson.shapes.map(s => s.labelInfo.name))],
  }
}

// ─── Props ───

interface DatasetSplitManagerProps {
  resources: DatasetResource[]
  classNames: string[]
}

// ─── Component ───

export function DatasetSplitManager({
  resources,
  classNames,
}: DatasetSplitManagerProps) {
  const [mode, setMode] = useState<SplitMode>('auto')
  const [currentPage, setCurrentPage] = useState(0)
  const [pageSize] = useState(20)

  // Derive annotations from resources once
  const annotations = useMemo(() => resources.map(resourceToAnnotation), [resources])

  // Compute real split ratios from actual annotation assignments
  const realSplit = useMemo(() => {
    const setCounts = { train: 0, val: 0, test: 0 }
    annotations.forEach(a => { setCounts[a.set]++ })
    const total = annotations.length || 1
    return {
      train: Math.round((setCounts.train / total) * 100),
      val: Math.round((setCounts.val / total) * 100),
      test: 100 - Math.round((setCounts.train / total) * 100) - Math.round((setCounts.val / total) * 100),
    }
  }, [annotations])

  const [assignments, setAssignments] = useState<Record<string, SetType>>(() => {
    const init: Record<string, SetType> = {}
    annotations.forEach(a => { init[a.id] = a.set })
    return init
  })
  const [form, setForm] = useState({
    trainRatio: realSplit.train,
    valRatio: realSplit.val,
    testRatio: realSplit.test,
    selectedLabels: [] as string[],
  })
  const [labelSearch, setLabelSearch] = useState('')

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

  const classDistributionData = useMemo<ClassDistribution[]>(() => {
    return classNames.map(name => {
      const dist = { 训练集: 0, 验证集: 0, 测试集: 0 }
      allAnnotations.forEach(ann => {
        if (ann.classes.includes(name)) {
          const key = ann.set === 'train' ? '训练集' : ann.set === 'val' ? '验证集' : '测试集'
          dist[key]++
        }
      })
      return { name, ...dist }
    })
  }, [classNames, allAnnotations])

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

  // ─── Render ───

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 24, animation: 'slideIn 0.25s ease-out' }}>
      {/* Main area */}
      <div>
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
              {/* Labels of interest */}
              <div style={{ marginBottom: 20, padding: 16, background: 'var(--bg-elevated)', border: '1px solid var(--border-dim)' }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Tag size={13} style={{ color: 'var(--accent-bright)' }} />
                  感兴趣标签
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 10 }}>最多选择 3 个，系统优先按比例分配含这些标签的图片（可选）</div>
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
                          background: isSelected ? 'var(--accent-glow)' : 'var(--bg-surface)',
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

              <SplitAdjuster
                totalCount={allAnnotations.length}
                split={{ train: form.trainRatio, val: form.valRatio, test: form.testRatio }}
                onChange={handleSplitChange}
                showPercentInputs
                showCountInputs
              />
            </div>

            <button className="btn btn-primary" style={{ marginTop: 16 }} onClick={autoSplit}>
              <Save size={14} /> 保存
            </button>
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

            <button className="btn btn-primary" style={{ marginTop: 16 }}>
              <Save size={14} /> 保存
            </button>
          </div>
        )}
      </div>

      {/* ═══════════ Right sidebar ═══════════ */}
      <div>
        <div className="card" style={{ padding: 20, position: 'sticky', top: 24 }}>
          <SectionTitle icon={<Settings2 size={15} />} title="数据集分布情况" subtitle="" />

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

          {/* Class distribution chart */}
          <ClassDistributionChart data={classDistributionData} minHeight={200} rowHeight={32} />
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
