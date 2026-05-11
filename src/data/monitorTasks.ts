// 监控中心 — 任务监控 mock 数据与类型

export interface MonitorTask {
  id: string
  type: 'train' | 'validate'
  name: string
  modelName: string
  datasetName: string
  status: 'pending' | 'running' | 'paused' | 'completed' | 'failed'
  progress: number
  epoch: string
  gpu: string
  createdAt: string
  eta: string
  mAP?: number
  errorMessage?: string
}

export const MOCK_TASKS: MonitorTask[] = [
  { id: 'task-001', type: 'train', name: '道路缺陷检测 v2.3', modelName: 'YOLOv8m', datasetName: '道路缺陷标注集', status: 'running', progress: 47, epoch: '47/100', gpu: 'A100×2', createdAt: '2026-05-09 09:14', eta: '预计 2小时15分', mAP: 0.782 },
  { id: 'task-004', type: 'train', name: '工厂设备异常检测', modelName: 'YOLOv8n', datasetName: '设备标注集', status: 'pending', progress: 0, epoch: '0/60', gpu: 'A100×1', createdAt: '2026-05-09 14:30', eta: '排队中' },
  { id: 'task-007', type: 'train', name: 'PCB 焊点缺陷检测 v1', modelName: 'YOLOv8s', datasetName: 'PCB 焊点标注集', status: 'pending', progress: 0, epoch: '0/80', gpu: '—', createdAt: '2026-05-09 15:10', eta: '排队中' },
  { id: 'task-003', type: 'train', name: '车牌识别增强版', modelName: 'YOLOv8l', datasetName: '车牌数据集', status: 'failed', progress: 23, epoch: '23/120', gpu: 'A100×4', createdAt: '2026-05-08 22:05', eta: '—', errorMessage: 'CUDA out of memory · Batch size 64 → 建议降至 32 后重试' },
  { id: 'task-008', type: 'train', name: '无人机航拍目标检测', modelName: 'YOLOv8m', datasetName: '航拍目标标注集', status: 'failed', progress: 12, epoch: '12/150', gpu: 'A100×2', createdAt: '2026-05-08 16:20', eta: '—', errorMessage: '数据集加载异常 · 12 张图片路径无效 · 已自动跳过' },
  { id: 'val-003', type: 'validate', name: '跌倒检测交叉验证', modelName: '人员跌倒检测 v1.0', datasetName: '跌倒行为测试集', status: 'running', progress: 67, epoch: '—', gpu: 'A100×1', createdAt: '2026-05-09 15:00', eta: '预计 18分钟' },
  { id: 'val-006', type: 'validate', name: '安全帽模型 v2 验证', modelName: '施工安全帽检测 v2.0', datasetName: '安全帽测试集 v2', status: 'pending', progress: 0, epoch: '—', gpu: '—', createdAt: '2026-05-09 15:30', eta: '排队中' },
  { id: 'val-004', type: 'validate', name: '火焰烟雾模型验证', modelName: '火焰烟雾检测 v2.1', datasetName: '火焰烟雾测试集', status: 'failed', progress: 45, epoch: '—', gpu: 'A100×1', createdAt: '2026-05-08 14:15', eta: '—', errorMessage: '模型权重文件不兼容 · 期望 v2.1 实际加载 v2.0 · 请检查模型版本' },
]
