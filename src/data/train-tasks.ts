// ─── 训练任务 — 接口定义与 mock 数据 ───

/** 单轮训练指标 */
export interface EpochMetric {
  epoch: number
  mAP: number
  loss: number
  valLoss: number
}

/** 训练任务列表项（用于训练任务列表页） */
export interface TrainingTaskSummary {
  id: string
  name: string
  dataset: string
  images: number
  baseModel: string
  status: 'running' | 'completed' | 'failed' | 'pending'
  progress: number
  epoch: string
  mAP: number
  createdAt: string
  gpu: string
  eta: string
}

/** 训练任务详情（用于训练任务详情页） */
export interface TrainingTaskDetail {
  name: string
  dataset: string
  baseModel: string
  status: 'running' | 'completed' | 'failed' | 'pending'
  totalEpochs: number
  startEpoch: number
  mAP: number
  precision: number
  recall: number
  batchSize: number
  imgSize: number
  optimizer: string
  device: string
  createdAt: string
  classes: string[]
  trainImages: number
  valImages: number
  epochs: EpochMetric[]
  errorMsg?: string
  published: boolean
  modelName?: string
  modelVersion?: string
  publishedAt?: string
}

/** 验证指标项 */
export interface VerificationDetail {
  label: string
  value: string
  status: 'pass' | 'warn' | 'fail'
}

/** 模型验证结论（用于训练完成后的验证评估面板） */
export interface VerificationResult {
  quality: 'excellent' | 'good' | 'pass' | 'improve'
  qualityLabel: string
  summary: string
  highlights: string[]
  suggestions: string[]
  details: VerificationDetail[]
}

/** 可发布的已有模型（用于发布模型弹窗） */
export interface PublishableModel {
  id: string
  name: string
  existingVersions: string[]
}

/** 测试集图片（用于模型验证面板） */
export interface TestImage {
  id: string
  name: string
  width: number
  height: number
}

// ─── 辅助函数 ───

/** 根据总轮数、目标 mAP 和当前进度生成模拟的逐轮训练指标曲线 */
export function generateEpochMetrics(
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

/** 生成单轮训练日志文本 */
export function generateLog(metric: EpochMetric, total: number): string[] {
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

/** 按 ID 查找训练任务详情 */
export function getTaskById(id: string): TrainingTaskDetail | undefined {
  return TASK_DATA_DETAILED[id]
}

// ─── 训练任务列表 ───

/** 训练任务列表 mock 数据 */
export const ALL_TASKS: TrainingTaskSummary[] = [
  { id: 'task-001', name: '道路缺陷检测 v2.3', dataset: '道路缺陷标注集', images: 4872, baseModel: 'YOLOv8m', status: 'running' as const, progress: 47, epoch: '47/100', mAP: 0.782, createdAt: '2026-04-29 09:14', gpu: 'A100×2', eta: '预计 2小时15分' },
  { id: 'task-002', name: '施工人员安全帽检测', dataset: '安全帽标注集', images: 2391, baseModel: 'YOLOv8s', status: 'completed' as const, progress: 100, epoch: '80/80', mAP: 0.923, createdAt: '2026-04-28 14:30', gpu: 'A100×1', eta: '-' },
  { id: 'task-003', name: '车牌识别增强版', dataset: '车牌数据集', images: 7840, baseModel: 'YOLOv8l', status: 'failed' as const, progress: 23, epoch: '23/120', mAP: 0, createdAt: '2026-04-27 22:05', gpu: 'A100×4', eta: '-' },
  { id: 'task-004', name: '工厂设备异常检测', dataset: '设备标注集', images: 1628, baseModel: 'YOLOv8n', status: 'pending' as const, progress: 0, epoch: '0/60', mAP: 0, createdAt: '2026-04-29 10:47', gpu: 'A100×1', eta: '排队中' },
  { id: 'task-005', name: '人员跌倒检测 v1.0', dataset: '跌倒行为数据集', images: 3210, baseModel: 'YOLOv8s', status: 'completed' as const, progress: 100, epoch: '100/100', mAP: 0.887, createdAt: '2026-04-26 11:20', gpu: 'A100×2', eta: '-' },
  { id: 'task-006', name: '火焰烟雾检测', dataset: '火焰烟雾标注集', images: 5601, baseModel: 'YOLOv8m', status: 'completed' as const, progress: 100, epoch: '120/120', mAP: 0.911, createdAt: '2026-04-25 08:00', gpu: 'A100×2', eta: '-' },
]

// ─── 训练任务详情 ───

/** 训练任务详情 mock 数据（按 taskId 索引） */
export const TASK_DATA_DETAILED: Record<string, TrainingTaskDetail> = {
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

// ─── 验证结论 ───

/** 模型验证结论 mock 数据（按 taskId 索引） */
export const VERIFICATION_RESULTS: Record<string, VerificationResult> = {
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

// ─── 可发布模型列表 ───

/** 可发布的已有模型列表（用于发布模型弹窗下拉选择） */
export const PUBLISHABLE_MODELS: PublishableModel[] = [
  { id: 'sq-model-001', name: '道路缺陷检测', existingVersions: ['v2.3', 'v2.2', 'v2.1'] },
  { id: 'sq-model-002', name: '施工安全帽检测', existingVersions: ['v1.0'] },
  { id: 'sq-model-003', name: '人员跌倒检测', existingVersions: ['v1.0'] },
  { id: 'sq-model-004', name: '火焰烟雾检测', existingVersions: ['v2.1', 'v2.0', 'v1.5'] },
]

// ─── 测试集图片 ───

/** 测试集图片 mock 数据（用于模型验证面板） */
export const TEST_IMAGES: TestImage[] = [
  { id: 'test-001', name: 'test_0001.jpg', width: 640, height: 480 },
  { id: 'test-002', name: 'test_0002.jpg', width: 640, height: 480 },
  { id: 'test-003', name: 'test_0003.jpg', width: 640, height: 480 },
  { id: 'test-004', name: 'test_0004.jpg', width: 640, height: 480 },
  { id: 'test-005', name: 'test_0005.jpg', width: 640, height: 480 },
]
