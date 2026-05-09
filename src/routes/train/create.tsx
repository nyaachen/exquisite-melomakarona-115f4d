import { createFileRoute, useNavigate, Link } from '@tanstack/react-router'
import { useState, useMemo, useEffect } from 'react'
import {
  ChevronRight,
  ChevronLeft,
  Layers,
  Sliders,
  CheckCircle2,
  Info,
  Zap,
  Database,
  Globe,
  Package,
  Shuffle,
  Cpu,
  Target,
  FileText,
  AlertCircle,
  Server,
  BarChart3,
  Image,
  Sun,
  Contrast,
  Settings2,
} from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { DatasetPicker, type DatasetEntry } from '../../components/DatasetPicker'
import { SearchableDropdown } from '../../components/SearchableDropdown'

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

// Starting point
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

import { GPU_SERVERS, getAvailableServer } from '../../data/gpuServers'

const STEPS = [
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

  // Step 3: Task name + server
  const [taskName, setTaskName] = useState('')
  const [selectedServerId, setSelectedServerId] = useState('')

  // Auto-assign best available GPU server on mount
  useEffect(() => {
    const server = getAvailableServer()
    if (server) setSelectedServerId(server.id)
  }, [])

  const assignedServer = GPU_SERVERS.find(s => s.id === selectedServerId)

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

  // Per-class distribution across train/val/test (mock)
  const classDistribution = useMemo(() => {
    if (!selectedDs || selectedDs.classes.length === 0) return []
    const hash = (s: string) => { let h = 0; for (let i = 0; i < s.length; i++) h = ((h << 5) - h + s.charCodeAt(i)) | 0; return Math.abs(h) }
    return selectedDs.classes.map(cls => {
      const h = hash(cls)
      const base = 200 + (h % 800)
      const scale = totalImages / (selectedDs.classes.length * base)
      const t = Math.round(base * (0.55 + (h % 30) / 100) * scale)
      const v = Math.round(base * (0.15 + ((h >> 4) % 15) / 100) * scale)
      return { name: cls, 训练集: t, 验证集: v, 测试集: Math.max(0, Math.round(base * scale) - t - v) }
    })
  }, [selectedDs, totalImages])

  // Warning for split extremes
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

  const datasetSnapshot = useMemo(() => ({
    datasetId,
    datasetName: selectedDs?.name || '',
    totalImages,
    split: { ...datasetSplit },
    classes: selectedDs?.classes || [],
    snapshotAt: new Date().toISOString(),
  }), [datasetId, selectedDs, totalImages, datasetSplit])

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
    const gpuNames = assignedServer
      ? assignedServer.gpus.map(g => `#${g.index} ${g.model}`).join('、')
      : ''
    items.push({ label: 'GPU 服务器', value: assignedServer ? `${assignedServer.name} · ${gpuNames}` : '无可用服务器' })
    if (architecture) {
      architecture.params.forEach(p => {
        const val = paramValues[p.key]
        if (val !== undefined && val !== '') items.push({ label: p.name, value: String(val) })
      })
    }
    return items
  }, [selectedDs, datasetSplit, totalImages, trainImageCount, valImageCount, testImageCount, architecture, startPointType, paramValues, assignedServer])

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
        {/* Stepper */}
        <div className="stepper">
          {STEPS.map((s, i) => (
            <div key={s.id} className="step-item" style={{ flexDirection: 'column', alignItems: 'center', gap: 6 }}>
              <div style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                <div className={`step-circle ${step === s.id ? 'active' : step > s.id ? 'done' : ''}`}
                  style={{ cursor: step > s.id ? 'pointer' : 'default' }}
                  onClick={() => step > s.id && setStep(s.id)}>
                  {step > s.id ? <CheckCircle2 size={14} /> : s.id}
                </div>
                {i < STEPS.length - 1 && <div className={`step-connector ${step > s.id ? 'done' : ''}`} />}
              </div>
              <div className={`step-label ${step === s.id ? 'active' : step > s.id ? 'done' : ''}`}>{s.label}</div>
            </div>
          ))}
        </div>

        <div style={{ animation: 'slideIn 0.25s ease-out', paddingBottom: '50vh' }}>

          {/* ═══════════ Step 1: Select Train/Val/Test Datasets ═══════════ */}
          {step === 1 && (
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
                {/* Single Dataset Picker */}
                <DatasetPicker
                  label="选择数据集"
                  color="var(--accent-bright)"
                  selectedId={datasetId}
                  onChange={(id) => {
                    setDatasetId(id)
                    const ds = DATASET_ENTRIES.find(d => d.id === id)
                    // Default split from dataset or 70/15/15
                    if (ds && 'defaultSplit' in ds) {
                      const s = (ds as any).defaultSplit
                      if (s) setDatasetSplit(s)
                    }
                  }}
                  entries={DATASET_ENTRIES}
                  imageKey="trainImages"
                />

                {/* Split adjustment */}
                {selectedDs && (
                  <div className="card" style={{ padding: 14, animation: 'slideIn 0.2s ease-out' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
                      <Settings2 size={13} style={{ color: 'var(--accent-bright)' }} />
                      <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)' }}>数据划分</span>
                    </div>
                    <div className="split-bar" style={{ marginBottom: 10 }}>
                      <div className="split-bar-train" style={{ flex: datasetSplit.train }}>
                        <span className="split-bar-label" style={{ color: '#409eff' }}>训练 {datasetSplit.train}%</span>
                      </div>
                      <div className="split-bar-val" style={{ flex: datasetSplit.val }}>
                        <span className="split-bar-label" style={{ color: '#10b981' }}>验证 {datasetSplit.val}%</span>
                      </div>
                      <div className="split-bar-test" style={{ flex: datasetSplit.test }}>
                        <span className="split-bar-label" style={{ color: '#f59e0b' }}>测试 {datasetSplit.test}%</span>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: 16, fontSize: 11, color: 'var(--text-muted)' }}>
                      <span>训练 {trainImageCount.toLocaleString()} 张</span>
                      <span>验证 {valImageCount.toLocaleString()} 张</span>
                      <span>测试 {testImageCount.toLocaleString()} 张</span>
                    </div>
                    <div style={{ display: 'flex', gap: 12, marginTop: 10 }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, marginBottom: 2 }}>
                          <span style={{ color: '#409eff' }}>训练</span><span style={{ fontFamily: 'JetBrains Mono', color: 'var(--text-secondary)' }}>{datasetSplit.train}%</span>
                        </div>
                        <input type="range" min={10} max={90} value={datasetSplit.train} onChange={e => {
                          const t = parseInt(e.target.value)
                          const r = 100 - t
                          setDatasetSplit({ train: t, val: Math.round(r * 0.6), test: r - Math.round(r * 0.6) })
                        }} style={{ width: '100%' }} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, marginBottom: 2 }}>
                          <span style={{ color: '#10b981' }}>验证</span><span style={{ fontFamily: 'JetBrains Mono', color: 'var(--text-secondary)' }}>{datasetSplit.val}%</span>
                        </div>
                        <input type="range" min={1} max={50} value={datasetSplit.val} onChange={e => {
                          const v = parseInt(e.target.value)
                          const r = 100 - v
                          setDatasetSplit({ train: Math.round(r * 0.7), val: v, test: r - Math.round(r * 0.7) })
                        }} style={{ width: '100%' }} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, marginBottom: 2 }}>
                          <span style={{ color: '#f59e0b' }}>测试</span><span style={{ fontFamily: 'JetBrains Mono', color: 'var(--text-secondary)' }}>{datasetSplit.test}%</span>
                        </div>
                        <input type="range" min={1} max={50} value={datasetSplit.test} onChange={e => {
                          const t = parseInt(e.target.value)
                          const r = 100 - t
                          setDatasetSplit({ train: Math.round(r * 0.7), val: r - Math.round(r * 0.7), test: t })
                        }} style={{ width: '100%' }} />
                      </div>
                    </div>
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
                <div className="card" style={{ padding: 16, marginTop: 16 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12 }}>
                    <BarChart3 size={14} style={{ color: 'var(--accent-bright)' }} />
                    <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)' }}>各类别数据分布</span>
                  </div>
                  <ResponsiveContainer width="100%" height={Math.max(200, classDistribution.length * 36)}>
                    <BarChart data={classDistribution} layout="vertical" margin={{ top: 0, right: 0, left: 60, bottom: 0 }}
                      barGap={0} barCategoryGap="20%">
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--border-dim)" horizontal={false} />
                      <XAxis type="number" tick={{ fontSize: 10, fill: 'var(--text-muted)' }} axisLine={{ stroke: 'var(--border-dim)' }} tickLine={false} />
                      <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: 'var(--text-secondary)', fontFamily: 'JetBrains Mono' }} width={60} axisLine={false} tickLine={false} />
                      <Tooltip
                        contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border-default)', borderRadius: 4, fontSize: 12 }}
                        cursor={{ fill: 'var(--bg-hover)' }}
                      />
                      <Legend wrapperStyle={{ fontSize: 11, color: 'var(--text-secondary)' }} />
                      <Bar dataKey="训练集" fill="#409eff" radius={[0, 3, 3, 0]} />
                      <Bar dataKey="验证集" fill="#10b981" radius={[0, 3, 3, 0]} />
                      <Bar dataKey="测试集" fill="#f59e0b" radius={[0, 3, 3, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}

              {/* ─── Image Processing ─── */}
              <div className="card" style={{ padding: 16, marginTop: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
                  <Image size={14} style={{ color: 'var(--accent-bright)' }} />
                  <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)' }}>图像处理</span>
                </div>

                {/* Suggestion banner */}
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
                          onClick={() => setPreprocessing(prev =>
                            prev.includes(op.id) ? prev.filter(p => p !== op.id) : [...prev, op.id]
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
                          onClick={() => setAugmentation(prev =>
                            prev.includes(op.id) ? prev.filter(p => p !== op.id) : [...prev, op.id]
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

              <div style={{ marginTop: 16, padding: '10px 14px', background: 'rgba(64, 158, 255,0.06)', border: '1px solid rgba(64, 158, 255,0.15)', display: 'flex', gap: 8, fontSize: 12, color: 'var(--text-secondary)' }}>
                <Info size={13} style={{ color: 'var(--accent-bright)', flexShrink: 0, marginTop: 1 }} />
                <span>选择一个数据集后，可通过拖拽滑块调整训练/验证/测试的划分比例。创建任务时当前划分将保存为数据集快照，可在任务详情中查看。</span>
              </div>

            </div>
          )}

          {/* ═══════════ Step 2: Model Architecture + Parameters ═══════════ */}
          {step === 2 && (
            <div>
              <SectionTitle icon={<Cpu size={15} />} title="选择模型架构" subtitle="从模型模板中选择训练架构" />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 24 }}>
                {ARCHITECTURES.filter(a => a.isActive).map(arch => (
                  <div key={arch.id} className="select-card" style={{ borderColor: architectureId === arch.id ? 'var(--accent)' : undefined, background: architectureId === arch.id ? 'var(--accent-glow)' : undefined }} onClick={() => handleArchChange(arch.id)}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{ width: 40, height: 40, background: 'var(--accent-glow)', border: '1px solid var(--border-default)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Cpu size={20} style={{ color: 'var(--accent)' }} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 2 }}>{arch.name}</div>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'JetBrains Mono' }}>{arch.baseModel}</div>
                      </div>
                      {architectureId === arch.id && <CheckCircle2 size={16} color="var(--accent-bright)" />}
                    </div>
                    <div style={{ marginTop: 8, fontSize: 11, color: 'var(--text-secondary)', lineHeight: 1.5 }}>{arch.description}</div>
                  </div>
                ))}
              </div>

              <div style={{ marginBottom: 24 }}>
                <SearchableDropdown
                  label="快速设置参数（可选）"
                  color="var(--teal)"
                  selectedId={appliedPresetId || ''}
                  onChange={(id) => id && applyPreset(id)}
                  items={visiblePresets.filter(p => p.architectureId === architectureId).map(p => ({
                    id: p.id,
                    name: p.name,
                    subtitle: p.desc,
                  }))}
                  placeholder={visiblePresets.filter(p => p.architectureId === architectureId).length === 0 ? '该架构暂无可用预设' : '选择训练预设快速填充参数...'}
                />
              </div>

              {architecture && (
                <div style={{ animation: 'slideIn 0.2s ease-out' }}>
                  <SectionTitle icon={<Sliders size={15} />} title="训练参数" subtitle="根据模型模板定义的参数进行配置" />
                  <div className="card" style={{ padding: 20, marginBottom: 20 }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                      {architecture.params.map(param => {
                        const val = paramValues[param.key] ?? param.defaultValue
                        return (
                          <div key={param.key} className="form-group">
                            <label className="form-label">{param.name}{param.required && <span style={{ color: 'var(--error)', marginLeft: 2 }}>*</span>}</label>
                            {param.type === 'select' && param.options ? (
                              <select className="form-input" value={String(val)} onChange={e => {
                                const opt = param.options?.find(o => String(o.value) === e.target.value)
                                setParamValue(param.key, opt?.value ?? e.target.value)
                              }}>
                                {param.options.map(o => <option key={String(o.value)} value={String(o.value)}>{o.label}</option>)}
                              </select>
                            ) : param.type === 'boolean' ? (
                              <select className="form-input" value={String(val)} onChange={e => setParamValue(param.key, e.target.value === 'true')}>
                                <option value="true">是</option>
                                <option value="false">否</option>
                              </select>
                            ) : param.type === 'range' ? (
                              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                <input
                                  className="form-input"
                                  type="number"
                                  value={val}
                                  min={param.min}
                                  max={param.max}
                                  step={param.step}
                                  style={{ width: 90, fontFamily: 'JetBrains Mono', fontSize: 13, fontWeight: 600, textAlign: 'center', flexShrink: 0 }}
                                  onChange={e => {
                                    const raw = e.target.value
                                    if (raw === '' || raw === '-') { setParamValue(param.key, raw); return }
                                    const v = parseFloat(raw)
                                    if (!isNaN(v)) setParamValue(param.key, v)
                                  }}
                                  onBlur={e => {
                                    const v = parseFloat(e.target.value)
                                    const min = param.min ?? 0
                                    const max = param.max ?? 1
                                    if (isNaN(v)) { setParamValue(param.key, param.defaultValue); return }
                                    if (v < min) setParamValue(param.key, min)
                                    else if (v > max) setParamValue(param.key, max)
                                    else setParamValue(param.key, v)
                                  }}
                                  onKeyDown={e => {
                                    if (e.key === 'Enter') (e.target as HTMLInputElement).blur()
                                  }}
                                />
                                <input
                                  type="range"
                                  min={param.min || 0}
                                  max={param.max || 1}
                                  step={param.step || 0.001}
                                  value={isNaN(Number(val)) ? param.defaultValue as number : Number(val)}
                                  onChange={e => setParamValue(param.key, parseFloat(e.target.value))}
                                  style={{ flex: 1 }}
                                />
                              </div>
                            ) : (
                              <input className="form-input" type={param.type === 'number' ? 'number' : 'text'} value={String(val)} min={param.min} max={param.max} step={param.step}
                                onChange={e => { const v = param.type === 'number' ? (parseFloat(e.target.value) || 0) : e.target.value; setParamValue(param.key, v) }} />
                            )}
                            {param.description && <div className="form-hint">{param.description}</div>}
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </div>
              )}

              <div className="form-group" style={{ marginBottom: 16 }}>
                <label className="form-label">训练起点</label>
                <select className="form-input" value={startPointType} onChange={e => { setStartPointType(e.target.value); setStartPointId(null); setStartPointVersion('') }}>
                  {STARTING_POINT_TYPES.map(sp => (
                    <option key={sp.id} value={sp.id}>{sp.name} — {sp.desc}</option>
                  ))}
                </select>
              </div>

              {startPointType === 'existing_task' && (
                <div style={{ animation: 'slideIn 0.2s ease-out', marginBottom: 16 }}>
                  <SearchableDropdown
                    label="选择训练任务"
                    color="var(--accent-bright)"
                    selectedId={startPointId || ''}
                    onChange={(id) => setStartPointId(id)}
                    items={EXISTING_TASKS.map(t => ({
                      id: t.id,
                      name: t.name,
                      subtitle: `模型: ${t.model} · ${t.epochs} 轮 · 最佳 mAP: ${t.bestMap}%`,
                      count: t.lastEpoch,
                      countLabel: `第 ${t.lastEpoch} 轮`,
                    }))}
                    placeholder="选择历史训练任务..."
                  />
                </div>
              )}

              {startPointType === 'existing_model' && (
                <div style={{ animation: 'slideIn 0.2s ease-out', marginBottom: 16 }}>
                  <SearchableDropdown
                    label="选择模型广场模型"
                    color="var(--accent-bright)"
                    selectedId={startPointId || ''}
                    onChange={(id) => { setStartPointId(id); setStartPointVersion('') }}
                    items={SQUARE_MODELS_WITH_VERSIONS.map(m => ({
                      id: m.id,
                      name: m.name,
                      subtitle: `版本: ${m.versions.join('、')}`,
                      tags: m.versions,
                    }))}
                    placeholder="选择模型广场中已发布的模型..."
                  />
                  {startPointId && (
                    <div style={{ marginTop: 12 }}>
                      <SearchableDropdown
                        label="选择版本"
                        color="var(--teal)"
                        selectedId={startPointVersion}
                        onChange={(v) => setStartPointVersion(v)}
                        items={(SQUARE_MODELS_WITH_VERSIONS.find(m => m.id === startPointId)?.versions || []).map(v => ({
                          id: v,
                          name: v,
                        }))}
                        placeholder="选择模型版本..."
                      />
                    </div>
                  )}
                </div>
              )}

              {startPointType === 'public' && (
                <div style={{ animation: 'slideIn 0.2s ease-out', marginBottom: 16 }}>
                  {visiblePublicModels.length === 0 ? (
                    <div style={{ padding: '14px 16px', background: 'rgba(230, 162, 60,0.06)', border: '1px solid rgba(230, 162, 60,0.2)', fontSize: 12, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 8 }}>
                      <Info size={13} style={{ color: 'var(--warning)', flexShrink: 0 }} />
                      当前选择的架构暂无关联的公开预训练模型
                    </div>
                  ) : (
                    <SearchableDropdown
                      label="选择公开预训练模型"
                      color="var(--accent-bright)"
                      selectedId={startPointId || ''}
                      onChange={(id) => setStartPointId(id)}
                      items={visiblePublicModels.map(pm => ({
                        id: pm.id,
                        name: pm.name,
                        subtitle: `${pm.desc} · ${pm.fileSize} · ${pm.numClasses}类`,
                        tags: [pm.source, `输入${pm.inputSize}`],
                      }))}
                      placeholder="选择公开预训练模型..."
                    />
                  )}
                </div>
              )}

            </div>
          )}

          {/* ═══════════ Step 3: Task Name + Review ═══════════ */}
          {step === 3 && (
            <div>
              <SectionTitle icon={<FileText size={15} />} title="任务名称" subtitle="为本次训练任务命名" />
              <div className="card" style={{ padding: 20, marginBottom: 20 }}>
                <div className="form-group">
                  <label className="form-label">训练任务名称 <span style={{ color: 'var(--error)' }}>*</span></label>
                  <input type="text" className="form-input" placeholder="例：道路缺陷检测 v2.3-finetune" value={taskName} onChange={e => setTaskName(e.target.value)} />
                  <div className="form-hint">清晰的任务名称有助于后续查找和管理训练结果</div>
                </div>
              </div>

              <SectionTitle icon={<Server size={15} />} title="GPU 服务器" subtitle="系统自动分配执行训练任务的 GPU 服务器" />
              <div className="card" style={{ padding: 20, marginBottom: 20 }}>
                {assignedServer ? (
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                      <Server size={14} style={{ color: 'var(--accent-bright)' }} />
                      <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{assignedServer.name}</span>
                      <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{assignedServer.spec}</span>
                    </div>
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                      {assignedServer.gpus.map(g => (
                        <span key={g.id} style={{
                          fontSize: 11, fontFamily: 'JetBrains Mono',
                          background: 'var(--accent-glow)', color: 'var(--accent)',
                          padding: '3px 8px', borderRadius: 3,
                        }}>
                          #{g.index} {g.model} {g.memory}
                        </span>
                      ))}
                    </div>
                    <div style={{ marginTop: 10, fontSize: 11, color: 'var(--text-muted)' }}>
                      已自动分配 {assignedServer.gpus.length} 张 GPU
                    </div>
                  </div>
                ) : (
                  <div style={{ fontSize: 12, color: 'var(--warning)' }}>
                    暂无可用的 GPU 服务器
                  </div>
                )}
              </div>

              <SectionTitle icon={<CheckCircle2 size={15} />} title="配置确认" subtitle="请核对以下配置无误后提交" />
              <div className="card" style={{ padding: 24, marginBottom: 16 }}>
                <div className="confirm-list">
                  {reviewItems.map((item, i) => (
                    <div key={i} className="confirm-item">
                      <span className="confirm-label">{item.label}</span>
                      <span className="confirm-value">{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {!taskName && (
                <div style={{ padding: '10px 14px', background: 'var(--error-glow)', border: '1px solid rgba(239,68,68,0.3)', fontSize: 12, color: 'var(--error)', marginBottom: 16 }}>
                  请输入任务名称
                </div>
              )}

              <div style={{ padding: '12px 16px', background: 'rgba(16,185,129,0.05)', border: '1px solid rgba(16,185,129,0.15)', fontSize: 12, color: 'var(--text-secondary)' }}>
                <CheckCircle2 size={13} style={{ color: 'var(--success)', marginRight: 6, display: 'inline' }} />
                任务创建后将自动加入训练队列，在云服务器上执行。可在"训练任务"页面查看进度。
              </div>

            </div>
          )}
        </div>
      </div>

      {/* Fixed bottom bar */}
      <div style={{
        position: 'fixed', bottom: 0, left: 'var(--sidebar-width)', right: 0, zIndex: 20,
        background: 'var(--bg-card)', borderTop: '1px solid var(--border-dim)',
        padding: '12px 32px', display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: '0 -2px 8px rgba(0,0,0,0.04)',
      }}>
        <div style={{ maxWidth: 860, width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ width: 100 }}>
            {step > 1 && (
              <button className="btn btn-secondary" onClick={() => setStep(step - 1)}><ChevronLeft size={15} /> 上一步</button>
            )}
          </div>
          <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>第 {step} / {STEPS.length} 步 · {STEPS[step - 1].label}</span>
          <div style={{ width: 100, display: 'flex', justifyContent: 'flex-end' }}>
            {step === 1 && (
              <button className="btn btn-primary" onClick={handleNextFromStep1}>下一步 <ChevronRight size={15} /></button>
            )}
            {step === 2 && (
              <button className="btn btn-primary" onClick={() => setStep(3)}>下一步 <ChevronRight size={15} /></button>
            )}
            {step === 3 && (
              <button className="btn btn-primary" onClick={handleSubmit} disabled={submitting || !taskName}>
                {submitting ? <><span className="spinner" /> 正在创建…</> : <><CheckCircle2 size={15} /> 创建训练任务</>}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Sub-components ───

function SectionTitle({ icon, title, subtitle }: { icon: React.ReactNode; title: string; subtitle: string }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 7, color: 'var(--text-primary)', fontWeight: 600, fontSize: 14 }}>
        <span style={{ color: 'var(--accent-bright)' }}>{icon}</span>
        {title}
      </div>
      {subtitle && <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{subtitle}</div>}
    </div>
  )
}

