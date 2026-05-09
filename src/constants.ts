// ─── 平台共享常量 ───
// 所有硬编码字典的统一来源，各文件应从此导入而非各自定义

// ─── 类别映射 ───

export const CATEGORY_MAP: Record<string, string> = {
  'object-detection': '目标检测',
  'llm': '大语言模型',
  'multimodal': '多模态',
  'other': '其他',
}

export const CATEGORY_OPTIONS = Object.entries(CATEGORY_MAP).map(([value, label]) => ({ value, label }))

// ─── 状态配置 ───

export interface StatusConfig {
  label: string
  cls: string
}

export const TRAIN_STATUS: Record<string, StatusConfig> = {
  running:   { label: '训练中', cls: 'badge-running' },
  completed: { label: '已完成', cls: 'badge-completed' },
  failed:    { label: '训练失败', cls: 'badge-failed' },
  pending:   { label: '等待中', cls: 'badge-pending' },
}

export const VALIDATE_STATUS: Record<string, StatusConfig> = {
  running:   { label: '验证中', cls: 'badge-running' },
  completed: { label: '已完成', cls: 'badge-completed' },
  failed:    { label: '验证失败', cls: 'badge-failed' },
  pending:   { label: '等待中', cls: 'badge-pending' },
}

// ─── 评分等级阈值 ───

export const GRADE_THRESHOLDS = [
  { min: 0.9, label: '优秀', color: 'var(--success)', icon: 'CheckCircle2' as const },
  { min: 0.8, label: '良好', color: 'var(--accent-bright)', icon: 'CheckCircle2' as const },
  { min: 0.7, label: '中等', color: 'var(--warning)', icon: 'AlertCircle' as const },
  { min: 0,   label: '较差', color: 'var(--error)', icon: 'XCircle' as const },
]

export function getGrade(score: number) {
  for (const g of GRADE_THRESHOLDS) {
    if (score >= g.min) return g
  }
  return GRADE_THRESHOLDS[GRADE_THRESHOLDS.length - 1]
}

// ─── 默认类别颜色（fallback） ───

export const DEFAULT_CLASS_COLORS = ['#409eff', '#f56c6c', '#e6a23c', '#8b5cf6', '#67c23a', '#06b6d4', '#6366f1']
