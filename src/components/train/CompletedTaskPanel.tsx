import { Link } from '@tanstack/react-router'
import {
  CheckCircle2,
  Clock,
  FlaskConical,
  Package,
  Target,
  Award,
} from 'lucide-react'
import type { VerificationResult } from '../../data/train-tasks'

export function CompletedTaskPanel({
  published,
  modelName,
  modelVersion,
  publishedAt,
  verification,
  onPublishClick,
}: {
  published: boolean
  modelName?: string
  modelVersion?: string
  publishedAt?: string
  verification: VerificationResult
  onPublishClick: () => void
}) {
  return (
    <>
      {/* Training result status */}
      <div className="card card-padded mb-5">
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{
            width: 56, height: 56,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: published ? 'rgba(103, 194, 58,0.1)' : 'rgba(230, 162, 60,0.1)',
          }}>
            {published ? (
              <CheckCircle2 size={28} style={{ color: 'var(--success)' }} />
            ) : (
              <Clock size={28} style={{ color: 'var(--warning)' }} />
            )}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 4 }}>
              训练结果状态
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{
                fontSize: 20, fontWeight: 700,
                color: published ? 'var(--success)' : 'var(--warning)',
              }}>
                {published ? '已发布' : '未发布'}
              </span>
              {published && modelName && modelVersion && (
                <span className="badge" style={{ background: 'var(--accent-glow)', color: 'var(--accent)' }}>
                  {modelName} v{modelVersion}
                </span>
              )}
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>
              {published
                ? `发布时间: ${publishedAt}`
                : '训练任务产生的结果初始处于未发布状态，只有发布后才会出现在模型广场'
              }
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
            <Link to="/validate/create" className="btn btn-success btn-sm">
              <FlaskConical size={14} /> 创建验证任务
            </Link>
            {!published ? (
              <button className="btn btn-teal btn-sm" onClick={onPublishClick}>
                <Package size={13} /> 发布模型
              </button>
            ) : (
              <Link to="/models/$modelId" params={{ modelId: 'model-001' }} className="btn btn-primary btn-sm">
                <Package size={13} /> 查看模型
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Verification summary */}
      <div className="card card-padded mb-5">
        <div className="section-title mb-3">
          验证结论 · <span style={{
            color: verification.quality === 'excellent' ? 'var(--success)'
              : verification.quality === 'good' ? 'var(--accent-bright)'
              : verification.quality === 'pass' ? 'var(--teal)'
              : 'var(--warning)',
          }}>
            {verification.qualityLabel}
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <div>
            <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 8 }}>
              <Award size={12} style={{ color: 'var(--success)', marginRight: 4, display: 'inline' }} />
              优势亮点
            </div>
            <ul style={{ margin: 0, padding: '0 0 0 16px', fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.8 }}>
              {verification.highlights.map((h, i) => <li key={i}>{h}</li>)}
            </ul>
          </div>
          <div>
            <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 8 }}>
              <Target size={12} style={{ color: 'var(--accent-bright)', marginRight: 4, display: 'inline' }} />
              改进建议
            </div>
            <ul style={{ margin: 0, padding: '0 0 0 16px', fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.8 }}>
              {verification.suggestions.map((s, i) => <li key={i}>{s}</li>)}
            </ul>
          </div>
        </div>
      </div>

      {/* Detailed metrics */}
      <div className="card card-padded mb-5">
        <div className="section-title mb-3">详细指标</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 12 }}>
          {verification.details.map(d => (
            <div key={d.label} className="metric-chip">
              <div className="metric-chip-value" style={{
                color: d.status === 'pass' ? 'var(--success)'
                  : d.status === 'warn' ? 'var(--warning)'
                  : 'var(--error)',
              }}>
                {d.value}
              </div>
              <div className="metric-chip-label">{d.label}</div>
            </div>
          ))}
        </div>
      </div>
    </>
  )
}
