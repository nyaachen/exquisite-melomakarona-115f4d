import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import { ArrowLeft, Save, Info } from 'lucide-react'

export const Route = createFileRoute('/gpu-servers/create')({
  component: CreateGpuServer,
})

function CreateGpuServer() {
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [host, setHost] = useState('')
  const [port, setPort] = useState(2201)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [description, setDescription] = useState('')
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
            <h1 className="page-title">添加 GPU 服务器</h1>
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
                <input className="form-input" type="text" value={name} onChange={e => setName(e.target.value)} placeholder="例：训练节点-A" />
                {errors.name && <div className="error-text">{errors.name}</div>}
              </div>
              <div className="form-group">
                <label className="form-label">IP 地址 *</label>
                <input className="form-input" type="text" value={host} onChange={e => setHost(e.target.value)} placeholder="例：10.0.1.101" />
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
                <label className="form-label">描述</label>
                <input className="form-input" type="text" value={description} onChange={e => setDescription(e.target.value)} placeholder="服务器用途说明" />
              </div>
            </div>
          </div>

          {/* 认证信息 */}
          <div className="form-section">
            <div className="form-section-header">认证信息</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div className="form-group">
                <label className="form-label">用户名 *</label>
                <input className="form-input" type="text" value={username} onChange={e => setUsername(e.target.value)} placeholder="SSH 登录用户名" />
                {errors.username && <div className="error-text">{errors.username}</div>}
              </div>
              <div className="form-group">
                <label className="form-label">密码 *</label>
                <input className="form-input" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="SSH 登录密码" />
                {errors.password && <div className="error-text">{errors.password}</div>}
              </div>
            </div>
          </div>

          <div style={{ padding: '12px 16px', background: 'var(--accent-glow)', border: '1px solid rgba(64, 158, 255,0.15)', marginTop: 16, display: 'flex', gap: 8, fontSize: 12, color: 'var(--text-secondary)' }}>
            <Info size={13} style={{ color: 'var(--accent-bright)', flexShrink: 0, marginTop: 1 }} />
            <span>添加后服务器默认离线。上线后将自动获取硬件信息（显卡列表、内存、磁盘等），无需手动填写。</span>
          </div>

          <div style={{ display: 'flex', gap: 10, marginTop: 28 }}>
            <button className="btn btn-secondary" style={{ flex: 1 }} onClick={() => navigate({ to: '/gpu-servers' })}>取消</button>
            <button className="btn btn-primary" style={{ flex: 1 }} onClick={handleSubmit} disabled={submitting}>
              {submitting ? <><span className="spinner" /> 保存中…</> : <><Save size={14} /> 添加服务器</>}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
