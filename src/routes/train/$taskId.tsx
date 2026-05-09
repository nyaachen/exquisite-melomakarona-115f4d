import { createFileRoute } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import {
  RefreshCw,
  CheckCircle2,
  XCircle,
  Clock,
  AlertTriangle,
} from 'lucide-react'
import { NotFound } from '../../components/NotFound'
import { TRAIN_STATUS, DEFAULT_CLASS_COLORS } from '../../constants'
import { TaskHeader } from '../../components/train/TaskHeader'
import { CompletedTaskPanel } from '../../components/train/CompletedTaskPanel'
import { ModelValidationPanel } from '../../components/train/ModelValidationPanel'
import { TaskInfoCards } from '../../components/train/TaskInfoCards'
import { TrainingChartsSection } from '../../components/train/TrainingChartsSection'
import { TrainingLogPanel } from '../../components/train/TrainingLogPanel'
import { PublishModelModal } from '../../components/train/PublishModelModal'

export const Route = createFileRoute('/train/$taskId')({
  component: TaskDetail,
})

// ─── 每轮训练指标 ───

interface EpochMetric {
  epoch: number
  mAP: number
  loss: number
  valLoss: number
}

function generateEpochMetrics(
  totalEpochs: number,
  finalMAP: number,
  startEpoch: number = totalEpochs,
): EpochMetric[] {
  const epochs: EpochMetric[] = []
  const mapStart = 0.15
  const lossStart = 2.0
  const lossEnd = 0.35
  for (let i = 1; i <= startEpoch; i++) {
    const t = i / totalEpochs
    const mapProgress = 1 / (1 + Math.exp(-10 * (t - 0.3)))
    epochs.push({
      epoch: i,
      mAP: Math.round((mapStart + (finalMAP - mapStart) * mapProgress) * 10000) / 10000,
      loss: Math.round((lossStart - (lossStart - lossEnd) * mapProgress) * 10000) / 10000,
      valLoss: Math.round(((lossStart + 0.1) - (lossStart + 0.1 - lossEnd - 0.05) * mapProgress) * 10000) / 10000,
    })
  }
  return epochs
}

const TASK_DATA: Record<string, {
  name: string; dataset: string; baseModel: string; status: 'running' | 'completed' | 'failed' | 'pending';
  totalEpochs: number; startEpoch: number; mAP: number; precision: number; recall: number;
  batchSize: number; imgSize: number; optimizer: string; device: string;
  createdAt: string; classes: string[]; trainImages: number; valImages: number;
  epochs: EpochMetric[];
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
    epochs: generateEpochMetrics(100, 0.782, 47),
    published: false,
  },
  'task-002': {
    name: '施工人员安全帽检测', dataset: '安全帽标注集·2391张', baseModel: 'YOLOv8s',
    status: 'completed', totalEpochs: 80, startEpoch: 80,
    mAP: 0.923, precision: 0.941, recall: 0.908,
    batchSize: 32, imgSize: 640, optimizer: 'SGD', device: 'A100×1',
    createdAt: '2026-04-28 14:30', classes: ['安全帽', '无安全帽', '人员'],
    trainImages: 1673, valImages: 478,
    epochs: generateEpochMetrics(80, 0.923),
    published: false,
  },
  'task-003': {
    name: '车牌识别增强版', dataset: '车牌数据集·7840张', baseModel: 'YOLOv8l',
    status: 'failed', totalEpochs: 120, startEpoch: 23,
    mAP: 0, precision: 0, recall: 0,
    batchSize: 16, imgSize: 640, optimizer: 'AdamW', device: 'A100×4',
    createdAt: '2026-04-27 22:05', classes: ['车牌', '遮挡车牌', '模糊车牌'],
    trainImages: 5488, valImages: 1568,
    epochs: generateEpochMetrics(120, 0.65, 23),
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
    epochs: [],
    published: false,
  },
}

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

const TEST_IMAGES = [
  { id: 'test-001', name: 'test_0001.jpg', width: 640, height: 480 },
  { id: 'test-002', name: 'test_0002.jpg', width: 640, height: 480 },
  { id: 'test-003', name: 'test_0003.jpg', width: 640, height: 480 },
  { id: 'test-004', name: 'test_0004.jpg', width: 640, height: 480 },
  { id: 'test-005', name: 'test_0005.jpg', width: 640, height: 480 },
]

const CLASS_COLORS = DEFAULT_CLASS_COLORS

const PUBLISHABLE_MODELS = [
  { id: 'sq-model-001', name: '道路缺陷检测', existingVersions: ['v2.3', 'v2.2', 'v2.1'] },
  { id: 'sq-model-002', name: '施工安全帽检测', existingVersions: ['v1.0'] },
  { id: 'sq-model-003', name: '人员跌倒检测', existingVersions: ['v1.0'] },
  { id: 'sq-model-004', name: '火焰烟雾检测', existingVersions: ['v2.1', 'v2.0', 'v1.5'] },
]

function generateLog(metric: EpochMetric, total: number): string[] {
  const loss = metric.loss.toFixed(4)
  const valLoss = metric.valLoss.toFixed(4)
  const map = metric.mAP.toFixed(3)
  return [
    `[dim]${new Date().toTimeString().slice(0, 8)}[/dim] Epoch ${metric.epoch}/${total}`,
    `  train/box_loss: ${loss}  train/cls_loss: ${(metric.loss * 0.55).toFixed(4)}  train/dfl_loss: ${(metric.loss * 0.28).toFixed(4)}`,
    `  val/box_loss:   ${valLoss}  val/cls_loss:   ${(metric.valLoss * 0.55).toFixed(4)}  val/dfl_loss:   ${(metric.valLoss * 0.28).toFixed(4)}`,
    `  metrics/mAP50: ${map}  metrics/mAP50-95: ${(metric.mAP * 0.62).toFixed(3)}`,
  ]
}

const STATUS_ICONS: Record<string, React.ReactNode> = {
  running: <RefreshCw size={11} className="spinning" />,
  completed: <CheckCircle2 size={11} />,
  failed: <XCircle size={11} />,
  pending: <Clock size={11} />,
}

function TaskDetail() {
  const { taskId } = Route.useParams()
  const task = TASK_DATA[taskId]
  if (!task) return <NotFound />

  const [epoch, setEpoch] = useState(task.startEpoch)
  const [mAP, setMAP] = useState(task.mAP)
  const [precision, setPrecision] = useState(task.precision)
  const [recall, setRecall] = useState(task.recall)
  const [logs, setLogs] = useState<Array<{ text: string; cls: string }>>([])
  const [mapHistory, setMapHistory] = useState<number[]>(
    () => task.epochs.map(e => e.mAP),
  )
  const [lossHistory, setLossHistory] = useState<number[]>(
    () => task.epochs.map(e => e.loss),
  )
  const [perfView, setPerfView] = useState<'val' | 'test'>('val')
  const [logExpanded, setLogExpanded] = useState(false)
  const [showPublishModal, setShowPublishModal] = useState(false)

  useEffect(() => {
    if (task.status !== 'running') return
    const interval = setInterval(() => {
      setEpoch(prev => {
        if (prev >= task.totalEpochs) { clearInterval(interval); return prev }
        const next = prev + 1
        const t = next / task.totalEpochs
        const mapProgress = 1 / (1 + Math.exp(-10 * (t - 0.3)))
        const metric: EpochMetric = {
          epoch: next,
          mAP: Math.round((0.15 + (task.mAP - 0.15) * mapProgress) * 10000) / 10000,
          loss: Math.round((2.0 - (2.0 - 0.35) * mapProgress) * 10000) / 10000,
          valLoss: Math.round((2.1 - (2.1 - 0.4) * mapProgress) * 10000) / 10000,
        }
        const newPrec = Math.round((metric.mAP * 1.07) * 10000) / 10000
        const newRecall = Math.round((metric.mAP * 0.96) * 10000) / 10000
        setMAP(metric.mAP)
        setPrecision(newPrec)
        setRecall(newRecall)
        setMapHistory(h => [...h, metric.mAP])
        setLossHistory(h => [...h, metric.loss])
        setLogs(prev => [...prev.slice(-60), ...generateLog(metric, task.totalEpochs).map(t => ({ text: t, cls: 'log-info' }))])
        return next
      })
    }, 1200)
    return () => clearInterval(interval)
  }, [task.status, task.totalEpochs, task.mAP])

  const progress = Math.round((epoch / task.totalEpochs) * 100)
  const sc = TRAIN_STATUS[task.status]
  const ic = STATUS_ICONS[task.status]
  const verification = VERIFICATION_RESULTS[taskId] || {
    quality: 'pass' as const,
    qualityLabel: '待评估',
    summary: '暂无验证结论',
    highlights: [],
    suggestions: [],
    details: [],
  }

  const configRows = [
    { label: '数据集', value: task.dataset },
    { label: '基础模型', value: task.baseModel },
    { label: '优化器', value: task.optimizer },
    { label: '批次大小', value: String(task.batchSize) },
    { label: '图像尺寸', value: `${task.imgSize}×${task.imgSize}` },
    { label: '训练设备', value: task.device },
    { label: '创建时间', value: task.createdAt },
  ]

  const snapshotRows = [
    { label: '数据集', value: task.dataset },
    { label: '划分', value: '训练 70% · 验证 15% · 测试 15%' },
    { label: '图片总数', value: '4,872 张' },
    { label: '类别', value: '裂缝、坑洼、破损、剥落、标线模糊、积水、障碍物' },
    { label: '快照时间', value: task.createdAt },
  ]

  const splitBar = (
    <div className="split-bar" style={{ marginTop: 4 }}>
      <div className="split-bar-train" style={{ flex: 70 }}>
        <span className="split-bar-label" style={{ color: '#409eff' }}>训练 70%</span>
      </div>
      <div className="split-bar-val" style={{ flex: 15 }}>
        <span className="split-bar-label" style={{ color: '#10b981' }}>验证 15%</span>
      </div>
      <div className="split-bar-test" style={{ flex: 15 }}>
        <span className="split-bar-label" style={{ color: '#f59e0b' }}>测试 15%</span>
      </div>
    </div>
  )

  return (
    <>
    <div className="slide-in">
      <TaskHeader
        taskName={task.name}
        statusBadge={<span className={`badge ${sc.cls}`}>{ic} {sc.label}</span>}
      />

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

        {/* Completed task: verification + validation */}
        {task.status === 'completed' && (
          <>
            <CompletedTaskPanel
              published={task.published}
              modelName={task.modelName}
              modelVersion={task.modelVersion}
              publishedAt={task.publishedAt}
              verification={verification}
              onPublishClick={() => setShowPublishModal(true)}
            />
            <ModelValidationPanel
              taskId={taskId}
              classes={task.classes}
              classColors={CLASS_COLORS}
              testImages={TEST_IMAGES}
            />
          </>
        )}

        {/* Info + Progress cards */}
        <TaskInfoCards
          configRows={configRows}
          snapshotRows={snapshotRows}
          splitBar={splitBar}
          epoch={epoch}
          totalEpochs={task.totalEpochs}
          progress={progress}
          mAP={mAP}
          precision={precision}
          recall={recall}
          isRunning={task.status === 'running'}
          device={task.device}
        />

        {/* Training Charts */}
        <TrainingChartsSection
          mapHistory={mapHistory}
          lossHistory={lossHistory}
          classes={task.classes}
          mAP={mAP}
          perfView={perfView}
          onPerfViewChange={setPerfView}
        />

        {/* Training Log */}
        <TrainingLogPanel
          logs={logs}
          taskId={taskId}
          taskName={task.name}
          dataset={task.dataset}
          baseModel={task.baseModel}
          trainImages={task.trainImages}
          valImages={task.valImages}
          device={task.device}
          batchSize={task.batchSize}
          imgSize={task.imgSize}
          status={task.status}
          totalEpochs={task.totalEpochs}
          mAP={task.mAP}
          precision={task.precision}
          recall={task.recall}
          startEpoch={task.startEpoch}
          errorMsg={task.errorMsg}
          logExpanded={logExpanded}
          onToggle={() => setLogExpanded(!logExpanded)}
        />
      </div>
    </div>

    <PublishModelModal
      show={showPublishModal}
      taskName={task.name}
      baseModel={task.baseModel}
      mAP={task.mAP}
      publishableModels={PUBLISHABLE_MODELS}
      onClose={() => setShowPublishModal(false)}
    />
    </>
  )
}
