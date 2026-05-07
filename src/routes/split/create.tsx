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
} from 'lucide-react'

export const Route = createFileRoute('/split/create')({
  component: RouteComponent,
})

const DATASETS = [
  {
    id: 'ds-001',
    name: '道路缺陷检测数据集 v2.3',
    images: 4872,
    classes: ['裂缝', '坑洼', '破损', '剥落', '标线模糊', '积水', '障碍物', '正常'],
    source: '科宝标注平台',
    synced: '2026-04-29 08:30',
    annotations: Array.from({ length: 4872 }, (_, i) => ({
      id: `ann-${i + 1}`,
      name: `image_${String(i + 1).padStart(5, '0')}.jpg`,
      set: 'train' as 'train' | 'val' | 'test',
    })),
  },
  {
    id: 'ds-002',
    name: '施工安全帽检测集',
    images: 2391,
    classes: ['安全帽', '无安全帽', '人员'],
    source: '科宝标注平台',
    synced: '2026-04-28 11:20',
    annotations: Array.from({ length: 2391 }, (_, i) => ({
      id: `ann-${i + 1}`,
      name: `image_${String(i + 1).padStart(5, '0')}.jpg`,
      set: 'train' as 'train' | 'val' | 'test',
    })),
  },
]

type SplitMode = 'auto' | 'manual'
type SetType = 'train' | 'val' | 'test'

interface SliceForm {
  name: string
  comment: string
  datasetId: string
  trainRatio: number
  valRatio: number
  testRatio: number
}

function RouteComponent() {
  const navigate = useNavigate()
  const [mode, setMode] = useState<SplitMode>('auto')
  const [currentPage, setCurrentPage] = useState(0)
  const [pageSize] = useState(20)
  const [form, setForm] = useState<SliceForm>({
    name: '',
    comment: '',
    datasetId: 'ds-001',
    trainRatio: 70,
    valRatio: 20,
    testRatio: 10,
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

  function setField<K extends keyof SliceForm>(key: K, value: SliceForm[K]) {
    setForm(prev => ({ ...prev, [key]: value }))
  }

  function applyAutoSplit() {
    const total = annotations.length
    const trainCount = Math.round(total * form.trainRatio / 100)
    const valCount = Math.round(total * form.valRatio / 100)
    const shuffled = [...annotations].sort(() => Math.random() - 0.5)

    shuffled.forEach((ann, i) => {
      if (i < trainCount) ann.set = 'train'
      else if (i < trainCount + valCount) ann.set = 'val'
      else ann.set = 'test'
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

  function setPageAnnotations(pageAnnotations: typeof annotations, set: SetType) {
    pageAnnotations.forEach(ann => {
      const target = annotations.find(a => a.id === ann.id)
      if (target) target.set = set
    })
  }

  function handleSave() {
    const sliceData = {
      name: form.name || `切分_${new Date().toLocaleDateString('zh-CN')}`,
      datasetId: form.datasetId,
      datasetName: dataset?.name,
      totalAnnotations: annotations.length,
      splits: {
        train: counts.train,
        val: counts.val,
        test: counts.test,
      },
      assignments: annotations.map(a => ({
        annotationId: a.id,
        name: a.name,
        set: a.set,
      })),
    }
    console.log('保存切分数据:', sliceData)
    navigate({ to: '/slices' })
  }

  return (
    <div style={{ animation: 'slideIn 0.3s ease-out' }}>
      <div className="page-header">
        <div>
          <div className="breadcrumb">
            <Link to="/">科宝训练平台</Link> ›
            <Link to="/slices">切分管理</Link> ›
            <span>创建切分</span>
          </div>
          <h1 className="page-title">创建切分</h1>
        </div>
      </div>

      <div style={{ padding: '28px 32px', maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 24 }}>
          <div>
            <SectionTitle icon={<Layers size={15} />} title="选择数据集" subtitle="从科宝标注平台同步的数据集" />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24 }}>
              {DATASETS.map(ds => (
                <div
                  key={ds.id}
                  className="select-card"
                  style={{
                    borderColor: form.datasetId === ds.id ? 'var(--accent)' : undefined,
                    background: form.datasetId === ds.id ? 'var(--accent-glow)' : undefined,
                  }}
                  onClick={() => {
                    setField('datasetId', ds.id)
                    setCurrentPage(0)
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
                    <div>
                      <div style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>{ds.name}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 8 }}>
                        同步于 {ds.synced} · {ds.source}
                      </div>
                      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                        <span style={{ background: 'rgba(29,78,216,0.1)', color: 'var(--accent-bright)', fontSize: 11, padding: '2px 8px', borderRadius: 4, fontFamily: 'JetBrains Mono' }}>
                          {ds.images.toLocaleString()} 张
                        </span>
                        <span style={{ background: 'var(--bg-elevated)', color: 'var(--text-secondary)', fontSize: 11, padding: '2px 8px', borderRadius: 4 }}>
                          {ds.classes.length} 类别
                        </span>
                      </div>
                    </div>
                    {form.datasetId === ds.id && (
                      <div style={{ width: 20, height: 20, background: 'var(--accent)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <CheckCircle2 size={12} color="white" />
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
              <button
                className={`btn ${mode === 'auto' ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setMode('auto')}
              >
                <Shuffle size={14} /> 自动切分
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
                <SectionTitle icon={<SplitSquareVertical size={15} />} title="自动切分" subtitle="设置训练集、验证集、测试集比例，系统自动分配标注资源" />
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

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <SliderField
                      label="训练集比例"
                      value={form.trainRatio}
                      min={50}
                      max={90}
                      onChange={v => {
                        const val = Math.min(Math.max(v, 50), 90)
                        const remaining = 100 - val
                        const vr = Math.round(remaining * (form.valRatio / (form.valRatio + form.testRatio)))
                        const tr = 100 - val - vr
                        setForm(prev => ({ ...prev, trainRatio: val, valRatio: vr, testRatio: tr }))
                      }}
                      color="var(--accent)"
                      suffix="%"
                    />
                    <SliderField
                      label="验证集比例"
                      value={form.valRatio}
                      min={5}
                      max={30}
                      onChange={v => {
                        const val = Math.min(Math.max(v, 5), 30)
                        const tr = 100 - form.trainRatio - val
                        if (tr >= 5) setForm(prev => ({ ...prev, valRatio: val, testRatio: tr }))
                      }}
                      color="var(--teal)"
                      suffix="%"
                      hint={`测试集自动计算为 ${form.testRatio}%`}
                    />
                  </div>

                  <div style={{ marginTop: 20, display: 'flex', gap: 10 }}>
                    <button className="btn btn-primary" onClick={applyAutoSplit}>
                      <Shuffle size={14} /> 应用自动切分
                    </button>
                    <button className="btn btn-ghost" onClick={resetToDefault}>
                      <RotateCcw size={14} /> 重置为训练集
                    </button>
                  </div>

                  <div style={{ marginTop: 16, padding: '10px 14px', background: 'rgba(29,78,216,0.06)', borderRadius: 8, border: '1px solid rgba(29,78,216,0.15)', display: 'flex', gap: 8, fontSize: 12, color: 'var(--text-secondary)' }}>
                    <Info size={13} style={{ color: 'var(--accent-bright)', flexShrink: 0, marginTop: 1 }} />
                    <span>点击"应用自动切分"后，系统将随机分配标注资源到各集合。推荐训练集 70%、验证集 20%、测试集 10%。</span>
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
                      <button
                        className="btn btn-sm btn-secondary"
                        onClick={() => setPageAnnotations(paginatedAnnotations, 'train')}
                      >
                        本页设为训练集
                      </button>
                      <button
                        className="btn btn-sm btn-teal"
                        onClick={() => setPageAnnotations(paginatedAnnotations, 'val')}
                      >
                        本页设为验证集
                      </button>
                      <button
                        className="btn btn-sm btn-warning"
                        onClick={() => setPageAnnotations(paginatedAnnotations, 'test')}
                      >
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
                          background: ann.set === 'train' ? 'rgba(59,130,246,0.1)' : ann.set === 'val' ? 'rgba(13,148,136,0.1)' : 'rgba(245,158,11,0.1)',
                          border: `2px solid ${ann.set === 'train' ? 'var(--accent-bright)' : ann.set === 'val' ? 'var(--teal)' : 'var(--warning)'}`,
                          borderRadius: 8,
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
                        <div style={{
                          fontSize: 9,
                          fontWeight: 600,
                          textAlign: 'center',
                          marginTop: 4,
                          padding: '2px 4px',
                          borderRadius: 4,
                          color: ann.set === 'train' ? 'var(--accent-bright)' : ann.set === 'val' ? 'var(--teal)' : 'var(--warning)',
                          background: ann.set === 'train' ? 'rgba(59,130,246,0.15)' : ann.set === 'val' ? 'rgba(13,148,136,0.15)' : 'rgba(245,158,11,0.15)',
                        }}>
                          {ann.set === 'train' ? '训练' : ann.set === 'val' ? '验证' : '测试'}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 12, marginTop: 16 }}>
                    <button
                      className="btn btn-ghost btn-sm"
                      disabled={currentPage === 0}
                      onClick={() => setCurrentPage(p => p - 1)}
                    >
                      <ChevronLeft size={14} /> 上一页
                    </button>
                    <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                      {currentPage + 1} / {totalPages}
                    </span>
                    <button
                      className="btn btn-ghost btn-sm"
                      disabled={currentPage >= totalPages - 1}
                      onClick={() => setCurrentPage(p => p + 1)}
                    >
                      下一页 <ChevronRight size={14} />
                    </button>
                  </div>
                </div>

                <div style={{ padding: '10px 14px', background: 'rgba(13,148,136,0.06)', borderRadius: 8, border: '1px solid rgba(13,148,136,0.15)', display: 'flex', gap: 8, fontSize: 12, color: 'var(--text-secondary)' }}>
                  <Info size={13} style={{ color: 'var(--teal)', flexShrink: 0, marginTop: 1 }} />
                  <span>点击单张图片可循环切换集合归属。也可使用本页批量按钮快速设置。</span>
                </div>
              </div>
            )}
          </div>

          <div>
            <div className="card" style={{ padding: 20, position: 'sticky', top: 24 }}>
              <SectionTitle icon={<Settings2 size={15} />} title="切分配置" subtitle="" />

              <div style={{ marginBottom: 16 }}>
                <label className="form-label">切分名称</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder={`切分_${new Date().toLocaleDateString('zh-CN')}`}
                  value={form.name}
                  onChange={e => setField('name', e.target.value)}
                />
              </div>

              <div style={{ marginBottom: 16 }}>
                <label className="form-label">备注</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder={`切分_${new Date().toLocaleDateString('zh-CN')}`}
                  value={form.name}
                  onChange={e => setField('name', e.target.value)}
                />
              </div>

              <div style={{ marginBottom: 20 }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 12 }}>当前切分结果</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <SplitResultRow label="训练集" count={counts.train} total={annotations.length} color="var(--accent-bright)" />
                  <SplitResultRow label="验证集" count={counts.val} total={annotations.length} color="var(--teal)" />
                  <SplitResultRow label="测试集" count={counts.test} total={annotations.length} color="var(--warning)" />
                </div>
              </div>

              <div style={{ padding: '12px 14px', background: 'rgba(29,78,216,0.06)', borderRadius: 8, border: '1px solid rgba(29,78,216,0.12)', marginBottom: 16, fontSize: 11.5, color: 'var(--text-secondary)' }}>
                <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: 6 }}>数据保存格式</div>
                <div style={{ fontFamily: 'JetBrains Mono', fontSize: 10.5, color: 'var(--text-muted)' }}>
                  {`{ annotationId, name, set }`}
                </div>
              </div>

              <button className="btn btn-primary" style={{ width: '100%' }} onClick={handleSave}>
                <Save size={14} /> 保存切分
              </button>

              <div style={{ marginTop: 12, fontSize: 11, color: 'var(--text-muted)', textAlign: 'center' }}>
                保存后将生成切分记录，可用于训练任务
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
        min={min}
        max={max}
        value={value}
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