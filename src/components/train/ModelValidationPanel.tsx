import { useState } from 'react'
import {
  Package,
  Upload,
  ImageIcon,
  Zap,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react'

interface TestImage {
  id: string
  name: string
  width: number
  height: number
}

interface Prediction {
  className: string
  confidence: number
  bbox: { x: number; y: number; width: number; height: number }
}

type ImageSource = 'upload' | 'testset'

export function ModelValidationPanel({
  prefix,
  classes,
  classColors,
  testImages,
}: {
  prefix?: string
  classes: string[]
  classColors: string[]
  testImages: TestImage[]
}) {
  const [imageSource, setImageSource] = useState<ImageSource>('testset')
  const [selectedImage, setSelectedImage] = useState(testImages[0])
  const [uploadedImage, setUploadedImage] = useState<string | null>(null)
  const [predictions, setPredictions] = useState<Prediction[]>([])
  const [isPredicting, setIsPredicting] = useState(false)

  const currentImage = imageSource === 'upload' && uploadedImage
    ? { name: '上传的图片', width: 640, height: 480 }
    : selectedImage

  const fileInputId = `file-upload${prefix ? `-${prefix}` : ''}`

  async function runPrediction() {
    setIsPredicting(true)
    await new Promise(r => setTimeout(r, 1500))

    const mockPredictions: Prediction[] = []
    const numBoxes = Math.floor(Math.random() * 3) + 1
    for (let i = 0; i < numBoxes; i++) {
      const classIndex = Math.floor(Math.random() * classes.length)
      mockPredictions.push({
        className: classes[classIndex],
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
    <div className="card" style={{ padding: 24 }}>
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
                onClick={() => document.getElementById(fileInputId)?.click()}
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
                id={fileInputId}
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
                {testImages.map(img => (
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
              const color = classColors[classes.indexOf(pred.className)] || '#409eff'
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
                  const color = classColors[classes.indexOf(pred.className)] || '#409eff'
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
              {classes.map((cls, index) => (
                <div key={cls} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <div
                    className="class-color-sm"
                    style={{ background: classColors[index] || '#409eff' }}
                  />
                  <span style={{ fontSize: 10, color: 'var(--text-secondary)' }}>{cls}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
