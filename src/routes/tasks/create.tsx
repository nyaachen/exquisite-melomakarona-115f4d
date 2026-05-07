import { createFileRoute, useRouter } from '@tanstack/react-router'
import { useState } from 'react'
import {
  ChevronLeft,
  ChevronRight,
  FileText,
  Settings,
  Sparkles,
  CheckCircle2,
  Database,
} from 'lucide-react'

export const Route = createFileRoute('/tasks/create')({
  component: CreateTask,
})

const DATASETS = [
  { id: 'ds-001', name: '道路缺陷标注集', count: 4872, tags: ['裂缝', '坑洼', '破损', '剥落'] },
  { id: 'ds-002', name: '安全帽标注集', count: 2391, tags: ['安全帽', '无安全帽', '人员'] },
  { id: 'ds-003', name: '车牌数据集', count: 7840, tags: ['车牌'] },
  { id: 'ds-004', name: '设备标注集', count: 1628, tags: ['设备', '异常'] },
]

const BASE_MODELS = [
  { id: 'yolov8n', name: 'YOLOv8n', size: '最小', params: '3.2M', speed: '最快' },
  { id: 'yolov8s', name: 'YOLOv8s', size: '小', params: '11.2M', speed: '快' },
  { id: 'yolov8m', name: 'YOLOv8m', size: '中', params: '25.9M', speed: '中' },
  { id: 'yolov8l', name: 'YOLOv8l', size: '大', params: '43.7M', speed: '较慢' },
  { id: 'yolov8x', name: 'YOLOv8x', size: '最大', params: '68.2M', speed: '慢' },
]

const STEPS = [
  { id: 1, label: '基本信息', icon: <FileText size={14} /> },
  { id: 2, label: '数据集', icon: <Database size={14} /> },
  { id: 3, label: '基础模型', icon: <Settings size={14} /> },
  { id: 4, label: '参数配置', icon: <Sparkles size={14} /> },
]

function CreateTask() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [taskName, setTaskName] = useState('')
  const [description, setDescription] = useState('')
  const [selectedDataset, setSelectedDataset] = useState<string | null>(null)
  const [trainSplit, setTrainSplit] = useState(80)
  const [valSplit, setValSplit] = useState(15)
  const [testSplit, setTestSplit] = useState(5)
  const [selectedModel, setSelectedModel] = useState<string | null>(null)
  const [epochs, setEpochs] = useState(100)
  const [batchSize, setBatchSize] = useState(16)
  const [learningRate, setLearningRate] = useState(0.01)
  const [gpuCount, setGpuCount] = useState(1)

  const handleNext = () => {
    if (step < 4) setStep(step + 1)
  }

  const handlePrev = () => {
    if (step > 1) setStep(step - 1)
  }

  const handleSubmit = () => {
    router.navigate({ to: '/tasks/$taskId', params: { taskId: 'task-001' } })
  }

  return (
    <div className="slide-in">
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button onClick={() => router.back()} className="btn btn-ghost btn-sm">
            <ChevronLeft size={16} />
          </button>
          <div>
            <div className="breadcrumb">科宝训练平台 › 训练任务</div>
            <h1 className="page-title">创建训练任务</h1>
          </div>
        </div>
      </div>

      <div className="p-content">
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, paddingBottom: 16, borderBottom: '1px solid var(--border-dim)' }}>
            {STEPS.map((s) => (
              <div key={s.id} style={{ display: 'flex', alignItems: 'center' }}>
                <div className={`step-indicator ${step >= s.id ? 'step-active' : ''}`}>
                  {step > s.id ? <CheckCircle2 size={14} /> : s.id}
                </div>
                <span style={{ marginLeft: 8, fontSize: 12, color: step >= s.id ? 'var(--text-primary)' : 'var(--text-muted)' }}>
                  {s.label}
                </span>
                {s.id < 4 && <ChevronRight size={14} style={{ margin: '0 16px', color: 'var(--text-muted)' }} />}
              </div>
            ))}
          </div>

          <div style={{ minHeight: 192 }}>
            {step === 1 && (
              <div className="slide-fade">
                <div className="form-section">
                  <div className="form-section-header">
                    <FileText size={16} />
                    <span>基本信息</span>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
                    <div className="form-group">
                      <label className="form-label">任务名称 *</label>
                      <input
                        type="text"
                        value={taskName}
                        onChange={(e) => setTaskName(e.target.value)}
                        placeholder="例如: 道路缺陷检测 v2.0"
                        className="form-input"
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">任务描述</label>
                      <input
                        type="text"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="简短描述此训练任务的目的"
                        className="form-input"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="slide-fade">
                <div className="form-section">
                  <div className="form-section-header">
                    <Database size={16} />
                    <span>选择数据集</span>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
                    {DATASETS.map((ds) => (
                      <div
                        key={ds.id}
                        className="select-card"
                        style={{ cursor: 'pointer', borderColor: selectedDataset === ds.id ? 'var(--accent)' : undefined }}
                        onClick={() => setSelectedDataset(ds.id)}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                          <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{ds.name}</span>
                          <span className="badge badge-secondary">{ds.count} 张</span>
                        </div>
                        <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
                          {ds.tags.map((tag) => (
                            <span key={tag} className="class-tag">{tag}</span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="form-section" style={{ marginTop: 16 }}>
                  <div className="form-section-header">
                    <Settings size={16} />
                    <span>数据划分</span>
                  </div>
                  <div className="split-bar">
                    <div className="split-bar-train" style={{ flex: trainSplit }}>
                      <span className="split-bar-label">训练 {trainSplit}%</span>
                    </div>
                    <div className="split-bar-val" style={{ flex: valSplit }}>
                      <span className="split-bar-label">验证 {valSplit}%</span>
                    </div>
                    <div className="split-bar-test" style={{ flex: testSplit }}>
                      <span className="split-bar-label">测试 {testSplit}%</span>
                    </div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginTop: 16 }}>
                    {[
                      { label: '训练集', value: trainSplit, onChange: setTrainSplit },
                      { label: '验证集', value: valSplit, onChange: setValSplit },
                      { label: '测试集', value: testSplit, onChange: setTestSplit },
                    ].map((s) => (
                      <div key={s.label} className="form-group">
                        <label className="form-label">{s.label}</label>
                        <input
                          type="number"
                          min={0}
                          max={100}
                          value={s.value}
                          onChange={(e) => s.onChange(Number(e.target.value))}
                          className="form-input"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="slide-fade">
                <div className="form-section">
                  <div className="form-section-header">
                    <Sparkles size={16} />
                    <span>选择基础模型</span>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 12 }}>
                    {BASE_MODELS.map((model) => (
                      <div
                        key={model.id}
                        className="select-card"
                        style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', borderColor: selectedModel === model.id ? 'var(--accent)' : undefined }}
                        onClick={() => setSelectedModel(model.id)}
                      >
                        <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>{model.name}</div>
                        <div style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 8 }}>{model.size}模型</div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 4, width: '100%' }}>
                          <div style={{ fontSize: 10, display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ color: 'var(--text-muted)' }}>参数量</span>
                            <span style={{ fontFamily: "'JetBrains Mono', monospace" }}>{model.params}</span>
                          </div>
                          <div style={{ fontSize: 10, display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ color: 'var(--text-muted)' }}>推理速度</span>
                            <span style={{ fontFamily: "'JetBrains Mono', monospace" }}>{model.speed}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {step === 4 && (
              <div className="slide-fade">
                <div className="form-section">
                  <div className="form-section-header">
                    <Settings size={16} />
                    <span>训练参数</span>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
                    {[
                      { label: '训练轮数 (Epochs)', value: epochs, onChange: setEpochs, min: 1, max: 500 },
                      { label: '批次大小 (Batch Size)', value: batchSize, onChange: setBatchSize, min: 1, max: 128 },
                      { label: '学习率', value: learningRate, onChange: setLearningRate, step: 0.001 },
                      { label: 'GPU数量', value: gpuCount, onChange: setGpuCount, min: 1, max: 8 },
                    ].map((p) => (
                      <div key={p.label} className="form-group">
                        <label className="form-label">{p.label}</label>
                        <input
                          type="number"
                          min={p.min}
                          max={p.max}
                          step={p.step || 1}
                          value={p.value}
                          onChange={(e) => p.onChange(Number(e.target.value))}
                          className="form-input"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <div className="form-section" style={{ marginTop: 16 }}>
                  <div className="form-section-header">
                    <CheckCircle2 size={16} />
                    <span>配置确认</span>
                  </div>
                  <div className="confirm-list">
                    <div className="confirm-item">
                      <span className="confirm-label">任务名称</span>
                      <span className="confirm-value">{taskName || '未填写'}</span>
                    </div>
                    <div className="confirm-item">
                      <span className="confirm-label">数据集</span>
                      <span className="confirm-value">{selectedDataset ? DATASETS.find(d => d.id === selectedDataset)?.name : '未选择'}</span>
                    </div>
                    <div className="confirm-item">
                      <span className="confirm-label">基础模型</span>
                      <span className="confirm-value">{selectedModel || '未选择'}</span>
                    </div>
                    <div className="confirm-item">
                      <span className="confirm-label">数据划分</span>
                      <span className="confirm-value">训练:{trainSplit}% / 验证:{valSplit}% / 测试:{testSplit}%</span>
                    </div>
                    <div className="confirm-item">
                      <span className="confirm-label">训练参数</span>
                      <span className="confirm-value">{epochs} epochs / {batchSize} batch / LR {learningRate}</span>
                    </div>
                    <div className="confirm-item">
                      <span className="confirm-label">GPU资源</span>
                      <span className="confirm-value">{gpuCount} × A100</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div style={{ marginTop: 24, paddingTop: 16, borderTop: '1px solid var(--border-dim)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <button
              onClick={handlePrev}
              disabled={step === 1}
              className="btn btn-ghost"
            >
              <ChevronLeft size={14} /> 上一步
            </button>
            {step < 4 ? (
              <button onClick={handleNext} className="btn btn-primary">
                下一步 <ChevronRight size={14} />
              </button>
            ) : (
              <button onClick={handleSubmit} className="btn btn-primary">
                <Sparkles size={14} /> 开始训练
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}