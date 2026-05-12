import { createFileRoute, Link } from '@tanstack/react-router'
import { useState } from 'react'
import {
  Package,
  Tag,
  Clock,
  CheckCircle2,
  ArrowLeft,
  User,
  Layers,
  Upload,
  ImageIcon,
  AlertCircle,
  Zap,
  Globe,
  Shield,
} from 'lucide-react'
import { NotFound } from '../../components/NotFound'
import { PLAZA_MODELS } from '../../data/plaza-models'
import { TEST_IMAGES } from '../../data/train-tasks'

export const Route = createFileRoute('/plaza/$modelId')({
  component: PlazaDetail,
})

type ImageSource = 'upload' | 'testset'

interface Prediction {
  className: string
  confidence: number
  bbox: { x: number; y: number; width: number; height: number }
}

function PlazaDetail() {
  const { modelId } = Route.useParams()
  const model = PLAZA_MODELS.find(m => m.id === modelId)
  if (!model) return <NotFound />

  const latestVersion = model.versions[0]
  const hasMetrics = !!latestVersion.metrics
  const modelClasses = model.classes
  const modelClassColors = model.classColors

  const [imageSource, setImageSource] = useState<ImageSource>('testset')
  const [selectedImage, setSelectedImage] = useState(TEST_IMAGES[0])
  const [uploadedImage, setUploadedImage] = useState<string | null>(null)
  const [predictions, setPredictions] = useState<Prediction[]>([])
  const [isPredicting, setIsPredicting] = useState(false)

  const currentImage = imageSource === 'upload' && uploadedImage
    ? { name: '上传的图片', width: 640, height: 480 }
    : selectedImage

  async function runPrediction() {
    setIsPredicting(true)
    await new Promise(r => setTimeout(r, 1500))

    const mockPredictions: Prediction[] = []
    const numBoxes = Math.floor(Math.random() * 3) + 1
    for (let i = 0; i < numBoxes; i++) {
      const classIndex = Math.floor(Math.random() * modelClasses.length)
      mockPredictions.push({
        className: modelClasses[classIndex],
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
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Link to="/plaza" className="btn btn-ghost btn-sm">
            <ArrowLeft size={14} /> 返回
          </Link>
          <div>
            <div className="breadcrumb">
              <Link to="/">科宝训练平台</Link> ›
              <Link to="/plaza">模型广场</Link> ›
              <span>{model.name}</span>
            </div>
            <h1 className="page-title">{model.name}</h1>
          </div>
        </div>
      </div>

      <div className="p-content">
        <div className="model-detail-grid">
          <div>
            {/* ── Model Info Card ── */}
            <div className="card" style={{ padding: 24 }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16, marginBottom: 20 }}>
                <div className="model-icon">
                  <Package size={28} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 24, fontWeight: 700, color: 'var(--text-primary)' }}>{model.name}</div>
                  <p style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{model.description}</p>
                </div>
                <span className="badge" style={{
                  background: model.source === 'platform' ? 'var(--accent-glow)' : 'rgba(230, 162, 60, 0.12)',
                  color: model.source === 'platform' ? 'var(--accent)' : 'var(--warning)',
                  borderColor: model.source === 'platform' ? 'rgba(64,158,255,0.3)' : 'rgba(230,162,60,0.3)',
                }}>
                  {model.source === 'platform' ? <Shield size={10} /> : <Globe size={10} />}
                  {model.source === 'platform' ? '平台自有' : model.sourceLabel || '公开模型'}
                </span>
              </div>

              <div style={{ display: 'flex', gap: 24, paddingBottom: 20, marginBottom: 16, borderBottom: '1px solid var(--border-dim)' }}>
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
                  <span>{model.architectureName}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 10, color: 'var(--text-muted)' }}>
                  <Layers size={12} />
                  <span>最新版本 {latestVersion.version}</span>
                </div>
              </div>

              <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 16 }}>检测类别</div>
              {model.classes.length > 0 ? (
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
              ) : (
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>该模型未定义检测类别（可能为大语言模型）</div>
              )}

            </div>

            

            {/* Visualization */}
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
                            className="select-card"
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
                      const color = modelClassColors[modelClasses.indexOf(pred.className)] || '#409eff'
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
                          const color = modelClassColors[modelClasses.indexOf(pred.className)] || '#409eff'
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
                            style={{ background: model.classColors[index] || '#409eff' }}
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

          {/* ── Right Sidebar ── */}
          <div className="model-detail-sidebar">
            {/* Quick actions */}
            <div className="card card-padded" style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 16 }}>快捷操作</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <Link to="/train/create" className="btn btn-primary">
                  <Zap size={14} /> 以此模型开始训练
                </Link>
                <Link to="/validate/create" className="btn btn-teal">
                  <CheckCircle2 size={14} /> 验证该模型
                </Link>
                <a href="https://kebao-platform.example.com" className="btn btn-teal" target="_blank" rel="noopener noreferrer">
                  前往科宝平台使用模型
                </a>
              </div>
            </div>

            

            {/* Source info */}
            <div className="card card-padded" style={{ marginTop: 16 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 8 }}>来源信息</div>
              <div className="data-row">
                <span className="data-row-label">来源类型</span>
                <span className="data-row-value" style={{ fontFamily: 'inherit', fontSize: 12 }}>
                  {model.source === 'platform' ? '平台模型' : '公共模型'}
                </span>
              </div>
              <div className="data-row">
                <span className="data-row-label">来源说明</span>
                <span className="data-row-value" style={{ fontFamily: 'inherit', fontSize: 12 }}>
                  {model.sourceLabel || '—'}
                </span>
              </div>
              <div className="data-row">
                <span className="data-row-label">训练架构</span>
                <span className="data-row-value" style={{ fontFamily: 'inherit', fontSize: 12 }}>
                  {model.architectureName}
                </span>
              </div>
            </div>

            {/* 参数信息 */}
            <div className="card card-padded" style={{ marginTop: 16 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 8 }}>参数信息</div>
              
              <div className="data-row">
                <span className="data-row-label">当前版本</span>
                <span className="data-row-value">{latestVersion.version}</span>
              </div>

              <div className="data-row">
                <span className="data-row-label">文件大小</span>
                <span className="data-row-value">{latestVersion.fileSize}</span>
              </div>

              <div className="data-row">
                <span className="data-row-label">输入尺寸</span>
                <span className="data-row-value">{latestVersion.inputSize}</span>
              </div>

              <div className="data-row">
                <span className="data-row-label">文件格式</span>
                <span className="data-row-value">{latestVersion.fileFormat}</span>
              </div>
              

              
              {hasMetrics ? ( <>
                <div className="data-row">
                  <span className="data-row-label">mAP@0.5</span>
                  <span className="data-row-value">{latestVersion.metrics!.mAP.toFixed(3)}</span>
                </div>
                <div className="data-row">
                  <span className="data-row-label">Precision</span>
                  <span className="data-row-value">{latestVersion.metrics!.precision.toFixed(3)}</span>
                </div>
                <div className="data-row">
                  <span className="data-row-label">Recall</span>
                  <span className="data-row-value">{latestVersion.metrics!.recall.toFixed(3)}</span>
                </div>
                <div className="data-row">
                  <span className="data-row-label">F1 Score</span>
                  <span className="data-row-value">{latestVersion.metrics!.f1.toFixed(3)}</span>
                </div>
                
              </ >) : (
                <div style={{ padding: 16, background: 'var(--bg-elevated)', borderRadius: 4, fontSize: 12, color: 'var(--text-muted)' }}>
                  该模型暂未包含评估指标。公开预训练模型的指标请参考其官方文档。
                </div>
              )}

            </div>

          </div>
        </div>
      </div>
    </div>
  )
}

