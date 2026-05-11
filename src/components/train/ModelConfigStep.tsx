import {
  Cpu,
  CheckCircle2,
  Sliders,
  Info,
} from 'lucide-react'
import { SearchableDropdown } from '../SearchableDropdown'
import { SectionTitle } from './SectionTitle'
import type { Architecture } from '../../data/architectures'
import type { Preset } from '../../data/presets'
import type { ExistingTask } from '../../data/train-tasks'

interface StartingPointType {
  id: string
  name: string
  icon: React.ReactNode
  desc: string
}

interface ModelWithVersions {
  id: string
  name: string
  versions: string[]
}

interface PublicModel {
  id: string
  name: string
  architectureId: string
  source: string
  fileSize: string
  desc: string
  inputSize: number
  numClasses: number
}

export function ModelConfigStep({
  architectureId,
  appliedPresetId,
  paramValues,
  startPointType,
  startPointId,
  startPointVersion,
  architectures,
  visiblePresets,
  visiblePublicModels,
  existingTasks,
  squareModels,
  startingPointTypes,
  architecture,
  onArchChange,
  onPresetApply,
  onParamChange,
  onStartPointTypeChange,
  onStartPointIdChange,
  onStartPointVersionChange,
}: {
  architectureId: string
  appliedPresetId: string | null
  paramValues: Record<string, any>
  startPointType: string
  startPointId: string | null
  startPointVersion: string
  architectures: Architecture[]
  visiblePresets: Preset[]
  visiblePublicModels: PublicModel[]
  existingTasks: ExistingTask[]
  squareModels: ModelWithVersions[]
  startingPointTypes: StartingPointType[]
  architecture?: Architecture
  onArchChange: (id: string) => void
  onPresetApply: (presetId: string) => void
  onParamChange: (key: string, value: any) => void
  onStartPointTypeChange: (type: string) => void
  onStartPointIdChange: (id: string | null) => void
  onStartPointVersionChange: (version: string) => void
}) {
  const matchingPresets = visiblePresets.filter(p => p.architectureId === architectureId)

  return (
    <div>
      <SectionTitle icon={<Cpu size={15} />} title="选择模型架构" subtitle="从模型模板中选择训练架构" />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 24 }}>
        {architectures.filter(a => a.isActive).map(arch => (
          <div
            key={arch.id}
            className="select-card"
            style={{
              borderColor: architectureId === arch.id ? 'var(--accent)' : undefined,
              background: architectureId === arch.id ? 'var(--accent-glow)' : undefined,
            }}
            onClick={() => onArchChange(arch.id)}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 40, height: 40, background: 'var(--accent-glow)', border: '1px solid var(--border-default)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Cpu size={20} style={{ color: 'var(--accent)' }} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 2 }}>{arch.name}</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'JetBrains Mono' }}>{arch.baseModel}</div>
              </div>
              {architectureId === arch.id && <CheckCircle2 size={16} color="var(--accent-bright)" />}
            </div>
            <div style={{ marginTop: 8, fontSize: 11, color: 'var(--text-secondary)', lineHeight: 1.5 }}>{arch.description}</div>
          </div>
        ))}
      </div>

      <div style={{ marginBottom: 24 }}>
        <SearchableDropdown
          label="快速设置参数（可选）"
          color="var(--teal)"
          selectedId={appliedPresetId || ''}
          onChange={(id) => id && onPresetApply(id)}
          items={matchingPresets.map(p => ({
            id: p.id,
            name: p.name,
            subtitle: p.description,
          }))}
          placeholder={matchingPresets.length === 0 ? '该架构暂无可用预设' : '选择训练预设快速填充参数...'}
        />
      </div>

      {architecture && (
        <div style={{ animation: 'slideIn 0.2s ease-out' }}>
          <SectionTitle icon={<Sliders size={15} />} title="训练参数" subtitle="根据模型模板定义的参数进行配置" />
          <div className="card" style={{ padding: 20, marginBottom: 20 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              {architecture.params.map(param => {
                const val = paramValues[param.key] ?? param.defaultValue
                return (
                  <div key={param.key} className="form-group">
                    <label className="form-label">
                      {param.name}
                      {param.required && <span style={{ color: 'var(--error)', marginLeft: 2 }}>*</span>}
                    </label>
                    {param.type === 'select' && param.options ? (
                      <select
                        className="form-input"
                        value={String(val)}
                        onChange={e => {
                          const opt = param.options?.find(o => String(o.value) === e.target.value)
                          onParamChange(param.key, opt?.value ?? e.target.value)
                        }}
                      >
                        {param.options.map(o => (
                          <option key={String(o.value)} value={String(o.value)}>{o.label}</option>
                        ))}
                      </select>
                    ) : param.type === 'boolean' ? (
                      <select
                        className="form-input"
                        value={String(val)}
                        onChange={e => onParamChange(param.key, e.target.value === 'true')}
                      >
                        <option value="true">是</option>
                        <option value="false">否</option>
                      </select>
                    ) : param.type === 'range' ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <input
                          className="form-input"
                          type="number"
                          value={val}
                          min={param.min}
                          max={param.max}
                          step={param.step}
                          style={{ width: 90, fontFamily: 'JetBrains Mono', fontSize: 13, fontWeight: 600, textAlign: 'center', flexShrink: 0 }}
                          onChange={e => {
                            const raw = e.target.value
                            if (raw === '' || raw === '-') { onParamChange(param.key, raw); return }
                            const v = parseFloat(raw)
                            if (!isNaN(v)) onParamChange(param.key, v)
                          }}
                          onBlur={e => {
                            const v = parseFloat(e.target.value)
                            const min = param.min ?? 0
                            const max = param.max ?? 1
                            if (isNaN(v)) { onParamChange(param.key, param.defaultValue); return }
                            if (v < min) onParamChange(param.key, min)
                            else if (v > max) onParamChange(param.key, max)
                            else onParamChange(param.key, v)
                          }}
                          onKeyDown={e => {
                            if (e.key === 'Enter') (e.target as HTMLInputElement).blur()
                          }}
                        />
                        <input
                          type="range"
                          min={param.min || 0}
                          max={param.max || 1}
                          step={param.step || 0.001}
                          value={isNaN(Number(val)) ? param.defaultValue as number : Number(val)}
                          onChange={e => onParamChange(param.key, parseFloat(e.target.value))}
                          style={{ flex: 1 }}
                        />
                      </div>
                    ) : (
                      <input
                        className="form-input"
                        type={param.type === 'number' ? 'number' : 'text'}
                        value={String(val)}
                        min={param.min}
                        max={param.max}
                        step={param.step}
                        onChange={e => {
                          const v = param.type === 'number' ? (parseFloat(e.target.value) || 0) : e.target.value
                          onParamChange(param.key, v)
                        }}
                      />
                    )}
                    {param.description && <div className="form-hint">{param.description}</div>}
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {/* Starting point */}
      <div className="form-group" style={{ marginBottom: 16 }}>
        <label className="form-label">训练起点</label>
        <select
          className="form-input"
          value={startPointType}
          onChange={e => {
            onStartPointTypeChange(e.target.value)
            onStartPointIdChange(null)
            onStartPointVersionChange('')
          }}
        >
          {startingPointTypes.map(sp => (
            <option key={sp.id} value={sp.id}>{sp.name} — {sp.desc}</option>
          ))}
        </select>
      </div>

      {startPointType === 'existing_task' && (
        <div style={{ animation: 'slideIn 0.2s ease-out', marginBottom: 16 }}>
          <SearchableDropdown
            label="选择训练任务"
            color="var(--accent-bright)"
            selectedId={startPointId || ''}
            onChange={(id) => onStartPointIdChange(id)}
            items={existingTasks.map(t => ({
              id: t.id,
              name: t.name,
              subtitle: `模型: ${t.model} · ${t.epochs} 轮 · 最佳 mAP: ${t.bestMap}%`,
              count: t.lastEpoch,
              countLabel: `第 ${t.lastEpoch} 轮`,
            }))}
            placeholder="选择历史训练任务..."
          />
        </div>
      )}

      {startPointType === 'existing_model' && (
        <div style={{ animation: 'slideIn 0.2s ease-out', marginBottom: 16 }}>
          <SearchableDropdown
            label="选择模型广场模型"
            color="var(--accent-bright)"
            selectedId={startPointId || ''}
            onChange={(id) => { onStartPointIdChange(id); onStartPointVersionChange('') }}
            items={squareModels.map(m => ({
              id: m.id,
              name: m.name,
              subtitle: `版本: ${m.versions.join('、')}`,
              tags: m.versions,
            }))}
            placeholder="选择模型广场中已发布的模型..."
          />
          {startPointId && (
            <div style={{ marginTop: 12 }}>
              <SearchableDropdown
                label="选择版本"
                color="var(--teal)"
                selectedId={startPointVersion}
                onChange={(v) => onStartPointVersionChange(v)}
                items={(squareModels.find(m => m.id === startPointId)?.versions || []).map(v => ({
                  id: v,
                  name: v,
                }))}
                placeholder="选择模型版本..."
              />
            </div>
          )}
        </div>
      )}

      {startPointType === 'public' && (
        <div style={{ animation: 'slideIn 0.2s ease-out', marginBottom: 16 }}>
          {visiblePublicModels.length === 0 ? (
            <div style={{ padding: '14px 16px', background: 'rgba(230, 162, 60,0.06)', border: '1px solid rgba(230, 162, 60,0.2)', fontSize: 12, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 8 }}>
              <Info size={13} style={{ color: 'var(--warning)', flexShrink: 0 }} />
              当前选择的架构暂无关联的公开预训练模型
            </div>
          ) : (
            <SearchableDropdown
              label="选择公开预训练模型"
              color="var(--accent-bright)"
              selectedId={startPointId || ''}
              onChange={(id) => onStartPointIdChange(id)}
              items={visiblePublicModels.map(pm => ({
                id: pm.id,
                name: pm.name,
                subtitle: `${pm.desc} · ${pm.fileSize} · ${pm.numClasses}类`,
                tags: [pm.source, `输入${pm.inputSize}`],
              }))}
              placeholder="选择公开预训练模型..."
            />
          )}
        </div>
      )}

    </div>
  )
}
