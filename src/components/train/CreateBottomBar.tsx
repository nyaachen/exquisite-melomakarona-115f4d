import { ChevronRight, ChevronLeft, CheckCircle2 } from 'lucide-react'

export function CreateBottomBar({
  step,
  totalSteps,
  stepLabel,
  submitting,
  canSubmit,
  onPrev,
  onNext,
  onSubmit,
}: {
  step: number
  totalSteps: number
  stepLabel: string
  submitting: boolean
  canSubmit: boolean
  onPrev: () => void
  onNext: () => void
  onSubmit: () => void
}) {
  return (
    <div style={{
      position: 'fixed', bottom: 0, left: 'var(--sidebar-width)', right: 0, zIndex: 20,
      background: 'var(--bg-card)', borderTop: '1px solid var(--border-dim)',
      padding: '12px 32px', display: 'flex', alignItems: 'center', justifyContent: 'center',
      boxShadow: '0 -2px 8px rgba(0,0,0,0.04)',
    }}>
      <div style={{ maxWidth: 860, width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ width: 100 }}>
          {step > 1 && (
            <button className="btn btn-secondary" onClick={onPrev}>
              <ChevronLeft size={15} /> 上一步
            </button>
          )}
        </div>
        <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
          第 {step} / {totalSteps} 步 · {stepLabel}
        </span>
        <div style={{ width: 100, display: 'flex', justifyContent: 'flex-end' }}>
          {step === 1 && (
            <button className="btn btn-primary" onClick={onNext}>
              下一步 <ChevronRight size={15} />
            </button>
          )}
          {step === 2 && (
            <button className="btn btn-primary" onClick={onNext}>
              下一步 <ChevronRight size={15} />
            </button>
          )}
          {step === 3 && (
            <button className="btn btn-primary" onClick={onSubmit} disabled={submitting || !canSubmit}>
              {submitting ? (
                <><span className="spinner" /> 正在创建…</>
              ) : (
                <><CheckCircle2 size={15} /> 创建训练任务</>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
