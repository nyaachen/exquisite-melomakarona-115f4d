import { createFileRoute, useNavigate, Link } from '@tanstack/react-router'
import { useState, useMemo, useEffect } from 'react'
import {
  Layers,
  Sliders,
  CheckCircle2,
  Shuffle,
  Database,
  Package,
  Globe,
} from 'lucide-react'
import { datasetToEntry, type DatasetEntry } from '../../components/DatasetPicker'
import { DATASETS } from '../../data/datasets'
import { PLAZA_MODELS } from '../../data/plaza-models'
import { ARCHITECTURES } from '../../data/architectures'
import { PRESETS } from '../../data/presets'
import { EXISTING_TASKS } from '../../data/train-tasks'
import { CreateStepper, type StepDef } from '../../components/train/CreateStepper'
import { DatasetStep } from '../../components/train/DatasetStep'
import { ModelConfigStep } from '../../components/train/ModelConfigStep'
import { ReviewStep } from '../../components/train/ReviewStep'
import { CreateBottomBar } from '../../components/train/CreateBottomBar'

export const Route = createFileRoute('/train/create')({
  component: CreateTask,
})

const CURRENT_USER = '张工'

// ─── Datasets ───
const DATASET_ENTRIES: DatasetEntry[] = DATASETS.map(datasetToEntry)

const STARTING_POINT_TYPES = [
  { id: 'random', name: '随机起点', icon: <Shuffle size={16} />, desc: '从随机初始化权重开始训练' },
  { id: 'existing_task', name: '训练任务结果', icon: <Database size={16} />, desc: '选择历史训练任务产生的结果继续训练' },
  { id: 'existing_model', name: '模型广场模型', icon: <Package size={16} />, desc: '选择模型广场中已发布的模型作为起点' },
  { id: 'public', name: '公开预训练模型', icon: <Globe size={16} />, desc: '使用社区预训练权重' },
]

const SQUARE_MODELS_WITH_VERSIONS = PLAZA_MODELS
  .filter(m => m.source === 'platform')
  .map(m => ({ id: m.id, name: m.name, versions: m.versions.map(v => v.version) }))

const ALL_PUBLIC_MODELS = PLAZA_MODELS
  .filter(m => m.source === 'public')
  .map(m => {
    const latest = m.versions[0]
    return {
      id: m.id,
      name: m.name,
      architectureId: m.architectureId,
      source: m.sourceLabel || m.author,
      fileSize: latest?.fileSize || '未知',
      desc: m.description,
      inputSize: latest?.inputSize || 640,
      numClasses: m.classes.length,
    }
  })

const STEPS: StepDef[] = [
  { id: 1, label: '选择数据集', icon: <Layers size={14} /> },
  { id: 2, label: '模型与参数', icon: <Sliders size={14} /> },
  { id: 3, label: '确认创建', icon: <CheckCircle2 size={14} /> },
]

// ─── Component ───

function CreateTask() {
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [submitting, setSubmitting] = useState(false)

  // Step 1: Single dataset selection + split
  const [datasetId, setDatasetId] = useState('')
  const [datasetSplit, setDatasetSplit] = useState({ train: 70, val: 15, test: 15 })
  const [datasetErrors, setDatasetErrors] = useState<Record<string, string>>({})

  // Step 2: Model & Params
  const [architectureId, setArchitectureId] = useState('arch-yolov8')
  const [appliedPresetId, setAppliedPresetId] = useState<string | null>(null)
  const [paramValues, setParamValues] = useState<Record<string, any>>({})
  const [startPointType, setStartPointType] = useState('random')
  const [startPointId, setStartPointId] = useState<string | null>(null)
  const [startPointVersion, setStartPointVersion] = useState<string>('')

  // Step 3: Task name
  const [taskName, setTaskName] = useState('')

  const visiblePresets = useMemo(() =>
    PRESETS.filter(p => p.visibility === 'public' || p.author === CURRENT_USER),
  [])

  const visiblePublicModels = useMemo(() =>
    ALL_PUBLIC_MODELS.filter(m => m.architectureId === architectureId),
  [architectureId])

  useEffect(() => { window.scrollTo({ top: 0, behavior: 'smooth' }) }, [step])

  const architecture = ARCHITECTURES.find(a => a.id === architectureId)
  const selectedDs = DATASET_ENTRIES.find(d => d.id === datasetId)
  const selectedDataset = DATASETS.find(d => d.id === datasetId)

  const totalImages = selectedDs ? selectedDs.totalImages : 0
  const trainImageCount = Math.round(totalImages * datasetSplit.train / 100)
  const valImageCount = Math.round(totalImages * datasetSplit.val / 100)
  const testImageCount = totalImages - trainImageCount - valImageCount

  const classDistribution = useMemo(() => {
    if (!selectedDs || selectedDs.classes.length === 0) return []
    const hash = (s: string) => { let h = 0; for (let i = 0; i < s.length; i++) h = ((h << 5) - h + s.charCodeAt(i)) | 0; return Math.abs(h) }
    return selectedDs.classes.map(cls => {
      const h = hash(cls)
      const base = 200 + (h % 800)
      const scale = totalImages / (selectedDs.classes.length * base)
      const t = Math.round(base * (0.55 + (h % 30) / 100) * scale)
      const v = Math.round(base * (0.15 + ((h >> 4) % 15) / 100) * scale)
      return { name: cls, '训练集': t, '验证集': v, '测试集': Math.max(0, Math.round(base * scale) - t - v) }
    })
  }, [selectedDs, totalImages])

  const datasetWarnings: string[] = []
  if (datasetSplit.train > 85) datasetWarnings.push('训练集占比过高（>85%），验证和测试数据可能不足')
  if (datasetSplit.val < 5) datasetWarnings.push('验证集占比过低（<5%），可能无法准确监控训练过程')
  if (datasetSplit.test < 5) datasetWarnings.push('测试集占比过低（<5%），最终评估结果可能不可靠')

  function validateDatasets(): boolean {
    const errs: Record<string, string> = {}
    if (!datasetId || totalImages === 0) {
      errs.dataset = '必须选择一个包含图片的数据集'
    }
    setDatasetErrors(errs)
    return Object.keys(errs).length === 0
  }

  function handleNextFromStep1() {
    if (!validateDatasets()) return
    setStep(2)
  }

  function handleArchChange(id: string) {
    setArchitectureId(id)
    setAppliedPresetId(null)
    setStartPointId(null)
    setStartPointVersion('')
    const arch = ARCHITECTURES.find(a => a.id === id)
    if (arch) {
      const defaults: Record<string, any> = {}
      arch.params.forEach(p => { defaults[p.key] = p.defaultValue })
      setParamValues(defaults)
    }
  }

  function applyPreset(presetId: string) {
    const preset = PRESETS.find(p => p.id === presetId)
    if (!preset) return
    setArchitectureId(preset.architectureId)
    setAppliedPresetId(presetId)
    const arch = ARCHITECTURES.find(a => a.id === preset.architectureId)
    const values: Record<string, any> = {}
    if (arch) arch.params.forEach(p => { values[p.key] = p.defaultValue })
    Object.assign(values, preset.paramValues)
    setParamValues(values)
  }

  function setParamValue(key: string, value: any) {
    setParamValues(prev => ({ ...prev, [key]: value }))
    setAppliedPresetId(null)
  }

  async function handleSubmit() {
    setSubmitting(true)
    await new Promise(r => setTimeout(r, 1400))
    navigate({ to: '/train/$taskId', params: { taskId: 'task-001' } })
  }

  const reviewItems = useMemo(() => {
    const items: { label: string; value: string }[] = []
    if (selectedDs) {
      items.push({ label: '数据集', value: selectedDs.name })
      items.push({ label: '数据划分', value: `训练 ${datasetSplit.train}% · 验证 ${datasetSplit.val}% · 测试 ${datasetSplit.test}% (${totalImages.toLocaleString()} 张)` })
    }
    if (architecture) {
      items.push({ label: '模型架构', value: architecture.name })
      items.push({ label: '基础模型', value: architecture.baseModel })
    }
    items.push({ label: '训练起点', value: STARTING_POINT_TYPES.find(s => s.id === startPointType)?.name || '随机' })
    if (architecture) {
      architecture.params.forEach(p => {
        const val = paramValues[p.key]
        if (val !== undefined && val !== '') items.push({ label: p.name, value: String(val) })
      })
    }
    return items
  }, [selectedDs, datasetSplit, totalImages, architecture, startPointType, paramValues])

  return (
    <div style={{ animation: 'slideIn 0.3s ease-out' }}>
      <div className="page-header">
        <div>
          <div className="breadcrumb">
            <Link to="/">科宝训练平台</Link> ›
            <Link to="/train">训练任务</Link> ›
            <span>创建训练任务</span>
          </div>
          <h1 className="page-title">创建训练任务</h1>
        </div>
      </div>

      <div style={{ padding: '28px 32px', maxWidth: 860, margin: '0 auto' }}>
        <CreateStepper steps={STEPS} currentStep={step} onStepClick={setStep} />

        <div style={{ animation: 'slideIn 0.25s ease-out', paddingBottom: '50vh' }}>
          {step === 1 && (
            <DatasetStep
              datasetId={datasetId}
              datasetSplit={datasetSplit}
              datasetErrors={datasetErrors}
              datasetWarnings={datasetWarnings}
              classDistribution={classDistribution}
              entries={DATASET_ENTRIES}
              selectedDs={selectedDs}
              selectedDataset={selectedDataset}
              totalImages={totalImages}
              trainImageCount={trainImageCount}
              valImageCount={valImageCount}
              testImageCount={testImageCount}
              onDatasetChange={(id) => {
                setDatasetId(id)
                const ds = DATASETS.find(d => d.id === id)
                if (ds) {
                  const total = ds.resources.length
                  if (total > 0) {
                    const counts = { train: 0, val: 0, test: 0 }
                    ds.resources.forEach(r => { counts[r.set]++ })
                    setDatasetSplit({
                      train: Math.round((counts.train / total) * 100),
                      val: Math.round((counts.val / total) * 100),
                      test: 100 - Math.round((counts.train / total) * 100) - Math.round((counts.val / total) * 100),
                    })
                  }
                }
              }}
            />
          )}

          {step === 2 && (
            <ModelConfigStep
              architectureId={architectureId}
              appliedPresetId={appliedPresetId}
              paramValues={paramValues}
              startPointType={startPointType}
              startPointId={startPointId}
              startPointVersion={startPointVersion}
              architectures={ARCHITECTURES}
              visiblePresets={visiblePresets}
              visiblePublicModels={visiblePublicModels}
              existingTasks={EXISTING_TASKS}
              squareModels={SQUARE_MODELS_WITH_VERSIONS}
              startingPointTypes={STARTING_POINT_TYPES}
              architecture={architecture}
              onArchChange={handleArchChange}
              onPresetApply={applyPreset}
              onParamChange={setParamValue}
              onStartPointTypeChange={setStartPointType}
              onStartPointIdChange={setStartPointId}
              onStartPointVersionChange={setStartPointVersion}
            />
          )}

          {step === 3 && (
            <ReviewStep
              taskName={taskName}
              reviewItems={reviewItems}
              onTaskNameChange={setTaskName}
            />
          )}
        </div>
      </div>

      <CreateBottomBar
        step={step}
        totalSteps={STEPS.length}
        stepLabel={STEPS[step - 1].label}
        submitting={submitting}
        canSubmit={!!taskName}
        onPrev={() => setStep(step - 1)}
        onNext={step === 1 ? handleNextFromStep1 : () => setStep(step + 1)}
        onSubmit={handleSubmit}
      />
    </div>
  )
}
