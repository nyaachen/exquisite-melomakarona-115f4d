import { createFileRoute, useNavigate, Link } from '@tanstack/react-router'
import { useState, useMemo, useCallback } from 'react'
import {
  Layers,
  SplitSquareVertical,
  Settings2,
  Grid3X3,
  CheckCircle2,
  Info,
  ChevronLeft,
  ChevronRight,
  Shuffle,
  Save,
  RotateCcw,
  Image,
  Tag,
  Search,
  X,
} from 'lucide-react'
import { SearchableDropdown } from '../../components/SearchableDropdown'

export const Route = createFileRoute('/subdatasets/create')({
  component: CreateSubdataset,
})

interface Annotation {
  id: string
  name: string
  set: 'train' | 'val' | 'test'
  classes: string[]
}

const DATASETS = [
  {
    id: 'ds-001',
    name: '道路缺陷检测数据集 v2.3',
    images: 4872,
    classes: ['裂缝', '坑洼', '破损', '剥落', '标线模糊', '积水', '障碍物', '正常'],
    source: '科宝标注平台',
    synced: '2026-04-29 08:30',
    annotations: Array.from({ length: 4872 }, (_, i) => {
      const classPool = ['裂缝', '坑洼', '破损', '剥落', '标线模糊', '积水', '障碍物', '正常']
      const numClasses = 1 + Math.floor(Math.random() * 3)
      const annClasses: string[] = []
      for (let j = 0; j < numClasses; j++) {
        annClasses.push(classPool[(i + j * 7 + j * j * 3) % classPool.length])
      }
      return {
        id: `ann-${i + 1}`,
        name: `image_${String(i + 1).padStart(5, '0')}.jpg`,
        set: 'train' as const,
        classes: [...new Set(annClasses)],
      }
    }),
  },
  {
    id: 'ds-002',
    name: '施工安全帽检测集',
    images: 2391,
    classes: ['安全帽', '无安全帽', '人员'],
    source: '科宝标注平台',
    synced: '2026-04-28 11:20',
    annotations: Array.from({ length: 2391 }, (_, i) => {
      const classPool = ['安全帽', '无安全帽', '人员']
      const numClasses = 1 + Math.floor(Math.random() * 2)
      const annClasses: string[] = []
      for (let j = 0; j < numClasses; j++) {
        annClasses.push(classPool[(i + j * 3) % classPool.length])
      }
      return {
        id: `ann-${i + 1}`,
        name: `image_${String(i + 1).padStart(5, '0')}.jpg`,
        set: 'train' as const,
        classes: [...new Set(annClasses)],
      }
    }),
  },
]

type SplitMode = 'auto' | 'manual'
type SetType = 'train' | 'val' | 'test'

const SET_META = {
  train: { label: '训练集', color: 'var(--accent-bright)', bg: 'rgba(59,130,246,0.08)', badge: '训练' },
  val:   { label: '验证集', color: 'var(--teal)',             bg: 'rgba(13,148,136,0.08)', badge: '验证' },
  test:  { label: '测试集', color: 'var(--warning)',          bg: 'rgba(245,158,11,0.08)', badge: '测试' },
} as const

function CreateSubdataset() {
  const navigate = useNavigate()
  const [mode, setMode] = useState<SplitMode>('auto')
  const [currentPage, setCurrentPage] = useState(0)
  const [pageSize] = useState(20)

  // Each annotation's set assignment — stored in a plain JS object for reactivity
  const [assignments, setAssignments] = useState<Record<string, SetType>>(() => {
    const init: Record<string, SetType> = {}
    const ds = DATASETS[0]
    ds.annotations.forEach(a => { init[a.id] = 'train' })
    return init
  })

  const [form, setForm] = useState({
    name: '',
    comment: '',
    datasetId: 'ds-001',
    trainRatio: 70,
    valRatio: 20,
    testRatio: 10,
    trainCount: 0,
    valCount: 0,
    testCount: 0,
    selectedLabels: [] as string[],
  })

  // Manual mode search
  const [labelSearch, setLabelSearch] = useState('')

  const dataset = DATASETS.find(d => d.id === form.datasetId)

  // When dataset changes, reset assignments
  const handleDatasetChange = useCallback((id: string) => {
    const ds = DATASETS.find(d => d.id === id)
    if (!ds) return
    const init: Record<string, SetType> = {}
    ds.annotations.forEach(a => { init[a.id] = 'train' })
    setAssignments(init)
    setForm(prev => ({
      ...prev,
      datasetId: id,
      selectedLabels: [],
      trainRatio: 70,
      valRatio: 20,
      testRatio: 10,
      trainCount: 0,
      valCount: 0,
      testCount: 0,
    }))
    setCurrentPage(0)
  }, [])

  const allAnnotations = useMemo(() => {
    if (!dataset) return [] as Annotation[]
    return dataset.annotations.map(ann => ({
      ...ann,
      set: assignments[ann.id] || 'train',
    }))
  }, [dataset, assignments])

  // Filter for manual mode
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

  // Counts from assignments
  const counts = useMemo(() => {
    const result = { train: 0, val: 0, test: 0 }
    allAnnotations.forEach(a => { result[a.set]++ })
    return result
  }, [allAnnotations])

  // ---- Auto split helper ----

  function autoSplit() {
    if (!dataset) return
    const total = allAnnotations.length
    const selected = form.selectedLabels

    let priorityAnns = [...allAnnotations]
    let otherAnns: Annotation[] = []

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
    if (!dataset) return
    const init: Record<string, SetType> = {}
    dataset.annotations.forEach(a => { init[a.id] = 'train' })
    setAssignments(init)
    setCurrentPage(0)
  }

  // ---- Manual helpers ----

  function setAnnotationSet(annId: string, set: SetType) {
    setAssignments(prev => ({ ...prev, [annId]: set }))
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

  function handleSave() {
    navigate({ to: '/subdatasets' })
  }

  // Category tag toggle
  function toggleLabel(label: string) {
    setForm(prev => {
      const current = prev.selectedLabels
      if (current.includes(label)) return { ...prev, selectedLabels: current.filter(l => l !== label) }
      if (current.length >= 3) return prev
      return { ...prev, selectedLabels: [...current, label] }
    })
  }

  // ---- Handlers for ratio changes ----
  function setTrainRatio(v: number) {
    const val = Math.max(0, Math.min(100, v))
    const remaining = 100 - val
    const vr = form.valRatio + form.testRatio > 0 ? Math.round(remaining * (form.valRatio / (form.valRatio + form.testRatio))) : Math.round(remaining / 2)
    setForm(prev => ({ ...prev, trainRatio: val, valRatio: vr, testRatio: 100 - val - vr }))
  }

  function setValRatio(v: number) {
    const val = Math.max(0, Math.min(100 - form.trainRatio, v))
    setForm(prev => ({ ...prev, valRatio: val, testRatio: 100 - prev.trainRatio - val }))
  }

  return (
    <div style={{ animation: 'slideIn 0.3s ease-out' }}>
      <div className="page-header">
        <div>
          <div className="breadcrumb">
            <Link to="/">科宝训练平台</Link> ›
            <Link to="/subdatasets">子数据集</Link> ›
            <span>创建子数据集</span>
          </div>
          <h1 className="page-title">创建子数据集</h1>
        </div>
      </div>

      <div style={{ padding: '28px 32px', maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 24 }}>
          <div>
            {/* Dataset selector */}
            <div style={{ marginBottom: 24 }}>
              <SearchableDropdown
                label="选择父数据集"
                color="var(--accent-bright)"
                selectedId={form.datasetId}
                onChange={handleDatasetChange}
                items={DATASETS.map(ds => ({
                  id: ds.id,
                  name: ds.name,
                  subtitle: `同步于 ${ds.synced} · ${ds.source}`,
                  tags: ds.classes,
                  count: ds.images,
                  countLabel: '张',
                }))}
                placeholder="从科宝标注平台同步的数据集中选择..."
              />
            </div>

            {/* Label of Interest */}
            {dataset && (
              <div style={{ marginBottom: 20 }}>
                <SectionTitle icon={<Tag size={15} />} title="感兴趣标签" subtitle="最多选择 3 个，系统优先按比例分配含这些标签的图片（可选）" />
                <div className="card" style={{ padding: 16 }}>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {dataset.classes.map(cls => {
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
              </div>
            )}

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
            {mode === 'auto' && dataset && (
              <div style={{ animation: 'slideIn 0.2s ease-out' }}>
                <SectionTitle icon={<SplitSquareVertical size={15} />} title="自动划分" subtitle="调节滑块或直接输入比例/数量，实时预览" />
                <div className="card" style={{ padding: 24 }}>
                  {/* Split bar preview */}
                  <div className="split-bar" style={{ marginBottom: 16 }}>
                    <div className="split-seg split-train" style={{ flex: form.trainRatio || 0.1 }}>
                      训练 {form.trainRatio}%
                    </div>
                    <div className="split-seg split-val" style={{ flex: form.valRatio || 0.1 }}>
                      验证 {form.valRatio}%
                    </div>
                    <div className="split-seg split-test" style={{ flex: form.testRatio || 0.1 }}>
                      测试 {form.testRatio}%
                    </div>
                  </div>

                  {/* Count summary */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 20 }}>
                    {[
                      { label: '训练集', ratio: form.trainRatio, count: Math.round(allAnnotations.length * form.trainRatio / 100), color: 'var(--accent-bright)' },
                      { label: '验证集', ratio: form.valRatio, count: Math.round(allAnnotations.length * form.valRatio / 100), color: 'var(--teal)' },
                      { label: '测试集', ratio: form.testRatio, count: Math.round(allAnnotations.length * form.testRatio / 100), color: 'var(--warning)' },
                    ].map(s => (
                      <div key={s.label} className="metric-chip">
                        <div className="metric-chip-value" style={{ color: s.color, fontSize: 18 }}>{s.count.toLocaleString()}</div>
                        <div className="metric-chip-label">{s.label} ({s.ratio}%)</div>
                      </div>
                    ))}
                  </div>

                  {/* Ratio sliders with manual input */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    <RatioRow
                      label="训练集比例"
                      pct={form.trainRatio}
                      count={Math.round(allAnnotations.length * form.trainRatio / 100)}
                      total={allAnnotations.length}
                      color="var(--accent-bright)"
                      onChangePct={setTrainRatio}
                      onChangeCount={c => setTrainRatio(Math.round((c / allAnnotations.length) * 100))}
                    />
                    <RatioRow
                      label="验证集比例"
                      pct={form.valRatio}
                      count={Math.round(allAnnotations.length * form.valRatio / 100)}
                      total={allAnnotations.length}
                      color="var(--teal)"
                      maxPct={100 - form.trainRatio}
                      onChangePct={setValRatio}
                      onChangeCount={c => setValRatio(Math.round((c / allAnnotations.length) * 100))}
                    />
                    {/* Test set: display only */}
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                        <label className="form-label" style={{ marginBottom: 0 }}>测试集比例</label>
                        <span style={{ fontFamily: 'JetBrains Mono', fontSize: 14, fontWeight: 600, color: 'var(--warning)' }}>{form.testRatio}%</span>
                      </div>
                      <div className="progress-bar" style={{ height: 6 }}>
                        <div className="progress-fill" style={{ width: `${form.testRatio}%`, background: 'var(--warning)' }} />
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>
                        {Math.round(allAnnotations.length * form.testRatio / 100).toLocaleString()} 张（自动计算 = 100% − 训练 − 验证）
                      </div>
                    </div>
                  </div>

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
                    <div style={{ marginTop: 16, padding: 12, background: 'rgba(13,148,136,0.06)', border: '1px solid rgba(13,148,136,0.15)' }}>
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
            {mode === 'manual' && dataset && (
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
                                    background: form.selectedLabels.includes(cls) ? 'rgba(13,148,136,0.2)' : 'rgba(148,163,184,0.15)',
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

                <div style={{ padding: '10px 14px', background: 'rgba(13,148,136,0.06)', border: '1px solid rgba(13,148,136,0.15)', display: 'flex', gap: 8, fontSize: 12, color: 'var(--text-secondary)' }}>
                  <Info size={13} style={{ color: 'var(--teal)', flexShrink: 0, marginTop: 1 }} />
                  <span>点击单张图片可循环切换（训练→验证→测试→训练）。使用搜索可快速定位特定标签的图片。</span>
                </div>
              </div>
            )}
          </div>

          {/* ═══════════ RIGHT SIDEBAR ═══════════ */}
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
                      <span key={label} className="class-tag" style={{ background: 'rgba(13,148,136,0.1)', color: 'var(--teal)', borderColor: 'rgba(13,148,136,0.3)' }}>
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

              <div style={{ padding: '12px 14px', background: 'var(--bg-elevated)', border: '1px solid var(--border-dim)', marginBottom: 16, fontSize: 11.5, color: 'var(--text-secondary)' }}>
                <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: 6 }}>数据保存格式</div>
                <div style={{ fontFamily: 'JetBrains Mono', fontSize: 10, color: 'var(--text-muted)', lineHeight: 1.6 }}>
                  名称：{form.name || '(自动生成)'}<br />
                  父数据集：{dataset?.name || '—'}<br />
                  标签：{dataset?.classes.join('、') || '—'}<br />
                  训练 {counts.train.toLocaleString()} 张 / 验证 {counts.val.toLocaleString()} 张 / 测试 {counts.test.toLocaleString()} 张
                </div>
              </div>

              <button className="btn btn-primary" style={{ width: '100%' }} onClick={handleSave}>
                <Save size={14} /> 保存子数据集
              </button>
            </div>
          </div>
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

function RatioRow({ label, pct, count, total, color, maxPct = 100, onChangePct, onChangeCount, readonly }: {
  label: string
  pct: number
  count: number
  total: number
  color: string
  maxPct?: number
  onChangePct?: (v: number) => void
  onChangeCount?: (v: number) => void
  readonly?: boolean
}) {
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
        <label className="form-label" style={{ marginBottom: 0 }}>{label}</label>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {/* Percentage input */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <input
              type="number"
              className="form-input"
              style={{ width: 50, textAlign: 'center', fontFamily: 'JetBrains Mono', fontSize: 12, padding: '4px 6px' }}
              value={pct}
              min={0} max={maxPct}
              onChange={e => {
                if (readonly || !onChangePct) return
                const v = parseInt(e.target.value)
                if (!isNaN(v)) onChangePct(v)
              }}
              disabled={readonly}
            />
            <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>%</span>
          </div>
          {/* Count input */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <input
              type="number"
              className="form-input"
              style={{ width: 64, textAlign: 'center', fontFamily: 'JetBrains Mono', fontSize: 12, padding: '4px 6px' }}
              value={count}
              min={0} max={total}
              onChange={e => {
                if (readonly || !onChangeCount) return
                const v = parseInt(e.target.value)
                if (!isNaN(v)) onChangeCount(Math.max(0, Math.min(total, v)))
              }}
              disabled={readonly}
            />
            <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>张</span>
          </div>
        </div>
      </div>
      {!readonly ? (
        <input
          type="range"
          min={0} max={maxPct} value={pct}
          onChange={e => onChangePct?.(Number(e.target.value))}
          style={{ background: `linear-gradient(90deg, ${color} ${(pct / maxPct) * 100}%, var(--border-default) ${(pct / maxPct) * 100}%)` }}
        />
      ) : (
        <div className="progress-bar" style={{ height: 6 }}>
          <div className="progress-fill" style={{ width: `${pct}%`, background: color }} />
        </div>
      )}
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
