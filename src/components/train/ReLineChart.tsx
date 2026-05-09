import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'

export function ReLineChart({
  data,
  color,
  height = 120,
}: {
  data: number[]
  color: string
  height?: number
}) {
  if (data.length === 0) {
    return (
      <div className="mini-chart" style={{ height, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>暂无数据</span>
      </div>
    )
  }

  const chartData = data.map((value, index) => ({
    epoch: index + 1,
    value,
  }))

  return (
    <div className="mini-chart" style={{ height: `${height}px`, minHeight: '80px', minWidth: '200px' }}>
      <ResponsiveContainer width="100%" height={height}>
        <LineChart data={chartData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border-dim)" />
          <XAxis
            dataKey="epoch"
            tick={{ fontSize: 10, fill: 'var(--text-muted)' }}
            axisLine={{ stroke: 'var(--border-dim)' }}
            tickLine={{ stroke: 'var(--border-dim)' }}
            minTickGap={20}
          />
          <YAxis
            tick={{ fontSize: 10, fill: 'var(--text-muted)' }}
            axisLine={{ stroke: 'var(--border-dim)' }}
            tickLine={{ stroke: 'var(--border-dim)' }}
            domain={['auto', 'auto']}
          />
          <Tooltip
            contentStyle={{
              background: 'var(--bg-elevated)',
              border: '1px solid var(--border-default)',
              borderRadius: 6,
              padding: '8px 12px',
              fontSize: 12,
            }}
            formatter={(value) => [`${typeof value === 'number' ? value.toFixed(4) : value}`, '值']}
            labelFormatter={(label) => `第 ${label} 轮`}
          />
          <Line
            type="monotone"
            dataKey="value"
            stroke={color}
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4, fill: color }}
            animationDuration={300}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
