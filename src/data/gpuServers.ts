// GPU 服务器 — 集群资源接口与 mock 数据（用于训练任务的 GPU 分配）

/** 单张 GPU 卡 */
export interface GpuCard {
  id: string // GPU 卡唯一标识
  index: number // 卡位序号
  model: string // GPU 型号
  memory: string // 显存容量
}

/** 分配在该服务器上的训练/验证任务 */
export interface AssignedTask {
  taskId: string // 任务 ID
  taskName: string // 任务名称
  taskType: 'train' | 'validate' // 任务类型（训练 / 验证）
  startedAt: number // 任务启动时间戳（Date.now()）
  epoch: number // 当前训练轮数
  totalEpochs: number // 总训练轮数
  etaMinutes: number // 预计剩余时间（分钟）
}

/** GPU 服务器节点 */
export interface GpuServer {
  id: string // 服务器唯一标识
  name: string // 服务器名称
  spec: string // 硬件规格
  status: 'online' | 'offline' | 'maintenance' // 运行状态
  gpus: GpuCard[] // GPU 卡列表
  assignedTask: AssignedTask | null // 当前分配的任务
}

function generateEta(): number {
  return Math.round(15 + Math.random() * 120)
}

/** GPU 服务器集群列表 */
export const GPU_SERVERS: GpuServer[] = [
  {
    id: 'gpu-001', name: '训练节点-A', spec: '512GB RAM', status: 'online',
    gpus: [
      { id: 'gpu-001-0', index: 0, model: 'A100', memory: '80GB' },
      { id: 'gpu-001-1', index: 1, model: 'A100', memory: '80GB' },
      { id: 'gpu-001-2', index: 2, model: 'A100', memory: '80GB' },
      { id: 'gpu-001-3', index: 3, model: 'A100', memory: '80GB' },
    ],
    assignedTask: {
      taskId: 'task-001', taskName: '道路缺陷检测 v2.3', taskType: 'train',
      startedAt: Date.now() - 6 * 60 * 60 * 1000, // 6 hours ago
      epoch: 52, totalEpochs: 100, etaMinutes: generateEta(),
    },
  },
  {
    id: 'gpu-002', name: '训练节点-B', spec: '256GB RAM', status: 'online',
    gpus: [
      { id: 'gpu-002-0', index: 0, model: 'A100', memory: '80GB' },
      { id: 'gpu-002-1', index: 1, model: 'A100', memory: '80GB' },
    ],
    assignedTask: null,
  },
  {
    id: 'gpu-003', name: '推理节点-A', spec: '128GB RAM', status: 'online',
    gpus: [
      { id: 'gpu-003-0', index: 0, model: 'V100', memory: '32GB' },
      { id: 'gpu-003-1', index: 1, model: 'V100', memory: '32GB' },
    ],
    assignedTask: {
      taskId: 'task-005', taskName: '人员跌倒检测 v1.0', taskType: 'train',
      startedAt: Date.now() - 3 * 60 * 60 * 1000,
      epoch: 23, totalEpochs: 80, etaMinutes: generateEta(),
    },
  },
  {
    id: 'gpu-004', name: '备用节点', spec: '384GB RAM', status: 'maintenance',
    gpus: [
      { id: 'gpu-004-0', index: 0, model: 'A6000', memory: '48GB' },
      { id: 'gpu-004-1', index: 1, model: 'A6000', memory: '48GB' },
      { id: 'gpu-004-2', index: 2, model: 'A6000', memory: '48GB' },
      { id: 'gpu-004-3', index: 3, model: 'A6000', memory: '48GB' },
    ],
    assignedTask: null,
  },
  {
    id: 'gpu-005', name: '开发测试节点', spec: '64GB RAM', status: 'offline',
    gpus: [
      { id: 'gpu-005-0', index: 0, model: 'RTX 4090', memory: '24GB' },
    ],
    assignedTask: null,
  },
]

/** Find the best available server for auto-assignment */
export function getAvailableServer(): GpuServer | undefined {
  return GPU_SERVERS.find(s => s.status === 'online' && !s.assignedTask)
}
