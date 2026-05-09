import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import { ArrowLeft, Save, Info, Cpu } from 'lucide-react'
import { NotFound } from '../../components/NotFound'
import type { GpuServer } from './index'

export const Route = createFileRoute('/gpu-servers/$serverId')({
  component: EditGpuServer,
})

const GPU_SERVERS: GpuServer[] = [
  { id: 'gpu-001', name: '训练节点-A', host: '10.0.1.101', port: 2201, username: 'kebao_admin', password: '****', gpus: [{ id: 'gpu-001-0', index: 0, model: 'NVIDIA A100', memory: '80 GB' }, { id: 'gpu-001-1', index: 1, model: 'NVIDIA A100', memory: '80 GB' }, { id: 'gpu-001-2', index: 2, model: 'NVIDIA A100', memory: '80 GB' }, { id: 'gpu-001-3', index: 3, model: 'NVIDIA A100', memory: '80 GB' }], ram: '512 GB', diskSize: '8 TB', status: 'online', description: '主力训练节点', createdAt: '2026-03-15' },
  { id: 'gpu-002', name: '训练节点-B', host: '10.0.1.102', port: 2201, username: 'kebao_admin', password: '****', gpus: [{ id: 'gpu-002-0', index: 0, model: 'NVIDIA A100', memory: '80 GB' }, { id: 'gpu-002-1', index: 1, model: 'NVIDIA A100', memory: '80 GB' }], ram: '256 GB', diskSize: '4 TB', status: 'online', description: '辅助训练节点', createdAt: '2026-03-20' },
  { id: 'gpu-003', name: '推理节点-A', host: '10.0.2.101', port: 2201, username: 'kebao_infer', password: '****', gpus: [{ id: 'gpu-003-0', index: 0, model: 'NVIDIA V100', memory: '32 GB' }, { id: 'gpu-003-1', index: 1, model: 'NVIDIA V100', memory: '32 GB' }], ram: '128 GB', diskSize: '2 TB', status: 'online', description: '模型验证与推理', createdAt: '2026-04-01' },
  { id: 'gpu-004', name: '备用节点', host: '10.0.1.201', port: 2201, username: 'kebao_admin', password: '****', gpus: [{ id: 'gpu-004-0', index: 0, model: 'NVIDIA A6000', memory: '48 GB' }, { id: 'gpu-004-1', index: 1, model: 'NVIDIA A6000', memory: '48 GB' }, { id: 'gpu-004-2', index: 2, model: 'NVIDIA A6000', memory: '48 GB' }, { id: 'gpu-004-3', index: 3, model: 'NVIDIA A6000', memory: '48 GB' }], ram: '384 GB', diskSize: '6 TB', status: 'maintenance', description: '备用训练节点', createdAt: '2026-04-10' },
  { id: 'gpu-005', name: '开发测试节点', host: '10.0.3.101', port: 2201, username: 'dev_test', password: '****', gpus: [{ id: 'gpu-005-0', index: 0, model: 'NVIDIA RTX 4090', memory: '24 GB' }], ram: '64 GB', diskSize: '1 TB', status: 'offline', description: '开发调试用', createdAt: '2026-04-25' },
]

function EditGpuServer() {
  const { serverId } = Route.useParams()
  const navigate = useNavigate()

  const data = GPU_SERVERS.find(s => s.id === serverId)
  if (!data) return <NotFound />

  const [name, setName] = useState(data.name)
  const [host, setHost] = useState(data.host)
  const [port, setPort] = useState(data.port)
  const [username, setUsername] = useState(data.username)
  const [password, setPassword] = useState(data.password)
  const [status, setStatus] = useState(data.status)
  const [description, setDescription] = useState(data.description)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)

  function validate(): boolean {
    const e: Record<string, string> = {}
    if (!name.trim()) e.name = '请输入服务器名称'
    if (!host.trim()) e.host = '请输入 IP 地址'
    if (!username.trim()) e.username = '请输入用户名'
    if (!password.trim()) e.password = '请输入密码'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  async function handleSubmit() {
    if (!validate()) return
    setSubmitting(true)
    await new Promise(r => setTimeout(r, 1000))
    navigate({ to: '/gpu-servers' })
  }

  return (
    <div style={{ animation: 'slideIn 0.3s ease-out' }}>
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Link to="/gpu-servers" className="btn btn-ghost btn-sm">
            <ArrowLeft size={14} /> 返回
          </Link>
          <div>
            <div className="breadcrumb">科宝训练平台 › GPU 服务器</div>
            <h1 className="page-title">编辑 GPU 服务器</h1>
          </div>
        </div>
      </div>

      <div className="content-padded" style={{ maxWidth: 720, margin: '0 auto' }}>
        <div className="card" style={{ padding: 24 }}>
          {/* 基本信息 */}
          <div className="form-section">
            <div className="form-section-header">基本信息</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div className="form-group">
                <label className="form-label">服务器名称 *</label>
                <input className="form-input" type="text" value={name} onChange={e => setName(e.target.value)} />
                {errors.name && <div className="error-text">{errors.name}</div>}
              </div>
              <div className="form-group">
                <label className="form-label">IP 地址 *</label>
                <input className="form-input" type="text" value={host} onChange={e => setHost(e.target.value)} />
                {errors.host && <div className="error-text">{errors.host}</div>}
              </div>
            </div>
          </div>

          <div className="form-section">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div className="form-group">
                <label className="form-label">端口</label>
                <input className="form-input" type="number" value={port} onChange={e => setPort(parseInt(e.target.value) || 0)} />
              </div>
              <div className="form-group">
                <label className="form-label">状态</label>
                <select className="form-input" value={status} onChange={e => setStatus(e.target.value as GpuServer['status'])}>
                  <option value="online">在线</option>
                  <option value="offline">离线</option>
                  <option value="maintenance">维护中</option>
                </select>
              </div>
            </div>
          </div>

          <div className="form-section">
            <div className="form-group">
              <label className="form-label">描述</label>
              <input className="form-input" type="text" value={description} onChange={e => setDescription(e.target.value)} />
            </div>
          </div>

          {/* 认证信息 */}
          <div className="form-section">
            <div className="form-section-header">认证信息</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div className="form-group">
                <label className="form-label">用户名 *</label>
                <input className="form-input" type="text" value={username} onChange={e => setUsername(e.target.value)} />
                {errors.username && <div className="error-text">{errors.username}</div>}
              </div>
              <div className="form-group">
                <label className="form-label">密码 *</label>
                <input className="form-input" type="password" value={password} onChange={e => setPassword(e.target.value)} />
                {errors.password && <div className="error-text">{errors.password}</div>}
              </div>
            </div>
          </div>

          {/* 硬件信息（自动获取，只读展示） */}
          <div className="form-section">
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <div className="form-section-header" style={{ marginBottom: 0 }}>硬件信息</div>
              <span style={{ fontSize: 10, color: 'var(--text-muted)', background: 'var(--bg-elevated)', padding: '2px 8px', borderRadius: 4 }}>服务器上线后自动获取</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
              <div className="metric-chip">
                <div className="metric-chip-label">内存</div>
                <div className="metric-chip-value" style={{ fontSize: 16 }}>{data.ram}</div>
              </div>
              <div className="metric-chip">
                <div className="metric-chip-label">磁盘空间</div>
                <div className="metric-chip-value" style={{ fontSize: 16 }}>{data.diskSize}</div>
              </div>
            </div>

            <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 8 }}>显卡列表</div>
            {data.gpus.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {data.gpus.map(g => (
                  <div key={g.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', background: 'var(--bg-elevated)', border: '1px solid var(--border-dim)' }}>
                    <Cpu size={14} style={{ color: 'var(--accent-bright)' }} />
                    <span style={{ fontFamily: 'JetBrains Mono', fontSize: 12, color: 'var(--text-secondary)', minWidth: 28 }}>#{g.index}</span>
                    <span style={{ fontSize: 12, color: 'var(--text-primary)' }}>{g.model}</span>
                    <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{g.memory}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ fontSize: 12, color: 'var(--text-muted)', padding: '12px 0' }}>
                暂无显卡数据 — 服务器上线后将自动检测并填充
              </div>
            )}
          </div>

          <div style={{ padding: '12px 16px', background: 'var(--accent-glow)', border: '1px solid rgba(64, 158, 255,0.15)', marginTop: 16, display: 'flex', gap: 8, fontSize: 12, color: 'var(--text-secondary)' }}>
            <Info size={13} style={{ color: 'var(--accent-bright)', flexShrink: 0, marginTop: 1 }} />
            <span>显卡信息由服务器自动上报，此处仅展示，不可手动编辑。</span>
          </div>

          <div style={{ display: 'flex', gap: 10, marginTop: 28 }}>
            <button className="btn btn-secondary" style={{ flex: 1 }} onClick={() => navigate({ to: '/gpu-servers' })}>取消</button>
            <button className="btn btn-primary" style={{ flex: 1 }} onClick={handleSubmit} disabled={submitting}>
              {submitting ? <><span className="spinner" /> 保存中…</> : <><Save size={14} /> 保存修改</>}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
