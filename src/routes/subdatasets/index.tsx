import { createFileRoute, Link } from '@tanstack/react-router'
import { useState } from 'react'
import {
  Plus,
  Layers,
  Zap,
  Edit3,
  Copy,
  Trash2,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react'

export const Route = createFileRoute('/subdatasets/')({
  component: SubdatasetList,
})

const SUBDATASETS = [
  {
    id: 'sub-001',
    name: '道路缺陷检测 v2.3 子集',
    note: '按标准 7:2:1 比例划分，已用于多个训练任务',
    parentDatasetId: 'ds-001',
    parentDatasetName: '道路缺陷检测数据集 v2.3',
    trainCount: 3410,
    valCount: 974,
    testCount: 488,
    used: true,
    creator: '张工',
    createdAt: '2026-04-28 14:20',
  },
  {
    id: 'sub-002',
    name: '施工安全帽检测初版',
    note: '快速测试用划分，训练集偏多',
    parentDatasetId: 'ds-002',
    parentDatasetName: '施工安全帽检测集',
    trainCount: 1913,
    valCount: 239,
    testCount: 239,
    used: true,
    creator: '李工',
    createdAt: '2026-04-27 09:15',
  },
  {
    id: 'sub-003',
    name: '设备异常检测标准划分',
    note: '采用推荐比例，验证集占比 20%',
    parentDatasetId: 'ds-003',
    parentDatasetName: '工厂设备异常检测集',
    trainCount: 1139,
    valCount: 326,
    testCount: 163,
    used: false,
    creator: '王工',
    createdAt: '2026-04-29 08:30',
  },
  {
    id: 'sub-004',
    name: '车牌识别 v1.0 子集',
    note: '',
    parentDatasetId: 'ds-004',
    parentDatasetName: '车牌识别数据集',
    trainCount: 6272,
    valCount: 784,
    testCount: 784,
    used: false,
    creator: '赵工',
    createdAt: '2026-04-26 16:45',
  },
  {
    id: 'sub-005',
    name: '道路缺陷 v1.0 测试',
    note: '小规模测试，仅用 500 张图片',
    parentDatasetId: 'ds-001',
    parentDatasetName: '道路缺陷检测数据集 v2.3',
    trainCount: 400,
    valCount: 50,
    testCount: 50,
    used: false,
    creator: '张工',
    createdAt: '2026-04-25 11:00',
  },
]

function SubdatasetList() {
  const [subdatasets, setSubdatasets] = useState(SUBDATASETS)
  const [deleting, setDeleting] = useState<string | null>(null)

  async function handleDelete(id: string) {
    const sub = subdatasets.find(s => s.id === id)
    if (!sub) return

    if (sub.used) {
      alert('该子数据集已被训练任务使用，无法删除')
      return
    }

    if (!confirm(`确定要删除子数据集"${sub.name}"吗？`)) return

    setDeleting(id)
    await new Promise(r => setTimeout(r, 600))
    setSubdatasets(prev => prev.filter(s => s.id !== id))
    setDeleting(null)
  }

  function handleCopy(id: string) {
    const sub = subdatasets.find(s => s.id === id)
    if (!sub) return

    const newSub = {
      ...sub,
      id: `sub-${Date.now()}`,
      name: `${sub.name} (副本)`,
      used: false,
      createdAt: new Date().toLocaleString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }).replace(/\//g, '-'),
    }
    setSubdatasets(prev => [newSub, ...prev])
  }

  return (
    <div style={{ animation: 'slideIn 0.3s ease-out' }}>
      <div className="page-header">
        <div>
          <div className="breadcrumb">科宝训练平台 › 子数据集</div>
          <h1 className="page-title">子数据集</h1>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>
            将父数据集按比例划分为训练/验证/测试三个子数据集
          </div>
        </div>
        <Link to="/subdatasets/create" className="btn btn-primary">
          <Plus size={15} /> 创建子数据集
        </Link>
      </div>

      <div style={{ padding: '24px 32px' }}>
        <div className="card">
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>子数据集名称</th>
                  <th>父数据集</th>
                  <th style={{ textAlign: 'right' }}>训练集</th>
                  <th style={{ textAlign: 'right' }}>验证集</th>
                  <th style={{ textAlign: 'right' }}>测试集</th>
                  <th>状态</th>
                  <th>创建人</th>
                  <th>创建时间</th>
                  <th style={{ textAlign: 'center' }}>操作</th>
                </tr>
              </thead>
              <tbody>
                {subdatasets.map((sub) => {
                  const total = sub.trainCount + sub.valCount + sub.testCount
                  return (
                    <tr key={sub.id}>
                      <td>
                        <div>
                          <div className="primary" style={{ fontWeight: 500, marginBottom: 2 }}>{sub.name}</div>
                          {sub.note && (
                            <div style={{ fontSize: 11, color: 'var(--text-muted)', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {sub.note}
                            </div>
                          )}
                        </div>
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <Layers size={12} style={{ color: 'var(--accent-bright)', flexShrink: 0 }} />
                          <span style={{ fontSize: 12 }}>{sub.parentDatasetName}</span>
                        </div>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <span className="mono" style={{ fontSize: 12, color: 'var(--accent-bright)' }}>
                          {sub.trainCount.toLocaleString()}
                        </span>
                        <span style={{ fontSize: 10, color: 'var(--text-muted)', marginLeft: 4 }}>
                          ({total > 0 ? ((sub.trainCount / total) * 100).toFixed(0) : 0}%)
                        </span>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <span className="mono" style={{ fontSize: 12, color: 'var(--teal)' }}>
                          {sub.valCount.toLocaleString()}
                        </span>
                        <span style={{ fontSize: 10, color: 'var(--text-muted)', marginLeft: 4 }}>
                          ({total > 0 ? ((sub.valCount / total) * 100).toFixed(0) : 0}%)
                        </span>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <span className="mono" style={{ fontSize: 12, color: 'var(--warning)' }}>
                          {sub.testCount.toLocaleString()}
                        </span>
                        <span style={{ fontSize: 10, color: 'var(--text-muted)', marginLeft: 4 }}>
                          ({total > 0 ? ((sub.testCount / total) * 100).toFixed(0) : 0}%)
                        </span>
                      </td>
                      <td>
                        {sub.used ? (
                          <span className="badge badge-completed">
                            <CheckCircle2 size={10} /> 已使用
                          </span>
                        ) : (
                          <span className="badge badge-pending">
                            <AlertCircle size={10} /> 未使用
                          </span>
                        )}
                      </td>
                      <td style={{ fontSize: 12 }}>{sub.creator}</td>
                      <td style={{ fontSize: 12 }}>{sub.createdAt}</td>
                      <td>
                        <div style={{ display: 'flex', gap: 6, justifyContent: 'center' }}>
                          <Link
                            to="/train/create"
                            className="btn btn-success btn-sm"
                            style={{ padding: '5px 10px' }}
                          >
                            <Zap size={11} /> 创建任务
                          </Link>
                          <button className="btn btn-ghost btn-sm" style={{ padding: '5px 8px' }} title="修改">
                            <Edit3 size={12} />
                          </button>
                          <button className="btn btn-ghost btn-sm" style={{ padding: '5px 8px' }} onClick={() => handleCopy(sub.id)} title="复制">
                            <Copy size={12} />
                          </button>
                          <button
                            className="btn btn-danger btn-sm" style={{ padding: '5px 8px' }}
                            onClick={() => handleDelete(sub.id)}
                            disabled={deleting === sub.id || sub.used}
                            title={sub.used ? '已被使用，无法删除' : '删除'}
                          >
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

          {subdatasets.length === 0 && (
            <div style={{ padding: '60px 20px', textAlign: 'center' }}>
              <Layers size={40} style={{ color: 'var(--text-muted)', marginBottom: 16, opacity: 0.5 }} />
              <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 8 }}>
                暂无子数据集
              </div>
              <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 20 }}>
                点击右上角按钮创建第一个子数据集
              </div>
              <Link to="/subdatasets/create" className="btn btn-primary">
                <Plus size={14} /> 创建子数据集
              </Link>
            </div>
          )}
        </div>

        <div style={{ marginTop: 16, fontSize: 12, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 6 }}>
          <span>共 {subdatasets.length} 个子数据集</span>
          <span style={{ color: 'var(--border-default)' }}>·</span>
          <span>已使用 {subdatasets.filter(s => s.used).length} 个</span>
          <span style={{ color: 'var(--border-default)' }}>·</span>
          <span>未使用 {subdatasets.filter(s => !s.used).length} 个</span>
        </div>
      </div>
    </div>
  )
}
