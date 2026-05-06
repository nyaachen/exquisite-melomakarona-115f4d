import { createFileRoute, Link } from '@tanstack/react-router'
import { useState } from 'react'
import {
  Package,
  Upload,
  ImageIcon,
  Database,
  Target,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Zap,
} from 'lucide-react'

export const Route = createFileRoute('/visual/$modelId')({
  component: ModelVisualization,
})

// Mock model data
const MODELS = [
  {
    id: 'model-002',
    name: '施工安全帽检测 v1.0',
    taskId: 'task-002',
    taskName: '施工人员安全帽检测',
    baseModel: 'YOLOv8s',
    mAP: 0.923,
    precision: 0.941,
    recall: 0.908,
    f1: 0.924,
    size: '22.4 MB',
    classes: ['安全帽', '无安全帽', '人员'],
    classColors: ['#1d4ed8', '#ef4444', '#10b981'],
    imgSize: 640,
    status: 'published' as const,
    publishedTo: '科宝智能体中台·工地安全模块',
    publishedAt: '2026-04-28 18:45',
    trainedAt: '2026-04-28 18:12',
    valImages: 478,
    format: 'PT + ONNX',
  },
  {
    id: 'model-001',
    name: '道路缺陷检测 v2.3',
    taskId: 'task-001',
    taskName: '道路缺陷检测 v2.3',
    baseModel: 'YOLOv8m',
    mAP: 0.782,
    precision: 0.831,
    recall: 0.748,
    f1: 0.788,
    size: '51.7 MB',
    classes: ['裂缝', '坑洼', '破损', '剥落', '标线模糊', '积水', '障碍物'],
    classColors: ['#1d4ed8', '#ef4444', '#f59e0b', '#8b5cf6', '#10b981', '#06b6d4', '#6366f1'],
    imgSize: 640,
    status: 'ready' as const,
    publishedTo: null,
    publishedAt: null,
    trainedAt: '2026-04-29 11:30',
    valImages: 975,
    format: 'PT',
  },
  {
    id: 'model-003',
    name: '人员跌倒检测 v1.0',
    taskId: 'task-005',
    taskName: '人员跌倒检测 v1.0',
    baseModel: 'YOLOv8s',
    mAP: 0.887,
    precision: 0.912,
    recall: 0.865,
    f1: 0.888,
    size: '22.1 MB',
    classes: ['正常站立', '跌倒'],
    classColors: ['#10b981', '#ef4444'],
    imgSize: 640,
    status: 'published' as const,
    publishedTo: '科宝智能体中台·安全监控模块',
    publishedAt: '2026-04-27 09:15',
    trainedAt: '2026-04-26 17:40',
    valImages: 642,
    format: 'PT + ONNX + TensorRT',
  },
]

// Mock test set images
const TEST_IMAGES = [
  { id: 'test-001', name: 'test_0001.jpg', width: 640, height: 480 },
  { id: 'test-002', name: 'test_0002.jpg', width: 640, height: 480 },
  { id: 'test-003', name: 'test_0003.jpg', width: 640, height: 480 },
  { id: 'test-004', name: 'test_0004.jpg', width: 640, height: 480 },
  { id: 'test-005', name: 'test_0005.jpg', width: 640, height: 480 },
]

// Mock datasets from annotation platform
const DATASETS = [
  {
    id: 'ds-001',
    name: '道路缺陷检测数据集 v2.3',
    images: 4872,
    imagesList: [
      { id: 'ds-img-001', name: 'img_0001.jpg', width: 640, height: 480 },
      { id: 'ds-img-002', name: 'img_0002.jpg', width: 640, height: 480 },
      { id: 'ds-img-003', name: 'img_0003.jpg', width: 640, height: 480 },
    ],
  },
  {
    id: 'ds-002',
    name: '施工安全帽检测集',
    images: 2391,
    imagesList: [
      { id: 'ds-img-004', name: 'img_0004.jpg', width: 640, height: 480 },
      { id: 'ds-img-005', name: 'img_0005.jpg', width: 640, height: 480 },
      { id: 'ds-img-006', name: 'img_0006.jpg', width: 640, height: 480 },
    ],
  },
]

type ImageSource = 'upload' | 'testset' | 'dataset'

interface Prediction {
  className: string
  confidence: number
  bbox: { x: number; y: number; width: number; height: number }
}

function ModelVisualization() {
  const { modelId } = Route.useParams()
  const model = MODELS.find(m => m.id === modelId) || MODELS[0]
  
  const [imageSource, setImageSource] = useState<ImageSource>('testset')
  const [selectedDataset, setSelectedDataset] = useState(DATASETS[0]?.id || '')
  const [selectedImage, setSelectedImage] = useState(TEST_IMAGES[0])
  const [uploadedImage, setUploadedImage] = useState<string | null>(null)
  const [predictions, setPredictions] = useState<Prediction[]>([])
  const [isPredicting, setIsPredicting] = useState(false)

  const availableImages = imageSource === 'testset' 
    ? TEST_IMAGES 
    : DATASETS.find(d => d.id === selectedDataset)?.imagesList || []

  const currentImage = imageSource === 'upload' && uploadedImage 
    ? { name: '上传的图片', width: 640, height: 480 } 
    : selectedImage

  async function runPrediction() {
    setIsPredicting(true)
    await new Promise(r => setTimeout(r, 1500))
    
    const mockPredictions: Prediction[] = []
    const numBoxes = Math.floor(Math.random() * 3) + 1
    for (let i = 0; i < numBoxes; i++) {
      const classIndex = Math.floor(Math.random() * model.classes.length)
      mockPredictions.push({
        className: model.classes[classIndex],
        confidence: 0.75 + Math.random() * 0.24,
        bbox: {
          x: 50 + Math.random() * 200,
          y: 50 + Math.random() * 200,
          width: 80 + Math.random() * 120,
          height: 80 + Math.random() * 120,
        },
      })
    }
    setPredictions(mockPredictions)
    setIsPredicting(false)
  }

  function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => {
        setUploadedImage(event.target?.result as string)
        setSelectedImage({ id: 'upload', name: file.name, width: 640, height: 480 })
        setPredictions([])
      }
      reader.readAsDataURL(file)
    }
  }

  return (
    <div style={{ animation: 'slideIn 0.3s ease-out' }}>
      <div className="page-header">
        <div>
          <div className="breadcrumb">
            <Link to="/">科宝训练平台</Link> ›
            <Link to="/models">模型管理</Link> ›
            <span>{model.name}</span> ›
            <span>可视化</span>
          </div>
          <h1 className="page-title">{model.name} - 模型可视化</h1>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <span className={`badge ${model.status === 'published' ? 'badge-published' : 'badge-pending'}`}>
            {model.status === 'published' ? '已发布' : '待发布'}
          </span>
        </div>
      </div>

      {/* Evaluation Metrics */}
      <div style={{ padding: '24px 32px' }}>
        <div className="card" style={{ padding: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
            <Target size={15} style={{ color: 'var(--accent-bright)' }} />
            <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)' }}>训练评估指标</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
            <MetricCard label="mAP@0.5" value={model.mAP.toFixed(3)} color="var(--accent-bright)" trend="up" />
            <MetricCard label="Precision" value={model.precision.toFixed(3)} color="var(--teal)" trend="up" />
            <MetricCard label="Recall" value={model.recall.toFixed(3)} color="var(--warning)" trend="up" />
            <MetricCard label="F1 Score" value={model.f1.toFixed(3)} color="var(--success)" trend="up" />
          </div>
          <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid var(--border-dim)', display: 'flex', gap: 24, fontSize: 12, color: 'var(--text-muted)' }}>
            <span>基础模型: <span style={{ color: 'var(--text-primary)', fontFamily: 'JetBrains Mono' }}>{model.baseModel}</span></span>
            <span>输入尺寸: <span style={{ color: 'var(--text-primary)' }}>{model.imgSize} × {model.imgSize}</span></span>
            <span>模型大小: <span style={{ color: 'var(--text-primary)' }}>{model.size}</span></span>
            <span>训练时间: <span style={{ color: 'var(--text-primary)' }}>{model.trainedAt}</span></span>
          </div>
        </div>
      </div>

      {/* Validation Interface */}
      <div style={{ padding: '0 32px 32px' }}>
        <div className="card" style={{ padding: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
            <Package size={15} style={{ color: 'var(--accent-bright)' }} />
            <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)' }}>模型验证</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: 24 }}>
            {/* Left Panel - Image Selection */}
            <div style={{ borderRight: '1px solid var(--border-dim)', paddingRight: 24 }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <button
                  className={`btn ${imageSource === 'upload' ? 'btn-primary' : 'btn-secondary'}`}
                  onClick={() => setImageSource('upload')}
                >
                  <Upload size={14} /> 本地上传
                </button>
                <button
                  className={`btn ${imageSource === 'testset' ? 'btn-primary' : 'btn-secondary'}`}
                  onClick={() => setImageSource('testset')}
                >
                  <ImageIcon size={14} /> 测试集图片
                </button>
                <button
                  className={`btn ${imageSource === 'dataset' ? 'btn-primary' : 'btn-secondary'}`}
                  onClick={() => {
                    setImageSource('dataset')
                    setSelectedDataset(DATASETS[0]?.id || '')
                  }}
                >
                  <Database size={14} /> 标注平台数据集
                </button>
              </div>

              {imageSource === 'upload' && (
                <div style={{ marginTop: 20 }}>
                  <label className="form-label">选择图片文件</label>
                  <div style={{
                    border: '2px dashed var(--border-default)',
                    borderRadius: 8,
                    padding: '24px',
                    textAlign: 'center',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                  }}
                    onClick={() => document.getElementById('file-upload')?.click()}
                  >
                    <Upload size={24} style={{ color: 'var(--text-muted)', marginBottom: 8 }} />
                    <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                      {uploadedImage ? '点击更换图片' : '点击或拖拽上传图片'}
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>
                      支持 JPG、PNG、WebP 格式
                    </div>
                  </div>
                  <input
                    id="file-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    style={{ display: 'none' }}
                  />
                </div>
              )}

              {imageSource === 'testset' && (
                <div style={{ marginTop: 20 }}>
                  <label className="form-label">测试集图片</label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
                    {TEST_IMAGES.map(img => (
                      <div
                        key={img.id}
                        className="select-card"
                        style={{
                          borderColor: selectedImage?.id === img.id ? 'var(--accent)' : undefined,
                          cursor: 'pointer',
                          padding: 8,
                        }}
                        onClick={() => {
                          setSelectedImage(img)
                          setPredictions([])
                        }}
                      >
                        <div style={{
                          width: '100%',
                          aspectRatio: '4/3',
                          background: 'var(--bg-elevated)',
                          borderRadius: 6,
                          marginBottom: 6,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}>
                          <ImageIcon size={20} style={{ color: 'var(--text-muted)' }} />
                        </div>
                        <div style={{ fontSize: 10, color: 'var(--text-muted)', textAlign: 'center' }}>
                          {img.name}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {imageSource === 'dataset' && (
                <div style={{ marginTop: 20 }}>
                  <label className="form-label">选择数据集</label>
                  <select
                    className="form-input"
                    value={selectedDataset}
                    onChange={e => {
                      setSelectedDataset(e.target.value)
                      const ds = DATASETS.find(d => d.id === e.target.value)
                      if (ds?.imagesList?.[0]) {
                        setSelectedImage(ds.imagesList[0])
                      }
                      setPredictions([])
                    }}
                  >
                    {DATASETS.map(ds => (
                      <option key={ds.id} value={ds.id}>{ds.name} ({ds.images} 张)</option>
                    ))}
                  </select>

                  <div style={{ marginTop: 16 }}>
                    <label className="form-label">数据集图片</label>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
                      {availableImages.map(img => (
                        <div
                          key={img.id}
                          className="select-card"
                          style={{
                            borderColor: selectedImage?.id === img.id ? 'var(--accent)' : undefined,
                            cursor: 'pointer',
                            padding: 8,
                          }}
                          onClick={() => {
                            setSelectedImage(img)
                            setPredictions([])
                          }}
                        >
                          <div style={{
                            width: '100%',
                            aspectRatio: '4/3',
                            background: 'var(--bg-elevated)',
                            borderRadius: 6,
                            marginBottom: 6,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}>
                            <ImageIcon size={20} style={{ color: 'var(--text-muted)' }} />
                          </div>
                          <div style={{ fontSize: 10, color: 'var(--text-muted)', textAlign: 'center' }}>
                            {img.name}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Right Panel - Prediction Result */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                  {currentImage?.name || '未选择图片'}
                </div>
                <button
                  className="btn btn-primary"
                  onClick={runPrediction}
                  disabled={!currentImage || isPredicting}
                >
                  <Zap size={14} /> {isPredicting ? '预测中...' : '运行预测'}
                </button>
              </div>

              <div style={{
                position: 'relative',
                background: 'var(--bg-elevated)',
                borderRadius: 12,
                overflow: 'hidden',
                aspectRatio: '4/3',
                minHeight: 300,
              }}>
                {uploadedImage ? (
                  <img
                    src={uploadedImage}
                    alt="Uploaded"
                    style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                  />
                ) : (
                  <div style={{
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'var(--bg-elevated)',
                  }}>
                    <ImageIcon size={40} style={{ color: 'var(--text-muted)' }} />
                  </div>
                )}

                {/* Prediction boxes */}
                {isPredicting && (
                  <div style={{
                    position: 'absolute',
                    inset: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'rgba(0,0,0,0.5)',
                  }}>
                    <div style={{
                      width: 40,
                      height: 40,
                      border: 3,
                      borderStyle: 'solid',
                      borderColor: 'transparent var(--accent) var(--accent) var(--accent)',
                      borderRadius: '50%',
                      animation: 'spin 1s linear infinite',
                    }} />
                  </div>
                )}

                {predictions.map((pred, index) => {
                  const color = model.classColors[model.classes.indexOf(pred.className)] || '#1d4ed8'
                  return (
                    <div
                      key={index}
                      style={{
                        position: 'absolute',
                        left: `${(pred.bbox.x / 640) * 100}%`,
                        top: `${(pred.bbox.y / 480) * 100}%`,
                        width: `${(pred.bbox.width / 640) * 100}%`,
                        height: `${(pred.bbox.height / 480) * 100}%`,
                        border: `2px solid ${color}`,
                        borderRadius: 4,
                        boxShadow: `0 0 8px ${color}40`,
                      }}
                    >
                      <div style={{
                        position: 'absolute',
                        top: '-24px',
                        left: 0,
                        background: color,
                        color: 'white',
                        fontSize: 10,
                        padding: '2px 6px',
                        borderRadius: 2,
                        whiteSpace: 'nowrap',
                      }}>
                        {pred.className} {pred.confidence.toFixed(2)}
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Prediction Results List */}
              {predictions.length > 0 && (
                <div style={{ marginTop: 16 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 10 }}>
                    检测结果 ({predictions.length} 个目标)
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {predictions.map((pred, index) => {
                      const color = model.classColors[model.classes.indexOf(pred.className)] || '#1d4ed8'
                      const isHighConfidence = pred.confidence >= 0.85
                      return (
                        <div
                          key={index}
                          className="badge"
                          style={{
                            background: `${color}15`,
                            color: color,
                            borderColor: `${color}30`,
                          }}
                        >
                          {isHighConfidence ? <CheckCircle2 size={10} /> : <AlertCircle size={10} />}
                          <span>{pred.className}</span>
                          <span style={{ fontFamily: 'JetBrains Mono', fontSize: 10 }}>
                            {pred.confidence.toFixed(2)}
                          </span>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Legend */}
              <div style={{ marginTop: 20, paddingTop: 16, borderTop: '1px solid var(--border-dim)' }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 10 }}>
                  类别图例
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
                  {model.classes.map((cls, index) => (
                    <div key={cls} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <div style={{
                        width: 12,
                        height: 12,
                        borderRadius: 3,
                        background: model.classColors[index] || '#1d4ed8',
                      }} />
                      <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{cls}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function MetricCard({ label, value, color, trend }: { label: string; value: string; color: string; trend: 'up' | 'down' }) {
  return (
    <div className="stat-card" style={{ padding: 16 }}>
      <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>{label}</div>
      <div style={{ fontFamily: 'JetBrains Mono', fontSize: 24, fontWeight: 600, color }}>{value}</div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 4 }}>
        <div style={{ width: 12, height: 12, borderRadius: '50%', background: 'var(--success-glow)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <CheckCircle2 size={8} style={{ color: 'var(--success)' }} />
        </div>
        <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>优于基线</span>
      </div>
    </div>
  )
}