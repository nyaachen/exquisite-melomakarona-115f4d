import { createFileRoute, Link } from '@tanstack/react-router'
import { useState } from 'react'
import { Plus, Edit3, Trash2, Copy, CheckCircle2, XCircle, Globe, HardDrive, Search } from 'lucide-react'
import { CATEGORY_MAP } from '../../constants'

export const Route = createFileRoute('/pretrained-models/')({
  component: PretrainedModelList,
})

// ─── 公开预训练模型实体 ───

export interface PublicPretrainedModel {
  id: string
  name: string
  architectureId: string
  architectureName: string
  variant?: string
  source: string
  sourceUrl: string
  fileUrl: string
  fileSize: string
  fileHash?: string
  fileFormat: 'pt' | 'onnx' | 'safetensors' | 'bin'
  inputSize: number
  numClasses: number
  classNames: string[]
  description: string
  isActive: boolean
  createdAt: string
  createdBy: string
}

const PRETRAINED_MODELS: PublicPretrainedModel[] = [
  {
    id: 'pub-yolov8n-coco', name: 'YOLOv8n (COCO)', architectureId: 'arch-yolov8', architectureName: 'YOLOv8 目标检测',
    variant: 'n', source: 'Ultralytics', sourceUrl: 'https://github.com/ultralytics/assets/releases/download/v8.2.0/yolov8n.pt',
    fileUrl: '', fileSize: '6.2 MB', fileFormat: 'pt',
    inputSize: 640, numClasses: 80, classNames: ['person', 'car', 'dog', 'cat', '...'],
    description: 'YOLOv8 Nano 在 COCO 数据集上预训练的权重，参数量最小，适合边缘设备',
    isActive: true, createdAt: '2026-04-10', createdBy: '系统管理员',
  },
  {
    id: 'pub-yolov8s-coco', name: 'YOLOv8s (COCO)', architectureId: 'arch-yolov8', architectureName: 'YOLOv8 目标检测',
    variant: 's', source: 'Ultralytics', sourceUrl: 'https://github.com/ultralytics/assets/releases/download/v8.2.0/yolov8s.pt',
    fileUrl: '', fileSize: '21.5 MB', fileFormat: 'pt',
    inputSize: 640, numClasses: 80, classNames: ['person', 'car', 'dog', 'cat', '...'],
    description: 'YOLOv8 Small 在 COCO 数据集上预训练的权重，速度与精度平衡',
    isActive: true, createdAt: '2026-04-10', createdBy: '系统管理员',
  },
  {
    id: 'pub-yolov8m-coco', name: 'YOLOv8m (COCO)', architectureId: 'arch-yolov8', architectureName: 'YOLOv8 目标检测',
    variant: 'm', source: 'Ultralytics', sourceUrl: 'https://github.com/ultralytics/assets/releases/download/v8.2.0/yolov8m.pt',
    fileUrl: '', fileSize: '49.7 MB', fileFormat: 'pt',
    inputSize: 640, numClasses: 80, classNames: ['person', 'car', 'dog', 'cat', '...'],
    description: 'YOLOv8 Medium 在 COCO 数据集上预训练的权重，推荐作为默认起点',
    isActive: true, createdAt: '2026-04-10', createdBy: '系统管理员',
  },
  {
    id: 'pub-yolov8l-coco', name: 'YOLOv8l (COCO)', architectureId: 'arch-yolov8', architectureName: 'YOLOv8 目标检测',
    variant: 'l', source: 'Ultralytics', sourceUrl: 'https://github.com/ultralytics/assets/releases/download/v8.2.0/yolov8l.pt',
    fileUrl: '', fileSize: '83.7 MB', fileFormat: 'pt',
    inputSize: 640, numClasses: 80, classNames: ['person', 'car', 'dog', 'cat', '...'],
    description: 'YOLOv8 Large 在 COCO 数据集上预训练的权重，精度更高',
    isActive: true, createdAt: '2026-04-10', createdBy: '系统管理员',
  },
  {
    id: 'pub-yolov8x-coco', name: 'YOLOv8x (COCO)', architectureId: 'arch-yolov8', architectureName: 'YOLOv8 目标检测',
    variant: 'x', source: 'Ultralytics', sourceUrl: 'https://github.com/ultralytics/assets/releases/download/v8.2.0/yolov8x.pt',
    fileUrl: '', fileSize: '130.5 MB', fileFormat: 'pt',
    inputSize: 640, numClasses: 80, classNames: ['person', 'car', 'dog', 'cat', '...'],
    description: 'YOLOv8 XLarge 在 COCO 数据集上预训练的权重，最高精度',
    isActive: true, createdAt: '2026-04-10', createdBy: '系统管理员',
  },
  {
    id: 'pub-yolov8n-pothole', name: 'YOLOv8n (道路缺陷)', architectureId: 'arch-yolov8', architectureName: 'YOLOv8 目标检测',
    variant: 'n', source: 'Roboflow', sourceUrl: 'https://universe.roboflow.com/pothole-detection',
    fileUrl: '', fileSize: '6.3 MB', fileFormat: 'pt',
    inputSize: 640, numClasses: 5, classNames: ['pothole', 'crack', 'patch', 'rutting', 'shoving'],
    description: '在道路缺陷数据集上预训练的 YOLOv8 Nano，适合道路病害检测微调',
    isActive: true, createdAt: '2026-04-22', createdBy: '张工',
  },
  {
    id: 'pub-yolov8n-helmet', name: 'YOLOv8n (安全检测)', architectureId: 'arch-yolov8', architectureName: 'YOLOv8 目标检测',
    variant: 'n', source: 'Roboflow', sourceUrl: 'https://universe.roboflow.com/safety-helmet',
    fileUrl: '', fileSize: '6.4 MB', fileFormat: 'pt',
    inputSize: 640, numClasses: 3, classNames: ['helmet', 'no-helmet', 'person'],
    description: '在安全帽检测数据集上预训练的 YOLOv8 Nano',
    isActive: true, createdAt: '2026-04-25', createdBy: '李工',
  },
  {
    id: 'pub-qwen-7b-base', name: 'Qwen-7B-Chat (原版)', architectureId: 'arch-qwen', architectureName: 'Qwen 大语言模型微调',
    variant: '7B', source: 'Alibaba', sourceUrl: 'https://huggingface.co/Qwen/Qwen-7B-Chat',
    fileUrl: '', fileSize: '14.0 GB', fileFormat: 'safetensors',
    inputSize: 2048, numClasses: 0, classNames: [],
    description: 'Qwen-7B-Chat 官方预训练权重，阿里云通义千问 70 亿参数版本',
    isActive: true, createdAt: '2026-04-15', createdBy: '系统管理员',
  },
  {
    id: 'pub-qwen-14b-base', name: 'Qwen-14B-Chat (原版)', architectureId: 'arch-qwen', architectureName: 'Qwen 大语言模型微调',
    variant: '14B', source: 'Alibaba', sourceUrl: 'https://huggingface.co/Qwen/Qwen-14B-Chat',
    fileUrl: '', fileSize: '28.0 GB', fileFormat: 'safetensors',
    inputSize: 2048, numClasses: 0, classNames: [],
    description: 'Qwen-14B-Chat 官方预训练权重，140 亿参数版本',
    isActive: true, createdAt: '2026-04-15', createdBy: '系统管理员',
  },
  {
    id: 'pub-llama-7b-base', name: 'LLaMA-2-7B-Chat (原版)', architectureId: 'arch-llama', architectureName: 'LLaMA 大语言模型微调',
    variant: '7B', source: 'Meta', sourceUrl: 'https://huggingface.co/meta-llama/Llama-2-7b-chat',
    fileUrl: '', fileSize: '13.5 GB', fileFormat: 'safetensors',
    inputSize: 2048, numClasses: 0, classNames: [],
    description: 'LLaMA-2-7B-Chat 官方预训练权重，Meta 开源 70 亿参数版本',
    isActive: true, createdAt: '2026-04-28', createdBy: '系统管理员',
  },
]

const ARCHITECTURES = [
  { id: 'arch-yolov8', name: 'YOLOv8 目标检测', category: 'object-detection', baseModel: 'YOLOv8m' },
  { id: 'arch-yolov8-fast', name: 'YOLOv8 快速验证', category: 'object-detection', baseModel: 'YOLOv8s' },
  { id: 'arch-qwen', name: 'Qwen 大语言模型微调', category: 'llm', baseModel: 'Qwen-7B-Chat' },
  { id: 'arch-llama', name: 'LLaMA 大语言模型微调', category: 'llm', baseModel: 'LLaMA-2-7B-Chat' },
]

function PretrainedModelList() {
  const [models, setModels] = useState(PRETRAINED_MODELS)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [filterArch, setFilterArch] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')

  const filtered = models.filter(m =>
    (filterArch === 'all' || m.architectureId === filterArch) &&
    (m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
     m.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
     m.source.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  async function handleDelete(id: string) {
    setDeleting(id)
    await new Promise(r => setTimeout(r, 500))
    setModels(prev => prev.filter(m => m.id !== id))
    setDeleting(null)
  }

  function handleCopy(id: string) {
    const model = models.find(m => m.id === id)
    if (!model) return
    const newModel: PublicPretrainedModel = {
      ...model,
      id: `pub-${Date.now()}`,
      name: `${model.name} (副本)`,
      isActive: true,
      createdAt: new Date().toISOString().slice(0, 10),
    }
    setModels(prev => [newModel, ...prev])
  }

  return (
    <div style={{ animation: 'slideIn 0.3s ease-out' }}>
      <div className="page-header">
        <div>
          <div className="breadcrumb">科宝训练平台 › 公开模型</div>
          <h1 className="page-title">公开预训练模型</h1>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>
            管理平台可用的公开预训练模型，创建训练任务时可选择作为训练起点
          </div>
        </div>
        <Link to="/pretrained-models/create" className="btn btn-primary">
          <Plus size={15} /> 添加模型
        </Link>
      </div>

      <div className="content-padded">
        <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
          <button className={`btn btn-sm ${filterArch === 'all' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setFilterArch('all')}>
            全部架构
          </button>
          {ARCHITECTURES.map(arch => (
            <button key={arch.id} className={`btn btn-sm ${filterArch === arch.id ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setFilterArch(arch.id)}>
              {arch.name}
            </button>
          ))}
        </div>

        <div className="card">
          <div className="card-header">
            <div className="search-input">
              <Search size={14} style={{ color: 'var(--text-muted)' }} />
              <input
                type="text"
                placeholder="搜索模型名称、来源或描述..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input-field"
              />
            </div>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>模型名称</th>
                  <th>关联架构</th>
                  <th>变体</th>
                  <th>来源</th>
                  <th style={{ textAlign: 'right' }}>文件大小</th>
                  <th style={{ textAlign: 'right' }}>输入尺寸</th>
                  <th style={{ textAlign: 'right' }}>类别数</th>
                  <th>状态</th>
                  <th>创建人</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(model => (
                  <tr key={model.id}>
                    <td>
                      <div className="primary" style={{ fontWeight: 500 }}>{model.name}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2, maxWidth: 280 }}>
                        {model.description}
                      </div>
                    </td>
                    <td>
                      <span className="badge badge-secondary">{model.architectureName}</span>
                    </td>
                    <td className="mono" style={{ fontSize: 12 }}>
                      {model.variant || '—'}
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <Globe size={12} style={{ color: 'var(--text-muted)' }} />
                        <span style={{ fontSize: 12 }}>{model.source}</span>
                      </div>
                    </td>
                    <td className="mono" style={{ textAlign: 'right', fontSize: 12 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4, justifyContent: 'flex-end' }}>
                        <HardDrive size={11} style={{ color: 'var(--text-muted)' }} />
                        {model.fileSize}
                      </div>
                    </td>
                    <td className="mono" style={{ textAlign: 'right' }}>{model.inputSize}</td>
                    <td className="mono" style={{ textAlign: 'right' }}>{model.numClasses}</td>
                    <td>
                      {model.isActive ? (
                        <span className="badge badge-success"><CheckCircle2 size={10} /> 启用</span>
                      ) : (
                        <span className="badge badge-archived"><XCircle size={10} /> 禁用</span>
                      )}
                    </td>
                    <td style={{ fontSize: 12 }}>{model.createdBy}</td>
                    <td>
                      <div style={{ display: 'flex', gap: 4 }}>
                        <Link to="/pretrained-models/$modelId" params={{ modelId: model.id }} className="btn btn-ghost btn-sm">
                          <Edit3 size={12} />
                        </Link>
                        <button className="btn btn-ghost btn-sm" onClick={() => handleCopy(model.id)}>
                          <Copy size={12} />
                        </button>
                        <button className="btn btn-ghost btn-sm" onClick={() => handleDelete(model.id)}
                          disabled={deleting === model.id}>
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filtered.length === 0 && (
            <div className="empty-state">
              <div className="empty-state-icon"><Globe size={32} /></div>
              <div className="empty-state-text">暂无公开预训练模型</div>
              <div className="empty-state-hint">点击右上角"添加模型"录入新的预训练权重</div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
