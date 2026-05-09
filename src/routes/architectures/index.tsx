import { createFileRoute, Link } from '@tanstack/react-router'
import { useState } from 'react'
import { Plus, Edit3, Trash2, Copy, CheckCircle2, XCircle, Search } from 'lucide-react'
import { CATEGORY_MAP } from '../../constants'
import { ARCHITECTURES, Architecture } from '../../data/architectures'

export const Route = createFileRoute('/architectures/')({
  component: ArchitectureList,
})

function ArchitectureList() {
  const [architectures, setArchitectures] = useState(ARCHITECTURES)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [filterCategory, setFilterCategory] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')

  const filtered = architectures.filter(a =>
    (filterCategory === 'all' || a.category === filterCategory) &&
    (a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
     a.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
     a.baseModel.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  async function handleDelete(id: string) {
    const arch = architectures.find(a => a.id === id)
    if (arch?.usageCount && arch.usageCount > 0) {
      alert('该模型模板已被训练预设引用，无法删除')
      return
    }
    setDeleting(id)
    await new Promise(r => setTimeout(r, 500))
    setArchitectures(prev => prev.filter(a => a.id !== id))
    setDeleting(null)
  }

  function handleCopy(id: string) {
    const arch = architectures.find(a => a.id === id)
    if (!arch) return
    const newArch: Architecture = {
      ...arch,
      id: `arch-${Date.now()}`,
      name: `${arch.name} (副本)`,
      createdAt: new Date().toLocaleString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }).replace(/\//g, '-'),
      usageCount: 0,
    }
    setArchitectures(prev => [newArch, ...prev])
  }

  return (
    <div style={{ animation: 'slideIn 0.3s ease-out' }}>
      <div className="page-header">
        <div>
          <div className="breadcrumb">科宝训练平台 › 模型模板</div>
          <h1 className="page-title">模型模板</h1>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>
            配置平台支持的模型架构及其参数定义
          </div>
        </div>
        <Link to="/architectures/create" className="btn btn-primary">
          <Plus size={15} /> 创建模板
        </Link>
      </div>

      <div className="content-padded">
        <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
          <button className={`btn btn-sm ${filterCategory === 'all' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setFilterCategory('all')}>
            全部
          </button>
          {Object.entries(CATEGORY_MAP).map(([key, label]) => (
            <button key={key} className={`btn btn-sm ${filterCategory === key ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setFilterCategory(key)}>
              {label}
            </button>
          ))}
        </div>

        <div className="card">
          <div className="card-header">
            <div className="search-input">
              <Search size={14} style={{ color: 'var(--text-muted)' }} />
              <input
                type="text"
                placeholder="搜索模板名称、基础模型或描述..."
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
                  <th>模板名称</th>
                  <th>基础模型</th>
                  <th>类别</th>
                  <th>状态</th>
                  <th style={{ textAlign: 'right' }}>参数数量</th>
                  <th style={{ textAlign: 'right' }}>预设引用</th>
                  <th>创建人</th>
                  <th>创建时间</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(arch => (
                  <tr key={arch.id}>
                    <td>
                      <div className="primary" style={{ fontWeight: 500 }}>{arch.name}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2, maxWidth: 260 }}>
                        {arch.description}
                      </div>
                    </td>
                    <td className="mono" style={{ fontSize: 12 }}>{arch.baseModel}</td>
                    <td>
                      <span className="badge badge-secondary">{CATEGORY_MAP[arch.category] || arch.category}</span>
                    </td>
                    <td>
                      {arch.isActive ? (
                        <span className="badge badge-success"><CheckCircle2 size={10} /> 启用</span>
                      ) : (
                        <span className="badge badge-archived"><XCircle size={10} /> 禁用</span>
                      )}
                    </td>
                    <td className="mono" style={{ textAlign: 'right' }}>{arch.params.length}</td>
                    <td className="mono" style={{ textAlign: 'right' }}>{arch.usageCount}</td>
                    <td style={{ fontSize: 12 }}>{arch.author}</td>
                    <td style={{ fontSize: 12 }}>{arch.createdAt}</td>
                    <td>
                      <div style={{ display: 'flex', gap: 4 }}>
                        <Link to="/architectures/$architectureId" params={{ architectureId: arch.id }} className="btn btn-ghost btn-sm">
                          <Edit3 size={12} />
                        </Link>
                        <button className="btn btn-ghost btn-sm" onClick={() => handleCopy(arch.id)}>
                          <Copy size={12} />
                        </button>
                        <button className="btn btn-ghost btn-sm" onClick={() => handleDelete(arch.id)}
                          disabled={deleting === arch.id || arch.usageCount > 0}>
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filtered.length === 0 && (
            <div className="empty-state">
              <div className="empty-state-icon"><Plus size={32} /></div>
              <div className="empty-state-text">暂无模型模板</div>
              <div className="empty-state-hint">点击右上角"创建模板"添加新的模型架构配置</div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
