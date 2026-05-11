// 验证任务 — 接口与 mock 数据

import { DATASETS } from './datasets'

// ─── 接口定义 ───

export interface ValidateClassMetric {
  className: string
  precision: number
  recall: number
  f1: number
  support: number
}

export interface ValidateResult {
  mAP: number
  precision: number
  recall: number
  f1: number
  confusionMatrix: number[][]
  classMetrics: ValidateClassMetric[]
}

export interface ValidateTask {
  id: string
  name: string
  modelId: string
  modelName: string
  baseModel: string
  datasetId: string
  datasetName: string
  images: number
  status: 'running' | 'completed' | 'failed' | 'pending'
  progress: number
  result?: ValidateResult
  createdAt: string
  completedAt?: string
  duration?: string
}

/** 创建验证任务 — 模型选项 */
export interface ValidateModelOption {
  id: string
  name: string
  baseModel: string
  mAP: number
  classes: string[]
}

/** 创建验证任务 — 数据集选项 */
export interface ValidateDatasetOption {
  id: string
  name: string
  images: number
  classes: string[]
}

// ─── Mock 数据 ───

export const VALIDATE_TASKS: Record<string, ValidateTask> = {
  'val-001': {
    id: 'val-001',
    name: '道路缺陷检测 v2.3 验证',
    modelId: 'model-001',
    modelName: '道路缺陷检测 v2.3',
    baseModel: 'YOLOv8m',
    datasetId: '84',
    datasetName: 'paosawu_images_240826_已标注',
    images: 975,
    status: 'completed',
    progress: 100,
    createdAt: '2026-04-29 14:30',
    completedAt: '2026-04-29 14:45',
    duration: '15分钟',
    result: {
      mAP: 0.765,
      precision: 0.812,
      recall: 0.731,
      f1: 0.770,
      confusionMatrix: [
        [185, 12, 8, 5, 3, 2, 1],
        [8, 165, 15, 6, 4, 3, 2],
        [5, 10, 195, 8, 5, 3, 2],
        [3, 6, 12, 178, 10, 4, 2],
        [2, 4, 6, 8, 155, 12, 3],
        [1, 3, 4, 5, 8, 145, 4],
        [0, 2, 3, 4, 6, 5, 135],
      ],
      classMetrics: [
        { className: '裂缝', precision: 0.892, recall: 0.886, f1: 0.889, support: 216 },
        { className: '坑洼', precision: 0.851, recall: 0.825, f1: 0.838, support: 200 },
        { className: '破损', precision: 0.847, recall: 0.887, f1: 0.867, support: 230 },
        { className: '剥落', precision: 0.796, recall: 0.848, f1: 0.821, support: 215 },
        { className: '标线模糊', precision: 0.784, recall: 0.816, f1: 0.800, support: 190 },
        { className: '积水', precision: 0.869, recall: 0.878, f1: 0.873, support: 170 },
        { className: '障碍物', precision: 0.938, recall: 0.894, f1: 0.915, support: 155 },
      ],
    },
  },
  'val-002': {
    id: 'val-002',
    name: '安全帽检测模型验证',
    modelId: 'model-002',
    modelName: '施工安全帽检测 v1.0',
    baseModel: 'YOLOv8s',
    datasetId: '102',
    datasetName: '施工安全帽检测集_v1',
    images: 478,
    status: 'completed',
    progress: 100,
    createdAt: '2026-04-28 16:00',
    completedAt: '2026-04-28 16:12',
    duration: '12分钟',
    result: {
      mAP: 0.918,
      precision: 0.935,
      recall: 0.902,
      f1: 0.918,
      confusionMatrix: [
        [215, 8, 5],
        [6, 185, 8],
        [4, 6, 157],
      ],
      classMetrics: [
        { className: '安全帽', precision: 0.957, recall: 0.943, f1: 0.950, support: 228 },
        { className: '无安全帽', precision: 0.925, recall: 0.925, f1: 0.925, support: 199 },
        { className: '人员', precision: 0.929, recall: 0.940, f1: 0.934, support: 167 },
      ],
    },
  },
  'val-003': {
    id: 'val-003',
    name: '跌倒检测交叉验证',
    modelId: 'model-003',
    modelName: '人员跌倒检测 v1.0',
    baseModel: 'YOLOv8s',
    datasetId: '84',
    datasetName: 'paosawu_images_240826_已标注',
    images: 642,
    status: 'running',
    progress: 67,
    createdAt: '2026-04-29 15:00',
  },
  'val-004': {
    id: 'val-004',
    name: '火焰烟雾模型验证',
    modelId: 'model-004',
    modelName: '火焰烟雾检测 v2.1',
    baseModel: 'YOLOv8m',
    datasetId: '102',
    datasetName: '施工安全帽检测集_v1',
    images: 1120,
    status: 'failed',
    progress: 45,
    createdAt: '2026-04-27 10:30',
  },
  'val-005': {
    id: 'val-005',
    name: '道路缺陷检测 v2.2 验证',
    modelId: 'model-old-001',
    modelName: '道路缺陷检测 v2.2',
    baseModel: 'YOLOv8m',
    datasetId: '84',
    datasetName: 'paosawu_images_240826_已标注',
    images: 975,
    status: 'completed',
    progress: 100,
    createdAt: '2026-04-10 09:15',
    completedAt: '2026-04-10 09:28',
    duration: '13分钟',
    result: {
      mAP: 0.742,
      precision: 0.795,
      recall: 0.708,
      f1: 0.750,
      confusionMatrix: [],
      classMetrics: [],
    },
  },
}

export const VALIDATE_MODELS: ValidateModelOption[] = [
  { id: 'model-001', name: '道路缺陷检测 v2.3', baseModel: 'YOLOv8m', mAP: 0.782, classes: ['裂缝', '坑洼', '破损', '剥落', '标线模糊', '积水', '障碍物'] },
  { id: 'model-002', name: '施工安全帽检测 v1.0', baseModel: 'YOLOv8s', mAP: 0.923, classes: ['安全帽', '无安全帽', '人员'] },
  { id: 'model-003', name: '人员跌倒检测 v1.0', baseModel: 'YOLOv8s', mAP: 0.887, classes: ['正常站立', '跌倒'] },
  { id: 'model-004', name: '火焰烟雾检测 v2.1', baseModel: 'YOLOv8m', mAP: 0.911, classes: ['火焰', '浓烟', '轻烟'] },
]

export const VALIDATE_DATASETS: ValidateDatasetOption[] = DATASETS.map(ds => {
  const classes: string[] = []
  ds.contentTagList.forEach(g =>
    g.labelDetails.forEach(d => {
      if (!classes.includes(d.labelName)) classes.push(d.labelName)
    })
  )
  return {
    id: ds.id,
    name: ds.datasetName,
    images: ds.dataCount,
    classes,
  }
})
