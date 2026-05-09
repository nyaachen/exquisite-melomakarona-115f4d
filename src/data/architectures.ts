// 模型架构 — 训练模板接口与 mock 数据（用于架构模板管理）

/** 架构参数定义 */
export interface ArchitectureParam {
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

/** 模型架构模板 */
export interface Architecture {
  id: string
  name: string
  category: string
  baseModel: string
  description: string
  params: ArchitectureParam[]
  isActive: boolean
  createdAt: string
  author: string
  usageCount: number
}

/** 模型架构模板列表 */
export const ARCHITECTURES: Architecture[] = [
  {
    id: 'arch-yolov8', name: 'YOLOv8 目标检测', category: 'object-detection', baseModel: 'YOLOv8m',
    description: 'YOLOv8 系列目标检测模型架构，支持 nano~xlarge 多尺寸变体',
    isActive: true, createdAt: '2026-04-15 10:30', author: '系统管理员', usageCount: 47,
    params: [
      { name: '模型尺寸', key: 'variant', type: 'select', defaultValue: 'm', options: [{ label: 'YOLOv8n (Nano)', value: 'n' }, { label: 'YOLOv8s (Small)', value: 's' }, { label: 'YOLOv8m (Medium)', value: 'm' }, { label: 'YOLOv8l (Large)', value: 'l' }, { label: 'YOLOv8x (XLarge)', value: 'x' }], required: true, description: '模型尺寸变体' },
      { name: '训练轮数', key: 'epochs', type: 'number', defaultValue: 100, min: 1, max: 1000, required: true, description: '模型训练的总轮数' },
      { name: '批次大小', key: 'batchSize', type: 'number', defaultValue: 16, min: 1, max: 128, required: true, description: '每批次训练的样本数量' },
      { name: '输入尺寸', key: 'imgSize', type: 'select', defaultValue: 640, options: [{ label: '416×416', value: 416 }, { label: '512×512', value: 512 }, { label: '640×640', value: 640 }, { label: '800×800', value: 800 }, { label: '1024×1024', value: 1024 }], required: true, description: '模型输入图片尺寸' },
      { name: '初始学习率', key: 'lr0', type: 'range', defaultValue: 0.01, min: 0.0001, max: 0.1, step: 0.0001, required: true, description: '初始学习率' },
      { name: '最终学习率', key: 'lrf', type: 'number', defaultValue: 0.001, min: 0.00001, max: 0.01, required: false, description: '余弦退火终止学习率' },
      { name: '优化器', key: 'optimizer', type: 'select', defaultValue: 'SGD', options: [{ label: 'SGD（推荐）', value: 'SGD' }, { label: 'Adam', value: 'Adam' }, { label: 'AdamW', value: 'AdamW' }, { label: 'RMSProp', value: 'RMSProp' }], required: true, description: '优化器类型' },
      { name: '权重衰减', key: 'weightDecay', type: 'number', defaultValue: 0.0005, min: 0, max: 0.01, required: false, description: '权重衰减系数' },
      { name: '动量', key: 'momentum', type: 'number', defaultValue: 0.937, min: 0, max: 1, required: false, description: 'SGD动量参数' },
      { name: '早停轮数', key: 'patience', type: 'number', defaultValue: 10, min: 0, max: 50, required: false, description: '验证损失不下降时的等待轮数' },
      { name: '数据增强策略', key: 'augment', type: 'select', defaultValue: 'default', options: [{ label: '默认', value: 'default' }, { label: '强增强', value: 'strong' }, { label: '保守', value: 'conservative' }], required: false, description: '数据增强策略' },
      { name: '启用 Mosaic 增强', key: 'useMosaic', type: 'boolean', defaultValue: true, required: false, description: '是否启用 Mosaic 4图拼接增强' },
      { name: '保存检查点间隔', key: 'saveEvery', type: 'number', defaultValue: 10, min: 1, max: 50, required: false, description: '每隔多少轮保存一次模型' },
    ],
  },
  {
    id: 'arch-yolov8-fast', name: 'YOLOv8 快速验证', category: 'object-detection', baseModel: 'YOLOv8s',
    description: '快速模型验证配置，减少训练轮数，适合初步可行性测试',
    isActive: true, createdAt: '2026-04-18 14:20', author: '张工', usageCount: 23,
    params: [
      { name: '模型尺寸', key: 'variant', type: 'select', defaultValue: 's', options: [{ label: 'YOLOv8n (Nano)', value: 'n' }, { label: 'YOLOv8s (Small)', value: 's' }, { label: 'YOLOv8m (Medium)', value: 'm' }], required: true, description: '模型尺寸变体' },
      { name: '训练轮数', key: 'epochs', type: 'number', defaultValue: 30, min: 1, max: 500, required: true, description: '模型训练的总轮数' },
      { name: '批次大小', key: 'batchSize', type: 'number', defaultValue: 32, min: 1, max: 128, required: true, description: '每批次训练的样本数量' },
      { name: '输入尺寸', key: 'imgSize', type: 'select', defaultValue: 416, options: [{ label: '416×416', value: 416 }, { label: '512×512', value: 512 }, { label: '640×640', value: 640 }], required: true, description: '模型输入图片尺寸' },
      { name: '初始学习率', key: 'lr0', type: 'range', defaultValue: 0.02, min: 0.0001, max: 0.1, step: 0.0001, required: true, description: '初始学习率' },
      { name: '优化器', key: 'optimizer', type: 'select', defaultValue: 'SGD', options: [{ label: 'SGD', value: 'SGD' }, { label: 'Adam', value: 'Adam' }], required: false, description: '优化器类型' },
    ],
  },
  {
    id: 'arch-qwen', name: 'Qwen 大语言模型微调', category: 'llm', baseModel: 'Qwen-7B-Chat',
    description: 'Qwen 系列大语言模型的 LoRA/全参数微调架构，支持对话和指令调优',
    isActive: true, createdAt: '2026-04-20 09:15', author: '李工', usageCount: 18,
    params: [
      { name: '模型版本', key: 'baseModel', type: 'select', defaultValue: 'Qwen-7B-Chat', options: [{ label: 'Qwen-7B-Chat', value: 'Qwen-7B-Chat' }, { label: 'Qwen-14B-Chat', value: 'Qwen-14B-Chat' }, { label: 'Qwen-72B-Chat', value: 'Qwen-72B-Chat' }, { label: 'Qwen-VL-Chat', value: 'Qwen-VL-Chat' }], required: true, description: '预训练模型版本' },
      { name: '微调方式', key: 'finetuneMode', type: 'select', defaultValue: 'lora', options: [{ label: 'LoRA（参数高效）', value: 'lora' }, { label: '全参数微调', value: 'full' }], required: true, description: '微调方式' },
      { name: '训练轮数', key: 'epochs', type: 'number', defaultValue: 3, min: 1, max: 20, required: true, description: '模型训练的总轮数' },
      { name: '批次大小', key: 'batchSize', type: 'number', defaultValue: 8, min: 1, max: 64, required: true, description: '每批次训练的样本数量' },
      { name: '学习率', key: 'lr0', type: 'range', defaultValue: 0.0001, min: 0.00001, max: 0.001, step: 0.00001, required: true, description: 'LoRA学习率' },
      { name: 'LoRA秩', key: 'loraRank', type: 'number', defaultValue: 64, min: 8, max: 256, required: true, description: '低秩矩阵的秩' },
      { name: 'LoRA Alpha', key: 'loraAlpha', type: 'number', defaultValue: 128, min: 8, max: 512, required: true, description: 'LoRA缩放因子' },
      { name: '目标层', key: 'targetLayers', type: 'select', defaultValue: 'q_proj,v_proj', options: [{ label: '仅 Q/V', value: 'q_proj,v_proj' }, { label: 'Q/K/V', value: 'q_proj,k_proj,v_proj' }, { label: '全注意力层', value: 'q_proj,k_proj,v_proj,o_proj' }], required: true, description: 'LoRA注入的目标层' },
      { name: '梯度累积步数', key: 'gradAccum', type: 'number', defaultValue: 4, min: 1, max: 32, required: false, description: '梯度累积步数' },
      { name: '最大序列长度', key: 'maxSeqLen', type: 'number', defaultValue: 2048, min: 512, max: 8192, required: true, description: '输入序列最大长度' },
      { name: '启用 DeepSpeed', key: 'useDeepSpeed', type: 'boolean', defaultValue: true, required: false, description: '是否启用DeepSpeed优化' },
      { name: '混合精度', key: 'mixedPrecision', type: 'select', defaultValue: 'bf16', options: [{ label: 'FP32', value: 'fp32' }, { label: 'FP16', value: 'fp16' }, { label: 'BF16', value: 'bf16' }], required: false, description: '混合精度训练类型' },
    ],
  },
  {
    id: 'arch-llama', name: 'LLaMA 大语言模型微调', category: 'llm', baseModel: 'LLaMA-2-7B-Chat',
    description: 'LLaMA-2 系列大语言模型的 LoRA 微调架构',
    isActive: true, createdAt: '2026-04-25 11:00', author: '赵工', usageCount: 8,
    params: [
      { name: '模型版本', key: 'baseModel', type: 'select', defaultValue: 'LLaMA-2-7B-Chat', options: [{ label: 'LLaMA-2-7B-Chat', value: 'LLaMA-2-7B-Chat' }, { label: 'LLaMA-2-13B-Chat', value: 'LLaMA-2-13B-Chat' }, { label: 'LLaMA-2-70B-Chat', value: 'LLaMA-2-70B-Chat' }], required: true, description: '预训练模型版本' },
      { name: '训练轮数', key: 'epochs', type: 'number', defaultValue: 3, min: 1, max: 20, required: true, description: '模型训练的总轮数' },
      { name: '批次大小', key: 'batchSize', type: 'number', defaultValue: 8, min: 1, max: 64, required: true, description: '每批次训练的样本数量' },
      { name: '学习率', key: 'lr0', type: 'range', defaultValue: 0.0001, min: 0.00001, max: 0.001, step: 0.00001, required: true, description: 'LoRA学习率' },
      { name: 'LoRA秩', key: 'loraRank', type: 'number', defaultValue: 64, min: 8, max: 256, required: true, description: '低秩矩阵的秩' },
      { name: 'LoRA Alpha', key: 'loraAlpha', type: 'number', defaultValue: 128, min: 8, max: 512, required: true, description: 'LoRA缩放因子' },
      { name: '最大序列长度', key: 'maxSeqLen', type: 'number', defaultValue: 2048, min: 512, max: 4096, required: true, description: '输入序列最大长度' },
      { name: '启用 FSDP', key: 'useFSDP', type: 'boolean', defaultValue: true, required: false, description: '是否启用FSDP分布式训练' },
    ],
  },
]

/** 按 ID 查找架构 */
export function getArchById(id: string): Architecture | undefined {
  return ARCHITECTURES.find(a => a.id === id)
}
