/* 训练预设
 * 训练预设是针对不同训练需求预先配置的一套参数集合，帮助用户快速选择合适的训练配置，避免每次都需要手动调整多个参数。
 * 每个预设包含了模型架构、基础模型、训练参数等信息，并且可以区分公开和私有预设，以满足不同用户的使用场景。
 */

export interface Preset { // 训练预设
  id: string // 预设唯一标识
  name: string // 预设名称
  architectureId: string // 模型架构ID，对照架构实体
  architectureName: string // 模型架构名称
  baseModel: string // 基础模型
  category: string // 类别
  description: string // 描述
  paramValues: Record<string, number | string | boolean> // 参数值，参数名称与值类型对照架构实体
  isActive: boolean // 是否激活
  visibility: 'public' | 'private' // 可见性
  createdAt: string // 创建时间
  author: string // 作者
  usageCount: number // 使用次数
}

export const PRESETS: Preset[] = [
  {
    id: 'preset-quick', name: '快速验证', architectureId: 'arch-yolov8', architectureName: 'YOLOv8 目标检测',
    baseModel: 'YOLOv8m', category: 'object-detection',
    description: '快速测试模型可行性，降低训练轮数和批次大小，适合初步实验',
    paramValues: { variant: 's', epochs: 30, batchSize: 32, imgSize: 416, lr0: 0.02, optimizer: 'SGD', useMosaic: false, saveEvery: 10 },
    isActive: true, visibility: 'public', createdAt: '2026-04-20 10:15', author: '张工', usageCount: 34,
  },
  {
    id: 'preset-standard', name: '标准训练', architectureId: 'arch-yolov8', architectureName: 'YOLOv8 目标检测',
    baseModel: 'YOLOv8m', category: 'object-detection',
    description: '平衡训练速度与模型精度，适用于正式训练任务',
    paramValues: { variant: 'm', epochs: 100, batchSize: 16, imgSize: 640, lr0: 0.01, optimizer: 'SGD', useMosaic: true, saveEvery: 10 },
    isActive: true, visibility: 'public', createdAt: '2026-04-18 09:30', author: '系统管理员', usageCount: 56,
  },
  {
    id: 'preset-highacc', name: '高精度训练', architectureId: 'arch-yolov8', architectureName: 'YOLOv8 目标检测',
    baseModel: 'YOLOv8l', category: 'object-detection',
    description: '追求最佳检测精度，使用更大输入尺寸和更多训练轮数',
    paramValues: { variant: 'l', epochs: 150, batchSize: 8, imgSize: 1024, lr0: 0.005, optimizer: 'AdamW', useMosaic: true, saveEvery: 5 },
    isActive: true, visibility: 'public', createdAt: '2026-04-22 14:00', author: '李工', usageCount: 19,
  },
  {
    id: 'preset-edge', name: '边缘设备部署', architectureId: 'arch-yolov8', architectureName: 'YOLOv8 目标检测',
    baseModel: 'YOLOv8n', category: 'object-detection',
    description: '针对移动端/边缘设备优化，使用 nano 模型 + 小尺寸输入',
    paramValues: { variant: 'n', epochs: 80, batchSize: 64, imgSize: 416, lr0: 0.01, optimizer: 'SGD', useMosaic: false, saveEvery: 10 },
    isActive: true, visibility: 'private', createdAt: '2026-04-25 16:45', author: '王工', usageCount: 12,
  },
  {
    id: 'preset-qwen-lora', name: 'Qwen LoRA 标准微调', architectureId: 'arch-qwen', architectureName: 'Qwen 大语言模型微调',
    baseModel: 'Qwen-7B-Chat', category: 'llm',
    description: 'Qwen-7B 的 LoRA 参数高效微调标准配置，适合指令调优任务',
    paramValues: { baseModel: 'Qwen-7B-Chat', finetuneMode: 'lora', epochs: 3, batchSize: 8, lr0: 0.0001, loraRank: 64, loraAlpha: 128, targetLayers: 'q_proj,v_proj', gradAccum: 4, maxSeqLen: 2048, useDeepSpeed: true, mixedPrecision: 'bf16' },
    isActive: true, visibility: 'private', createdAt: '2026-04-28 10:00', author: '李工', usageCount: 9,
  },
]

export function getPresetById(id: string): Preset | undefined {
  return PRESETS.find(p => p.id === id)
}
