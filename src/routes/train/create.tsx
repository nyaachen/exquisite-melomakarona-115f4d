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
import type { DatasetEntry } from '../../components/DatasetPicker'
import { CreateStepper, type StepDef } from '../../components/train/CreateStepper'
import { DatasetStep } from '../../components/train/DatasetStep'
import { ModelConfigStep } from '../../components/train/ModelConfigStep'
import { ReviewStep } from '../../components/train/ReviewStep'
import { CreateBottomBar } from '../../components/train/CreateBottomBar'

export const Route = createFileRoute('/train/create')({
  component: CreateTask,
})

// ─── 模型模板 (Architectures) ───
interface Param {
  name: string
  key: string
  type: 'number' | 'string' | 'select' | 'boolean' | 'range'
  defaultValue: number | string | boolean
  min?: number
  max?: number
  step?: number
  options?: { label: string; value: string | number }[]
  required: boolean
  description: string
}

interface Architecture {
  id: string
  name: string
  category: string
  baseModel: string
  description: string
  params: Param[]
  isActive: boolean
}

const ARCHITECTURES: Architecture[] = [
  {
    id: 'arch-yolov8', name: 'YOLOv8 目标检测', category: 'object-detection', baseModel: 'YOLOv8m',
    description: 'YOLOv8 系列目标检测模型架构，支持 nano~xlarge 多尺寸变体',
    isActive: true,
    params: [
      { name: '模型尺寸', key: 'variant', type: 'select', defaultValue: 'm', required: true, description: '模型尺寸变体', options: [
        { label: 'YOLOv8n (Nano · 3.2M)', value: 'n' },
        { label: 'YOLOv8s (Small · 11.2M)', value: 's' },
        { label: 'YOLOv8m (Medium · 25.9M)', value: 'm' },
        { label: 'YOLOv8l (Large · 43.7M)', value: 'l' },
        { label: 'YOLOv8x (XLarge · 68.2M)', value: 'x' },
      ]},
      { name: '训练轮数', key: 'epochs', type: 'number', defaultValue: 100, min: 1, max: 1000, required: true, description: '完整遍历数据集的次数' },
      { name: '批次大小', key: 'batchSize', type: 'number', defaultValue: 16, min: 1, max: 128, required: true, description: '每批训练样本数' },
      { name: '输入尺寸', key: 'imgSize', type: 'select', defaultValue: 640, required: true, description: '模型输入图片尺寸', options: [
        { label: '416×416', value: 416 }, { label: '512×512', value: 512 }, { label: '640×640', value: 640 },
        { label: '800×800', value: 800 }, { label: '1024×1024', value: 1024 },
      ]},
      { name: '初始学习率', key: 'lr0', type: 'range', defaultValue: 0.01, min: 0.0001, max: 0.1, step: 0.0001, required: true, description: 'SGD推荐0.01，Adam推荐0.001' },
      { name: '最终学习率', key: 'lrf', type: 'number', defaultValue: 0.001, min: 0.00001, max: 0.01, required: false, description: '余弦退火终止学习率' },
      { name: '优化器', key: 'optimizer', type: 'select', defaultValue: 'SGD', required: true, description: '优化器类型', options: [
        { label: 'SGD（推荐）', value: 'SGD' }, { label: 'Adam', value: 'Adam' }, { label: 'AdamW', value: 'AdamW' }, { label: 'RMSProp', value: 'RMSProp' },
      ]},
      { name: '早停轮数', key: 'patience', type: 'number', defaultValue: 10, min: 0, max: 50, required: false, description: '验证损失不下降时的等待轮数' },
      { name: '启用数据增强', key: 'useAugmentation', type: 'boolean', defaultValue: true, required: false, description: '随机翻转、旋转、色彩抖动等' },
      { name: '启用 Mosaic', key: 'useMosaic', type: 'boolean', defaultValue: true, required: false, description: '4图拼接增强' },
      { name: '保存间隔', key: 'saveEvery', type: 'number', defaultValue: 10, min: 1, max: 50, required: false, description: '每隔多少轮保存一次检查点' },
      { name: '训练设备', key: 'device', type: 'select', defaultValue: 'cuda', required: false, description: '训练硬件', options: [
        { label: 'CUDA GPU（推荐）', value: 'cuda' }, { label: 'CUDA GPU 0,1（双卡）', value: 'cuda:0,1' },
        { label: 'CUDA GPU 0-3（四卡）', value: 'cuda:0,1,2,3' }, { label: 'CPU（仅调试）', value: 'cpu' },
      ]},
    ],
  },
  {
    id: 'arch-qwen', name: 'Qwen 大语言模型微调', category: 'llm', baseModel: 'Qwen-7B-Chat',
    description: 'Qwen 系列大语言模型的 LoRA/全参数微调架构', isActive: true,
    params: [
      { name: '模型版本', key: 'baseModel', type: 'select', defaultValue: 'Qwen-7B-Chat', required: true, description: '预训练模型版本', options: [
        { label: 'Qwen-7B-Chat', value: 'Qwen-7B-Chat' }, { label: 'Qwen-14B-Chat', value: 'Qwen-14B-Chat' }, { label: 'Qwen-72B-Chat', value: 'Qwen-72B-Chat' },
      ]},
      { name: '微调方式', key: 'finetuneMode', type: 'select', defaultValue: 'lora', required: true, description: '微调方式', options: [
        { label: 'LoRA（参数高效）', value: 'lora' }, { label: '全参数微调', value: 'full' },
      ]},
      { name: '训练轮数', key: 'epochs', type: 'number', defaultValue: 3, min: 1, max: 20, required: true, description: '推荐大模型1-5轮' },
      { name: '批次大小', key: 'batchSize', type: 'number', defaultValue: 8, min: 1, max: 64, required: true, description: '根据GPU显存调整' },
      { name: '学习率', key: 'lr0', type: 'range', defaultValue: 0.0001, min: 0.00001, max: 0.001, step: 0.00001, required: true, description: 'LoRA推荐1e-4' },
      { name: '最大序列长度', key: 'maxSeqLen', type: 'number', defaultValue: 2048, min: 512, max: 8192, required: true, description: '输入序列最大长度' },
      { name: '启用 DeepSpeed', key: 'useDeepSpeed', type: 'boolean', defaultValue: true, required: false, description: 'DeepSpeed ZeRO 优化' },
    ],
  },
]

// ─── 训练预设 (Presets) ───
const CURRENT_USER = '张工'

const ALL_PRESETS = [
  { id: 'preset-quick', name: '快速验证', architectureId: 'arch-yolov8', desc: '快速测试可行性', icon: '⚡', visibility: 'public' as const, author: '张工',
    values: { variant: 's', epochs: 30, batchSize: 32, imgSize: 416, lr0: 0.02, lrf: 0.001, optimizer: 'SGD', patience: 15, useAugmentation: true, useMosaic: false, saveEvery: 10, device: 'cuda' },
  },
  { id: 'preset-standard', name: '标准训练', architectureId: 'arch-yolov8', desc: '平衡速度与精度', icon: '⚖️', visibility: 'public' as const, author: '系统管理员',
    values: { variant: 'm', epochs: 100, batchSize: 16, imgSize: 640, lr0: 0.01, lrf: 0.001, optimizer: 'SGD', patience: 20, useAugmentation: true, useMosaic: true, saveEvery: 10, device: 'cuda' },
  },
  { id: 'preset-highacc', name: '高精度', architectureId: 'arch-yolov8', desc: '追求最佳精度', icon: '🎯', visibility: 'public' as const, author: '李工',
    values: { variant: 'l', epochs: 150, batchSize: 8, imgSize: 1024, lr0: 0.005, lrf: 0.0005, optimizer: 'AdamW', patience: 30, useAugmentation: true, useMosaic: true, saveEvery: 5, device: 'cuda:0,1' },
  },
  { id: 'preset-edge', name: '边缘部署', architectureId: 'arch-yolov8', desc: '适合边缘设备', icon: '📱', visibility: 'private' as const, author: '王工',
    values: { variant: 'n', epochs: 80, batchSize: 64, imgSize: 416, lr0: 0.01, lrf: 0.001, optimizer: 'SGD', patience: 15, useAugmentation: true, useMosaic: false, saveEvery: 10, device: 'cuda' },
  },
  { id: 'preset-qwen-lora', name: 'Qwen LoRA 微调', architectureId: 'arch-qwen', desc: '参数高效微调', icon: '🔧', visibility: 'private' as const, author: '张工',
    values: { baseModel: 'Qwen-7B-Chat', finetuneMode: 'lora', epochs: 3, batchSize: 8, lr0: 0.0001, maxSeqLen: 2048, useDeepSpeed: true },
  },
]

// ─── Combined Datasets (parent datasets + sub-datasets) ───
const DATASET_ENTRIES: DatasetEntry[] = [
  { id: 'ds-001', name: '道路缺陷检测数据集 v2.3', type: 'parent', totalImages: 4872, trainImages: 4872, valImages: 4872, testImages: 4872, classes: ['裂缝', '坑洼', '破损', '剥落', '标线模糊', '积水', '障碍物', '正常'] },
  { id: 'ds-002', name: '施工安全帽检测集', type: 'parent', totalImages: 2391, trainImages: 2391, valImages: 2391, testImages: 2391, classes: ['安全帽', '无安全帽', '人员'] },
  { id: 'ds-003', name: '工厂设备异常检测集', type: 'parent', totalImages: 1628, trainImages: 1628, valImages: 1628, testImages: 1628, classes: ['正常设备', '异常设备', '待检修'] },
  { id: 'ds-004', name: '车牌识别数据集', type: 'parent', totalImages: 7840, trainImages: 7840, valImages: 7840, testImages: 7840, classes: ['车牌', '遮挡车牌', '模糊车牌'] },
  { id: 'sub-001', name: '道路缺陷 v2.3 标准划分子集', type: 'subdataset', parentName: '道路缺陷检测数据集 v2.3', totalImages: 4872, trainImages: 3410, valImages: 974, testImages: 488, classes: ['裂缝', '坑洼', '破损', '剥落', '标线模糊', '积水', '障碍物', '正常'] },
  { id: 'sub-002', name: '施工安全帽检测子集', type: 'subdataset', parentName: '施工安全帽检测集', totalImages: 2391, trainImages: 1913, valImages: 239, testImages: 239, classes: ['安全帽', '无安全帽', '人员'] },
  { id: 'sub-003', name: '设备异常检测标准子集', type: 'subdataset', parentName: '工厂设备异常检测集', totalImages: 1628, trainImages: 1139, valImages: 326, testImages: 163, classes: ['正常设备', '异常设备', '待检修'] },
  { id: 'sub-004', name: '车牌识别 v1.0 子集', type: 'subdataset', parentName: '车牌识别数据集', totalImages: 7840, trainImages: 6272, valImages: 784, testImages: 784, classes: ['车牌', '遮挡车牌', '模糊车牌'] },
]

const STARTING_POINT_TYPES = [
  { id: 'random', name: '随机起点', icon: <Shuffle size={16} />, desc: '从随机初始化权重开始训练' },
  { id: 'existing_task', name: '训练任务结果', icon: <Database size={16} />, desc: '选择历史训练任务产生的结果继续训练' },
  { id: 'existing_model', name: '模型广场模型', icon: <Package size={16} />, desc: '选择模型广场中已发布的模型作为起点' },
  { id: 'public', name: '公开预训练模型', icon: <Globe size={16} />, desc: '使用社区预训练权重' },
]

const EXISTING_TASKS = [
  { id: 'task-prev-001', name: '道路缺陷检测 v1.0', model: 'YOLOv8s', epochs: 120, bestMap: 52.3, lastEpoch: 120, status: 'completed', createdAt: '2026-04-25' },
  { id: 'task-prev-002', name: '安全帽检测实验组A', model: 'YOLOv8n', epochs: 80, bestMap: 48.7, lastEpoch: 80, status: 'completed', createdAt: '2026-04-20' },
  { id: 'task-prev-003', name: '设备异常检测 v2', model: 'YOLOv8m', epochs: 100, bestMap: 45.2, lastEpoch: 45, status: 'stopped', createdAt: '2026-04-18' },
]

const SQUARE_MODELS_WITH_VERSIONS = [
  { id: 'sq-model-001', name: '道路缺陷检测', versions: ['v2.3', 'v2.2', 'v2.1'] },
  { id: 'sq-model-002', name: '施工安全帽检测', versions: ['v1.0'] },
  { id: 'sq-model-003', name: '人员跌倒检测', versions: ['v1.0'] },
  { id: 'sq-model-004', name: '火焰烟雾检测', versions: ['v2.1', 'v2.0', 'v1.5'] },
]

const ALL_PUBLIC_MODELS = [
  { id: 'pub-yolov8n-coco', name: 'YOLOv8n (COCO)', architectureId: 'arch-yolov8', source: 'Ultralytics', fileSize: '6.2 MB', desc: 'COCO 80类预训练', inputSize: 640, numClasses: 80 },
  { id: 'pub-yolov8s-coco', name: 'YOLOv8s (COCO)', architectureId: 'arch-yolov8', source: 'Ultralytics', fileSize: '21.5 MB', desc: 'COCO 80类预训练', inputSize: 640, numClasses: 80 },
  { id: 'pub-yolov8m-coco', name: 'YOLOv8m (COCO)', architectureId: 'arch-yolov8', source: 'Ultralytics', fileSize: '49.7 MB', desc: 'COCO 80类预训练', inputSize: 640, numClasses: 80 },
  { id: 'pub-yolov8l-coco', name: 'YOLOv8l (COCO)', architectureId: 'arch-yolov8', source: 'Ultralytics', fileSize: '83.7 MB', desc: 'COCO 80类预训练', inputSize: 640, numClasses: 80 },
  { id: 'pub-yolov8x-coco', name: 'YOLOv8x (COCO)', architectureId: 'arch-yolov8', source: 'Ultralytics', fileSize: '130.5 MB', desc: 'COCO 80类预训练', inputSize: 640, numClasses: 80 },
  { id: 'pub-yolov8n-pothole', name: 'YOLOv8n (道路缺陷)', architectureId: 'arch-yolov8', source: 'Roboflow', fileSize: '6.3 MB', desc: '道路坑洼检测预训练', inputSize: 640, numClasses: 5 },
  { id: 'pub-qwen-7b-base', name: 'Qwen-7B-Chat (原版)', architectureId: 'arch-qwen', source: 'Alibaba', fileSize: '14.0 GB', desc: '通义千问 70亿参数预训练', inputSize: 2048, numClasses: 0 },
  { id: 'pub-qwen-14b-base', name: 'Qwen-14B-Chat (原版)', architectureId: 'arch-qwen', source: 'Alibaba', fileSize: '28.0 GB', desc: '通义千问 140亿参数预训练', inputSize: 2048, numClasses: 0 },
]

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

  // Image processing
  const [preprocessing, setPreprocessing] = useState<string[]>([])
  const [augmentation, setAugmentation] = useState<string[]>([])

  // Step 3: Task name
  const [taskName, setTaskName] = useState('')

  const visiblePresets = useMemo(() =>
    ALL_PRESETS.filter(p => p.visibility === 'public' || p.author === CURRENT_USER),
  [])

  const visiblePublicModels = useMemo(() =>
    ALL_PUBLIC_MODELS.filter(m => m.architectureId === architectureId),
  [architectureId])

  useEffect(() => { window.scrollTo({ top: 0, behavior: 'smooth' }) }, [step])

  const architecture = ARCHITECTURES.find(a => a.id === architectureId)
  const selectedDs = DATASET_ENTRIES.find(d => d.id === datasetId)

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
    const preset = ALL_PRESETS.find(p => p.id === presetId)
    if (!preset) return
    setArchitectureId(preset.architectureId)
    setAppliedPresetId(presetId)
    const arch = ARCHITECTURES.find(a => a.id === preset.architectureId)
    const values: Record<string, any> = {}
    if (arch) arch.params.forEach(p => { values[p.key] = p.defaultValue })
    Object.assign(values, preset.values)
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
              preprocessing={preprocessing}
              augmentation={augmentation}
              classDistribution={classDistribution}
              entries={DATASET_ENTRIES}
              selectedDs={selectedDs}
              totalImages={totalImages}
              trainImageCount={trainImageCount}
              valImageCount={valImageCount}
              testImageCount={testImageCount}
              onDatasetChange={(id) => {
                setDatasetId(id)
                const ds = DATASET_ENTRIES.find(d => d.id === id)
                if (ds && 'defaultSplit' in ds) {
                  const s = (ds as any).defaultSplit
                  if (s) setDatasetSplit(s)
                }
              }}
              onSplitChange={setDatasetSplit}
              onPreprocessingChange={setPreprocessing}
              onAugmentationChange={setAugmentation}
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
