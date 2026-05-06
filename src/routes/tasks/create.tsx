import { createFileRoute, useNavigate, Link } from '@tanstack/react-router'
import { useState } from 'react'
import {
  ChevronRight,
  ChevronLeft,
  Layers,
  Target,
  Sliders,
  CheckCircle2,
  Info,
  Zap,
  Copy,
} from 'lucide-react'

export const Route = createFileRoute('/tasks/create')({
  component: CreateTask,
})

// ─── Mock datasets from 科宝标注平台 ───
const DATASETS = [
  { id: 'ds-001', name: '道路缺陷检测数据集 v2.3', images: 4872, classes: ['裂缝', '坑洼', '破损', '剥落', '标线模糊', '积水', '障碍物', '正常'], source: '科宝标注平台', synced: '2026-04-29 08:30' },
  { id: 'ds-002', name: '施工安全帽检测集', images: 2391, classes: ['安全帽', '无安全帽', '人员'], source: '科宝标注平台', synced: '2026-04-28 11:20' },
  { id: 'ds-003', name: '工厂设备异常检测集', images: 1628, classes: ['正常设备', '异常设备', '待检修'], source: '科宝标注平台', synced: '2026-04-29 07:45' },
  { id: 'ds-004', name: '车牌识别数据集', images: 7840, classes: ['车牌', '遮挡车牌', '模糊车牌'], source: '科宝标注平台', synced: '2026-04-27 20:10' },
]

// ─── Mock slices ───
const SLICES = [
  { id: 'slice-001', name: '道路缺陷检测标准切分', datasetId: 'ds-001', datasetName: '道路缺陷检测数据集 v2.3', trainCount: 3410, valCount: 974, testCount: 488, creator: '张工', createdAt: '2026-04-28 14:20' },
  { id: 'slice-002', name: '施工安全帽检测初版', datasetId: 'ds-002', datasetName: '施工安全帽检测集', trainCount: 1913, valCount: 239, testCount: 239, creator: '李工', createdAt: '2026-04-27 09:15' },
  { id: 'slice-003', name: '设备异常检测标准切分', datasetId: 'ds-003', datasetName: '工厂设备异常检测集', trainCount: 1139, valCount: 326, testCount: 163, creator: '王工', createdAt: '2026-04-29 08:30' },
  { id: 'slice-004', name: '车牌识别 v1.0 切分', datasetId: 'ds-004', datasetName: '车牌识别数据集', trainCount: 6272, valCount: 784, testCount: 784, creator: '赵工', createdAt: '2026-04-26 16:45' },
]

// ─── YOLO model variants ───
const BASE_MODELS = [
  { id: 'scratch', name: '从头训练', params: '—', speed: '—', mAP: '—', desc: '不使用预训练权重，从随机初始化开始训练', tag: '' },
  { id: 'yolov8n', name: 'YOLOv8n', params: '3.2M', speed: '80.4 FPS', mAP: '37.3', desc: 'Nano 轻量版，适合边缘设备部署', tag: '推荐·轻量' },
  { id: 'yolov8s', name: 'YOLOv8s', params: '11.2M', speed: '58.1 FPS', mAP: '44.9', desc: 'Small 版本，速度与精度均衡', tag: '推荐·均衡' },
  { id: 'yolov8m', name: 'YOLOv8m', params: '25.9M', speed: '39.6 FPS', mAP: '50.2', desc: 'Medium 版本，更高精度', tag: '' },
  { id: 'yolov8l', name: 'YOLOv8l', params: '43.7M', speed: '29.3 FPS', mAP: '52.9', desc: 'Large 版本，高精度应用', tag: '' },
  { id: 'yolov8x', name: 'YOLOv8x', params: '68.2M', speed: '20.1 FPS', mAP: '53.9', desc: 'Extra-Large，最高精度', tag: '高精度' },
]

const STEPS = [
  { id: 1, label: '数据集划分', icon: <Layers size={14} /> },
  { id: 2, label: '训练起点', icon: <Target size={14} /> },
  { id: 3, label: '训练参数', icon: <Sliders size={14} /> },
  { id: 4, label: '确认创建', icon: <CheckCircle2 size={14} /> },
]

interface FormState {
  datasetId: string
  sliceId: string | null
  trainRatio: number
  valRatio: number
  testRatio: number
  baseModel: string
  epochs: number
  batchSize: number
  imgSize: number
  lr0: number
  lrFinal: number
  optimizer: string
  patience: number
  device: string
  taskName: string
  useAugmentation: boolean
  useMosaic: boolean
  saveEvery: number
}

function CreateTask() {
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [submitting, setSubmitting] = useState(false)
  const [form, setForm] = useState<FormState>({
    datasetId: 'ds-001',
    sliceId: null,
    trainRatio: 70,
    valRatio: 20,
    testRatio: 10,
    baseModel: 'yolov8s',
    epochs: 100,
    batchSize: 16,
    imgSize: 640,
    lr0: 0.01,
    lrFinal: 0.001,
    optimizer: 'SGD',
    patience: 20,
    device: 'cuda',
    taskName: '',
    useAugmentation: true,
    useMosaic: true,
    saveEvery: 10,
  })

  const dataset = DATASETS.find(d => d.id === form.datasetId)
  const model = BASE_MODELS.find(m => m.id === form.baseModel)

  function setField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm(prev => ({ ...prev, [key]: value }))
  }

  function adjustSplit(field: 'trainRatio' | 'valRatio', value: number) {
    if (field === 'trainRatio') {
      const val = Math.min(Math.max(value, 50), 90)
      const remaining = 100 - val
      const vr = Math.round(remaining * (form.valRatio / (form.valRatio + form.testRatio)))
      const tr = 100 - val - vr
      setForm(prev => ({ ...prev, trainRatio: val, valRatio: vr, testRatio: tr }))
    } else {
      const val = Math.min(Math.max(value, 5), 30)
      const tr = 100 - form.trainRatio - val
      if (tr >= 5) setForm(prev => ({ ...prev, valRatio: val, testRatio: tr }))
    }
  }

  async function handleSubmit() {
    setSubmitting(true)
    await new Promise(r => setTimeout(r, 1400))
    navigate({ to: '/tasks/$taskId', params: { taskId: 'task-001' } })
  }

  return (
    <div style={{ animation: 'slideIn 0.3s ease-out' }}>
      <div className="page-header">
        <div>
          <div className="breadcrumb">
            <Link to="/">科宝训练平台</Link> ›
            <Link to="/tasks">训练任务</Link> ›
            <span>创建训练任务</span>
          </div>
          <h1 className="page-title">创建训练任务</h1>
        </div>
      </div>

      <div style={{ padding: '28px 32px', maxWidth: 860, margin: '0 auto' }}>
        {/* Stepper */}
        <div className="stepper">
          {STEPS.map((s, i) => (
            <div key={s.id} className="step-item" style={{ flexDirection: 'column', alignItems: 'center', gap: 6 }}>
              <div style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                <div
                  className={`step-circle ${step === s.id ? 'active' : step > s.id ? 'done' : ''}`}
                  style={{ cursor: step > s.id ? 'pointer' : 'default' }}
                  onClick={() => step > s.id && setStep(s.id)}
                >
                  {step > s.id ? <CheckCircle2 size={14} /> : s.id}
                </div>
                {i < STEPS.length - 1 && (
                  <div className={`step-connector ${step > s.id ? 'done' : ''}`} />
                )}
              </div>
              <div className={`step-label ${step === s.id ? 'active' : step > s.id ? 'done' : ''}`}>
                {s.label}
              </div>
            </div>
          ))}
        </div>

        {/* Step Content */}
        <div key={step} style={{ animation: 'slideIn 0.25s ease-out' }}>

          {/* ── Step 1: Dataset Split ── */}
          {step === 1 && (
            <div>
              <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
                <button
                  className={`btn ${form.sliceId === null ? 'btn-primary' : 'btn-secondary'}`}
                  onClick={() => setField('sliceId', null)}
                >
                  <Sliders size={14} /> 快速创建切分
                </button>
                <button
                  className={`btn ${form.sliceId !== null ? 'btn-primary' : 'btn-secondary'}`}
                  onClick={() => { setField('sliceId', SLICES[0]?.id || null) }}
                >
                  <Copy size={14} /> 选择已有切分
                </button>
              </div>

              {/* Option A: Quick Split - Create new split on the fly */}
              {form.sliceId === null && (
                <div style={{ animation: 'slideIn 0.2s ease-out' }}>
                  <SectionTitle icon={<Layers size={15} />} title="选择数据集" subtitle="从科宝标注平台同步的数据集" />

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 24 }}>
                    {DATASETS.map(ds => (
                      <div
                        key={ds.id}
                        className={`select-card`}
                        style={{ borderColor: form.datasetId === ds.id ? 'var(--accent)' : undefined, background: form.datasetId === ds.id ? 'var(--accent-glow)' : undefined }}
                        onClick={() => setField('datasetId', ds.id)}
                      >
                        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
                          <div>
                            <div style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>{ds.name}</div>
                            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 8 }}>
                              同步于 {ds.synced} · {ds.source}
                            </div>
                            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                              <span style={{ background: 'rgba(27,107,239,0.1)', color: 'var(--accent-bright)', fontSize: 11, padding: '2px 8px', borderRadius: 4, fontFamily: 'JetBrains Mono' }}>
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
                        <div style={{ marginTop: 10, fontSize: 11, color: 'var(--text-muted)' }}>
                          {ds.classes.join(' · ')}
                        </div>
                      </div>
                    ))}
                  </div>

                  <SectionTitle icon={<Sliders size={15} />} title="训练/验证/测试集划分" subtitle="拖动滑块调整各集合比例" />

                  <div className="card" style={{ padding: 24 }}>
                    {/* Visual split bar */}
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

                    {/* Image counts */}
                    {dataset && (
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 20 }}>
                        {[
                          { label: '训练集', ratio: form.trainRatio, color: 'var(--accent-bright)' },
                          { label: '验证集', ratio: form.valRatio, color: 'var(--teal)' },
                          { label: '测试集', ratio: form.testRatio, color: 'var(--warning)' },
                        ].map(s => (
                          <div key={s.label} className="metric-chip">
                            <div className="metric-chip-value" style={{ color: s.color, fontSize: 18 }}>
                              {Math.round(dataset.images * s.ratio / 100).toLocaleString()}
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
                        min={50} max={90}
                        onChange={v => adjustSplit('trainRatio', v)}
                        color="var(--accent)"
                        suffix="%"
                      />
                      <SliderField
                        label="验证集比例"
                        value={form.valRatio}
                        min={5} max={30}
                        onChange={v => adjustSplit('valRatio', v)}
                        color="var(--teal)"
                        suffix="%"
                        hint={`测试集自动计算为 ${form.testRatio}%`}
                      />
                    </div>

                    <div style={{ marginTop: 16, padding: '10px 14px', background: 'rgba(27,107,239,0.06)', borderRadius: 8, border: '1px solid rgba(27,107,239,0.15)', display: 'flex', gap: 8, fontSize: 12, color: 'var(--text-secondary)' }}>
                      <Info size={13} style={{ color: 'var(--accent-bright)', flexShrink: 0, marginTop: 1 }} />
                      <span>推荐训练集 70%、验证集 20%、测试集 10%。过小的验证集可能导致过拟合评估不准确。</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Option B: Select Existing Slice */}
              {form.sliceId !== null && (
                <div style={{ animation: 'slideIn 0.2s ease-out' }}>
                  <SectionTitle icon={<Copy size={15} />} title="选择切分" subtitle="从已保存的切分中选择" />

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24 }}>
                    {SLICES.map(slice => {
                      const total = slice.trainCount + slice.valCount + slice.testCount
                      const trainPct = Math.round((slice.trainCount / total) * 100)
                      const valPct = Math.round((slice.valCount / total) * 100)
                      const testPct = Math.round((slice.testCount / total) * 100)
                      return (
                        <div
                          key={slice.id}
                          className="select-card"
                          style={{
                            borderColor: form.sliceId === slice.id ? 'var(--accent)' : undefined,
                            background: form.sliceId === slice.id ? 'var(--accent-glow)' : undefined,
                            display: 'flex', alignItems: 'center', gap: 16,
                          }}
                          onClick={() => setField('sliceId', slice.id)}
                        >
                          <div style={{ flex: 1 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
                              <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>{slice.name}</span>
                            </div>
                            <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 8 }}>
                              数据集: {slice.datasetName} · 创建者: {slice.creator} · 创建于 {slice.createdAt}
                            </div>
                            <div style={{ display: 'flex', gap: 12 }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                <span style={{ color: 'var(--accent-bright)', fontWeight: 600 }}>{slice.trainCount.toLocaleString()}</span>
                                <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>训练集 ({trainPct}%)</span>
                              </div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                <span style={{ color: 'var(--teal)', fontWeight: 600 }}>{slice.valCount.toLocaleString()}</span>
                                <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>验证集 ({valPct}%)</span>
                              </div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                <span style={{ color: 'var(--warning)', fontWeight: 600 }}>{slice.testCount.toLocaleString()}</span>
                                <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>测试集 ({testPct}%)</span>
                              </div>
                            </div>
                          </div>
                          {form.sliceId === slice.id && (
                            <div style={{ width: 20, height: 20, background: 'var(--accent)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                              <CheckCircle2 size={12} color="white" />
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>

                  <div className="card" style={{ padding: 20 }}>
                    {form.sliceId && (
                      <div>
                        <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 12 }}>选中的切分信息</div>
                        {(() => {
                          const slice = SLICES.find(s => s.id === form.sliceId)
                          if (!slice) return null
                          const total = slice.trainCount + slice.valCount + slice.testCount
                          return (
                            <div>
                              <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 12 }}>{slice.name}</div>
                              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
                                {[
                                  { label: '训练集', count: slice.trainCount, pct: Math.round((slice.trainCount / total) * 100), color: 'var(--accent-bright)' },
                                  { label: '验证集', count: slice.valCount, pct: Math.round((slice.valCount / total) * 100), color: 'var(--teal)' },
                                  { label: '测试集', count: slice.testCount, pct: Math.round((slice.testCount / total) * 100), color: 'var(--warning)' },
                                ].map(s => (
                                  <div key={s.label} className="metric-chip">
                                    <div className="metric-chip-value" style={{ color: s.color, fontSize: 18 }}>
                                      {s.count.toLocaleString()}
                                    </div>
                                    <div className="metric-chip-label">{s.label} ({s.pct}%)</div>
                                  </div>
                                ))}
                              </div>
                              <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid var(--border-dim)', fontSize: 12, color: 'var(--text-muted)' }}>
                                数据集: {slice.datasetName} · 创建者: {slice.creator} · 创建于 {slice.createdAt}
                              </div>
                            </div>
                          )
                        })()}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── Step 2: Base Model ── */}
          {step === 2 && (
            <div>
              <SectionTitle icon={<Target size={15} />} title="选择训练起点" subtitle="选择预训练模型权重以加速收敛" />
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {BASE_MODELS.map(m => (
                  <div
                    key={m.id}
                    className="select-card"
                    style={{
                      borderColor: form.baseModel === m.id ? 'var(--accent)' : undefined,
                      background: form.baseModel === m.id ? 'var(--accent-glow)' : undefined,
                      display: 'flex', alignItems: 'center', gap: 16,
                    }}
                    onClick={() => setField('baseModel', m.id)}
                  >
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
                        <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'JetBrains Mono' }}>{m.name}</span>
                        {m.tag && (
                          <span style={{ background: 'rgba(10,184,158,0.15)', color: 'var(--teal)', fontSize: 10, padding: '2px 7px', borderRadius: 20, fontWeight: 600 }}>
                            {m.tag}
                          </span>
                        )}
                      </div>
                      <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{m.desc}</div>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, textAlign: 'center', flexShrink: 0 }}>
                      {[
                        { label: '参数量', value: m.params },
                        { label: '推理速度', value: m.speed },
                        { label: 'COCO mAP', value: m.mAP !== '—' ? `${m.mAP}%` : '—' },
                      ].map(s => (
                        <div key={s.label}>
                          <div style={{ fontFamily: 'JetBrains Mono', fontSize: 13, fontWeight: 600, color: form.baseModel === m.id ? 'var(--accent-bright)' : 'var(--text-primary)' }}>{s.value}</div>
                          <div style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{s.label}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ marginTop: 16, padding: '12px 16px', background: 'rgba(10,184,158,0.06)', borderRadius: 8, border: '1px solid rgba(10,184,158,0.15)', fontSize: 12, color: 'var(--text-secondary)', display: 'flex', gap: 8 }}>
                <Zap size={13} style={{ color: 'var(--teal)', flexShrink: 0, marginTop: 1 }} />
                <span>使用预训练权重可显著缩短训练时间（通常减少 40–60%），尤其适合小数据集场景。</span>
              </div>
            </div>
          )}

          {/* ── Step 3: Parameters ── */}
          {step === 3 && (
            <div>
              <SectionTitle icon={<Sliders size={15} />} title="任务基本信息" subtitle="" />
              <div className="card" style={{ padding: 20, marginBottom: 20 }}>
                <div>
                  <label className="form-label">训练任务名称 <span style={{ color: 'var(--error)' }}>*</span></label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="例：道路缺陷检测 v2.3-finetune"
                    value={form.taskName}
                    onChange={e => setField('taskName', e.target.value)}
                  />
                </div>
              </div>

              <SectionTitle icon={<Sliders size={15} />} title="核心训练参数" subtitle="影响训练效果的关键超参数" />
              <div className="card" style={{ padding: 20, marginBottom: 20 }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <NumberField label="训练轮数 (Epochs)" value={form.epochs} min={10} max={500} onChange={v => setField('epochs', v)} hint="推荐 80–150，过大可能过拟合" />
                  <NumberField label="批次大小 (Batch Size)" value={form.batchSize} min={1} max={128} onChange={v => setField('batchSize', v)} hint="根据 GPU 显存调整，A100 推荐 32" />
                  <NumberField label="输入图像尺寸" value={form.imgSize} min={320} max={1280} onChange={v => setField('imgSize', v)} hint="必须为 32 的倍数，推荐 640" step={32} />
                  <NumberField label="Early Stopping 耐心值" value={form.patience} min={5} max={100} onChange={v => setField('patience', v)} hint="无改善多少轮后停止训练" />
                  <NumberField label="保存检查点间隔 (Epochs)" value={form.saveEvery} min={1} max={50} onChange={v => setField('saveEvery', v)} hint="每隔多少轮保存一次模型" />
                </div>
              </div>

              <SectionTitle icon={<Sliders size={15} />} title="学习率与优化器" subtitle="" />
              <div className="card" style={{ padding: 20, marginBottom: 20 }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
                  <div>
                    <label className="form-label">优化器</label>
                    <select className="form-input" value={form.optimizer} onChange={e => setField('optimizer', e.target.value)}>
                      <option value="SGD">SGD（推荐）</option>
                      <option value="Adam">Adam</option>
                      <option value="AdamW">AdamW</option>
                      <option value="RMSProp">RMSProp</option>
                    </select>
                  </div>
                  <div>
                    <label className="form-label">初始学习率 (lr0)</label>
                    <input type="number" className="form-input" value={form.lr0} step={0.001} min={0.0001} max={0.1} onChange={e => setField('lr0', parseFloat(e.target.value))} />
                    <div className="form-hint">SGD 推荐 0.01</div>
                  </div>
                  <div>
                    <label className="form-label">最终学习率 (lrf)</label>
                    <input type="number" className="form-input" value={form.lrFinal} step={0.0001} min={0.00001} max={0.01} onChange={e => setField('lrFinal', parseFloat(e.target.value))} />
                    <div className="form-hint">余弦退火终止学习率</div>
                  </div>
                </div>
              </div>

              <SectionTitle icon={<Sliders size={15} />} title="数据增强与设备" subtitle="" />
              <div className="card" style={{ padding: 20 }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <div>
                    <label className="form-label">训练设备</label>
                    <select className="form-input" value={form.device} onChange={e => setField('device', e.target.value)}>
                      <option value="cuda">CUDA GPU（推荐）</option>
                      <option value="cuda:0">CUDA GPU 0</option>
                      <option value="cuda:0,1">CUDA GPU 0,1（多卡）</option>
                      <option value="cuda:0,1,2,3">CUDA GPU 0–3（4卡）</option>
                      <option value="cpu">CPU（仅调试）</option>
                    </select>
                  </div>
                  <div></div>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
                    <input type="checkbox" checked={form.useAugmentation} onChange={e => setField('useAugmentation', e.target.checked)} />
                    <div>
                      <div style={{ fontSize: 13.5, color: 'var(--text-primary)', fontWeight: 500 }}>启用数据增强</div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>随机翻转、旋转、色彩抖动等</div>
                    </div>
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
                    <input type="checkbox" checked={form.useMosaic} onChange={e => setField('useMosaic', e.target.checked)} />
                    <div>
                      <div style={{ fontSize: 13.5, color: 'var(--text-primary)', fontWeight: 500 }}>启用 Mosaic 增强</div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>将 4 张图拼接为 1 张，提升小目标检测能力</div>
                    </div>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* ── Step 4: Review ── */}
          {step === 4 && (
            <div>
              <SectionTitle icon={<CheckCircle2 size={15} />} title="确认创建" subtitle="请核对以下配置无误后提交" />
              <div className="card" style={{ padding: 24, marginBottom: 16 }}>
                <ReviewRow label="任务名称" value={form.taskName || '（未设置）'} highlight={!form.taskName} />
                <ReviewRow label="数据集" value={dataset?.name || '—'} />
                <ReviewRow label="图像总数" value={`${dataset?.images.toLocaleString()} 张`} mono />
                <ReviewRow label="训练/验证/测试" value={`${form.trainRatio}% / ${form.valRatio}% / ${form.testRatio}%`} mono />
                <ReviewRow label="基础模型" value={model?.name || '—'} mono />
                <ReviewRow label="训练轮数" value={`${form.epochs} Epochs`} mono />
                <ReviewRow label="批次大小" value={`${form.batchSize}`} mono />
                <ReviewRow label="图像尺寸" value={`${form.imgSize}×${form.imgSize}`} mono />
                <ReviewRow label="优化器" value={`${form.optimizer} (lr0=${form.lr0}, lrf=${form.lrFinal})`} mono />
                <ReviewRow label="训练设备" value={form.device.toUpperCase()} mono />
                <ReviewRow label="数据增强" value={[form.useAugmentation && '标准增强', form.useMosaic && 'Mosaic'].filter(Boolean).join(' + ') || '关闭'} />
              </div>
              {!form.taskName && (
                <div style={{ padding: '10px 14px', background: 'var(--error-glow)', borderRadius: 8, border: '1px solid rgba(255,70,85,0.3)', fontSize: 12.5, color: 'var(--error)', marginBottom: 16 }}>
                  请返回第 3 步填写任务名称
                </div>
              )}
              <div style={{ padding: '12px 16px', background: 'rgba(18,217,122,0.05)', borderRadius: 8, border: '1px solid rgba(18,217,122,0.15)', fontSize: 12, color: 'var(--text-secondary)' }}>
                <CheckCircle2 size={13} style={{ color: 'var(--success)', marginRight: 6, display: 'inline' }} />
                任务创建后将自动加入训练队列，在云服务器上执行。您可以在"训练任务"页面查看进度。
              </div>
            </div>
          )}
        </div>

        {/* Navigation Buttons */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 28 }}>
          <button
            className="btn btn-secondary"
            onClick={() => step > 1 ? setStep(s => s - 1) : undefined}
            disabled={step === 1}
          >
            <ChevronLeft size={15} /> 上一步
          </button>

          {step < 4 ? (
            <button className="btn btn-primary" onClick={() => setStep(s => s + 1)}>
              下一步 <ChevronRight size={15} />
            </button>
          ) : (
            <button
              className="btn btn-primary"
              onClick={handleSubmit}
              disabled={submitting || !form.taskName}
            >
              {submitting ? (
                <>
                  <div className="spinning" style={{ width: 14, height: 14, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%' }} />
                  正在创建…
                </>
              ) : (
                <>
                  <CheckCircle2 size={15} /> 创建训练任务
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Sub-components ───

function SectionTitle({ icon, title, subtitle }: { icon: React.ReactNode; title: string; subtitle: string }) {
  return (
    <div style={{ marginBottom: 14, marginTop: subtitle ? 0 : 4 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 7, color: 'var(--text-primary)', fontWeight: 600, fontSize: 14 }}>
        <span style={{ color: 'var(--accent-bright)' }}>{icon}</span>
        {title}
      </div>
      {subtitle && <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{subtitle}</div>}
    </div>
  )
}

function SliderField({ label, value, min, max, onChange, color, suffix, hint }: {
  label: string; value: number; min: number; max: number;
  onChange: (v: number) => void; color: string; suffix?: string; hint?: string;
}) {
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
        <label className="form-label" style={{ marginBottom: 0 }}>{label}</label>
        <span style={{ fontFamily: 'JetBrains Mono', fontSize: 13, fontWeight: 600, color }}>{value}{suffix}</span>
      </div>
      <input type="range" min={min} max={max} value={value}
        onChange={e => onChange(parseInt(e.target.value))}
        style={{ accentColor: color }}
      />
      {hint && <div className="form-hint">{hint}</div>}
    </div>
  )
}

function NumberField({ label, value, min, max, onChange, hint, step = 1 }: {
  label: string; value: number; min: number; max: number;
  onChange: (v: number) => void; hint?: string; step?: number;
}) {
  return (
    <div>
      <label className="form-label">{label}</label>
      <input type="number" className="form-input" value={value} min={min} max={max} step={step}
        onChange={e => onChange(parseInt(e.target.value) || min)} />
      {hint && <div className="form-hint">{hint}</div>}
    </div>
  )
}

function ReviewRow({ label, value, mono, highlight }: { label: string; value: string; mono?: boolean; highlight?: boolean }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--border-dim)' }}>
      <span style={{ fontSize: 12.5, color: 'var(--text-muted)' }}>{label}</span>
      <span style={{
        fontSize: 13, fontWeight: 500,
        fontFamily: mono ? 'JetBrains Mono' : 'inherit',
        color: highlight ? 'var(--error)' : 'var(--text-primary)',
      }}>{value}</span>
    </div>
  )
}
