import { createFileRoute, Link } from '@tanstack/react-router'
import { useState } from 'react'
import {
  Package,
  Tag,
  Clock,
  CheckCircle2,
  TrendingUp,
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  User,
  Layers,
  Archive,
  Upload,
  ImageIcon,
  Database,
  AlertCircle,
  Zap,
} from 'lucide-react'
import { SearchableDropdown } from '../../components/SearchableDropdown'

export const Route = createFileRoute('/models/$modelId')({
  component: ModelDetail,
})

interface ModelVersion {
  version: string
  mAP: number
  precision: number
  recall: number
  f1: number
  trainedAt: string
  taskId: string
  status: 'published' | 'archived'
}

interface SquareModel {
  id: string
  name: string
  description: string
  category: string
  baseModel: string
  classes: string[]
  classColors: string[]
  totalVersions: number
  publishedVersions: number
  latestVersion: string
  latestMAP: number
  latestF1: number
  createdAt: string
  author: string
  versions: ModelVersion[]
  size?: string
  imgSize?: number
  valImages?: number
}

const SQUARE_MODELS: SquareModel[] = [
  {
    id: 'sq-model-001',
    name: '道路缺陷检测',
    description: '支持裂缝、坑洼、破损、剥落、标线模糊、积水、障碍物等道路病害检测',
    category: '缺陷检测',
    baseModel: 'YOLOv8m',
    classes: ['裂缝', '坑洼', '破损', '剥落', '标线模糊', '积水', '障碍物'],
    classColors: ['#1d4ed8', '#ef4444', '#f59e0b', '#8b5cf6', '#10b981', '#06b6d4', '#6366f1'],
    totalVersions: 3,
    publishedVersions: 2,
    latestVersion: 'v2.3',
    latestMAP: 0.782,
    latestF1: 0.788,
    createdAt: '2026-03-15',
    author: '张工',
    size: '51.7 MB',
    imgSize: 640,
    valImages: 975,
    versions: [
      { version: 'v2.3', mAP: 0.782, precision: 0.831, recall: 0.748, f1: 0.788, trainedAt: '2026-04-29 11:30', taskId: 'task-001', status: 'published' },
      { version: 'v2.2', mAP: 0.751, precision: 0.812, recall: 0.701, f1: 0.752, trainedAt: '2026-04-10 09:15', taskId: 'task-old-001', status: 'published' },
      { version: 'v2.1', mAP: 0.698, precision: 0.765, recall: 0.652, f1: 0.704, trainedAt: '2026-03-28 14:20', taskId: 'task-old-002', status: 'archived' },
    ],
  },
  {
    id: 'sq-model-002',
    name: '施工安全帽检测',
    description: '精准检测施工人员安全帽佩戴情况，支持安全帽、无安全帽、人员三类目标',
    category: '安全检测',
    baseModel: 'YOLOv8s',
    classes: ['安全帽', '无安全帽', '人员'],
    classColors: ['#1d4ed8', '#ef4444', '#10b981'],
    totalVersions: 2,
    publishedVersions: 1,
    latestVersion: 'v1.0',
    latestMAP: 0.923,
    latestF1: 0.924,
    createdAt: '2026-04-20',
    author: '李工',
    size: '22.4 MB',
    imgSize: 640,
    valImages: 478,
    versions: [
      { version: 'v1.0', mAP: 0.923, precision: 0.941, recall: 0.908, f1: 0.924, trainedAt: '2026-04-28 18:12', taskId: 'task-002', status: 'published' },
    ],
  },
  {
    id: 'sq-model-003',
    name: '人员跌倒检测',
    description: '实时检测人员跌倒行为，适用于监控场景下的安全预警',
    category: '行为检测',
    baseModel: 'YOLOv8s',
    classes: ['正常站立', '跌倒'],
    classColors: ['#10b981', '#ef4444'],
    totalVersions: 2,
    publishedVersions: 1,
    latestVersion: 'v1.0',
    latestMAP: 0.887,
    latestF1: 0.888,
    createdAt: '2026-04-18',
    author: '王工',
    size: '22.1 MB',
    imgSize: 640,
    valImages: 642,
    versions: [
      { version: 'v1.0', mAP: 0.887, precision: 0.912, recall: 0.865, f1: 0.888, trainedAt: '2026-04-26 17:40', taskId: 'task-005', status: 'published' },
    ],
  },
  {
    id: 'sq-model-004',
    name: '火焰烟雾检测',
    description: '快速识别火焰和烟雾，及时预警火灾风险',
    category: '安全检测',
    baseModel: 'YOLOv8m',
    classes: ['火焰', '浓烟', '轻烟'],
    classColors: ['#ef4444', '#6b7280', '#9ca3af'],
    totalVersions: 3,
    publishedVersions: 2,
    latestVersion: 'v2.1',
    latestMAP: 0.911,
    latestF1: 0.912,
    createdAt: '2026-04-05',
    author: '赵工',
    size: '51.2 MB',
    imgSize: 640,
    valImages: 856,
    versions: [
      { version: 'v2.1', mAP: 0.911, precision: 0.928, recall: 0.897, f1: 0.912, trainedAt: '2026-04-25 14:03', taskId: 'task-006', status: 'published' },
      { version: 'v2.0', mAP: 0.875, precision: 0.895, recall: 0.858, f1: 0.876, trainedAt: '2026-04-12 10:30', taskId: 'task-old-003', status: 'published' },
      { version: 'v1.5', mAP: 0.812, precision: 0.834, recall: 0.791, f1: 0.812, trainedAt: '2026-03-30 16:45', taskId: 'task-old-004', status: 'archived' },
    ],
  },
]

const TEST_IMAGES = [
  { id: 'test-001', name: 'test_0001.jpg', width: 640, height: 480 },
  { id: 'test-002', name: 'test_0002.jpg', width: 640, height: 480 },
  { id: 'test-003', name: 'test_0003.jpg', width: 640, height: 480 },
  { id: 'test-004', name: 'test_0004.jpg', width: 640, height: 480 },
  { id: 'test-005', name: 'test_0005.jpg', width: 640, height: 480 },
]

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

function ModelDetail() {
  const { modelId } = Route.useParams()
  const model = SQUARE_MODELS.find(m => m.id === modelId) || SQUARE_MODELS[0]
  
  const sortedVersions = [...model.versions].sort((a, b) => 
    new Date(b.trainedAt).getTime() - new Date(a.trainedAt).getTime()
  )
  
  const [selectedVersion, setSelectedVersion] = useState<string>(model.latestVersion)
  const [showVersionDropdown, setShowVersionDropdown] = useState(false)
  
  const currentVersion = sortedVersions.find(v => v.version === selectedVersion) || sortedVersions[0]

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
    <div className="slide-in">
      <div className="page-header">
        <div>
          <div className="breadcrumb">
            <Link to="/">科宝训练平台</Link> ›
            <Link to="/models">模型管理</Link> ›
            <span>{model.name}</span>
          </div>
          <h1 className="page-title">{model.name}</h1>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <Link to="/models" className="btn btn-secondary">
            <ArrowLeft size={14} /> 返回列表
          </Link>
        </div>
      </div>

      <div className="p-content">
        <div className="model-detail-grid">
          <div>
            <div className="card" style={{ padding: 24 }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16, marginBottom: 20 }}>
                <div className="model-icon">
                  <Package size={28} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 24, fontWeight: 700, color: 'var(--text-primary)' }}>{model.name}</div>
                  <p style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{model.description}</p>
                </div>
                <span className="badge badge-published">
                  <CheckCircle2 size={10} /> 已发布
                </span>
              </div>

              <div style={{ display: 'flex', gap: 24, paddingBottom: 20, borderBottom: '1px solid var(--border-dim)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 10, color: 'var(--text-muted)' }}>
                  <User size={12} />
                  <span>{model.author}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 10, color: 'var(--text-muted)' }}>
                  <Clock size={12} />
                  <span>创建于 {model.createdAt}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 10, color: 'var(--text-muted)' }}>
                  <Tag size={12} />
                  <span>{model.category}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 10, color: 'var(--text-muted)' }}>
                  <Layers size={12} />
                  <span>基础: {model.baseModel}</span>
                </div>
              </div>

              <div style={{ marginTop: 20 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                  <span style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-primary)' }}>当前版本: {selectedVersion}</span>
                  
                  <div style={{ position: 'relative' }}>
                    <button
                      className="btn btn-sm btn-secondary"
                      onClick={() => setShowVersionDropdown(!showVersionDropdown)}
                    >
                      切换版本
                      {showVersionDropdown ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                    </button>
                    
                    {showVersionDropdown && (
                      <VersionDropdown
                        versions={sortedVersions}
                        selectedVersion={selectedVersion}
                        onSelect={(v) => {
                          setSelectedVersion(v)
                          setShowVersionDropdown(false)
                        }}
                      />
                    )}
                  </div>
                </div>

                <div className="card card-padded">
                  <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 16 }}>版本 {selectedVersion} 评估指标</div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
                    <MetricCard label="mAP@0.5" value={currentVersion.mAP.toFixed(3)} color="var(--accent-bright)" />
                    <MetricCard label="Precision" value={currentVersion.precision.toFixed(3)} color="var(--teal)" />
                    <MetricCard label="Recall" value={currentVersion.recall.toFixed(3)} color="var(--warning)" />
                    <MetricCard label="F1 Score" value={currentVersion.f1.toFixed(3)} color="var(--success)" />
                  </div>
                  <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid var(--border-dim)', display: 'flex', gap: 24, fontSize: 10, color: 'var(--text-muted)' }}>
                    <span>训练时间: <span style={{ color: 'var(--text-secondary)' }}>{currentVersion.trainedAt}</span></span>
                    <span>训练任务: <span style={{ color: 'var(--text-secondary)', fontFamily: "'JetBrains Mono', monospace" }}>{currentVersion.taskId}</span></span>
                  </div>
                </div>
              </div>
            </div>

            <div className="card" style={{ padding: 24, marginTop: 24 }}>
              <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 16 }}>检测类别</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                {model.classes.map((cls, index) => (
                  <div key={cls} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div 
                      className="class-color"
                      style={{ background: model.classColors[index] || `hsl(${(index * 50) % 360}, 70%, 50%)` }} 
                    />
                    <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{cls}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="card" style={{ padding: 24, marginTop: 24 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
                <Package size={15} style={{ color: 'var(--accent-bright)' }} />
                <span style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-primary)' }}>模型验证</span>
              </div>

              <div className="prediction-grid">
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
                      <div 
                        className="upload-area"
                        onClick={() => document.getElementById('file-upload')?.click()}
                      >
                        <Upload size={24} style={{ color: 'var(--text-muted)', marginBottom: 8 }} />
                        <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                          {uploadedImage ? '点击更换图片' : '点击或拖拽上传图片'}
                        </div>
                        <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 4 }}>
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
                      <div className="image-select-grid">
                        {TEST_IMAGES.map(img => (
                          <div
                            key={img.id}
                            className={`select-card${selectedImage?.id === img.id ? '' : ''}`}
                            style={{ cursor: 'pointer', padding: 8, borderColor: selectedImage?.id === img.id ? 'var(--accent)' : undefined }}
                            onClick={() => {
                              setSelectedImage(img)
                              setPredictions([])
                            }}
                          >
                            <div className="image-placeholder">
                              <ImageIcon size={20} style={{ color: 'var(--text-muted)' }} />
                            </div>
                            <div style={{ fontSize: 10, color: 'var(--text-muted)', textAlign: 'center', marginTop: 6 }}>{img.name}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {imageSource === 'dataset' && (
                    <div style={{ marginTop: 20 }}>
                      <SearchableDropdown
                        label="选择数据集"
                        color="var(--success)"
                        selectedId={selectedDataset}
                        onChange={(id) => {
                          setSelectedDataset(id)
                          const ds = DATASETS.find(d => d.id === id)
                          if (ds?.imagesList?.[0]) setSelectedImage(ds.imagesList[0])
                          setPredictions([])
                        }}
                        items={DATASETS.map(ds => ({
                          id: ds.id,
                          name: ds.name,
                          count: ds.images,
                          countLabel: '张',
                        }))}
                        placeholder="选择数据集..."
                      />

                      <div style={{ marginTop: 16 }}>
                        <label className="form-label">数据集图片</label>
                        <div className="image-select-grid">
                          {availableImages.map(img => (
                            <div
                              key={img.id}
                              className={`select-card${selectedImage?.id === img.id ? '' : ''}`}
                              style={{ cursor: 'pointer', padding: 8, borderColor: selectedImage?.id === img.id ? 'var(--accent)' : undefined }}
                              onClick={() => {
                                setSelectedImage(img)
                                setPredictions([])
                              }}
                            >
                              <div className="image-placeholder">
                                <ImageIcon size={20} style={{ color: 'var(--text-muted)' }} />
                              </div>
                              <div style={{ fontSize: 10, color: 'var(--text-muted)', textAlign: 'center', marginTop: 6 }}>{img.name}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                    <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{currentImage?.name || '未选择图片'}</div>
                    <button
                      className="btn btn-primary"
                      onClick={runPrediction}
                      disabled={!currentImage || isPredicting}
                    >
                      <Zap size={14} /> {isPredicting ? '预测中...' : '运行预测'}
                    </button>
                  </div>

                  <div className="prediction-canvas">
                    {uploadedImage ? (
                      <img
                        src={uploadedImage}
                        alt="Uploaded"
                        style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                      />
                    ) : (
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                        <ImageIcon size={40} style={{ color: 'var(--text-muted)' }} />
                      </div>
                    )}

                    {isPredicting && (
                      <div className="predicting-overlay">
                        <div className="spinning-circle" />
                      </div>
                    )}

                    {predictions.map((pred, index) => {
                      const color = model.classColors[model.classes.indexOf(pred.className)] || '#1d4ed8'
                      return (
                        <div
                          key={index}
                          className="prediction-box"
                          style={{
                            left: `${(pred.bbox.x / 640) * 100}%`,
                            top: `${(pred.bbox.y / 480) * 100}%`,
                            width: `${(pred.bbox.width / 640) * 100}%`,
                            height: `${(pred.bbox.height / 480) * 100}%`,
                            borderColor: color,
                            boxShadow: `0 0 8px ${color}40`,
                          }}
                        >
                          <div 
                            className="prediction-label"
                            style={{ background: color }}
                          >
                            {pred.className} {pred.confidence.toFixed(2)}
                          </div>
                        </div>
                      )
                    })}
                  </div>

                  {predictions.length > 0 && (
                    <div style={{ marginTop: 16 }}>
                      <div style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 10 }}>
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
                                color,
                                borderColor: `${color}30`,
                              }}
                            >
                              {isHighConfidence ? <CheckCircle2 size={10} /> : <AlertCircle size={10} />}
                              <span>{pred.className}</span>
                              <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10 }}>{pred.confidence.toFixed(2)}</span>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )}

                  <div style={{ marginTop: 20, paddingTop: 16, borderTop: '1px solid var(--border-dim)' }}>
                    <div style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 10 }}>类别图例</div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
                      {model.classes.map((cls, index) => (
                        <div key={cls} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <div 
                            className="class-color-sm"
                            style={{ background: model.classColors[index] || '#1d4ed8' }} 
                          />
                          <span style={{ fontSize: 10, color: 'var(--text-secondary)' }}>{cls}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="model-detail-sidebar">
            <div className="card card-padded">
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                <Layers size={15} style={{ color: 'var(--accent-bright)' }} />
                <span style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-primary)' }}>版本历史</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {sortedVersions.map((ver, index) => (
                  <div
                    key={ver.version}
                    className={`select-card${ver.status === 'archived' ? ' opacity-60' : ''}`}
                    style={{ padding: 12, cursor: 'pointer', borderColor: selectedVersion === ver.version ? 'var(--accent)' : undefined }}
                    onClick={() => setSelectedVersion(ver.version)}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span className={`version-badge ${index === 0 ? 'version-badge-latest' : ''}`}>
                          {index + 1}
                        </span>
                        <span style={{ fontFamily: "'JetBrains Mono', monospace", fontWeight: 600, color: 'var(--text-primary)' }}>{ver.version}</span>
                        <span className={`badge ${ver.status === 'published' ? 'badge-published' : 'badge-archived'}`}>
                          {ver.status === 'published' ? <CheckCircle2 size={8} /> : <Archive size={8} />}
                          {ver.status === 'published' ? '已发布' : '已归档'}
                        </span>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: 16, fontSize: 10, color: 'var(--text-secondary)' }}>
                      <span>mAP: <span style={{ fontFamily: "'JetBrains Mono', monospace", color: 'var(--success)' }}>{ver.mAP.toFixed(3)}</span></span>
                      <span>F1: <span style={{ fontFamily: "'JetBrains Mono', monospace", color: 'var(--accent-bright)' }}>{ver.f1.toFixed(3)}</span></span>
                    </div>
                    <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 4 }}>训练于 {ver.trainedAt}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="card card-padded" style={{ marginTop: 24 }}>
              <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 16 }}>快速操作</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <button
                  className="btn btn-teal"
                  onClick={() => {}}
                >
                  <TrendingUp size={14} /> 在线验证模型
                </button>
                <Link
                  to="/models/manualUpload"
                  className="btn btn-secondary"
                >
                  <Package size={14} /> 上传新版本
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function VersionDropdown({ versions, selectedVersion, onSelect }: { versions: ModelVersion[]; selectedVersion: string; onSelect: (v: string) => void }) {
  return (
    <div className="version-dropdown">
      {versions.map(ver => (
        <button
          key={ver.version}
          className={`btn btn-ghost dropdown-item ${selectedVersion === ver.version ? 'dropdown-item-active' : ''}`}
          onClick={() => onSelect(ver.version)}
        >
          <span style={{ fontFamily: "'JetBrains Mono', monospace", marginRight: 8 }}>{ver.version}</span>
          <span className={`badge ${ver.status === 'published' ? 'badge-published' : 'badge-archived'}`}>
            {ver.status === 'published' ? <CheckCircle2 size={8} /> : <Archive size={8} />}
          </span>
        </button>
      ))}
    </div>
  )
}

function MetricCard({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="stat-card metric-card">
      <div style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 4 }}>{label}</div>
      <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 24, fontWeight: 600, color }}>{value}</div>
    </div>
  )
}