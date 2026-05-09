// 模型广场 — 模型卡片接口与 mock 数据（用于模型广场列表页面）

/** 模型广场卡片 */
export interface SquareModel {
  id: string
  name: string
  description: string
  category: string
  baseModel: string
  classes: string[]
  createdAt: string
  author: string
  source: 'platform' | 'public'
  sourceLabel?: string
  coverImage: string
}

/** 根据类别和名称生成模型封面图 URL */
export function modelCover(category: string, name: string): string {
  const prompts: Record<string, string> = {
    '缺陷检测': 'road surface crack pothole defect detection photography',
    '安全检测': 'construction site safety detection photography',
    '行为检测': 'person fall detection surveillance photography',
    '目标跟踪': 'object tracking multi person street photography',
    '图像分割': 'image segmentation medical scan photography',
    '目标检测': 'object detection traffic scene photography',
    'LLM': 'language model AI neural network visualization',
  }
  const prompt = prompts[category] || `machine learning ${name} visualization`
  return `https://neeko-copilot.bytedance.net/api/text2image?prompt=${encodeURIComponent(prompt)}&image_size=landscape_4_3`
}

/** 模型广场卡片列表（含平台自训练 + 公开预训练模型） */
export const SQUARE_MODELS: SquareModel[] = [
  {
    id: 'sq-model-001',
    name: '道路缺陷检测',
    description: '支持裂缝、坑洼、破损、剥落、标线模糊、积水、障碍物等道路病害检测',
    category: '缺陷检测',
    baseModel: 'YOLOv8m',
    classes: ['裂缝', '坑洼', '破损', '剥落', '标线模糊', '积水', '障碍物'],
    createdAt: '2026-03-15',
    author: '张工',
    source: 'platform',
    coverImage: modelCover('缺陷检测', '道路缺陷检测'),
  },
  {
    id: 'sq-model-002',
    name: '施工安全帽检测',
    description: '精准检测施工人员安全帽佩戴情况，支持安全帽、无安全帽、人员三类目标',
    category: '安全检测',
    baseModel: 'YOLOv8s',
    classes: ['安全帽', '无安全帽', '人员'],
    createdAt: '2026-04-20',
    author: '李工',
    source: 'platform',
    coverImage: modelCover('安全检测', '安全帽检测'),
  },
  {
    id: 'sq-model-003',
    name: '人员跌倒检测',
    description: '实时检测人员跌倒行为，适用于监控场景下的安全预警',
    category: '行为检测',
    baseModel: 'YOLOv8s',
    classes: ['正常站立', '跌倒'],
    createdAt: '2026-04-18',
    author: '王工',
    source: 'platform',
    coverImage: modelCover('行为检测', '跌倒检测'),
  },
  {
    id: 'sq-model-004',
    name: '火焰烟雾检测',
    description: '快速识别火焰和烟雾，及时预警火灾风险',
    category: '安全检测',
    baseModel: 'YOLOv8m',
    classes: ['火焰', '浓烟', '轻烟'],
    createdAt: '2026-04-05',
    author: '赵工',
    source: 'platform',
    coverImage: modelCover('安全检测', '火焰烟雾'),
  },
  {
    id: 'pub-yolov8n-coco',
    name: 'YOLOv8n (COCO)',
    description: 'YOLOv8 Nano 在 COCO 数据集上预训练，参数量最小，适合边缘设备',
    category: '目标检测',
    baseModel: 'YOLOv8n',
    classes: ['person', 'car', 'dog', 'cat', 'bicycle', '...等80类'],
    createdAt: '2026-04-10',
    author: 'Ultralytics',
    source: 'public',
    sourceLabel: 'Ultralytics',
    coverImage: modelCover('目标检测', 'COCO预训练'),
  },
  {
    id: 'pub-yolov8m-coco',
    name: 'YOLOv8m (COCO)',
    description: 'YOLOv8 Medium 在 COCO 数据集上预训练，速度与精度平衡，推荐作为默认起点',
    category: '目标检测',
    baseModel: 'YOLOv8m',
    classes: ['person', 'car', 'dog', 'cat', 'bicycle', '...等80类'],
    createdAt: '2026-04-10',
    author: 'Ultralytics',
    source: 'public',
    sourceLabel: 'Ultralytics',
    coverImage: modelCover('目标检测', 'COCO预训练'),
  },
  {
    id: 'pub-yolov8n-pothole',
    name: 'YOLOv8n (道路缺陷)',
    description: '在道路缺陷数据集上预训练的 YOLOv8 Nano，适合道路病害检测微调',
    category: '缺陷检测',
    baseModel: 'YOLOv8n',
    classes: ['pothole', 'crack', 'patch', 'rutting', 'shoving'],
    createdAt: '2026-04-22',
    author: 'Roboflow',
    source: 'public',
    sourceLabel: 'Roboflow',
    coverImage: modelCover('缺陷检测', '道路缺陷预训练'),
  },
  {
    id: 'pub-yolov8n-helmet',
    name: 'YOLOv8n (安全检测)',
    description: '在安全帽检测数据集上预训练的 YOLOv8 Nano，适用于工地安全场景',
    category: '安全检测',
    baseModel: 'YOLOv8n',
    classes: ['helmet', 'no-helmet', 'person'],
    createdAt: '2026-04-25',
    author: 'Roboflow',
    source: 'public',
    sourceLabel: 'Roboflow',
    coverImage: modelCover('安全检测', '安全帽预训练'),
  },
  {
    id: 'pub-qwen-7b-base',
    name: 'Qwen-7B-Chat (原版)',
    description: '通义千问 70亿参数预训练模型，阿里云官方权重',
    category: 'LLM',
    baseModel: 'Qwen-7B-Chat',
    classes: [],
    createdAt: '2026-04-15',
    author: 'Alibaba',
    source: 'public',
    sourceLabel: 'Alibaba',
    coverImage: modelCover('LLM', 'Qwen大模型'),
  },
]
