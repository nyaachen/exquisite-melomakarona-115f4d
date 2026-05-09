export interface GpuCard {
  id: string
  index: number
  model: string
  memory: string
}

export interface AssignedTask {
  taskId: string
  taskName: string
  taskType: 'train' | 'validate'
  startedAt: number // Date.now()
  epoch: number
  totalEpochs: number
  etaMinutes: number
}

export interface GpuServer {
  id: string
  name: string
  spec: string
  status: 'online' | 'offline' | 'maintenance'
  gpus: GpuCard[]
  assignedTask: AssignedTask | null
}

function generateEta(): number {
  return Math.round(15 + Math.random() * 120)
}

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
