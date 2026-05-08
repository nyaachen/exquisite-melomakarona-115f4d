import { createFileRoute, Link } from '@tanstack/react-router'
import { useState } from 'react'
import { Plus, Edit3, Trash2, Server, Search, Cpu, RefreshCw } from 'lucide-react'

export const Route = createFileRoute('/gpu-servers/')({
  component: GpuServerList,
})

// ─── GPU 显卡 ───

export interface GpuCard {
  id: string
  index: number
  model: string
  memory: string
}

// ─── GPU 服务器 ───

export interface GpuServer {
  id: string
  name: string
  host: string
  port: number
  username: string
  password: string
  gpus: GpuCard[]
  ram: string
  diskSize: string
  status: 'online' | 'offline' | 'maintenance'
  description: string
  createdAt: string
}

const GPU_SERVERS: GpuServer[] = [
  {
    id: 'gpu-001', name: '训练节点-A', host: '10.0.1.101', port: 2201,
    username: 'kebao_admin', password: '****',
    gpus: [
      { id: 'gpu-001-0', index: 0, model: 'NVIDIA A100', memory: '80 GB' },
      { id: 'gpu-001-1', index: 1, model: 'NVIDIA A100', memory: '80 GB' },
      { id: 'gpu-001-2', index: 2, model: 'NVIDIA A100', memory: '80 GB' },
      { id: 'gpu-001-3', index: 3, model: 'NVIDIA A100', memory: '80 GB' },
    ],
    ram: '512 GB', diskSize: '8 TB',
    status: 'online', description: '主力训练节点，用于大型模型训练',
    createdAt: '2026-03-15',
  },
  {
    id: 'gpu-002', name: '训练节点-B', host: '10.0.1.102', port: 2201,
    username: 'kebao_admin', password: '****',
    gpus: [
      { id: 'gpu-002-0', index: 0, model: 'NVIDIA A100', memory: '80 GB' },
      { id: 'gpu-002-1', index: 1, model: 'NVIDIA A100', memory: '80 GB' },
    ],
    ram: '256 GB', diskSize: '4 TB',
    status: 'online', description: '辅助训练节点，处理中小型任务',
    createdAt: '2026-03-20',
  },
  {
    id: 'gpu-003', name: '推理节点-A', host: '10.0.2.101', port: 2201,
    username: 'kebao_infer', password: '****',
    gpus: [
      { id: 'gpu-003-0', index: 0, model: 'NVIDIA V100', memory: '32 GB' },
      { id: 'gpu-003-1', index: 1, model: 'NVIDIA V100', memory: '32 GB' },
    ],
    ram: '128 GB', diskSize: '2 TB',
    status: 'online', description: '模型验证与推理专用',
    createdAt: '2026-04-01',
  },
  {
    id: 'gpu-004', name: '备用节点', host: '10.0.1.201', port: 2201,
    username: 'kebao_admin', password: '****',
    gpus: [
      { id: 'gpu-004-0', index: 0, model: 'NVIDIA A6000', memory: '48 GB' },
      { id: 'gpu-004-1', index: 1, model: 'NVIDIA A6000', memory: '48 GB' },
      { id: 'gpu-004-2', index: 2, model: 'NVIDIA A6000', memory: '48 GB' },
      { id: 'gpu-004-3', index: 3, model: 'NVIDIA A6000', memory: '48 GB' },
    ],
    ram: '384 GB', diskSize: '6 TB',
    status: 'maintenance', description: '备用训练节点，当前维护中',
    createdAt: '2026-04-10',
  },
  {
    id: 'gpu-005', name: '开发测试节点', host: '10.0.3.101', port: 2201,
    username: 'dev_test', password: '****',
    gpus: [
      { id: 'gpu-005-0', index: 0, model: 'NVIDIA RTX 4090', memory: '24 GB' },
    ],
    ram: '64 GB', diskSize: '1 TB',
    status: 'offline', description: '开发调试用，按需开启',
    createdAt: '2026-04-25',
  },
]

const STATUS_META = {
  online:      { label: '在线',   cls: 'badge-completed', color: 'var(--success)' },
  offline:     { label: '离线',   cls: 'badge-failed',    color: 'var(--error)' },
  maintenance: { label: '维护中', cls: 'badge-pending',   color: 'var(--warning)' },
} as const

function GpuServerList() {
  const [servers, setServers] = useState(GPU_SERVERS)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')

  const filtered = servers.filter(s =>
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.host.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.description.toLowerCase().includes(searchQuery.toLowerCase())
  )

  async function handleDelete(id: string) {
    setDeleting(id)
    await new Promise(r => setTimeout(r, 500))
    setServers(prev => prev.filter(s => s.id !== id))
    setDeleting(null)
  }

  async function handleRefresh(id: string) {
    const srv = servers.find(s => s.id === id)
    if (!srv || srv.status !== 'online') return
    // Simulate re-fetching GPU card list from server hardware
    // In production this would call the server's hardware detection API
  }

  return (
    <div style={{ animation: 'slideIn 0.3s ease-out' }}>
      <div className="page-header">
        <div>
          <div className="breadcrumb">科宝训练平台 › GPU 服务器</div>
          <h1 className="page-title">GPU 服务器</h1>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>
            管理训练和推理所用的 GPU 服务器资源 · 显卡信息由服务器上线后自动获取
          </div>
        </div>
        <Link to="/gpu-servers/create" className="btn btn-primary">
          <Plus size={15} /> 添加服务器
        </Link>
      </div>

      <div className="content-padded">
        <div className="card">
          <div className="card-header">
            <div className="search-input">
              <Search size={14} style={{ color: 'var(--text-muted)' }} />
              <input
                type="text"
                placeholder="搜索服务器名称、IP、用户名..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input-field"
              />
            </div>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>服务器名称</th>
                  <th>地址</th>
                  <th>显卡列表</th>
                  <th>内存</th>
                  <th>状态</th>
                  <th>创建时间</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(srv => {
                  const st = STATUS_META[srv.status]
                  return (
                    <tr key={srv.id}>
                      <td>
                        <div className="primary" style={{ fontWeight: 500 }}>{srv.name}</div>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2, maxWidth: 200 }}>
                          {srv.description}
                        </div>
                      </td>
                      <td className="mono" style={{ fontSize: 12 }}>
                        <div>{srv.host}:{srv.port}</div>
                        <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>{srv.username}</div>
                      </td>
                      <td>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                          {srv.gpus.map(g => (
                            <span key={g.id} style={{
                              fontSize: 10, padding: '2px 6px',
                              background: 'var(--bg-elevated)',
                              border: '1px solid var(--border-dim)',
                              fontFamily: 'JetBrains Mono',
                              color: 'var(--text-secondary)',
                            }}>
                              <Cpu size={9} style={{ marginRight: 3, display: 'inline' }} />
                              {g.model.split(' ').pop()} {g.memory}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td style={{ fontSize: 12 }}>{srv.ram}</td>
                      <td>
                        <span className={`badge ${st.cls}`} style={{ color: st.color }}>
                          <div style={{ width: 6, height: 6, borderRadius: '50%', background: st.color, marginRight: 4, display: 'inline-block' }} />
                          {st.label}
                        </span>
                      </td>
                      <td style={{ fontSize: 12 }}>{srv.createdAt}</td>
                      <td>
                        <div style={{ display: 'flex', gap: 4 }}>
                          <Link to="/gpu-servers/$serverId" params={{ serverId: srv.id }} className="btn btn-ghost btn-sm">
                            <Edit3 size={12} />
                          </Link>
                          <button className="btn btn-ghost btn-sm" onClick={() => handleRefresh(srv.id)} title="重新获取服务器信息" disabled={srv.status !== 'online'}>
                            <RefreshCw size={12} />
                          </button>
                          <button className="btn btn-ghost btn-sm" onClick={() => handleDelete(srv.id)}
                            disabled={deleting === srv.id}>
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {filtered.length === 0 && (
            <div className="empty-state">
              <div className="empty-state-icon"><Server size={32} /></div>
              <div className="empty-state-text">暂无 GPU 服务器</div>
              <div className="empty-state-hint">点击右上角"添加服务器"录入 GPU 资源</div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
