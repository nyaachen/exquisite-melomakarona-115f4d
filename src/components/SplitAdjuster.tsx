import { useMemo } from 'react'

export interface SplitRatio {
  train: number
  val: number
  test: number
}

interface SplitAdjusterProps {
  totalCount: number
  split: SplitRatio
  onChange: (split: SplitRatio) => void
  /** Allow editing individual ratios. Default true. */
  editable?: boolean
  /** Show percentage inputs alongside sliders. Default false. */
  showPercentInputs?: boolean
  /** Show count inputs alongside sliders. Default false. */
  showCountInputs?: boolean
  /** Show a count summary card row below. Default true. */
  showCountSummary?: boolean
  /** Width of the component. Default '100%'. */
  width?: string
}

export function SplitAdjuster({
  totalCount,
  split,
  onChange,
  editable = true,
  showPercentInputs = false,
  showCountInputs = false,
  showCountSummary = true,
  width = '100%',
}: SplitAdjusterProps) {
  const trainCount = Math.round(totalCount * split.train / 100)
  const valCount = Math.round(totalCount * split.val / 100)
  const testCount = totalCount - trainCount - valCount

  const setTrainRatio = (v: number) => {
    const train = Math.max(0, Math.min(100, v))
    const remaining = 100 - train
    const ratio = split.val + split.test > 0 ? split.val / (split.val + split.test) : 0.5
    const val = Math.round(remaining * ratio)
    onChange({ train, val, test: 100 - train - val })
  }

  const setValRatio = (v: number) => {
    const val = Math.max(0, Math.min(100 - split.train, v))
    onChange({ ...split, val, test: 100 - split.train - val })
  }

  const setTrainCount = (c: number) => {
    setTrainRatio(Math.round((c / totalCount) * 100))
  }

  const setValCount = (c: number) => {
    setValRatio(Math.round((c / totalCount) * 100))
  }

  const rows = useMemo(() => [
    {
      key: 'train' as const,
      label: '训练集',
      pct: split.train,
      count: trainCount,
      color: '#409eff',
      setPct: setTrainRatio,
      setCount: setTrainCount,
    },
    {
      key: 'val' as const,
      label: '验证集',
      pct: split.val,
      count: valCount,
      color: '#10b981',
      setPct: setValRatio,
      setCount: setValCount,
    },
    {
      key: 'test' as const,
      label: '测试集',
      pct: split.test,
      count: testCount,
      color: '#f59e0b',
      readonly: true,
    },
  ], [split, totalCount, editable, trainCount, valCount, testCount])

  const inputBase: React.CSSProperties = {
    width: 58,
    textAlign: 'center',
    fontFamily: 'JetBrains Mono',
    fontSize: 12,
    padding: '4px 6px',
    background: 'var(--bg-elevated)',
    border: '1px solid var(--border-default)',
    color: 'var(--text-primary)',
    outline: 'none',
    borderRadius: 3,
  }

  return (
    <div style={{ width }}>
      {/* Split bar */}
      <div className="split-bar" style={{ marginBottom: 14 }}>
        <div className="split-bar-train" style={{ flex: split.train || 0.1 }}>
          <span className="split-bar-label" style={{ color: '#409eff' }}>训练 {split.train}%</span>
        </div>
        <div className="split-bar-val" style={{ flex: split.val || 0.1 }}>
          <span className="split-bar-label" style={{ color: '#10b981' }}>验证 {split.val}%</span>
        </div>
        <div className="split-bar-test" style={{ flex: split.test || 0.1 }}>
          <span className="split-bar-label" style={{ color: '#f59e0b' }}>测试 {split.test}%</span>
        </div>
      </div>

      {/* Row controls */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {rows.map(row => (
          <div key={row.key}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
              <span style={{ fontSize: 11, fontWeight: 500, color: row.color }}>{row.label}</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                {row.readonly ? (
                  <span style={{ fontFamily: 'JetBrains Mono', fontSize: 11, fontWeight: 600, color: row.color }}>
                    {row.pct}%{showCountInputs && ` · ${row.count.toLocaleString()} 张`}
                  </span>
                ) : (
                  <>
                    {showPercentInputs && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <input
                          type="number"
                          style={inputBase}
                          value={row.pct}
                          min={0}
                          max={row.key === 'train' ? 100 : 100 - split.train}
                          onChange={e => {
                            const v = parseInt(e.target.value)
                            if (!isNaN(v)) row.setPct?.(v)
                          }}
                          disabled={!editable}
                        />
                        <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>%</span>
                      </div>
                    )}
                    {showCountInputs && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <input
                          type="number"
                          style={{ ...inputBase, width: 72, fontFamily: 'JetBrains Mono', fontSize: 12, padding: '4px 6px', background: 'var(--bg-elevated)', border: '1px solid var(--border-default)', color: 'var(--text-primary)', outline: 'none', borderRadius: 3, textAlign: 'center' }}
                          value={row.count}
                          min={0}
                          max={totalCount}
                          onChange={e => {
                            const v = parseInt(e.target.value)
                            if (!isNaN(v)) row.setCount?.(Math.max(0, Math.min(totalCount, v)))
                          }}
                          disabled={!editable}
                        />
                        <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>张</span>
                      </div>
                    )}
                    {!showPercentInputs && !showCountInputs && (
                      <span style={{ fontFamily: 'JetBrains Mono', fontSize: 11, fontWeight: 600, color: row.color }}>
                        {row.pct}%
                      </span>
                    )}
                  </>
                )}
              </div>
            </div>

            {editable && !row.readonly ? (
              <input
                type="range"
                min={0}
                max={row.key === 'train' ? 100 : 100 - split.train}
                value={row.pct}
                onChange={e => row.setPct?.(Number(e.target.value))}
                style={{ width: '100%' }}
              />
            ) : (
              <div className="progress-bar" style={{ height: 5 }}>
                <div className="progress-fill" style={{ width: `${row.pct}%`, background: row.color }} />
              </div>
            )}

            <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 2 }}>
              {row.count.toLocaleString()} 张
            </div>
          </div>
        ))}
      </div>

      {/* Count summary */}
      {showCountSummary && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginTop: 16 }}>
          {rows.map(row => (
            <div key={row.key} className="metric-chip">
              <div className="metric-chip-value" style={{ color: row.color, fontSize: 16 }}>
                {row.count.toLocaleString()}
              </div>
              <div className="metric-chip-label">{row.label} ({row.pct}%)</div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
