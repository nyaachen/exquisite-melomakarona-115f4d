import { BarChart3 } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

export interface ClassDistribution {
  name: string
  训练集: number
  验证集: number
  测试集: number
}

interface Props {
  data: ClassDistribution[]
  /** Min chart height in px. Default 180. */
  minHeight?: number
  /** Height per bar row in px. Default 36. */
  rowHeight?: number
  showLegend?: boolean
}

export function ClassDistributionChart({
  data,
  minHeight = 180,
  rowHeight = 36,
  showLegend = false,
}: Props) {
  const height = Math.max(minHeight, data.length * rowHeight)

  return (
    <div className="card" style={{ padding: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12 }}>
        <BarChart3 size={14} style={{ color: 'var(--accent-bright)' }} />
        <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)' }}>各类别数据分布</span>
      </div>
      <ResponsiveContainer width="100%" height={height}>
        <BarChart data={data} layout="vertical" margin={{ top: 0, right: 0, left: 60, bottom: 0 }}
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
    </div>
  )
}
