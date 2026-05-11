// 仪表盘 — 训练概览统计数据

import { Cpu, CheckCircle2, Package, RefreshCw } from 'lucide-react'

export interface StatCard {
  label: string
  value: string
  delta: string
  icon: React.ReactNode
  color: string
}

export interface WeeklyStat {
  label: string
  value: string
  unit: string
}

export interface LatestPublished {
  name: string
  map: number
  target: string
  time: string
}

export const STATS: StatCard[] = [
  { label: '训练任务总数', value: '17', delta: '+3 本周', icon: <Cpu size={16} />, color: 'var(--accent)' },
  { label: '正在训练', value: '1', delta: 'GPU 利用率 89%', icon: <RefreshCw size={16} />, color: 'var(--warning)' },
  { label: '已完成任务', value: '12', delta: '成功率 92.3%', icon: <CheckCircle2 size={16} />, color: 'var(--success)' },
  { label: '已发布模型', value: '5', delta: '至科宝智能体中台', icon: <Package size={16} />, color: 'var(--teal)' },
]

export const WEEKLY_STATS: WeeklyStat[] = [
  { label: '训练时长', value: '38.4', unit: 'h' },
  { label: '数据量', value: '16.2', unit: 'k张' },
]

export const LATEST_PUBLISHED: LatestPublished[] = [
  { name: '安全帽检测 v1.2', map: 0.923, target: '智能体中台·工地安全', time: '昨天 16:22' },
  { name: '车辆检测 v3.1', map: 0.891, target: '智能体中台·交通分析', time: '4月27日' },
]
