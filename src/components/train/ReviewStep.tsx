import { FileText, CheckCircle2 } from 'lucide-react'
import { SectionTitle } from './SectionTitle'

interface ReviewItem {
  label: string
  value: string
}

export function ReviewStep({
  taskName,
  reviewItems,
  onTaskNameChange,
}: {
  taskName: string
  reviewItems: ReviewItem[]
  onTaskNameChange: (name: string) => void
}) {
  return (
    <div>
      <SectionTitle icon={<FileText size={15} />} title="任务名称" subtitle="为本次训练任务命名" />
      <div className="card" style={{ padding: 20, marginBottom: 20 }}>
        <div className="form-group">
          <label className="form-label">
            训练任务名称 <span style={{ color: 'var(--error)' }}>*</span>
          </label>
          <input
            type="text"
            className="form-input"
            placeholder="例：道路缺陷检测 v2.3-finetune"
            value={taskName}
            onChange={e => onTaskNameChange(e.target.value)}
          />
          <div className="form-hint">清晰的任务名称有助于后续查找和管理训练结果</div>
        </div>
      </div>

      <SectionTitle icon={<CheckCircle2 size={15} />} title="配置确认" subtitle="请核对以下配置无误后提交" />
      <div className="card" style={{ padding: 24, marginBottom: 16 }}>
        <div className="confirm-list">
          {reviewItems.map((item, i) => (
            <div key={i} className="confirm-item">
              <span className="confirm-label">{item.label}</span>
              <span className="confirm-value">{item.value}</span>
            </div>
          ))}
        </div>
      </div>

      {!taskName && (
        <div style={{ padding: '10px 14px', background: 'var(--error-glow)', border: '1px solid rgba(239,68,68,0.3)', fontSize: 12, color: 'var(--error)', marginBottom: 16 }}>
          请输入任务名称
        </div>
      )}

      <div style={{ padding: '12px 16px', background: 'rgba(16,185,129,0.05)', border: '1px solid rgba(16,185,129,0.15)', fontSize: 12, color: 'var(--text-secondary)' }}>
        <CheckCircle2 size={13} style={{ color: 'var(--success)', marginRight: 6, display: 'inline' }} />
        任务创建后将自动加入训练队列，在云服务器上执行。可在"训练任务"页面查看进度。
      </div>
    </div>
  )
}
