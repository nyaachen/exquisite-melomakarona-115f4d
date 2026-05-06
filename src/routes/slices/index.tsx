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
  XCircle,
  AlertCircle,
} from 'lucide-react'

export const Route = createFileRoute('/slices/')({
  component: SlicesList,
})

const SLICES = [
  {
    id: 'slice-001',
    name: '道路缺陷检测 v2.3 切分',
    note: '按标准 7:2:1 比例划分，已用于多个训练任务',
    datasetId: 'ds-001',
    datasetName: '道路缺陷检测数据集 v2.3',
    trainCount: 3410,
    valCount: 974,
    testCount: 488,
    used: true,
    creator: '张工',
    createdAt: '2026-04-28 14:20',
  },
  {
    id: 'slice-002',
    name: '施工安全帽检测初版',
    note: '快速测试用切分，训练集偏多',
    datasetId: 'ds-002',
    datasetName: '施工安全帽检测集',
    trainCount: 1913,
    valCount: 239,
    testCount: 239,
    used: true,
    creator: '李工',
    createdAt: '2026-04-27 09:15',
  },
  {
    id: 'slice-003',
    name: '设备异常检测标准切分',
    note: '采用推荐比例，验证集占比 20%',
    datasetId: 'ds-003',
    datasetName: '工厂设备异常检测集',
    trainCount: 1139,
    valCount: 326,
    testCount: 163,
    used: false,
    creator: '王工',
    createdAt: '2026-04-29 08:30',
  },
  {
    id: 'slice-004',
    name: '车牌识别 v1.0 切分',
    note: '',
    datasetId: 'ds-004',
    datasetName: '车牌识别数据集',
    trainCount: 6272,
    valCount: 784,
    testCount: 784,
    used: false,
    creator: '赵工',
    createdAt: '2026-04-26 16:45',
  },
  {
    id: 'slice-005',
    name: '道路缺陷 v1.0 测试',
    note: '小规模测试，仅用 500 张图片',
    datasetId: 'ds-001',
    datasetName: '道路缺陷检测数据集 v2.3',
    trainCount: 400,
    valCount: 50,
    testCount: 50,
    used: false,
    creator: '张工',
    createdAt: '2026-04-25 11:00',
  },
]

function SlicesList() {
  const [slices, setSlices] = useState(SLICES)
  const [deleting, setDeleting] = useState<string | null>(null)

  async function handleDelete(sliceId: string) {
    const slice = slices.find(s => s.id === sliceId)
    if (!slice) return

    if (slice.used) {
      alert('该切分已被训练任务使用，无法删除')
      return
    }

    if (!confirm(`确定要删除切分"${slice.name}"吗？`)) return

    setDeleting(sliceId)
    await new Promise(r => setTimeout(r, 600))
    setSlices(prev => prev.filter(s => s.id !== sliceId))
    setDeleting(null)
  }

  function handleCopy(sliceId: string) {
    const slice = slices.find(s => s.id === sliceId)
    if (!slice) return

    const newSlice = {
      ...slice,
      id: `slice-${Date.now()}`,
      name: `${slice.name} (副本)`,
      used: false,
      createdAt: new Date().toLocaleString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }).replace(/\//g, '-'),
    }
    setSlices(prev => [newSlice, ...prev])
  }

  return (
    <div style={{ animation: 'slideIn 0.3s ease-out' }}>
      <div className="page-header">
        <div>
          <div className="breadcrumb">科宝训练平台 › 切分管理</div>
          <h1 className="page-title">切分管理</h1>
        </div>
        <Link to="/slices/create" className="btn btn-primary">
          <Plus size={15} /> 创建切分
        </Link>
      </div>

      <div style={{ padding: '24px 32px' }}>
        <div className="card">
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>切分名称</th>
                  <th>对应数据集</th>
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
                {slices.map((slice) => {
                  const total = slice.trainCount + slice.valCount + slice.testCount
                  return (
                    <tr key={slice.id}>
                      <td>
                        <div>
                          <div className="primary" style={{ fontWeight: 500, marginBottom: 2 }}>{slice.name}</div>
                          {slice.note && (
                            <div style={{ fontSize: 11, color: 'var(--text-muted)', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {slice.note}
                            </div>
                          )}
                        </div>
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <Layers size={12} style={{ color: 'var(--accent-bright)', flexShrink: 0 }} />
                          <span style={{ fontSize: 12 }}>{slice.datasetName}</span>
                        </div>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <span className="mono" style={{ fontSize: 12, color: 'var(--accent-bright)' }}>
                          {slice.trainCount.toLocaleString()}
                        </span>
                        <span style={{ fontSize: 10, color: 'var(--text-muted)', marginLeft: 4 }}>
                          ({total > 0 ? ((slice.trainCount / total) * 100).toFixed(0) : 0}%)
                        </span>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <span className="mono" style={{ fontSize: 12, color: 'var(--teal)' }}>
                          {slice.valCount.toLocaleString()}
                        </span>
                        <span style={{ fontSize: 10, color: 'var(--text-muted)', marginLeft: 4 }}>
                          ({total > 0 ? ((slice.valCount / total) * 100).toFixed(0) : 0}%)
                        </span>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <span className="mono" style={{ fontSize: 12, color: 'var(--warning)' }}>
                          {slice.testCount.toLocaleString()}
                        </span>
                        <span style={{ fontSize: 10, color: 'var(--text-muted)', marginLeft: 4 }}>
                          ({total > 0 ? ((slice.testCount / total) * 100).toFixed(0) : 0}%)
                        </span>
                      </td>
                      <td>
                        {slice.used ? (
                          <span className="badge badge-completed">
                            <CheckCircle2 size={10} /> 已使用
                          </span>
                        ) : (
                          <span className="badge badge-pending">
                            <AlertCircle size={10} /> 未使用
                          </span>
                        )}
                      </td>
                      <td style={{ fontSize: 12 }}>{slice.creator}</td>
                      <td style={{ fontSize: 12 }}>{slice.createdAt}</td>
                      <td>
                        <div style={{ display: 'flex', gap: 6, justifyContent: 'center' }}>
                          <Link
                            to="/tasks/create"
                            className="btn btn-success btn-sm"
                            style={{ padding: '5px 10px' }}
                          >
                            <Zap size={11} /> 创建任务
                          </Link>
                          <button
                            className="btn btn-ghost btn-sm"
                            style={{ padding: '5px 8px' }}
                            title="修改"
                          >
                            <Edit3 size={12} />
                          </button>
                          <button
                            className="btn btn-ghost btn-sm"
                            style={{ padding: '5px 8px' }}
                            onClick={() => handleCopy(slice.id)}
                            title="复制"
                          >
                            <Copy size={12} />
                          </button>
                          <button
                            className="btn btn-danger btn-sm"
                            style={{ padding: '5px 8px' }}
                            onClick={() => handleDelete(slice.id)}
                            disabled={deleting === slice.id || slice.used}
                            title={slice.used ? '已被使用，无法删除' : '删除'}
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

          {slices.length === 0 && (
            <div style={{ padding: '60px 20px', textAlign: 'center' }}>
              <Layers size={40} style={{ color: 'var(--text-muted)', marginBottom: 16, opacity: 0.5 }} />
              <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 8 }}>
                暂无切分
              </div>
              <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 20 }}>
                点击下方按钮创建您的第一个切分
              </div>
              <Link to="/slices/create" className="btn btn-primary">
                <Plus size={14} /> 创建切分
              </Link>
            </div>
          )}
        </div>

        <div style={{ marginTop: 16, fontSize: 12, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 6 }}>
          <span>共 {slices.length} 个切分</span>
          <span style={{ color: 'var(--border-default)' }}>·</span>
          <span>已使用 {slices.filter(s => s.used).length} 个</span>
          <span style={{ color: 'var(--border-default)' }}>·</span>
          <span>未使用 {slices.filter(s => !s.used).length} 个</span>
        </div>
      </div>
    </div>
  )
}