import { createFileRoute, Link } from '@tanstack/react-router'
import { useState } from 'react'
import { Plus, Edit3, Trash2, Copy, CheckCircle2, XCircle, Sliders, Cpu, Zap } from 'lucide-react'

export const Route = createFileRoute('/presets/')({
  component: PresetList,
})

interface Preset {
  id: string
  name: string
  architectureId: string
  architectureName: string
  baseModel: string
  category: string
  description: string
  paramValues: Record<string, number | string | boolean>
  isActive: boolean
  createdAt: string
  author: string
  usageCount: number
}

const CATEGORY_LABELS: Record<string, string> = {
  'object-detection': '目标检测',
  'llm': '大语言模型',
  'multimodal': '多模态',
  'other': '其他',
}

const PRESETS: Preset[] = [
  {
    id: 'preset-quick',
    name: '快速验证',
    architectureId: 'arch-yolov8',
    architectureName: 'YOLOv8 目标检测',
    baseModel: 'YOLOv8m',
    category: 'object-detection',
    description: '快速测试模型可行性，降低训练轮数和批次大小，适合初步实验',
    paramValues: { variant: 's', epochs: 30, batchSize: 32, imgSize: 416, lr0: 0.02, optimizer: 'SGD', useMosaic: false, saveEvery: 10 },
    isActive: true,
    createdAt: '2026-04-20 10:15',
    author: '张工',
    usageCount: 34,
  },
  {
    id: 'preset-standard',
    name: '标准训练',
    architectureId: 'arch-yolov8',
    architectureName: 'YOLOv8 目标检测',
    baseModel: 'YOLOv8m',
    category: 'object-detection',
    description: '平衡训练速度与模型精度，适用于正式训练任务',
    paramValues: { variant: 'm', epochs: 100, batchSize: 16, imgSize: 640, lr0: 0.01, optimizer: 'SGD', useMosaic: true, saveEvery: 10 },
    isActive: true,
    createdAt: '2026-04-18 09:30',
    author: '系统管理员',
    usageCount: 56,
  },
  {
    id: 'preset-highacc',
    name: '高精度训练',
    architectureId: 'arch-yolov8',
    architectureName: 'YOLOv8 目标检测',
    baseModel: 'YOLOv8l',
    category: 'object-detection',
    description: '追求最佳检测精度，使用更大输入尺寸和更多训练轮数',
    paramValues: { variant: 'l', epochs: 150, batchSize: 8, imgSize: 1024, lr0: 0.005, optimizer: 'AdamW', useMosaic: true, saveEvery: 5 },
    isActive: true,
    createdAt: '2026-04-22 14:00',
    author: '李工',
    usageCount: 19,
  },
  {
    id: 'preset-edge',
    name: '边缘设备部署',
    architectureId: 'arch-yolov8',
    architectureName: 'YOLOv8 目标检测',
    baseModel: 'YOLOv8n',
    category: 'object-detection',
    description: '针对移动端/边缘设备优化，使用 nano 模型 + 小尺寸输入',
    paramValues: { variant: 'n', epochs: 80, batchSize: 64, imgSize: 416, lr0: 0.01, optimizer: 'SGD', useMosaic: false, saveEvery: 10 },
    isActive: true,
    createdAt: '2026-04-25 16:45',
    author: '王工',
    usageCount: 12,
  },
  {
    id: 'preset-qwen-lora',
    name: 'Qwen LoRA 标准微调',
    architectureId: 'arch-qwen',
    architectureName: 'Qwen 大语言模型微调',
    baseModel: 'Qwen-7B-Chat',
    category: 'llm',
    description: 'Qwen-7B 的 LoRA 参数高效微调标准配置，适合指令调优任务',
    paramValues: { baseModel: 'Qwen-7B-Chat', finetuneMode: 'lora', epochs: 3, batchSize: 8, lr0: 0.0001, loraRank: 64, loraAlpha: 128, targetLayers: 'q_proj,v_proj', gradAccum: 4, maxSeqLen: 2048, useDeepSpeed: true, mixedPrecision: 'bf16' },
    isActive: true,
    createdAt: '2026-04-28 10:00',
    author: '李工',
    usageCount: 9,
  },
]

function PresetList() {
  const [presets, setPresets] = useState(PRESETS)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [filterCategory, setFilterCategory] = useState<string>('all')

  const filtered = presets.filter(p =>
    filterCategory === 'all' || p.category === filterCategory
  )

  async function handleDelete(id: string) {
    const preset = presets.find(p => p.id === id)
    if (preset?.usageCount && preset.usageCount > 0) {
      alert('该预设已被训练任务使用，无法删除')
      return
    }
    setDeleting(id)
    await new Promise(r => setTimeout(r, 500))
    setPresets(prev => prev.filter(p => p.id !== id))
    setDeleting(null)
  }

  function handleCopy(id: string) {
    const preset = presets.find(p => p.id === id)
    if (!preset) return
    const newPreset: Preset = {
      ...preset,
      id: `preset-${Date.now()}`,
      name: `${preset.name} (副本)`,
      createdAt: new Date().toLocaleString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }).replace(/\//g, '-'),
      usageCount: 0,
    }
    setPresets(prev => [newPreset, ...prev])
  }

  return (
    <div style={{ animation: 'slideIn 0.3s ease-out' }}>
      <div className="page-header">
        <div>
          <div className="breadcrumb">科宝训练平台 › 训练预设</div>
          <h1 className="page-title">训练预设</h1>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>
            保存常用训练参数配置，创建训练任务时快速应用
          </div>
        </div>
        <Link to="/presets/create" className="btn btn-primary">
          <Plus size={15} /> 创建预设
        </Link>
      </div>

      <div className="content-padded">
        <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
          <button className={`btn btn-sm ${filterCategory === 'all' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setFilterCategory('all')}>
            全部
          </button>
          {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
            <button key={key} className={`btn btn-sm ${filterCategory === key ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setFilterCategory(key)}>
              {label}
            </button>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 16 }}>
          {filtered.map(preset => (
            <div key={preset.id} className="card" style={{ padding: 20 }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 10 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{
                    width: 40, height: 40,
                    background: 'var(--teal-glow)',
                    border: '1px solid var(--border-default)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <Sliders size={18} style={{ color: 'var(--teal)' }} />
                  </div>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>{preset.name}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{preset.architectureName}</div>
                  </div>
                </div>
                {preset.isActive ? (
                  <span className="badge badge-success"><CheckCircle2 size={10} /> 启用</span>
                ) : (
                  <span className="badge badge-archived"><XCircle size={10} /> 禁用</span>
                )}
              </div>

              <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 12, lineHeight: 1.5 }}>
                {preset.description}
              </div>

              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 10 }}>
                <span className="badge badge-secondary" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <Cpu size={10} /> {preset.baseModel}
                </span>
                <span className="badge badge-secondary">{CATEGORY_LABELS[preset.category] || preset.category}</span>
                <span className="badge badge-teal" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <Zap size={10} /> {preset.usageCount} 次使用
                </span>
              </div>

              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 12 }}>
                {Object.entries(preset.paramValues).slice(0, 4).map(([key, val]) => (
                  <span key={key} style={{ fontSize: 10, padding: '2px 6px', background: 'var(--bg-elevated)', border: '1px solid var(--border-dim)', color: 'var(--text-secondary)', fontFamily: 'JetBrains Mono' }}>
                    {key}: {String(val)}
                  </span>
                ))}
                {Object.keys(preset.paramValues).length > 4 && (
                  <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>+{Object.keys(preset.paramValues).length - 4} 项</span>
                )}
              </div>

              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 12 }}>
                {preset.author} · {preset.createdAt}
              </div>

              <div style={{ display: 'flex', gap: 6 }}>
                <Link to="/presets/$presetId" params={{ presetId: preset.id }} className="btn btn-ghost btn-sm">
                  <Edit3 size={12} /> 编辑
                </Link>
                <button className="btn btn-ghost btn-sm" onClick={() => handleCopy(preset.id)}>
                  <Copy size={12} /> 复制
                </button>
                <button className="btn btn-ghost btn-sm" onClick={() => handleDelete(preset.id)}
                  disabled={deleting === preset.id || preset.usageCount > 0}>
                  <Trash2 size={12} /> 删除
                </button>
              </div>
            </div>
          ))}

          {filtered.length === 0 && (
            <div className="empty-state" style={{ gridColumn: '1 / -1' }}>
              <div className="empty-state-icon"><Sliders size={32} /></div>
              <div className="empty-state-text">暂无训练预设</div>
              <div className="empty-state-hint">点击右上角"创建预设"保存常用训练参数配置</div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
