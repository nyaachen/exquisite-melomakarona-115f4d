import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { useState, useEffect, useRef } from 'react'
import { SearchableDropdown } from '../../components/SearchableDropdown'
import {
  ArrowLeft,
  RefreshCw,
  CheckCircle2,
  XCircle,
  Clock,
  Terminal,
  BarChart2,
  FlaskConical,
  Package,
  AlertTriangle,
  Cpu,
  TrendingUp,
  Award,
  Target,
  Zap,
  ChevronRight,
  Upload,
  ImageIcon,
  Database,
  AlertCircle,
  Plus,
  Copy,
} from 'lucide-react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'

export const Route = createFileRoute('/train/$taskId')({
  component: TaskDetail,
})

const TASK_DATA: Record<string, {
  name: string; dataset: string; baseModel: string; status: 'running' | 'completed' | 'failed' | 'pending';
  totalEpochs: number; startEpoch: number; mAP: number; precision: number; recall: number;
  batchSize: number; imgSize: number; optimizer: string; device: string;
  createdAt: string; classes: string[]; trainImages: number; valImages: number;
  errorMsg?: string;
  published: boolean;
  modelName?: string;
  modelVersion?: string;
  publishedAt?: string;
}> = {
  'task-001': {
    name: '道路缺陷检测 v2.3', dataset: '道路缺陷标注集·4872张', baseModel: 'YOLOv8m',
    status: 'running', totalEpochs: 100, startEpoch: 47,
    mAP: 0.782, precision: 0.831, recall: 0.748,
    batchSize: 16, imgSize: 640, optimizer: 'SGD', device: 'A100×2',
    createdAt: '2026-04-29 09:14', classes: ['裂缝', '坑洼', '破损', '剥落', '标线模糊', '积水', '障碍物'],
    trainImages: 3410, valImages: 975,
    published: false,
  },
  'task-002': {
    name: '施工人员安全帽检测', dataset: '安全帽标注集·2391张', baseModel: 'YOLOv8s',
    status: 'completed', totalEpochs: 80, startEpoch: 80,
    mAP: 0.923, precision: 0.941, recall: 0.908,
    batchSize: 32, imgSize: 640, optimizer: 'SGD', device: 'A100×1',
    createdAt: '2026-04-28 14:30', classes: ['安全帽', '无安全帽', '人员'],
    trainImages: 1673, valImages: 478,
    published: false,
  },
  'task-003': {
    name: '车牌识别增强版', dataset: '车牌数据集·7840张', baseModel: 'YOLOv8l',
    status: 'failed', totalEpochs: 120, startEpoch: 23,
    mAP: 0, precision: 0, recall: 0,
    batchSize: 16, imgSize: 640, optimizer: 'AdamW', device: 'A100×4',
    createdAt: '2026-04-27 22:05', classes: ['车牌', '遮挡车牌', '模糊车牌'],
    trainImages: 5488, valImages: 1568,
    errorMsg: 'CUDA out of memory. Tried to allocate 2.73 GiB (GPU 0; 79.20 GiB total capacity). Try reducing batch size or image size.',
    published: false,
  },
  'task-004': {
    name: '工厂设备异常检测', dataset: '设备标注集·1628张', baseModel: 'YOLOv8n',
    status: 'pending', totalEpochs: 60, startEpoch: 0,
    mAP: 0, precision: 0, recall: 0,
    batchSize: 16, imgSize: 640, optimizer: 'SGD', device: 'A100×1',
    createdAt: '2026-04-29 10:47', classes: ['正常设备', '异常设备', '待检修'],
    trainImages: 1139, valImages: 325,
    published: false,
  },
}

// Verification results for completed tasks
const VERIFICATION_RESULTS: Record<string, {
  quality: 'excellent' | 'good' | 'pass' | 'improve';
  qualityLabel: string;
  summary: string;
  highlights: string[];
  suggestions: string[];
  details: Array<{ label: string; value: string; status: 'pass' | 'warn' | 'fail' }>;
}> = {
  'task-002': {
    quality: 'excellent',
    qualityLabel: '优秀',
    summary: '模型表现出色，各项指标均达到或超过预期，可直接部署生产环境。',
    highlights: [
      'mAP@0.5 达到 0.923，检测精度优异',
      '安全帽类别识别准确率高达 94.8%',
      '召回率稳定在 90% 以上',
      'F1-Score 达到 0.924，综合表现优秀',
    ],
    suggestions: [
      '建议在实际场景中进一步测试遮挡场景的检测效果',
      '可考虑增加夜间场景数据以提升鲁棒性',
    ],
    details: [
      { label: 'mAP@0.5', value: '0.923', status: 'pass' },
      { label: 'mAP@0.5:0.95', value: '0.716', status: 'pass' },
      { label: 'Precision', value: '0.941', status: 'pass' },
      { label: 'Recall', value: '0.908', status: 'pass' },
      { label: 'F1-Score', value: '0.924', status: 'pass' },
      { label: '推理速度', value: '58 FPS', status: 'pass' },
    ],
  },
  'task-001': {
    quality: 'good',
    qualityLabel: '良好',
    summary: '模型整体表现良好，核心指标满足部署要求，部分类别可进一步优化。',
    highlights: [
      'mAP@0.5 达到 0.782，整体检测效果良好',
      '裂缝、坑洼等主要缺陷类别检测准确',
      '训练过程稳定，无明显过拟合',
    ],
    suggestions: [
      '"障碍物"类别召回率偏低(0.68)，建议增加该类样本',
      '考虑增加数据增强提升小目标检测能力',
      '可尝试调整 anchor 尺寸优化小目标检测',
    ],
    details: [
      { label: 'mAP@0.5', value: '0.782', status: 'pass' },
      { label: 'mAP@0.5:0.95', value: '0.488', status: 'warn' },
      { label: 'Precision', value: '0.831', status: 'pass' },
      { label: 'Recall', value: '0.748', status: 'pass' },
      { label: 'F1-Score', value: '0.788', status: 'pass' },
      { label: '推理速度', value: '39 FPS', status: 'pass' },
    ],
  },
}

// Mock test set images for visualization
const TEST_IMAGES = [
  { id: 'test-001', name: 'test_0001.jpg', width: 640, height: 480 },
  { id: 'test-002', name: 'test_0002.jpg', width: 640, height: 480 },
  { id: 'test-003', name: 'test_0003.jpg', width: 640, height: 480 },
  { id: 'test-004', name: 'test_0004.jpg', width: 640, height: 480 },
  { id: 'test-005', name: 'test_0005.jpg', width: 640, height: 480 },
]

// Mock datasets for visualization
const DATASETS = [
  {
    id: 'ds-001',
    name: '道路缺陷检测数据集 v2.3',
    images: 4872,
    imagesList: [
      { id: 'ds-img-001', name: 'img_0001.jpg', width: 640, height: 480 },
      { id: 'ds-img-002', name: 'img_0002.jpg', width: 640, height: 480 },
      { id: 'ds-img-003', name: 'img_0003.jpg', width: 640, height: 480 },
    ],
  },
  {
    id: 'ds-002',
    name: '施工安全帽检测集',
    images: 2391,
    imagesList: [
      { id: 'ds-img-004', name: 'img_0004.jpg', width: 640, height: 480 },
      { id: 'ds-img-005', name: 'img_0005.jpg', width: 640, height: 480 },
      { id: 'ds-img-006', name: 'img_0006.jpg', width: 640, height: 480 },
    ],
  },
]

const CLASS_COLORS = ['#1d4ed8', '#ef4444', '#f59e0b', '#8b5cf6', '#10b981', '#06b6d4', '#6366f1']

type ImageSource = 'upload' | 'testset' | 'dataset'

interface Prediction {
  className: string
  confidence: number
  bbox: { x: number; y: number; width: number; height: number }
}

// Simulate training log lines
const generateLog = (epoch: number, total: number): string[] => {
  const loss = (1.8 - epoch * 0.012 + Math.random() * 0.05).toFixed(4)
  const valLoss = (1.9 - epoch * 0.011 + Math.random() * 0.06).toFixed(4)
  const map = (0.2 + epoch * 0.006 + Math.random() * 0.01).toFixed(3)
  return [
    `[dim]${new Date().toTimeString().slice(0, 8)}[0m Epoch ${epoch}/${total}`,
    `  train/box_loss: ${loss}  train/cls_loss: ${(parseFloat(loss) * 0.6).toFixed(4)}  train/dfl_loss: ${(parseFloat(loss) * 0.3).toFixed(4)}`,
    `  val/box_loss:   ${valLoss}  val/cls_loss:   ${(parseFloat(valLoss) * 0.6).toFixed(4)}  val/dfl_loss:   ${(parseFloat(valLoss) * 0.3).toFixed(4)}`,
    `  metrics/mAP50: ${map}  metrics/mAP50-95: ${(parseFloat(map) * 0.62).toFixed(3)}`,
  ]
}

const STATUS_CONFIG = {
  running: { label: '训练中', cls: 'badge-running', icon: <RefreshCw size={11} className="spinning" /> },
  completed: { label: '已完成', cls: 'badge-completed', icon: <CheckCircle2 size={11} /> },
  failed: { label: '训练失败', cls: 'badge-failed', icon: <XCircle size={11} /> },
  pending: { label: '等待中', cls: 'badge-pending', icon: <Clock size={11} /> },
}

function ReLineChart({ data, color, height = 120 }: { data: number[]; color: string; height?: number }) {
  if (data.length === 0) {
    return (
      <div className="mini-chart" style={{ height, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>暂无数据</span>
      </div>
    )
  }

  const chartData = data.map((value, index) => ({
    epoch: index + 1,
    value,
  }))

  return (
    <div className="mini-chart" style={{ height: `${height}px`, minHeight: '80px', minWidth: '200px' }}>
      <ResponsiveContainer width="100%" height={height}>
        <LineChart data={chartData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border-dim)" />
          <XAxis
            dataKey="epoch"
            tick={{ fontSize: 10, fill: 'var(--text-muted)' }}
            axisLine={{ stroke: 'var(--border-dim)' }}
            tickLine={{ stroke: 'var(--border-dim)' }}
            minTickGap={20}
          />
          <YAxis
            tick={{ fontSize: 10, fill: 'var(--text-muted)' }}
            axisLine={{ stroke: 'var(--border-dim)' }}
            tickLine={{ stroke: 'var(--border-dim)' }}
            domain={['auto', 'auto']}
          />
          <Tooltip
            contentStyle={{
              background: 'var(--bg-elevated)',
              border: '1px solid var(--border-default)',
              borderRadius: 6,
              padding: '8px 12px',
              fontSize: 12,
            }}
            formatter={(value) => [`${typeof value === 'number' ? value.toFixed(4) : value}`, '值']}
            labelFormatter={(label) => `第 ${label} 轮`}
          />
          <Line
            type="monotone"
            dataKey="value"
            stroke={color}
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4, fill: color }}
            animationDuration={300}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

function TaskDetail() {
  const { taskId } = Route.useParams()
  const task = TASK_DATA[taskId] ?? TASK_DATA['task-001']
  const navigate = useNavigate()

  const [epoch, setEpoch] = useState(task.startEpoch)
  const [mAP, setMAP] = useState(task.mAP)
  const [precision, setPrecision] = useState(task.precision)
  const [recall, setRecall] = useState(task.recall)
  const [logs, setLogs] = useState<Array<{ text: string; cls: string }>>([])
  const [mapHistory, setMapHistory] = useState<number[]>(
    Array.from({ length: task.startEpoch }, (_, i) =>
      Math.min(0.95, 0.2 + (i + 1) * 0.006 + Math.random() * 0.01)
    )
  )
  const [lossHistory, setLossHistory] = useState<number[]>(
    Array.from({ length: task.startEpoch }, (_, i) =>
      Math.max(0.3, 1.8 - (i + 1) * 0.012 + Math.random() * 0.05)
    )
  )
  const [perfView, setPerfView] = useState<'val' | 'test'>('val')
  const logRef = useRef<HTMLDivElement>(null)
  const [logExpanded, setLogExpanded] = useState(false)
  // Publish modal
  const [showPublishModal, setShowPublishModal] = useState(false)
  const [publishMode, setPublishMode] = useState<'new' | 'existing'>('new')
  const [publishModelId, setPublishModelId] = useState('')
  const [publishVersion, setPublishVersion] = useState('')
  const [publishModelName, setPublishModelName] = useState('')
  const [publishModelDesc, setPublishModelDesc] = useState('')
  const [publishModelCategory, setPublishModelCategory] = useState('')
  const [publishErrors, setPublishErrors] = useState<Record<string, string>>({})
  const [publishSubmitting, setPublishSubmitting] = useState(false)

  const SQUARE_MODELS = [
    { id: 'sq-model-001', name: '道路缺陷检测', existingVersions: ['v2.3', 'v2.2', 'v2.1'] },
    { id: 'sq-model-002', name: '施工安全帽检测', existingVersions: ['v1.0'] },
    { id: 'sq-model-003', name: '人员跌倒检测', existingVersions: ['v1.0'] },
    { id: 'sq-model-004', name: '火焰烟雾检测', existingVersions: ['v2.1', 'v2.0', 'v1.5'] },
  ]
  const publishSelectedModel = SQUARE_MODELS.find(m => m.id === publishModelId)
  const publishExistingVersions = publishSelectedModel?.existingVersions || []

  function openPublishModal() {
    setPublishMode('new')
    setPublishModelId('')
    setPublishVersion('')
    setPublishModelName('')
    setPublishModelDesc('')
    setPublishModelCategory('')
    setPublishErrors({})
    setShowPublishModal(true)
  }

  function validatePublish(): boolean {
    const e: Record<string, string> = {}
    if (publishMode === 'existing') {
      if (!publishModelId) e.publishModelId = '请选择已有模型'
    } else {
      if (!publishModelName.trim()) e.publishModelName = '请输入模型名称'
    }
    if (!publishVersion) {
      e.publishVersion = '请输入版本号'
    } else if (publishMode === 'existing' && publishExistingVersions.includes(publishVersion)) {
      e.publishVersion = '该版本号已存在'
    } else if (!/^v?\d+\.\d+/.test(publishVersion)) {
      e.publishVersion = '版本号格式不正确，建议格式：v1.0'
    }
    setPublishErrors(e)
    return Object.keys(e).length === 0
  }

  async function handlePublish() {
    if (!validatePublish()) return
    setPublishSubmitting(true)
    await new Promise(r => setTimeout(r, 1500))
    const name = publishMode === 'existing' ? publishSelectedModel?.name : publishModelName
    alert(`模型「${name}」${publishVersion} 发布成功！`)
    setShowPublishModal(false)
    setPublishSubmitting(false)
  }

  // Visualization states
  const [imageSource, setImageSource] = useState<ImageSource>('testset')
  const [selectedDataset, setSelectedDataset] = useState(DATASETS[0]?.id || '')
  const [selectedImage, setSelectedImage] = useState(TEST_IMAGES[0])
  const [uploadedImage, setUploadedImage] = useState<string | null>(null)
  const [predictions, setPredictions] = useState<Prediction[]>([])
  const [isPredicting, setIsPredicting] = useState(false)

  const availableImages = imageSource === 'testset' 
    ? TEST_IMAGES 
    : DATASETS.find(d => d.id === selectedDataset)?.imagesList || []

  const currentImage = imageSource === 'upload' && uploadedImage 
    ? { name: '上传的图片', width: 640, height: 480 } 
    : selectedImage

  async function runPrediction() {
    setIsPredicting(true)
    await new Promise(r => setTimeout(r, 1500))
    
    const mockPredictions: Prediction[] = []
    const numBoxes = Math.floor(Math.random() * 3) + 1
    for (let i = 0; i < numBoxes; i++) {
      const classIndex = Math.floor(Math.random() * task.classes.length)
      mockPredictions.push({
        className: task.classes[classIndex],
        confidence: 0.75 + Math.random() * 0.24,
        bbox: {
          x: 50 + Math.random() * 200,
          y: 50 + Math.random() * 200,
          width: 80 + Math.random() * 120,
          height: 80 + Math.random() * 120,
        },
      })
    }
    setPredictions(mockPredictions)
    setIsPredicting(false)
  }

  function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => {
        setUploadedImage(event.target?.result as string)
        setSelectedImage({ id: 'upload', name: file.name, width: 640, height: 480 })
        setPredictions([])
      }
      reader.readAsDataURL(file)
    }
  }

  useEffect(() => {
    if (task.status !== 'running') return
    const interval = setInterval(() => {
      setEpoch(prev => {
        if (prev >= task.totalEpochs) { clearInterval(interval); return prev }
        const next = prev + 1
        const newMap = Math.min(0.95, 0.2 + next * 0.006 + Math.random() * 0.01)
        const newPrec = Math.min(0.98, newMap * 1.07 + Math.random() * 0.02)
        const newRecall = Math.min(0.96, newMap * 0.96 + Math.random() * 0.02)
        setMAP(newMap)
        setPrecision(newPrec)
        setRecall(newRecall)
        setMapHistory(h => [...h, newMap])
        setLossHistory(h => [...h, Math.max(0.3, 1.8 - next * 0.012 + Math.random() * 0.05)])
        const newLines = generateLog(next, task.totalEpochs)
        setLogs(prev => [...prev.slice(-60), ...newLines.map(t => ({ text: t, cls: 'log-info' }))])
        return next
      })
    }, 1200)
    return () => clearInterval(interval)
  }, [task.status, task.totalEpochs])

  useEffect(() => {
    if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight
  }, [logs])

  const progress = Math.round((epoch / task.totalEpochs) * 100)
  const sc = STATUS_CONFIG[task.status]
  const verification = VERIFICATION_RESULTS[taskId] || {
    quality: 'pass' as const,
    qualityLabel: '待评估',
    summary: '暂无验证结论',
    highlights: [],
    suggestions: [],
    details: [],
  }

  return (
    <div className="slide-in">
      {/* Header */}
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button className="btn btn-secondary btn-sm" onClick={() => navigate({ to: '/train' })}>
            <ArrowLeft size={14} /> 返回列表
          </button>
          <div>
            <div className="breadcrumb">
              <Link to="/">科宝训练平台</Link> ›
              <Link to="/train">训练任务</Link> ›
              <span>{task.name}</span>
            </div>
            <div className="flex items-center gap-3 mt-1">
              <h1 className="page-title mb-0">{task.name}</h1>
              <span className={`badge ${sc.cls}`}>{sc.icon} {sc.label}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="content-padded">
        {/* Failed error */}
        {task.status === 'failed' && task.errorMsg && (
          <div className="error-box mb-5">
            <AlertTriangle size={15} className="text-error flex-shrink-0 mt-0.5" />
            <div>
              <div className="text-sm font-semibold text-error mb-1">训练失败</div>
              <div className="font-mono text-xs text-secondary leading-relaxed">{task.errorMsg}</div>
            </div>
          </div>
        )}

        {/* Verification Results - only for completed tasks */}
        {task.status === 'completed' && (
          <>
            {/* 训练结果状态 */}
            <div className="card card-padded mb-5">
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <div style={{
                  width: 56, height: 56,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: task.published ? 'rgba(18,217,122,0.1)' : 'rgba(245,158,11,0.1)'
                }}>
                  {task.published ? (
                    <CheckCircle2 size={28} style={{ color: 'var(--success)' }} />
                  ) : (
                    <Clock size={28} style={{ color: 'var(--warning)' }} />
                  )}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 4 }}>
                    训练结果状态
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 20, fontWeight: 700,
                      color: task.published ? 'var(--success)' : 'var(--warning)'
                    }}>
                      {task.published ? '已发布' : '未发布'}
                    </span>
                    {task.published && task.modelName && task.modelVersion && (
                      <span className="badge" style={{ background: 'var(--accent-glow)', color: 'var(--accent)' }}>
                        {task.modelName} v{task.modelVersion}
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>
                    {task.published
                      ? `发布时间: ${task.publishedAt}`
                      : '训练任务产生的结果初始处于未发布状态，只有发布后才会出现在模型广场'
                    }
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                  <Link to="/validate/create" className="btn btn-success btn-sm">
                    <FlaskConical size={14} /> 创建验证任务
                  </Link>
                  {!task.published ? (
                    <button className="btn btn-teal btn-sm" onClick={openPublishModal}>
                      <Package size={13} /> 发布模型
                    </button>
                  ) : (
                    <Link to="/models/$modelId" params={{ modelId: 'model-001' }} className="btn btn-primary btn-sm">
                      <Package size={13} /> 查看模型
                    </Link>
                  )}
                </div>
              </div>
            </div>

           

            {/* Detailed metrics */}
            <div className="card card-padded mb-5">
              <div className="section-title mb-3">详细指标</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 12 }}>
                {verification.details.map(d => (
                  <div key={d.label} className="metric-chip">
                    <div className="metric-chip-value" style={{
                      color: d.status === 'pass' ? 'var(--success)' :
                             d.status === 'warn' ? 'var(--warning)' : 'var(--error)'
                    }}>
                      {d.value}
                    </div>
                    <div className="metric-chip-label">{d.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Model Validation Panel */}
            <div className="card card-padded mb-5">
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
                <Package size={15} style={{ color: 'var(--accent-bright)' }} />
                <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)' }}>模型验证</span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: 20 }}>
                {/* Left Panel - Image Selection */}
                <div style={{ borderRight: '1px solid var(--border-dim)', paddingRight: 20 }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <button
                      className={`btn btn-sm ${imageSource === 'upload' ? 'btn-primary' : 'btn-secondary'}`}
                      onClick={() => setImageSource('upload')}
                    >
                      <Upload size={12} /> 本地上传
                    </button>
                    <button
                      className={`btn btn-sm ${imageSource === 'testset' ? 'btn-primary' : 'btn-secondary'}`}
                      onClick={() => setImageSource('testset')}
                    >
                      <ImageIcon size={12} /> 测试集图片
                    </button>
                    
                  </div>

                  {imageSource === 'upload' && (
                    <div style={{ marginTop: 16 }}>
                      <label className="form-label text-xs">选择图片文件</label>
                      <div style={{
                        border: '2px dashed var(--border-default)',
                        borderRadius: 6,
                        padding: '16px',
                        textAlign: 'center',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                      }}
                        onClick={() => document.getElementById(`file-upload-${taskId}`)?.click()}
                      >
                        <Upload size={20} style={{ color: 'var(--text-muted)', marginBottom: 6 }} />
                        <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>
                          {uploadedImage ? '点击更换图片' : '点击或拖拽上传图片'}
                        </div>
                        <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 3 }}>
                          支持 JPG、PNG、WebP 格式
                        </div>
                      </div>
                      <input
                        id={`file-upload-${taskId}`}
                        type="file"
                        accept="image/*"
                        onChange={handleFileUpload}
                        style={{ display: 'none' }}
                      />
                    </div>
                  )}

                  {imageSource === 'testset' && (
                    <div style={{ marginTop: 16 }}>
                      <label className="form-label text-xs">测试集图片</label>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6 }}>
                        {TEST_IMAGES.map(img => (
                          <div
                            key={img.id}
                            className="select-card"
                            style={{
                              borderColor: selectedImage?.id === img.id ? 'var(--accent)' : undefined,
                              cursor: 'pointer',
                              padding: 6,
                            }}
                            onClick={() => {
                              setSelectedImage(img)
                              setPredictions([])
                            }}
                          >
                            <div style={{
                              width: '100%',
                              aspectRatio: '4/3',
                              background: 'var(--bg-elevated)',
                              borderRadius: 4,
                              marginBottom: 4,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}>
                              <ImageIcon size={16} style={{ color: 'var(--text-muted)' }} />
                            </div>
                            <div style={{ fontSize: 9, color: 'var(--text-muted)', textAlign: 'center' }}>
                              {img.name}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  
                </div>

                {/* Right Panel - Prediction Result */}
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                    <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                      {currentImage?.name || '未选择图片'}
                    </div>
                    <button
                      className="btn btn-primary btn-sm"
                      onClick={runPrediction}
                      disabled={!currentImage || isPredicting}
                    >
                      <Zap size={12} /> {isPredicting ? '预测中...' : '运行预测'}
                    </button>
                  </div>

                  <div style={{
                    position: 'relative',
                    background: 'var(--bg-elevated)',
                    borderRadius: 8,
                    overflow: 'hidden',
                    aspectRatio: '4/3',
                    minHeight: 240,
                  }}>
                    {uploadedImage ? (
                      <img
                        src={uploadedImage}
                        alt="Uploaded"
                        style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                      />
                    ) : (
                      <div style={{
                        width: '100%',
                        height: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: 'var(--bg-elevated)',
                      }}>
                        <ImageIcon size={32} style={{ color: 'var(--text-muted)' }} />
                      </div>
                    )}

                    {/* Prediction boxes */}
                    {isPredicting && (
                      <div style={{
                        position: 'absolute',
                        inset: 0,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: 'rgba(0,0,0,0.5)',
                      }}>
                        <div style={{
                          width: 32,
                          height: 32,
                          border: 2,
                          borderStyle: 'solid',
                          borderColor: 'transparent var(--accent) var(--accent) var(--accent)',
                          borderRadius: '50%',
                          animation: 'spin 1s linear infinite',
                        }} />
                      </div>
                    )}

                    {predictions.map((pred, index) => {
                      const color = CLASS_COLORS[task.classes.indexOf(pred.className)] || '#1d4ed8'
                      return (
                        <div
                          key={index}
                          style={{
                            position: 'absolute',
                            left: `${(pred.bbox.x / 640) * 100}%`,
                            top: `${(pred.bbox.y / 480) * 100}%`,
                            width: `${(pred.bbox.width / 640) * 100}%`,
                            height: `${(pred.bbox.height / 480) * 100}%`,
                            border: `2px solid ${color}`,
                            borderRadius: 3,
                            boxShadow: `0 0 6px ${color}40`,
                          }}
                        >
                          <div style={{
                            position: 'absolute',
                            top: '-20px',
                            left: 0,
                            background: color,
                            color: 'white',
                            fontSize: 9,
                            padding: '2px 4px',
                            borderRadius: 2,
                            whiteSpace: 'nowrap',
                          }}>
                            {pred.className} {pred.confidence.toFixed(2)}
                          </div>
                        </div>
                      )
                    })}
                  </div>

                  {/* Prediction Results List */}
                  {predictions.length > 0 && (
                    <div style={{ marginTop: 12 }}>
                      <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 8 }}>
                        检测结果 ({predictions.length} 个目标)
                      </div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                        {predictions.map((pred, index) => {
                          const color = CLASS_COLORS[task.classes.indexOf(pred.className)] || '#1d4ed8'
                          const isHighConfidence = pred.confidence >= 0.85
                          return (
                            <div
                              key={index}
                              className="badge"
                              style={{
                                background: `${color}15`,
                                color: color,
                                borderColor: `${color}30`,
                              }}
                            >
                              {isHighConfidence ? <CheckCircle2 size={9} /> : <AlertCircle size={9} />}
                              <span>{pred.className}</span>
                              <span style={{ fontFamily: 'JetBrains Mono', fontSize: 9 }}>
                                {pred.confidence.toFixed(2)}
                              </span>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )}

                  {/* Legend */}
                  <div style={{ marginTop: 16, paddingTop: 12, borderTop: '1px solid var(--border-dim)' }}>
                    <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 8 }}>
                      类别图例
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                      {task.classes.map((cls, index) => (
                        <div key={cls} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                          <div style={{
                            width: 10,
                            height: 10,
                            borderRadius: 2,
                            background: CLASS_COLORS[index] || '#1d4ed8',
                          }} />
                          <span style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{cls}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Info + Progress row */}
        <div className="grid-2 mb-5">
          {/* Task info */}
          <div className="card card-padded">
            <div className="section-title mb-3">任务配置</div>
            <div className="flex flex-col gap-2">
              {[
                { label: '数据集', value: task.dataset },
                { label: '基础模型', value: task.baseModel },
                { label: '优化器', value: task.optimizer },
                { label: '批次大小', value: String(task.batchSize) },
                { label: '图像尺寸', value: `${task.imgSize}×${task.imgSize}` },
                { label: '训练设备', value: task.device },
                { label: '创建时间', value: task.createdAt },
              ].map(row => (
                <div key={row.label} className="data-row">
                  <span className="data-row-label">{row.label}</span>
                  <span className="data-row-value">{row.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Progress */}
          <div className="card card-padded">
            <div className="section-title mb-4">训练进度</div>

            <div className="progress-info">
              <span className="progress-main">
                {epoch}<span className="progress-sub">/{task.totalEpochs}轮</span>
              </span>
              <span className={`progress-percent ${progress === 100 ? 'text-success' : 'text-accent'}`}>{progress}%</span>
            </div>

            <div className="progress-bar progress-lg mb-4">
              <div className={`progress-fill ${task.status === 'failed' ? 'progress-fill-error' : ''}`}
                style={{ width: `${progress}%` }} />
            </div>

            <div className="grid-3 mb-4">
              {[
                { label: 'mAP@0.5', value: mAP > 0 ? mAP.toFixed(3) : '—', color: 'var(--success)' },
                { label: 'Precision', value: precision > 0 ? precision.toFixed(3) : '—', color: 'var(--teal)' },
                { label: 'Recall', value: recall > 0 ? recall.toFixed(3) : '—', color: 'var(--warning)' },
              ].map(m => (
                <div key={m.label} className="metric-chip">
                  <div className="metric-chip-value" style={{ color: m.color }}>{m.value}</div>
                  <div className="metric-chip-label">{m.label}</div>
                </div>
              ))}
            </div>

            {task.status === 'running' && (
              <div className="gpu-info">
                <Cpu size={12} className="text-accent" />
                <span>GPU {task.device} · 已用 {Math.floor(epoch * 1.32)}min · 预计剩余 {Math.ceil((task.totalEpochs - epoch) * 1.32)}min</span>
              </div>
            )}
          </div>
        </div>

        {/* Training Charts */}
        <div className="grid-2 mb-5">
          <div className="card card-padded">
            <div className="chart-title">mAP@0.5 曲线（共 {mapHistory.length} 轮）</div>
            <ReLineChart data={mapHistory} color="var(--success)" height={100} />
          </div>
          <div className="card card-padded">
            <div className="chart-title">训练损失曲线（共 {lossHistory.length} 轮）</div>
            <ReLineChart data={lossHistory} color="var(--accent)" height={100} />
          </div>

          {/* Class metrics */}
          <div className="card card-padded" style={{ gridColumn: '1 / -1' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 16 }}>
              <div className="chart-title" style={{ marginBottom: 0 }}>类别检测性能</div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 16 }}>
              <div style={{ display: 'flex', gap: 0 }}>
                <button
                  className={`btn btn-sm ${perfView === 'val' ? 'btn-primary' : 'btn-secondary'}`}
                  onClick={() => setPerfView('val')}
                >
                  验证集
                </button>
                <button
                  className={`btn btn-sm ${perfView === 'test' ? 'btn-primary' : 'btn-secondary'}`}
                  onClick={() => setPerfView('test')}
                >
                  测试集
                </button>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <div style={{ display: 'flex', alignItems: 'center', padding: '0 8px', fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                <span style={{ width: 100, flexShrink: 0 }}>类别</span>
                <span style={{ flex: 1 }}>准确率</span>
                <span style={{ width: 72, textAlign: 'right', flexShrink: 0 }}>mAP</span>
              </div>

              {task.classes.map((cls, i) => {
                // Generate stable mock data per view
                const seed = (i + 1) * (perfView === 'val' ? 7 : 13)
                const classMap = mAP > 0
                  ? Math.min(0.99, mAP * (0.82 + (perfView === 'val' ? 0.04 : 0.01) + i * 0.015 + (Math.sin(seed) * 0.06)))
                  : 0
                const pct = Math.round(classMap * 100)

                return (
                  <div key={cls} style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 0,
                    padding: '9px 8px',
                  }}>
                    <span style={{
                      width: 100, flexShrink: 0, fontSize: 13, fontWeight: 500,
                      color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                    }}>
                      {cls}
                    </span>

                    <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div className="progress-bar" style={{ flex: 1, height: 8 }}>
                        <div className="progress-fill" style={{
                          width: `${pct}%`,
                          background: pct >= 80 ? 'var(--success)'
                            : pct >= 60 ? 'var(--teal)'
                            : pct >= 40 ? 'var(--warning)'
                            : 'var(--error)',
                        }} />
                      </div>
                      <span style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'JetBrains Mono', minWidth: 32, textAlign: 'right' }}>
                        {pct}%
                      </span>
                    </div>

                    <span style={{
                      width: 72, flexShrink: 0, textAlign: 'right',
                      fontFamily: 'JetBrains Mono', fontSize: 13, fontWeight: 600,
                      color: pct >= 80 ? 'var(--success)'
                        : pct >= 60 ? 'var(--teal)'
                        : pct >= 40 ? 'var(--warning)'
                        : 'var(--text-muted)',
                    }}>
                      {classMap > 0 ? classMap.toFixed(3) : '—'}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Training Log (collapsible) */}
        <div className="card">
          <button 
            style={{ width: '100%', padding: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', background: 'transparent', transition: 'background 0.15s' }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = 'var(--bg-hover)' }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = 'transparent' }}
            onClick={() => setLogExpanded(!logExpanded)}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Terminal size={15} style={{ color: 'var(--accent-bright)' }} />
              <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>训练日志</span>
              <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>({logs.length} 条)</span>
            </div>
            <div style={{ transform: logExpanded ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}>
              <ChevronRight size={15} style={{ color: 'var(--text-muted)' }} />
            </div>
          </button>
          
          {logExpanded && (
            <div className="log-terminal" style={{ height: 300, borderTop: '1px solid var(--border-dim)' }} ref={logRef}>
              <span className="log-line log-dim"># 科宝训练平台 · 任务 {taskId} · {task.name}</span>
              <span className="log-line log-dim"># 数据集: {task.dataset} · 基础模型: {task.baseModel}</span>
              <span className="log-line log-dim"># ─────────────────────────────────────────</span>
              {task.status === 'pending' && (
                <span className="log-line log-warn">⏳ 任务在队列中等待 GPU 资源…</span>
              )}
              {task.status === 'failed' && (
                <>
                  <span className="log-line log-error">✗ 训练进程异常终止 (Epoch {task.startEpoch}/{task.totalEpochs})</span>
                  <span className="log-line log-error">{task.errorMsg}</span>
                </>
              )}
              {(task.status === 'completed' || task.status === 'running') && (
                <>
                  <span className="log-line log-success">✓ 模型权重加载完成: {task.baseModel}.pt</span>
                  <span className="log-line log-info">  训练集: {task.trainImages} 张 · 验证集: {task.valImages} 张</span>
                  <span className="log-line log-info">  设备: {task.device} · 批次大小: {task.batchSize} · 图像尺寸: {task.imgSize}</span>
                  <span className="log-line log-dim">  ─────────────────────────────────</span>
                </>
              )}
              {logs.map((l, i) => (
                <span key={i} className={`log-line ${l.cls}`}>{l.text}</span>
              ))}
              {task.status === 'completed' && (
                <>
                  <span className="log-line log-dim">  ─────────────────────────────────</span>
                  <span className="log-line log-success">✓ 训练完成！最佳模型已保存: best.pt</span>
                  <span className="log-line log-success">  mAP@0.5: {task.mAP.toFixed(3)}  Precision: {task.precision.toFixed(3)}  Recall: {task.recall.toFixed(3)}</span>
                </>
              )}
              {task.status === 'running' && (
                <span className="log-line log-info">▌<span className="cursor-blink">_</span></span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Publish Modal */}
      {showPublishModal && (
        <div className="modal-backdrop" onClick={() => setShowPublishModal(false)}>
          <div className="modal" style={{ maxWidth: 540 }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
              <span style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' }}>发布模型</span>
              <button className="btn btn-ghost btn-sm" onClick={() => setShowPublishModal(false)}>✕</button>
            </div>

            {/* Current task info */}
            <div style={{ padding: 12, background: 'var(--bg-elevated)', border: '1px solid var(--border-dim)', marginBottom: 16, fontSize: 12 }}>
              <div style={{ color: 'var(--text-muted)', marginBottom: 4 }}>发布任务</div>
              <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{task.name}</div>
              <div style={{ color: 'var(--text-secondary)', marginTop: 2 }}>
                {task.baseModel} · mAP: {task.mAP > 0 ? task.mAP.toFixed(3) : '—'}
              </div>
            </div>

            {/* Publish mode toggle */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
              <button className={`btn btn-sm ${publishMode === 'new' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => { setPublishMode('new'); setPublishErrors({}) }}>
                <Plus size={13} /> 创建新模型
              </button>
              <button className={`btn btn-sm ${publishMode === 'existing' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => { setPublishMode('existing'); setPublishErrors({}) }}>
                <Copy size={13} /> 发布到已有模型
              </button>
            </div>

            {publishMode === 'existing' ? (
              <div style={{ animation: 'slideDown 0.15s ease-out' }}>
                <div style={{ marginBottom: 14 }}>
                  <SearchableDropdown
                    label="选择已有模型"
                    color="var(--accent-bright)"
                    selectedId={publishModelId}
                    onChange={(id) => { setPublishModelId(id); setPublishErrors({}) }}
                    items={SQUARE_MODELS.map(m => ({
                      id: m.id,
                      name: m.name,
                      subtitle: `已有版本: ${m.existingVersions.join('、')}`,
                      tags: m.existingVersions,
                    }))}
                    placeholder="选择要追加版本的已有模型..."
                  />
                  {publishErrors.publishModelId && <div className="error-text">{publishErrors.publishModelId}</div>}
                </div>
                {publishSelectedModel && (
                  <div style={{ padding: 10, background: 'var(--bg-elevated)', border: '1px solid var(--border-dim)', marginBottom: 14, fontSize: 11, color: 'var(--text-secondary)' }}>
                    当前已有版本：{publishSelectedModel.existingVersions.join('、')}，发布后将成为第 {publishSelectedModel.existingVersions.length + 1} 个版本
                  </div>
                )}
              </div>
            ) : (
              <div style={{ animation: 'slideDown 0.15s ease-out' }}>
                <div style={{ marginBottom: 14 }}>
                  <label className="form-label">模型名称</label>
                  <input className="form-input" type="text" value={publishModelName} onChange={e => { setPublishModelName(e.target.value); setPublishErrors({}) }} placeholder="例如：道路缺陷检测" />
                  {publishErrors.publishModelName && <div className="error-text">{publishErrors.publishModelName}</div>}
                </div>
                <div style={{ marginBottom: 14 }}>
                  <label className="form-label">模型描述（选填）</label>
                  <textarea className="form-input" value={publishModelDesc} onChange={e => setPublishModelDesc(e.target.value)} placeholder="简要描述模型的功能和适用场景..." style={{ minHeight: 60, resize: 'vertical' }} />
                </div>
                <div style={{ marginBottom: 14 }}>
                  <label className="form-label">模型类别</label>
                  <select className="form-input" value={publishModelCategory} onChange={e => setPublishModelCategory(e.target.value)}>
                    <option value="">请选择模型类别</option>
                    <option value="缺陷检测">缺陷检测</option>
                    <option value="安全检测">安全检测</option>
                    <option value="行为检测">行为检测</option>
                    <option value="目标跟踪">目标跟踪</option>
                    <option value="图像分割">图像分割</option>
                    <option value="其他">其他</option>
                  </select>
                </div>
              </div>
            )}

            <div style={{ marginBottom: 16 }}>
              <label className="form-label">{publishMode === 'existing' ? '新版本号' : '初始版本号'}</label>
              <input className="form-input" type="text" value={publishVersion} onChange={e => { setPublishVersion(e.target.value); setPublishErrors({}) }} placeholder="例如：v1.0" style={{ fontFamily: 'JetBrains Mono' }} />
              {publishErrors.publishVersion && <div className="error-text">{publishErrors.publishVersion}</div>}
              {publishMode === 'existing' && !publishErrors.publishVersion && publishVersion && !publishExistingVersions.includes(publishVersion) && (
                <div style={{ fontSize: 12, color: 'var(--success)', marginTop: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
                  <CheckCircle2 size={12} /> 版本号可用
                </div>
              )}
            </div>

            <button className="btn btn-primary" style={{ width: '100%' }} onClick={handlePublish} disabled={publishSubmitting}>
              {publishSubmitting ? <><span className="spinner" /> 发布中…</> : <><CheckCircle2 size={14} /> 确认发布</>}
            </button>
          </div>
        </div>
      )}

    </div>
  )
}
