import { createFileRoute, useNavigate, Link } from '@tanstack/react-router'
import { useState, useMemo } from 'react'
import {
  ChevronRight,
  ChevronLeft,
  Layers,
  Sliders,
  CheckCircle2,
  Info,
  Zap,
  Upload,
  Database,
  Globe,
  Shuffle,
  Cpu,
  Target,
  FileText,
  AlertCircle,
} from 'lucide-react'
import { DatasetPicker, type DatasetEntry } from '../../components/DatasetPicker'

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
const PRESETS = [
  { id: 'preset-quick', name: '快速验证', architectureId: 'arch-yolov8', desc: '快速测试可行性', icon: '⚡',
    values: { variant: 's', epochs: 30, batchSize: 32, imgSize: 416, lr0: 0.02, lrf: 0.001, optimizer: 'SGD', patience: 15, useAugmentation: true, useMosaic: false, saveEvery: 10, device: 'cuda' },
  },
  { id: 'preset-standard', name: '标准训练', architectureId: 'arch-yolov8', desc: '平衡速度与精度', icon: '⚖️',
    values: { variant: 'm', epochs: 100, batchSize: 16, imgSize: 640, lr0: 0.01, lrf: 0.001, optimizer: 'SGD', patience: 20, useAugmentation: true, useMosaic: true, saveEvery: 10, device: 'cuda' },
  },
  { id: 'preset-highacc', name: '高精度', architectureId: 'arch-yolov8', desc: '追求最佳精度', icon: '🎯',
    values: { variant: 'l', epochs: 150, batchSize: 8, imgSize: 1024, lr0: 0.005, lrf: 0.0005, optimizer: 'AdamW', patience: 30, useAugmentation: true, useMosaic: true, saveEvery: 5, device: 'cuda:0,1' },
  },
  { id: 'preset-edge', name: '边缘部署', architectureId: 'arch-yolov8', desc: '适合边缘设备', icon: '📱',
    values: { variant: 'n', epochs: 80, batchSize: 64, imgSize: 416, lr0: 0.01, lrf: 0.001, optimizer: 'SGD', patience: 15, useAugmentation: true, useMosaic: false, saveEvery: 10, device: 'cuda' },
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
  { id: 'existing', name: '已有训练结果', icon: <Database size={16} />, desc: '选择之前训练的模型权重继续训练' },
  { id: 'public', name: '公开预训练模型', icon: <Globe size={16} />, desc: '使用社区预训练权重' },
  { id: 'upload', name: '手动上传', icon: <Upload size={16} />, desc: '上传自定义权重文件' },
]

const EXISTING_TASKS = [
  { id: 'task-prev-001', name: '道路缺陷检测 v1.0', model: 'YOLOv8s', epochs: 120, bestMap: 52.3, lastEpoch: 120, status: 'completed', createdAt: '2026-04-25' },
  { id: 'task-prev-002', name: '安全帽检测实验组A', model: 'YOLOv8n', epochs: 80, bestMap: 48.7, lastEpoch: 80, status: 'completed', createdAt: '2026-04-20' },
  { id: 'task-prev-003', name: '设备异常检测 v2', model: 'YOLOv8m', epochs: 100, bestMap: 45.2, lastEpoch: 45, status: 'stopped', createdAt: '2026-04-18' },
]

const PUBLIC_MODELS = [
  { id: 'pub-yolov8n-coco', name: 'YOLOv8n (COCO)', source: 'Ultralytics', download: '15.1M', desc: 'COCO 80类预训练' },
  { id: 'pub-yolov8s-coco', name: 'YOLOv8s (COCO)', source: 'Ultralytics', download: '21.5M', desc: 'COCO 80类预训练' },
  { id: 'pub-yolov8m-coco', name: 'YOLOv8m (COCO)', source: 'Ultralytics', download: '51.5M', desc: 'COCO 80类预训练' },
  { id: 'pub-yolov8n-pothole', name: 'YOLOv8n (道路缺陷)', source: 'Roboflow', download: '3.2M', desc: '道路坑洼检测预训练' },
]

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

  // Step 1: Independent dataset selection
  const [trainDatasetId, setTrainDatasetId] = useState('')
  const [valDatasetId, setValDatasetId] = useState('')
  const [testDatasetId, setTestDatasetId] = useState('')
  const [datasetErrors, setDatasetErrors] = useState<Record<string, string>>({})

  // Step 2: Model & Params
  const [architectureId, setArchitectureId] = useState('arch-yolov8')
  const [appliedPresetId, setAppliedPresetId] = useState<string | null>(null)
  const [paramValues, setParamValues] = useState<Record<string, any>>({})
  const [startPointType, setStartPointType] = useState('random')
  const [startPointId, setStartPointId] = useState<string | null>(null)

  // Step 3: Task name
  const [taskName, setTaskName] = useState('')

  const architecture = ARCHITECTURES.find(a => a.id === architectureId)
  const trainDs = DATASET_ENTRIES.find(d => d.id === trainDatasetId)
  const valDs = DATASET_ENTRIES.find(d => d.id === valDatasetId)
  const testDs = DATASET_ENTRIES.find(d => d.id === testDatasetId)

  const trainImageCount = trainDs ? trainDs.trainImages : 0
  const valImageCount = valDs ? valDs.valImages : 0
  const testImageCount = testDs ? testDs.testImages : 0
  const totalImagesForValidation = trainImageCount + valImageCount + testImageCount

  function validateDatasets(): boolean {
    const errs: Record<string, string> = {}
    if (totalImagesForValidation === 0) {
      errs.general = '至少需要选择一个包含图片的数据集或子数据集'
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
    if (trainDs) items.push({ label: '训练数据集', value: `${trainDs.name} (${trainImageCount} 张)` })
    if (valDs) items.push({ label: '验证数据集', value: `${valDs.name} (${valImageCount} 张)` })
    if (testDs) items.push({ label: '测试数据集', value: `${testDs.name} (${testImageCount} 张)` })
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
  }, [trainDs, valDs, testDs, trainImageCount, valImageCount, testImageCount, architecture, startPointType, paramValues])

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

        <div key={step} style={{ animation: 'slideIn 0.25s ease-out' }}>

          {/* ═══════════ Step 1: Select Train/Val/Test Datasets ═══════════ */}
          {step === 1 && (
            <div>
              <SectionTitle icon={<Layers size={15} />} title="选择训练/验证/测试数据集"
                subtitle="为每个集合独立选择数据集或子数据集" />

              {datasetErrors.general && (
                <div style={{ padding: '10px 14px', background: 'var(--error-glow)', border: '1px solid rgba(239,68,68,0.3)', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: 'var(--error)' }}>
                  <AlertCircle size={14} /> {datasetErrors.general}
                </div>
              )}

              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                {/* Training Dataset */}
                <DatasetPicker
                  label="训练数据集"
                  color="var(--accent-bright)"
                  selectedId={trainDatasetId}
                  onChange={setTrainDatasetId}
                  entries={DATASET_ENTRIES}
                  imageKey="trainImages"
                />

                {/* Validation Dataset */}
                <DatasetPicker
                  label="验证数据集"
                  color="var(--teal)"
                  selectedId={valDatasetId}
                  onChange={setValDatasetId}
                  entries={DATASET_ENTRIES}
                  imageKey="valImages"
                />

                {/* Test Dataset */}
                <DatasetPicker
                  label="测试数据集"
                  color="var(--warning)"
                  selectedId={testDatasetId}
                  onChange={setTestDatasetId}
                  entries={DATASET_ENTRIES}
                  imageKey="testImages"
                />
              </div>

              {/* Summary */}
              <div className="card" style={{ padding: 16, marginTop: 20 }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 12 }}>
                  已选数据集概览
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
                  <div className="metric-chip">
                    <div className="metric-chip-value" style={{ color: 'var(--accent-bright)', fontSize: 20 }}>
                      {trainImageCount.toLocaleString()}
                    </div>
                    <div className="metric-chip-label">训练集图片</div>
                  </div>
                  <div className="metric-chip">
                    <div className="metric-chip-value" style={{ color: 'var(--teal)', fontSize: 20 }}>
                      {valImageCount.toLocaleString()}
                    </div>
                    <div className="metric-chip-label">验证集图片</div>
                  </div>
                  <div className="metric-chip">
                    <div className="metric-chip-value" style={{ color: 'var(--warning)', fontSize: 20 }}>
                      {testImageCount.toLocaleString()}
                    </div>
                    <div className="metric-chip-label">测试集图片</div>
                  </div>
                </div>
                {totalImagesForValidation > 0 && (
                  <div style={{ marginTop: 10, fontSize: 11, color: 'var(--text-muted)' }}>
                    总计 {totalImagesForValidation.toLocaleString()} 张图片（训练 {trainImageCount.toLocaleString()} + 验证 {valImageCount.toLocaleString()} + 测试 {testImageCount.toLocaleString()}）
                  </div>
                )}
                {totalImagesForValidation === 0 && (
                  <div style={{ marginTop: 10, fontSize: 12, color: 'var(--error)' }}>
                    尚未选择任何数据集，请至少选择一个包含图片的数据集
                  </div>
                )}
              </div>

              <div style={{ marginTop: 16, padding: '10px 14px', background: 'rgba(27,107,239,0.06)', border: '1px solid rgba(27,107,239,0.15)', display: 'flex', gap: 8, fontSize: 12, color: 'var(--text-secondary)' }}>
                <Info size={13} style={{ color: 'var(--accent-bright)', flexShrink: 0, marginTop: 1 }} />
                <span>可以从父数据集或已创建的子数据集中选择。直接选择父数据集将使用全部图片，选择子数据集将使用已划分好的图片子集。</span>
              </div>

              {/* Navigation */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 28 }}>
                <button className="btn btn-primary" onClick={handleNextFromStep1}>
                  下一步 <ChevronRight size={15} />
                </button>
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

              <SectionTitle icon={<Zap size={15} />} title="快速设置参数" subtitle="应用训练预设快速填充参数（可选）" />
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginBottom: 24 }}>
                {PRESETS.filter(p => p.architectureId === architectureId).map(preset => (
                  <div key={preset.id} className="select-card" style={{ textAlign: 'center', padding: 14, borderColor: appliedPresetId === preset.id ? 'var(--accent)' : undefined, background: appliedPresetId === preset.id ? 'var(--accent-glow)' : undefined }} onClick={() => applyPreset(preset.id)}>
                    <div style={{ fontSize: 22, marginBottom: 6 }}>{preset.icon}</div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 2 }}>{preset.name}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{preset.desc}</div>
                    {appliedPresetId === preset.id && <CheckCircle2 size={14} color="var(--accent-bright)" style={{ marginTop: 6 }} />}
                  </div>
                ))}
                {PRESETS.filter(p => p.architectureId === architectureId).length === 0 && (
                  <div style={{ gridColumn: '1 / -1', padding: 16, textAlign: 'center', color: 'var(--text-muted)', fontSize: 12, background: 'var(--bg-elevated)', border: '1px solid var(--border-dim)' }}>
                    该架构暂无可用预设，请手动配置参数
                  </div>
                )}
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
                              <div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                                  <span style={{ fontFamily: 'JetBrains Mono', fontSize: 13, fontWeight: 600, color: 'var(--accent-bright)' }}>{val}</span>
                                </div>
                                <input type="range" min={param.min || 0} max={param.max || 1} step={param.step || 0.001} value={Number(val)} onChange={e => setParamValue(param.key, parseFloat(e.target.value))} />
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

              <SectionTitle icon={<Target size={15} />} title="训练起点" subtitle="选择训练的初始权重来源" />
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 16 }}>
                {STARTING_POINT_TYPES.map(sp => (
                  <div key={sp.id} className="select-card" style={{ borderColor: startPointType === sp.id ? 'var(--accent)' : undefined, background: startPointType === sp.id ? 'var(--accent-glow)' : undefined, display: 'flex', alignItems: 'center', gap: 14 }} onClick={() => { setStartPointType(sp.id); setStartPointId(null) }}>
                    <div style={{ width: 36, height: 36, background: startPointType === sp.id ? 'var(--accent)' : 'var(--bg-elevated)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: startPointType === sp.id ? 'white' : 'var(--text-secondary)' }}>{sp.icon}</div>
                    <div style={{ flex: 1 }}><div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 2 }}>{sp.name}</div><div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{sp.desc}</div></div>
                    {startPointType === sp.id && <CheckCircle2 size={18} color="var(--accent-bright)" />}
                  </div>
                ))}
              </div>

              {startPointType === 'public' && (
                <div style={{ animation: 'slideIn 0.2s ease-out', marginBottom: 16 }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {PUBLIC_MODELS.map(pm => (
                      <div key={pm.id} className="select-card" style={{ borderColor: startPointId === pm.id ? 'var(--accent)' : undefined, background: startPointId === pm.id ? 'var(--accent-glow)' : undefined, display: 'flex', alignItems: 'center', gap: 12 }} onClick={() => setStartPointId(pm.id)}>
                        <div style={{ flex: 1 }}><div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}><span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{pm.name}</span><span style={{ fontSize: 10, padding: '2px 6px', background: 'rgba(27,107,239,0.1)', color: 'var(--accent-bright)' }}>{pm.source}</span></div><div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{pm.desc} · {pm.download}</div></div>
                        {startPointId === pm.id && <CheckCircle2 size={16} color="var(--accent-bright)" />}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {startPointType === 'existing' && (
                <div style={{ animation: 'slideIn 0.2s ease-out', marginBottom: 16 }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {EXISTING_TASKS.map(task => (
                      <div key={task.id} className="select-card" style={{ borderColor: startPointId === task.id ? 'var(--accent)' : undefined, background: startPointId === task.id ? 'var(--accent-glow)' : undefined, display: 'flex', alignItems: 'center', gap: 12 }} onClick={() => setStartPointId(task.id)}>
                        <div style={{ flex: 1 }}><div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}><span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{task.name}</span><span style={{ fontSize: 10, padding: '2px 6px', background: task.status === 'completed' ? 'rgba(16,185,129,0.1)' : 'rgba(245,158,11,0.1)', color: task.status === 'completed' ? 'var(--success)' : 'var(--warning)' }}>{task.status === 'completed' ? '已完成' : '已停止'}</span></div><div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 2 }}>模型: {task.model} · {task.epochs} 轮 · 最佳 mAP: {task.bestMap}%</div><div style={{ fontSize: 11, color: 'var(--text-muted)' }}>创建于 {task.createdAt} · 最后在第 {task.lastEpoch} 轮</div></div>
                        {startPointId === task.id && <CheckCircle2 size={16} color="var(--accent-bright)" />}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {startPointType === 'upload' && (
                <div className="upload-area" style={{ padding: 32, textAlign: 'center', marginBottom: 16 }}>
                  <Upload size={36} style={{ color: 'var(--text-muted)', marginBottom: 12 }} />
                  <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 6 }}>点击或拖拽上传权重文件</div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 14 }}>支持 .pt, .pth, .onnx 格式，最大 500MB</div>
                  <button className="btn btn-secondary">选择文件</button>
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 28 }}>
                <button className="btn btn-secondary" onClick={() => setStep(1)}><ChevronLeft size={15} /> 上一步</button>
                <button className="btn btn-primary" onClick={() => setStep(3)}>下一步 <ChevronRight size={15} /></button>
              </div>
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

              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 28 }}>
                <button className="btn btn-secondary" onClick={() => setStep(2)}><ChevronLeft size={15} /> 上一步</button>
                <button className="btn btn-primary" onClick={handleSubmit} disabled={submitting || !taskName}>
                  {submitting ? <><span className="spinner" /> 正在创建…</> : <><CheckCircle2 size={15} /> 创建训练任务</>}
                </button>
              </div>
            </div>
          )}
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

