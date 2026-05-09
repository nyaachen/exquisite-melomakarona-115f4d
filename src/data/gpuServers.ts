// GPU 服务器 — 集群资源接口与 mock 数据（用于训练任务的 GPU 分配和服务器管理）

/** 分配在 GPU 卡上的训练/验证任务 */
export interface AssignedTask {
  taskId: string // 任务 ID
  taskName: string // 任务名称
  taskType: 'train' | 'validate' // 任务类型（训练 / 验证）
  startedAt: number // 任务启动时间戳（Date.now()）
  epoch: number // 当前训练轮数
  totalEpochs: number // 总训练轮数
  etaMinutes: number // 预计剩余时间（分钟）
}

/** 单张 GPU 卡 */
export interface GpuCard {
  id: string // GPU 卡唯一标识
  index: number // 卡位序号
  model: string // GPU 型号
  memory: string // 显存容量
  assignedTask: AssignedTask | null // 该卡当前分配的任务（每张卡可独立运行任务）
}

/** GPU 服务器节点 */
export interface GpuServer {
  id: string // 服务器唯一标识
  name: string // 服务器名称
  host: string // IP 地址
  port: number // SSH 端口
  username: string // SSH 用户名
  password: string // SSH 密码
  gpus: GpuCard[] // GPU 卡列表（含各自的任务分配）
  ram: string // 内存
  diskSize: string // 磁盘空间
  status: 'online' | 'offline' | 'maintenance' // 运行状态
  description: string // 描述
  createdAt: string // 创建时间
}

function generateEta(): number {
  return Math.round(15 + Math.random() * 120)
}

/** GPU 服务器集群列表 */
export const GPU_SERVERS: GpuServer[] = [
  {
    id: 'gpu-001', name: '训练节点-A', host: '10.0.1.101', port: 2201,
    username: 'kebao_admin', password: '****',
    gpus: [
      { id: 'gpu-001-0', index: 0, model: 'NVIDIA A100', memory: '80 GB',
        assignedTask: { taskId: 'task-001', taskName: '道路缺陷检测 v2.3', taskType: 'train', startedAt: Date.now() - 6 * 60 * 60 * 1000, epoch: 52, totalEpochs: 100, etaMinutes: generateEta() },
      },
      { id: 'gpu-001-1', index: 1, model: 'NVIDIA A100', memory: '80 GB',
        assignedTask: { taskId: 'task-001', taskName: '道路缺陷检测 v2.3', taskType: 'train', startedAt: Date.now() - 6 * 60 * 60 * 1000, epoch: 52, totalEpochs: 100, etaMinutes: generateEta() },
      },
      { id: 'gpu-001-2', index: 2, model: 'NVIDIA A100', memory: '80 GB', assignedTask: null },
      { id: 'gpu-001-3', index: 3, model: 'NVIDIA A100', memory: '80 GB', assignedTask: null },
    ],
    ram: '512 GB', diskSize: '8 TB',
    status: 'online', description: '主力训练节点，用于大型模型训练',
    createdAt: '2026-03-15',
  },
  {
    id: 'gpu-002', name: '训练节点-B', host: '10.0.1.102', port: 2201,
    username: 'kebao_admin', password: '****',
    gpus: [
      { id: 'gpu-002-0', index: 0, model: 'NVIDIA A100', memory: '80 GB', assignedTask: null },
      { id: 'gpu-002-1', index: 1, model: 'NVIDIA A100', memory: '80 GB', assignedTask: null },
    ],
    ram: '256 GB', diskSize: '4 TB',
    status: 'online', description: '辅助训练节点，处理中小型任务',
    createdAt: '2026-03-20',
  },
  {
    id: 'gpu-003', name: '推理节点-A', host: '10.0.2.101', port: 2201,
    username: 'kebao_infer', password: '****',
    gpus: [
      { id: 'gpu-003-0', index: 0, model: 'NVIDIA V100', memory: '32 GB',
        assignedTask: { taskId: 'task-005', taskName: '人员跌倒检测 v1.0', taskType: 'train', startedAt: Date.now() - 3 * 60 * 60 * 1000, epoch: 23, totalEpochs: 80, etaMinutes: generateEta() },
      },
      { id: 'gpu-003-1', index: 1, model: 'NVIDIA V100', memory: '32 GB', assignedTask: null },
    ],
    ram: '128 GB', diskSize: '2 TB',
    status: 'online', description: '模型验证与推理专用',
    createdAt: '2026-04-01',
  },
  {
    id: 'gpu-004', name: '备用节点', host: '10.0.1.201', port: 2201,
    username: 'kebao_admin', password: '****',
    gpus: [
      { id: 'gpu-004-0', index: 0, model: 'NVIDIA A6000', memory: '48 GB', assignedTask: null },
      { id: 'gpu-004-1', index: 1, model: 'NVIDIA A6000', memory: '48 GB', assignedTask: null },
      { id: 'gpu-004-2', index: 2, model: 'NVIDIA A6000', memory: '48 GB', assignedTask: null },
      { id: 'gpu-004-3', index: 3, model: 'NVIDIA A6000', memory: '48 GB', assignedTask: null },
    ],
    ram: '384 GB', diskSize: '6 TB',
    status: 'maintenance', description: '备用训练节点，当前维护中',
    createdAt: '2026-04-10',
  },
  {
    id: 'gpu-005', name: '开发测试节点', host: '10.0.3.101', port: 2201,
    username: 'dev_test', password: '****',
    gpus: [
      { id: 'gpu-005-0', index: 0, model: 'NVIDIA RTX 4090', memory: '24 GB', assignedTask: null },
    ],
    ram: '64 GB', diskSize: '1 TB',
    status: 'offline', description: '开发调试用，按需开启',
    createdAt: '2026-04-25',
  },
]

/** 查找有空闲 GPU 卡的在线服务器 */
export function getAvailableServer(): GpuServer | undefined {
  return GPU_SERVERS.find(s =>
    s.status === 'online' && s.gpus.some(g => !g.assignedTask),
  )
}

/** 查找所有空闲的 GPU 卡 */
export function getAvailableGpus(serverId?: string): GpuCard[] {
  const servers = serverId
    ? GPU_SERVERS.filter(s => s.id === serverId)
    : GPU_SERVERS.filter(s => s.status === 'online')
  return servers.flatMap(s => s.gpus.filter(g => !g.assignedTask))
}
