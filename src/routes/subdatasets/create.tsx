import { createFileRoute, useNavigate, Link } from '@tanstack/react-router'
import { useState, useMemo } from 'react'
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

interface SubdatasetForm {
  name: string
  comment: string
  datasetId: string
  trainRatio: number
  valRatio: number
  testRatio: number
  selectedLabels: string[]
}

function CreateSubdataset() {
  const navigate = useNavigate()
  const [mode, setMode] = useState<SplitMode>('auto')
  const [currentPage, setCurrentPage] = useState(0)
  const [pageSize] = useState(20)
  const [form, setForm] = useState<SubdatasetForm>({
    name: '',
    comment: '',
    datasetId: 'ds-001',
    trainRatio: 70,
    valRatio: 20,
    testRatio: 10,
    selectedLabels: [],
  })

  const dataset = DATASETS.find(d => d.id === form.datasetId)

  const annotations = useMemo(() => {
    if (!dataset) return []
    return dataset.annotations.map(ann => ({ ...ann }))
  }, [dataset])

  const totalPages = Math.ceil(annotations.length / pageSize)

  const paginatedAnnotations = useMemo(() => {
    const start = currentPage * pageSize
    return annotations.slice(start, start + pageSize)
  }, [annotations, currentPage])

  const counts = useMemo(() => {
    const result = { train: 0, val: 0, test: 0 }
    annotations.forEach(a => result[a.set]++)
    return result
  }, [annotations])

  function setField<K extends keyof SubdatasetForm>(key: K, value: SubdatasetForm[K]) {
    setForm(prev => ({ ...prev, [key]: value }))
  }

  function toggleLabel(label: string) {
    setForm(prev => {
      const current = prev.selectedLabels
      if (current.includes(label)) {
        return { ...prev, selectedLabels: current.filter(l => l !== label) }
      }
      if (current.length >= 3) return prev
      return { ...prev, selectedLabels: [...current, label] }
    })
  }

  // Priority split: distribute annotations with selected labels first by ratio
  function applyAutoSplit() {
    const selected = form.selectedLabels
    let priorityAnns: Annotation[] = []
    let otherAnns: Annotation[] = []

    if (selected.length > 0) {
      // Separate annotations that contain the selected labels
      annotations.forEach(ann => {
        if (ann.classes.some(c => selected.includes(c))) {
          priorityAnns.push(ann)
        } else {
          otherAnns.push(ann)
        }
      })
    } else {
      otherAnns = [...annotations]
    }

    // Shuffle both groups independently
    priorityAnns = priorityAnns.sort(() => Math.random() - 0.5)
    otherAnns = otherAnns.sort(() => Math.random() - 0.5)

    // Distribute priority annotations according to ratio
    const trainCount = Math.round(annotations.length * form.trainRatio / 100)
    const valCount = Math.round(annotations.length * form.valRatio / 100)

    let trainIdx = 0, valIdx = 0, testIdx = 0

    // Distribute priority annotations first
    priorityAnns.forEach(ann => {
      const trainTarget = Math.round(priorityAnns.length * form.trainRatio / 100)
      const valTarget = Math.round(priorityAnns.length * form.valRatio / 100)

      if (trainIdx < trainTarget) {
        ann.set = 'train'; trainIdx++
      } else if (valIdx < valTarget) {
        ann.set = 'val'; valIdx++
      } else {
        ann.set = 'test'; testIdx++
      }
    })

    // Fill remaining slots with other annotations
    otherAnns.forEach(ann => {
      const totalTrain = Math.round(annotations.length * form.trainRatio / 100)
      const totalVal = Math.round(annotations.length * form.valRatio / 100)

      if (trainIdx < totalTrain) {
        ann.set = 'train'; trainIdx++
      } else if (valIdx < totalVal) {
        ann.set = 'val'; valIdx++
      } else {
        ann.set = 'test'; testIdx++
      }
    })

    setCurrentPage(0)
  }

  function resetToDefault() {
    if (!dataset) return
    dataset.annotations.forEach(ann => { ann.set = 'train' })
    setCurrentPage(0)
  }

  function setAnnotationSet(annId: string, set: SetType) {
    const ann = annotations.find(a => a.id === annId)
    if (ann) ann.set = set
  }

  function setPageAnnotations(pageAnnotations: Annotation[], set: SetType) {
    pageAnnotations.forEach(ann => {
      const target = annotations.find(a => a.id === ann.id)
      if (target) target.set = set
    })
  }

  function handleSave() {
    console.log('保存子数据集数据:', {
      name: form.name || `子数据集_${new Date().toLocaleDateString('zh-CN')}`,
      parentDatasetId: form.datasetId,
      parentDatasetName: dataset?.name,
      totalAnnotations: annotations.length,
      selectedLabels: form.selectedLabels,
      splits: { train: counts.train, val: counts.val, test: counts.test },
    })
    navigate({ to: '/subdatasets' })
  }

  // Count annotations matching selected labels per set
  const labelCountsBySet = useMemo(() => {
    if (form.selectedLabels.length === 0) return null
    const result = { train: 0, val: 0, test: 0 }
    annotations.forEach(ann => {
      if (ann.classes.some(c => form.selectedLabels.includes(c))) {
        result[ann.set]++
      }
    })
    return result
  }, [annotations, form.selectedLabels])

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
            <div style={{ marginBottom: 24 }}>
              <SearchableDropdown
                label="选择父数据集"
                color="var(--accent-bright)"
                selectedId={form.datasetId}
                onChange={(id) => {
                  setField('datasetId', id)
                  setField('selectedLabels', [])
                  setCurrentPage(0)
                }}
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

            {/* Label of Interest Selection */}
            {dataset && (
              <div style={{ marginBottom: 20 }}>
                <SectionTitle icon={<Tag size={15} />} title="感兴趣标签" subtitle="最多选择 3 个标签，系统优先按比例划分含这些标签的图片（可选）" />
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
                      已选择 {form.selectedLabels.length}/3 个标签，系统将优先确保这些标签的图片按比例均匀分配到各子集
                    </div>
                  )}
                </div>
              </div>
            )}

            <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
              <button
                className={`btn ${mode === 'auto' ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setMode('auto')}
              >
                <Shuffle size={14} /> 自动划分
              </button>
              <button
                className={`btn ${mode === 'manual' ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setMode('manual')}
              >
                <Grid3X3 size={14} /> 手动调整
              </button>
            </div>

            {mode === 'auto' && (
              <div style={{ animation: 'slideIn 0.2s ease-out' }}>
                <SectionTitle icon={<SplitSquareVertical size={15} />} title="自动划分" subtitle="设置训练集、验证集、测试集比例，系统自动分配" />
                <div className="card" style={{ padding: 24 }}>
                  <div className="split-bar" style={{ marginBottom: 20 }}>
                    <div className="split-seg split-train" style={{ flex: form.trainRatio }}>
                      训练集 {form.trainRatio}%
                    </div>
                    <div className="split-seg split-val" style={{ flex: form.valRatio }}>
                      验证集 {form.valRatio}%
                    </div>
                    <div className="split-seg split-test" style={{ flex: form.testRatio }}>
                      测试集 {form.testRatio}%
                    </div>
                  </div>

                  {dataset && (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 20 }}>
                      {[
                        { label: '训练集', ratio: form.trainRatio, count: counts.train, color: 'var(--accent-bright)' },
                        { label: '验证集', ratio: form.valRatio, count: counts.val, color: 'var(--teal)' },
                        { label: '测试集', ratio: form.testRatio, count: counts.test, color: 'var(--warning)' },
                      ].map(s => (
                        <div key={s.label} className="metric-chip">
                          <div className="metric-chip-value" style={{ color: s.color, fontSize: 18 }}>
                            {s.count.toLocaleString()}
                          </div>
                          <div className="metric-chip-label">{s.label} ({s.ratio}%)</div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Label distribution info */}
                  {labelCountsBySet && (
                    <div style={{
                      marginBottom: 20,
                      padding: 12,
                      background: 'rgba(13,148,136,0.06)',
                      border: '1px solid rgba(13,148,136,0.15)',
                    }}>
                      <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--teal)', marginBottom: 8 }}>
                        <Tag size={11} style={{ display: 'inline', marginRight: 4 }} />
                        感兴趣标签分布
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, fontSize: 11 }}>
                        {(['train', 'val', 'test'] as const).map(set => (
                          <div key={set}>
                            <span style={{ color: 'var(--text-muted)' }}>{set === 'train' ? '训练集' : set === 'val' ? '验证集' : '测试集'}：</span>
                            <span style={{ fontFamily: 'JetBrains Mono', fontWeight: 600, color: 'var(--text-primary)' }}>
                              {labelCountsBySet[set]}
                            </span>
                            <span style={{ color: 'var(--text-muted)' }}> 张</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <SliderField
                      label="训练集比例"
                      value={form.trainRatio}
                      min={50} max={90}
                      onChange={v => {
                        const val = Math.min(Math.max(v, 50), 90)
                        const remaining = 100 - val
                        const vr = Math.round(remaining * (form.valRatio / (form.valRatio + form.testRatio)))
                        setForm(prev => ({ ...prev, trainRatio: val, valRatio: vr, testRatio: 100 - val - vr }))
                      }}
                      color="var(--accent)" suffix="%"
                    />
                    <SliderField
                      label="验证集比例"
                      value={form.valRatio}
                      min={5} max={30}
                      onChange={v => {
                        const val = Math.min(Math.max(v, 5), 30)
                        const tr = 100 - form.trainRatio - val
                        if (tr >= 5) setForm(prev => ({ ...prev, valRatio: val, testRatio: tr }))
                      }}
                      color="var(--teal)" suffix="%"
                      hint={`测试集自动计算为 ${form.testRatio}%`}
                    />
                  </div>

                  <div style={{ marginTop: 20, display: 'flex', gap: 10 }}>
                    <button className="btn btn-primary" onClick={applyAutoSplit}>
                      <Shuffle size={14} /> 应用自动划分
                    </button>
                    <button className="btn btn-ghost" onClick={resetToDefault}>
                      <RotateCcw size={14} /> 重置为训练集
                    </button>
                  </div>

                  <div style={{ marginTop: 16, padding: '10px 14px', background: 'rgba(29,78,216,0.06)', border: '1px solid rgba(29,78,216,0.15)', display: 'flex', gap: 8, fontSize: 12, color: 'var(--text-secondary)' }}>
                    <Info size={13} style={{ color: 'var(--accent-bright)', flexShrink: 0, marginTop: 1 }} />
                    <span>
                      {form.selectedLabels.length > 0
                        ? '系统将优先按比例分配含感兴趣标签的图片，再随机分配其余图片。推荐训练集 70%、验证集 20%、测试集 10%。'
                        : '点击"应用自动划分"后，系统将随机分配图片到各集合。推荐训练集 70%、验证集 20%、测试集 10%。'}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {mode === 'manual' && (
              <div style={{ animation: 'slideIn 0.2s ease-out' }}>
                <SectionTitle icon={<Grid3X3 size={15} />} title="手动调整" subtitle="逐张图片选择所属集合，当前页可批量设置" />

                <div className="card" style={{ padding: 16, marginBottom: 16 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button className="btn btn-sm btn-secondary" onClick={() => setPageAnnotations(paginatedAnnotations, 'train')}>
                        本页设为训练集
                      </button>
                      <button className="btn btn-sm btn-teal" onClick={() => setPageAnnotations(paginatedAnnotations, 'val')}>
                        本页设为验证集
                      </button>
                      <button className="btn btn-sm btn-warning" onClick={() => setPageAnnotations(paginatedAnnotations, 'test')}>
                        本页设为测试集
                      </button>
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                      第 {currentPage * pageSize + 1} - {Math.min((currentPage + 1) * pageSize, annotations.length)} 张，共 {annotations.length} 张
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 8 }}>
                    {paginatedAnnotations.map(ann => (
                      <div
                        key={ann.id}
                        style={{
                          background: ann.set === 'train' ? 'rgba(59,130,246,0.08)' : ann.set === 'val' ? 'rgba(13,148,136,0.08)' : 'rgba(245,158,11,0.08)',
                          border: `2px solid ${ann.set === 'train' ? 'var(--accent-bright)' : ann.set === 'val' ? 'var(--teal)' : 'var(--warning)'}`,
                          padding: '8px 6px',
                          cursor: 'pointer',
                          transition: 'all 0.15s ease',
                        }}
                        onClick={() => {
                          const next: SetType = ann.set === 'train' ? 'val' : ann.set === 'val' ? 'test' : 'train'
                          setAnnotationSet(ann.id, next)
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 4 }}>
                          <Image size={12} style={{ color: 'var(--text-muted)' }} />
                        </div>
                        <div style={{ fontSize: 10, color: 'var(--text-muted)', textAlign: 'center', fontFamily: 'JetBrains Mono' }}>
                          {ann.name.replace('.jpg', '').replace('image_', '')}
                        </div>
                        {ann.classes.length > 0 && (
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 2, justifyContent: 'center', marginTop: 4 }}>
                            {ann.classes.filter(c => form.selectedLabels.length === 0 || form.selectedLabels.includes(c)).slice(0, 2).map(cls => (
                              <span key={cls} style={{
                                fontSize: 8,
                                padding: '1px 3px',
                                background: form.selectedLabels.includes(cls) ? 'rgba(13,148,136,0.2)' : 'rgba(148,163,184,0.15)',
                                color: form.selectedLabels.includes(cls) ? 'var(--teal)' : 'var(--text-muted)',
                              }}>
                                {cls}
                              </span>
                            ))}
                          </div>
                        )}
                        <div style={{
                          fontSize: 9, fontWeight: 600, textAlign: 'center', marginTop: 4,
                          padding: '2px 4px',
                          color: ann.set === 'train' ? 'var(--accent-bright)' : ann.set === 'val' ? 'var(--teal)' : 'var(--warning)',
                          background: ann.set === 'train' ? 'rgba(59,130,246,0.12)' : ann.set === 'val' ? 'rgba(13,148,136,0.12)' : 'rgba(245,158,11,0.12)',
                        }}>
                          {ann.set === 'train' ? '训练' : ann.set === 'val' ? '验证' : '测试'}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 12, marginTop: 16 }}>
                    <button className="btn btn-ghost btn-sm" disabled={currentPage === 0} onClick={() => setCurrentPage(p => p - 1)}>
                      <ChevronLeft size={14} /> 上一页
                    </button>
                    <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{currentPage + 1} / {totalPages}</span>
                    <button className="btn btn-ghost btn-sm" disabled={currentPage >= totalPages - 1} onClick={() => setCurrentPage(p => p + 1)}>
                      下一页 <ChevronRight size={14} />
                    </button>
                  </div>
                </div>

                <div style={{ padding: '10px 14px', background: 'rgba(13,148,136,0.06)', border: '1px solid rgba(13,148,136,0.15)', display: 'flex', gap: 8, fontSize: 12, color: 'var(--text-secondary)' }}>
                  <Info size={13} style={{ color: 'var(--teal)', flexShrink: 0, marginTop: 1 }} />
                  <span>点击单张图片可循环切换归属集合，也可使用批量按钮快速设置。</span>
                </div>
              </div>
            )}
          </div>

          <div>
            <div className="card" style={{ padding: 20, position: 'sticky', top: 24 }}>
              <SectionTitle icon={<Settings2 size={15} />} title="子数据集配置" subtitle="" />

              <div style={{ marginBottom: 16 }}>
                <label className="form-label">子数据集名称</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder={`子数据集_${new Date().toLocaleDateString('zh-CN')}`}
                  value={form.name}
                  onChange={e => setField('name', e.target.value)}
                />
              </div>

              <div style={{ marginBottom: 16 }}>
                <label className="form-label">备注</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="子数据集备注说明（可选）"
                  value={form.comment}
                  onChange={e => setField('comment', e.target.value)}
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

              <div style={{ marginBottom: 20 }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 12 }}>当前划分结果</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <SplitResultRow label="训练集" count={counts.train} total={annotations.length} color="var(--accent-bright)" />
                  <SplitResultRow label="验证集" count={counts.val} total={annotations.length} color="var(--teal)" />
                  <SplitResultRow label="测试集" count={counts.test} total={annotations.length} color="var(--warning)" />
                </div>
              </div>

              <div style={{ padding: '12px 14px', background: 'rgba(29,78,216,0.06)', border: '1px solid rgba(29,78,216,0.12)', marginBottom: 16, fontSize: 11.5, color: 'var(--text-secondary)' }}>
                <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: 6 }}>数据保存格式</div>
                <div style={{ fontFamily: 'JetBrains Mono', fontSize: 10.5, color: 'var(--text-muted)' }}>
                  {`{ annotationId, name, set, classes }`}
                </div>
              </div>

              <button className="btn btn-primary" style={{ width: '100%' }} onClick={handleSave}>
                <Save size={14} /> 保存子数据集
              </button>

              <div style={{ marginTop: 12, fontSize: 11, color: 'var(--text-muted)', textAlign: 'center' }}>
                保存后可用于创建训练任务
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

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

function SliderField({ label, value, min, max, onChange, color, suffix = '', hint }: {
  label: string; value: number; min: number; max: number; onChange: (v: number) => void; color: string; suffix?: string; hint?: string
}) {
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <label className="form-label" style={{ marginBottom: 0 }}>{label}</label>
        <span style={{ fontFamily: 'JetBrains Mono', fontSize: 14, fontWeight: 600, color }}>{value}{suffix}</span>
      </div>
      <input
        type="range"
        min={min} max={max} value={value}
        onChange={e => onChange(Number(e.target.value))}
        style={{ background: `linear-gradient(90deg, ${color} ${((value - min) / (max - min)) * 100}%, var(--border-default) ${((value - min) / (max - min)) * 100}%)` }}
      />
      {hint && <div className="form-hint">{hint}</div>}
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
