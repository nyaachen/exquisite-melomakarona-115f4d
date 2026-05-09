import { CheckCircle2 } from 'lucide-react'

export interface StepDef {
  id: number
  label: string
  icon: React.ReactNode
}

export function CreateStepper({
  steps,
  currentStep,
  onStepClick,
}: {
  steps: StepDef[]
  currentStep: number
  onStepClick: (step: number) => void
}) {
  return (
    <div className="stepper">
      {steps.map((s, i) => (
        <div key={s.id} className="step-item" style={{ flexDirection: 'column', alignItems: 'center', gap: 6 }}>
          <div style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
            <div
              className={`step-circle ${currentStep === s.id ? 'active' : currentStep > s.id ? 'done' : ''}`}
              style={{ cursor: currentStep > s.id ? 'pointer' : 'default' }}
              onClick={() => currentStep > s.id && onStepClick(s.id)}
            >
              {currentStep > s.id ? <CheckCircle2 size={14} /> : s.id}
            </div>
            {i < steps.length - 1 && (
              <div className={`step-connector ${currentStep > s.id ? 'done' : ''}`} />
            )}
          </div>
          <div className={`step-label ${currentStep === s.id ? 'active' : currentStep > s.id ? 'done' : ''}`}>
            {s.label}
          </div>
        </div>
      ))}
    </div>
  )
}
