import { createFileRoute, useParams, Link } from '@tanstack/react-router'
import { useState } from 'react'
import {
  ArrowLeft,
  Tag,
  Images,
  Calendar,
  User,
  MapPin,
  ZoomIn,
  X,
  ChevronRight,
} from 'lucide-react'

export const Route = createFileRoute('/datasets/$datasetId')({
  component: DatasetDetail,
})

// ─── Mock dataset data ──
const DATASETS = [
  {
    id: 'ds-001',
    name: '道路缺陷检测数据集 v2.3',
    description: '该数据集包含城市道路、高速公路等场景下的道路缺陷图像，用于训练道路缺陷检测模型。',
    contentTags: ['裂缝', '坑洼', '破损', '剥落', '标线模糊', '积水', '障碍物'],
    sceneTags: ['城市道路', '高速公路', '乡村道路', '桥梁隧道'],
    annotationCount: 4872,
    annotatedBy: '张工',
    createdAt: '2026-04-29',
    source: '科宝标注平台',
    images: [
      { id: 'img-001', url: 'https://neeko-copilot.bytedance.net/api/text2image?prompt=road%20surface%20crack%20defect%20closeup%20photography&image_size=landscape_4_3', label: '裂缝检测', bbox: { x: 120, y: 80, width: 200, height: 60 } },
      { id: 'img-002', url: 'https://neeko-copilot.bytedance.net/api/text2image?prompt=pothole%20on%20asphalt%20road%20surface%20photography&image_size=landscape_4_3', label: '坑洼检测', bbox: { x: 180, y: 150, width: 120, height: 80 } },
      { id: 'img-003', url: 'https://neeko-copilot.bytedance.net/api/text2image?prompt=damaged%20road%20surface%20with%20potholes%20photography&image_size=landscape_4_3', label: '破损检测', bbox: { x: 90, y: 120, width: 180, height: 100 } },
      { id: 'img-004', url: 'https://neeko-copilot.bytedance.net/api/text2image?prompt=road%20surface%20water%20ponding%20after%20rain%20photography&image_size=landscape_4_3', label: '积水检测', bbox: { x: 150, y: 100, width: 220, height: 140 } },
      { id: 'img-005', url: 'https://neeko-copilot.bytedance.net/api/text2image?prompt=faded%20road%20markings%20on%20asphalt%20photography&image_size=landscape_4_3', label: '标线模糊', bbox: { x: 80, y: 160, width: 280, height: 40 } },
      { id: 'img-006', url: 'https://neeko-copilot.bytedance.net/api/text2image?prompt=road%20obstacle%20debris%20on%20highway%20photography&image_size=landscape_4_3', label: '障碍物检测', bbox: { x: 200, y: 130, width: 80, height: 100 } },
    ]
  },
  {
    id: 'ds-002',
    name: '施工安全帽检测集',
    description: '建筑工地施工人员安全帽佩戴检测数据集，包含多种角度和光照条件下的样本。',
    contentTags: ['安全帽', '无安全帽', '人员'],
    sceneTags: ['建筑工地', '高空作业', '隧道施工', '厂房作业'],
    annotationCount: 2391,
    annotatedBy: '李工',
    createdAt: '2026-04-28',
    source: '科宝标注平台',
    images: [
      { id: 'img-001', url: 'https://neeko-copilot.bytedance.net/api/text2image?prompt=construction%20worker%20wearing%20yellow%20safety%20helmet%20photography&image_size=landscape_4_3', label: '安全帽', bbox: { x: 140, y: 40, width: 100, height: 80 } },
      { id: 'img-002', url: 'https://neeko-copilot.bytedance.net/api/text2image?prompt=construction%20worker%20without%20safety%20helmet%20photography&image_size=landscape_4_3', label: '无安全帽', bbox: { x: 160, y: 50, width: 80, height: 60 } },
      { id: 'img-003', url: 'https://neeko-copilot.bytedance.net/api/text2image?prompt=multiple%20construction%20workers%20on%20site%20photography&image_size=landscape_4_3', label: '人员', bbox: { x: 100, y: 60, width: 60, height: 180 } },
      { id: 'img-004', url: 'https://neeko-copilot.bytedance.net/api/text2image?prompt=construction%20worker%20blue%20helmet%20high%20altitude%20work%20photography&image_size=landscape_4_3', label: '安全帽', bbox: { x: 180, y: 30, width: 90, height: 70 } },
      { id: 'img-005', url: 'https://neeko-copilot.bytedance.net/api/text2image?prompt=construction%20team%20working%20on%20building%20site%20photography&image_size=landscape_4_3', label: '人员', bbox: { x: 120, y: 80, width: 70, height: 160 } },
      { id: 'img-006', url: 'https://neeko-copilot.bytedance.net/api/text2image?prompt=worker%20safety%20inspection%20construction%20site%20photography&image_size=landscape_4_3', label: '安全帽', bbox: { x: 150, y: 45, width: 85, height: 75 } },
    ]
  },
  {
    id: 'ds-003',
    name: '工厂设备异常检测集',
    description: '工业设备异常状态检测数据集，包含正常和异常状态的设备图像。',
    contentTags: ['正常设备', '异常设备', '待检修'],
    sceneTags: ['工厂车间', '生产线', '仓库设备', '机械设备'],
    annotationCount: 1628,
    annotatedBy: '王工',
    createdAt: '2026-04-29',
    source: '科宝标注平台',
    images: [
      { id: 'img-001', url: 'https://neeko-copilot.bytedance.net/api/text2image?prompt=industrial%20machine%20equipment%20normal%20state%20photography&image_size=landscape_4_3', label: '正常设备', bbox: { x: 60, y: 40, width: 320, height: 200 } },
      { id: 'img-002', url: 'https://neeko-copilot.bytedance.net/api/text2image?prompt=industrial%20machine%20equipment%20abnormal%20fault%20photography&image_size=landscape_4_3', label: '异常设备', bbox: { x: 80, y: 50, width: 280, height: 180 } },
      { id: 'img-003', url: 'https://neeko-copilot.bytedance.net/api/text2image?prompt=factory%20equipment%20maintenance%20repair%20photography&image_size=landscape_4_3', label: '待检修', bbox: { x: 100, y: 60, width: 240, height: 160 } },
      { id: 'img-004', url: 'https://neeko-copilot.bytedance.net/api/text2image?prompt=factory%20production%20line%20machinery%20photography&image_size=landscape_4_3', label: '正常设备', bbox: { x: 40, y: 30, width: 340, height: 220 } },
      { id: 'img-005', url: 'https://neeko-copilot.bytedance.net/api/text2image?prompt=industrial%20robot%20arm%20automation%20photography&image_size=landscape_4_3', label: '正常设备', bbox: { x: 120, y: 20, width: 200, height: 240 } },
      { id: 'img-006', url: 'https://neeko-copilot.bytedance.net/api/text2image?prompt=broken%20industrial%20machine%20equipment%20photography&image_size=landscape_4_3', label: '异常设备', bbox: { x: 70, y: 45, width: 300, height: 190 } },
    ]
  },
  {
    id: 'ds-004',
    name: '车牌识别数据集',
    description: '各种场景下的车牌图像数据集，支持多种车牌格式识别训练。',
    contentTags: ['车牌', '遮挡车牌', '模糊车牌'],
    sceneTags: ['城市道路', '停车场', '高速公路', '小区出入口'],
    annotationCount: 7840,
    annotatedBy: '赵工',
    createdAt: '2026-04-27',
    source: '科宝标注平台',
    images: [
      { id: 'img-001', url: 'https://neeko-copilot.bytedance.net/api/text2image?prompt=car%20license%20plate%20clear%20photography&image_size=landscape_4_3', label: '车牌', bbox: { x: 150, y: 100, width: 140, height: 45 } },
      { id: 'img-002', url: 'https://neeko-copilot.bytedance.net/api/text2image?prompt=car%20license%20plate%20obstructed%20partial%20covered%20photography&image_size=landscape_4_3', label: '遮挡车牌', bbox: { x: 160, y: 95, width: 120, height: 40 } },
      { id: 'img-003', url: 'https://neeko-copilot.bytedance.net/api/text2image?prompt=car%20license%20plate%20blurry%20motion%20blur%20photography&image_size=landscape_4_3', label: '模糊车牌', bbox: { x: 140, y: 105, width: 150, height: 50 } },
      { id: 'img-004', url: 'https://neeko-copilot.bytedance.net/api/text2image?prompt=car%20license%20plate%20night%20time%20photography&image_size=landscape_4_3', label: '车牌', bbox: { x: 130, y: 90, width: 160, height: 55 } },
      { id: 'img-005', url: 'https://neeko-copilot.bytedance.net/api/text2image?prompt=car%20license%20plate%20rainy%20weather%20photography&image_size=landscape_4_3', label: '模糊车牌', bbox: { x: 155, y: 100, width: 130, height: 45 } },
      { id: 'img-006', url: 'https://neeko-copilot.bytedance.net/api/text2image?prompt=car%20license%20plate%20covered%20by%20dirt%20photography&image_size=landscape_4_3', label: '遮挡车牌', bbox: { x: 145, y: 95, width: 145, height: 48 } },
    ]
  },
]

function DatasetDetail() {
  const params = Route.useParams()
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const dataset = DATASETS.find(d => d.id === params.datasetId) || DATASETS[0]

  return (
    <div>
      {/* Page Header */}
      <div className="page-header">
        <div className="breadcrumb">
          <Link to="/">科宝训练平台</Link> ›
          <Link to="/datasets">数据集管理</Link> ›
          <span>{dataset.name}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }}>
          <h1 className="page-title">{dataset.name}</h1>
          <Link to="/datasets" className="btn btn-secondary">
            <ArrowLeft size={15} /> 返回列表
          </Link>
        </div>
      </div>

      <div style={{ padding: '24px 32px', maxWidth: 1200, margin: '0 auto' }}>
        {/* Dataset Info Cards */}
        <div className="card" style={{ padding: 24, marginBottom: 24 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 24 }}>
            {/* Left Column - Stats */}
            <div>
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>标注数据数量</div>
                <div style={{ fontSize: 36, fontWeight: 700, color: 'var(--accent-bright)', fontFamily: 'JetBrains Mono' }}>
                  {dataset.annotationCount.toLocaleString()}
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <User size={16} style={{ color: 'var(--text-muted)' }} />
                  <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>创建人: {dataset.annotatedBy}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Calendar size={16} style={{ color: 'var(--text-muted)' }} />
                  <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>创建时间: {dataset.createdAt}</span>
                </div>
                {/* <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <MapPin size={16} style={{ color: 'var(--text-muted)' }} />
                  <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>来源: {dataset.source}</span>
                </div> */}
              </div>
            </div>

            {/* Right Column - Description */}
            <div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>数据集备注</div>
              <div style={{ fontSize: 14, color: 'var(--text-primary)', lineHeight: '1.6' }}>
                {dataset.description}
              </div>
            </div>
          </div>
        </div>

        {/* Tags Section */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 24 }}>
          <div className="card" style={{ padding: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12 }}>
              <Tag size={14} style={{ color: 'var(--accent-bright)' }} />
              <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>内容标签</span>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {dataset.contentTags.map(tag => (
                <span
                  key={tag}
                  style={{
                    background: 'rgba(27,107,239,0.1)',
                    color: 'var(--accent-bright)',
                    fontSize: 12,
                    padding: '4px 12px',
                    borderRadius: 20,
                    fontWeight: 500,
                  }}
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>

          <div className="card" style={{ padding: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12 }}>
              <MapPin size={14} style={{ color: 'var(--teal)' }} />
              <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>场景标签</span>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {dataset.sceneTags.map(tag => (
                <span
                  key={tag}
                  style={{
                    background: 'rgba(10,184,158,0.1)',
                    color: 'var(--teal)',
                    fontSize: 12,
                    padding: '4px 12px',
                    borderRadius: 20,
                    fontWeight: 500,
                  }}
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Image Preview Section */}
        <div className="card" style={{ padding: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContents: 'space-between', marginBottom: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Images size={16} style={{ color: 'var(--accent-bright)' }} />
              <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>标注数据预览</span>
            </div>
            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
              共 {dataset.images.length} 张预览图
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
            {dataset.images.map((img, index) => (
              <div
                key={img.id}
                className="select-card"
                style={{
                  padding: 0,
                  overflow: 'hidden',
                  cursor: 'pointer',
                  position: 'relative',
                }}
                onClick={() => setSelectedImage(img.id)}
              >
                <div style={{ position: 'relative', aspectRatio: '4/3' }}>
                  <img
                    src={img.url}
                    alt={`预览图 ${index + 1}`}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                  {/* Bounding Box Overlay */}
                  <div
                    style={{
                      position: 'absolute',
                      left: `${(img.bbox.x / 400) * 100}%`,
                      top: `${(img.bbox.y / 300) * 100}%`,
                      width: `${(img.bbox.width / 400) * 100}%`,
                      height: `${(img.bbox.height / 300) * 100}%`,
                      border: '2px solid var(--accent)',
                      backgroundColor: 'rgba(27,107,239,0.2)',
                    }}
                  />
                  {/* Label */}
                  <div
                    style={{
                      position: 'absolute',
                      left: `${(img.bbox.x / 400) * 100}%`,
                      top: `${(img.bbox.y / 300) * 100 - 24}%`,
                      background: 'var(--accent)',
                      color: 'white',
                      fontSize: 11,
                      padding: '2px 8px',
                      borderRadius: 4,
                      fontWeight: 500,
                    }}
                  >
                    {img.label}
                  </div>
                  {/* Zoom Icon */}
                  <div
                    style={{
                      position: 'absolute',
                      bottom: 8,
                      right: 8,
                      width: 28,
                      height: 28,
                      background: 'rgba(0,0,0,0.6)',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <ZoomIn size={14} color="white" />
                  </div>
                </div>
                <div style={{ padding: 12, borderTop: '1px solid var(--border)' }}>
                  <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                    预览图 {index + 1}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Image Preview Modal */}
      {selectedImage && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            animation: 'fadeIn 0.2s ease-out',
          }}
          onClick={() => setSelectedImage(null)}
        >
          <button
            style={{
              position: 'absolute',
              top: 20,
              right: 20,
              width: 40,
              height: 40,
              background: 'rgba(255,255,255,0.1)',
              border: 'none',
              borderRadius: '50%',
              color: 'white',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            onClick={() => setSelectedImage(null)}
          >
            <X size={20} />
          </button>

          {(() => {
            const img = dataset.images.find(i => i.id === selectedImage)
            if (!img) return null
            return (
              <div
                style={{
                  maxWidth: '90vw',
                  maxHeight: '90vh',
                  position: 'relative',
                }}
                onClick={e => e.stopPropagation()}
              >
                <img
                  src={img.url}
                  alt="预览"
                  style={{ maxWidth: '100%', maxHeight: '85vh', borderRadius: 8 }}
                />
                {/* Bounding Box */}
                <div
                  style={{
                    position: 'absolute',
                    left: `${(img.bbox.x / 400) * 100}%`,
                    top: `${(img.bbox.y / 300) * 100}%`,
                    width: `${(img.bbox.width / 400) * 100}%`,
                    height: `${(img.bbox.height / 300) * 100}%`,
                    border: '3px solid #1b6bef',
                    backgroundColor: 'rgba(27,107,239,0.2)',
                  }}
                />
                {/* Label */}
                <div
                  style={{
                    position: 'absolute',
                    left: `${(img.bbox.x / 400) * 100}%`,
                    top: `${(img.bbox.y / 300) * 100 - 30}%`,
                    background: '#1b6bef',
                    color: 'white',
                    fontSize: 14,
                    padding: '4px 12px',
                    borderRadius: 6,
                    fontWeight: 600,
                  }}
                >
                  {img.label}
                </div>
              </div>
            )
          })()}
        </div>
      )}
    </div>
  )
}