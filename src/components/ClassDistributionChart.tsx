import { useState, useEffect, useCallback } from 'react'
import { BarChart3 } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { simulateFetchClassDistribution } from '../data/datasets'

export interface ClassDistribution {
  name: string
  训练集: number
  验证集: number
  测试集: number
}

type Props =
  | {
      /** 直接传入数据（DatasetSplitManager / DatasetStep 等本地计算场景） */
      data: ClassDistribution[]
      datasetId?: never
      split?: never
      flatContentTags?: never
      minHeight?: number
      rowHeight?: number
      showLegend?: boolean
    }
  | {
      /** 通过 Promise 模拟 API 获取（数据集详情页场景） */
      data?: never
      datasetId: string
      split: { train: number; val: number; test: number }
      flatContentTags: string[]
      minHeight?: number
      rowHeight?: number
      showLegend?: boolean
    }

export function ClassDistributionChart(props: Props) {
  const {
    minHeight = 180,
    rowHeight = 36,
    showLegend = false,
  } = props

  // ── Promise API 模式 ──
  const isAsyncMode = 'datasetId' in props && props.datasetId !== undefined
  const [asyncData, setAsyncData] = useState<ClassDistribution[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchDistribution = useCallback(async () => {
    if (!isAsyncMode) return
    setLoading(true)
    setError(null)
    try {
      const res = await simulateFetchClassDistribution(props.datasetId, props.split, props.flatContentTags)
      if (res.code === 200) {
        setAsyncData(res.data)
      } else {
        setError(res.msg ?? '获取数据失败')
      }
    } catch {
      setError('网络请求失败')
    } finally {
      setLoading(false)
    }
  }, [isAsyncMode, props.datasetId, props.split, props.flatContentTags])

  useEffect(() => {
    if (isAsyncMode) fetchDistribution()
  }, [fetchDistribution, isAsyncMode])

  // ── 直接传入 data 模式 ──
  const directData = isAsyncMode ? asyncData : (props as { data: ClassDistribution[] }).data
  const height = directData.length > 0 ? Math.max(minHeight, directData.length * rowHeight) : minHeight

  return (
    <div className="card" style={{ padding: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12 }}>
        <BarChart3 size={14} style={{ color: 'var(--accent-bright)' }} />
        <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)' }}>各类别数据分布</span>
      </div>

      {loading && (
        <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)', fontSize: 13 }}>
          加载中...
        </div>
      )}

      {!loading && error && (
        <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--danger)', fontSize: 13 }}>
          {error}
        </div>
      )}

      {!loading && !error && (
        <ResponsiveContainer width="100%" height={height}>
          <BarChart data={directData} layout="vertical" margin={{ top: 0, right: 0, left: 60, bottom: 0 }}
            barGap={0} barCategoryGap="20%">
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border-dim)" horizontal={false} />
            <XAxis type="number" tick={{ fontSize: 10, fill: 'var(--text-muted)' }} axisLine={{ stroke: 'var(--border-dim)' }} tickLine={false} />
            <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: 'var(--text-secondary)', fontFamily: 'JetBrains Mono' }} width={60} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border-default)', borderRadius: 4, fontSize: 12 }} cursor={{ fill: 'var(--bg-hover)' }} />
            {showLegend && <Legend wrapperStyle={{ fontSize: 11, color: 'var(--text-secondary)' }} />}
            <Bar dataKey="训练集" fill="#409eff" radius={[0, 3, 3, 0]} />
            <Bar dataKey="验证集" fill="#10b981" radius={[0, 3, 3, 0]} />
            <Bar dataKey="测试集" fill="#f59e0b" radius={[0, 3, 3, 0]} />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  )
}
