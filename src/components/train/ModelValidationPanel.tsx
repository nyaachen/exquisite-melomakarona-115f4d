import { useState } from 'react'
import {
  Package,
  Upload,
  ImageIcon,
  Zap,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react'
import type { TestImage } from '../../data/train-tasks'

interface Prediction {
  className: string
  confidence: number
  bbox: { x: number; y: number; width: number; height: number }
}

type ImageSource = 'upload' | 'testset'

export function ModelValidationPanel({
  taskId,
  classes,
  classColors,
  testImages,
}: {
  taskId: string
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
    <div className="card card-padded mb-5">
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
        <Package size={15} style={{ color: 'var(--accent-bright)' }} />
        <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)' }}>模型验证</span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: 20 }}>
        {/* Left Panel - Image Selection */}
        <div style={{ borderRight: '1px solid var(--border-dim)', paddingRight: 20 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <button
              className={`btn btn-sm ${imageSource === 'upload' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setImageSource('upload')}
            >
              <Upload size={12} /> 本地上传
            </button>
            <button
              className={`btn btn-sm ${imageSource === 'testset' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setImageSource('testset')}
            >
              <ImageIcon size={12} /> 测试集图片
            </button>
          </div>

          {imageSource === 'upload' && (
            <div style={{ marginTop: 16 }}>
              <label className="form-label text-xs">选择图片文件</label>
              <div style={{
                border: '2px dashed var(--border-default)',
                borderRadius: 6,
                padding: '16px',
                textAlign: 'center',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
                onClick={() => document.getElementById(`file-upload-${taskId}`)?.click()}
              >
                <Upload size={20} style={{ color: 'var(--text-muted)', marginBottom: 6 }} />
                <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>
                  {uploadedImage ? '点击更换图片' : '点击或拖拽上传图片'}
                </div>
                <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 3 }}>
                  支持 JPG、PNG、WebP 格式
                </div>
              </div>
              <input
                id={`file-upload-${taskId}`}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                style={{ display: 'none' }}
              />
            </div>
          )}

          {imageSource === 'testset' && (
            <div style={{ marginTop: 16 }}>
              <label className="form-label text-xs">测试集图片</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6 }}>
                {testImages.map(img => (
                  <div
                    key={img.id}
                    className="select-card"
                    style={{
                      borderColor: selectedImage?.id === img.id ? 'var(--accent)' : undefined,
                      cursor: 'pointer',
                      padding: 6,
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
                      borderRadius: 4,
                      marginBottom: 4,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}>
                      <ImageIcon size={16} style={{ color: 'var(--text-muted)' }} />
                    </div>
                    <div style={{ fontSize: 9, color: 'var(--text-muted)', textAlign: 'center' }}>
                      {img.name}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Panel - Prediction Result */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
              {currentImage?.name || '未选择图片'}
            </div>
            <button
              className="btn btn-primary btn-sm"
              onClick={runPrediction}
              disabled={!currentImage || isPredicting}
            >
              <Zap size={12} /> {isPredicting ? '预测中...' : '运行预测'}
            </button>
          </div>

          <div style={{
            position: 'relative',
            background: 'var(--bg-elevated)',
            borderRadius: 8,
            overflow: 'hidden',
            aspectRatio: '4/3',
            minHeight: 240,
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
                <ImageIcon size={32} style={{ color: 'var(--text-muted)' }} />
              </div>
            )}

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
                  width: 32,
                  height: 32,
                  border: 2,
                  borderStyle: 'solid',
                  borderColor: 'transparent var(--accent) var(--accent) var(--accent)',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite',
                }} />
              </div>
            )}

            {predictions.map((pred, index) => {
              const color = classColors[classes.indexOf(pred.className)] || '#409eff'
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
                    borderRadius: 3,
                    boxShadow: `0 0 6px ${color}40`,
                  }}
                >
                  <div style={{
                    position: 'absolute',
                    top: '-20px',
                    left: 0,
                    background: color,
                    color: 'white',
                    fontSize: 9,
                    padding: '2px 4px',
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
            <div style={{ marginTop: 12 }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 8 }}>
                检测结果 ({predictions.length} 个目标)
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {predictions.map((pred, index) => {
                  const color = classColors[classes.indexOf(pred.className)] || '#409eff'
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
                      {isHighConfidence ? <CheckCircle2 size={9} /> : <AlertCircle size={9} />}
                      <span>{pred.className}</span>
                      <span style={{ fontFamily: 'JetBrains Mono', fontSize: 9 }}>
                        {pred.confidence.toFixed(2)}
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Legend */}
          <div style={{ marginTop: 16, paddingTop: 12, borderTop: '1px solid var(--border-dim)' }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 8 }}>
              类别图例
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
              {classes.map((cls, index) => (
                <div key={cls} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <div style={{
                    width: 10,
                    height: 10,
                    borderRadius: 2,
                    background: classColors[index] || '#409eff',
                  }} />
                  <span style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{cls}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
