import { createFileRoute, Link } from '@tanstack/react-router'
import { useState } from 'react'
import { Plus, Package, Edit3, Trash2, Copy, Clock, CheckCircle2, XCircle } from 'lucide-react'

export const Route = createFileRoute('/template/')({
  component: TemplateList,
})

interface TemplateParam {
  name: string
  key: string
  type: 'number' | 'string' | 'select' | 'boolean' | 'range'
  defaultValue: number | string | boolean
  min?: number
  max?: number
  step?: number
  options?: { label: string; value: string | number }[]
  required: boolean
  description: string
}

interface Template {
  id: string
  name: string
  modelType: 'YOLO' | 'QWEN' | 'LLaMA' | 'OTHER'
  baseModel: string
  description: string
  params: TemplateParam[]
  isActive: boolean
  createdAt: string
  author: string
  usageCount: number
}

const TEMPLATES: Template[] = [
  {
    id: 'template-yolo-default',
    name: 'YOLOv8 默认配置',
    modelType: 'YOLO',
    baseModel: 'YOLOv8m',
    description: 'YOLOv8目标检测模型的默认训练配置，适用于大多数场景',
    isActive: true,
    createdAt: '2026-04-15 10:30',
    author: '系统管理员',
    usageCount: 47,
    params: [
      { name: '训练轮数', key: 'epochs', type: 'number', defaultValue: 100, min: 1, max: 1000, required: true, description: '模型训练的总轮数' },
      { name: '批次大小', key: 'batchSize', type: 'number', defaultValue: 16, min: 1, max: 128, required: true, description: '每批次训练的样本数量' },
      { name: '输入尺寸', key: 'imgSize', type: 'select', defaultValue: 640, options: [
        { label: '416x416', value: 416 },
        { label: '512x512', value: 512 },
        { label: '640x640', value: 640 },
        { label: '800x800', value: 800 },
        { label: '1024x1024', value: 1024 },
      ], required: true, description: '模型输入图片尺寸' },
      { name: '学习率', key: 'lr0', type: 'range', defaultValue: 0.01, min: 0.0001, max: 0.1, step: 0.0001, required: true, description: '初始学习率' },
      { name: '权重衰减', key: 'weightDecay', type: 'number', defaultValue: 0.0005, min: 0, max: 0.01, required: false, description: '权重衰减系数' },
      { name: '动量', key: 'momentum', type: 'number', defaultValue: 0.937, min: 0, max: 1, required: false, description: 'SGD动量' },
      { name: '早停轮数', key: 'patience', type: 'number', defaultValue: 10, min: 0, max: 50, required: false, description: '验证损失不下降时的等待轮数' },
      { name: '增强策略', key: 'augment', type: 'select', defaultValue: 'default', options: [
        { label: '默认', value: 'default' },
        { label: '强增强', value: 'strong' },
        { label: '保守', value: 'conservative' },
      ], required: false, description: '数据增强策略' },
    ],
  },
  {
    id: 'template-yolo-fast',
    name: 'YOLOv8 快速训练',
    modelType: 'YOLO',
    baseModel: 'YOLOv8s',
    description: '快速验证模型效果的轻量配置，训练速度快但精度稍低',
    isActive: true,
    createdAt: '2026-04-18 14:20',
    author: '张工',
    usageCount: 23,
    params: [
      { name: '训练轮数', key: 'epochs', type: 'number', defaultValue: 30, min: 1, max: 1000, required: true, description: '模型训练的总轮数' },
      { name: '批次大小', key: 'batchSize', type: 'number', defaultValue: 32, min: 1, max: 128, required: true, description: '每批次训练的样本数量' },
      { name: '输入尺寸', key: 'imgSize', type: 'select', defaultValue: 416, options: [
        { label: '416x416', value: 416 },
        { label: '512x512', value: 512 },
        { label: '640x640', value: 640 },
      ], required: true, description: '模型输入图片尺寸' },
      { name: '学习率', key: 'lr0', type: 'range', defaultValue: 0.02, min: 0.0001, max: 0.1, step: 0.0001, required: true, description: '初始学习率' },
    ],
  },
  {
    id: 'template-qwen-lora',
    name: 'Qwen-7B LoRA 微调',
    modelType: 'QWEN',
    baseModel: 'Qwen-7B-Chat',
    description: 'Qwen-7B大语言模型的LoRA参数高效微调配置',
    isActive: true,
    createdAt: '2026-04-20 09:15',
    author: '李工',
    usageCount: 15,
    params: [
      { name: '训练轮数', key: 'epochs', type: 'number', defaultValue: 3, min: 1, max: 20, required: true, description: '模型训练的总轮数' },
      { name: '批次大小', key: 'batchSize', type: 'number', defaultValue: 8, min: 1, max: 64, required: true, description: '每批次训练的样本数量' },
      { name: '学习率', key: 'lr0', type: 'range', defaultValue: 0.0001, min: 0.00001, max: 0.001, step: 0.00001, required: true, description: 'LoRA学习率' },
      { name: 'LoRA秩', key: 'loraRank', type: 'number', defaultValue: 64, min: 8, max: 256, required: true, description: 'LoRA低秩矩阵的秩' },
      { name: 'LoRA Alpha', key: 'loraAlpha', type: 'number', defaultValue: 128, min: 8, max: 512, required: true, description: 'LoRA缩放因子' },
      { name: '目标层', key: 'targetLayers', type: 'select', defaultValue: 'q_proj,v_proj', options: [
        { label: '仅Q/V', value: 'q_proj,v_proj' },
        { label: 'Q/K/V', value: 'q_proj,k_proj,v_proj' },
        { label: '全注意力层', value: 'q_proj,k_proj,v_proj,o_proj' },
      ], required: true, description: 'LoRA注入的目标层' },
      { name: '梯度累积', key: 'gradientAccumulation', type: 'number', defaultValue: 4, min: 1, max: 32, required: false, description: '梯度累积步数' },
      { name: '最大序列长度', key: 'maxSeqLen', type: 'number', defaultValue: 2048, min: 512, max: 8192, required: true, description: '输入序列最大长度' },
      { name: '使用DeepSpeed', key: 'useDeepSpeed', type: 'boolean', defaultValue: true, required: false, description: '是否启用DeepSpeed优化' },
    ],
  },
  {
    id: 'template-qwen-full',
    name: 'Qwen-7B 全参数微调',
    modelType: 'QWEN',
    baseModel: 'Qwen-7B-Chat',
    description: 'Qwen-7B大语言模型的全参数微调配置，需要充足显存',
    isActive: false,
    createdAt: '2026-04-22 16:45',
    author: '王工',
    usageCount: 3,
    params: [
      { name: '训练轮数', key: 'epochs', type: 'number', defaultValue: 2, min: 1, max: 10, required: true, description: '模型训练的总轮数' },
      { name: '批次大小', key: 'batchSize', type: 'number', defaultValue: 2, min: 1, max: 16, required: true, description: '每批次训练的样本数量' },
      { name: '学习率', key: 'lr0', type: 'range', defaultValue: 0.00005, min: 0.00001, max: 0.0001, step: 0.00001, required: true, description: '学习率' },
      { name: '权重衰减', key: 'weightDecay', type: 'number', defaultValue: 0.01, min: 0, max: 0.1, required: false, description: '权重衰减系数' },
      { name: '最大序列长度', key: 'maxSeqLen', type: 'number', defaultValue: 1024, min: 512, max: 4096, required: true, description: '输入序列最大长度' },
      { name: '使用FSDP', key: 'useFSDP', type: 'boolean', defaultValue: true, required: false, description: '是否启用FSDP分布式训练' },
      { name: '混合精度', key: 'mixedPrecision', type: 'select', defaultValue: 'bf16', options: [
        { label: 'FP32', value: 'fp32' },
        { label: 'FP16', value: 'fp16' },
        { label: 'BF16', value: 'bf16' },
      ], required: false, description: '混合精度训练类型' },
    ],
  },
  {
    id: 'template-llama-lora',
    name: 'LLaMA-7B LoRA 微调',
    modelType: 'LLaMA',
    baseModel: 'LLaMA-2-7B-Chat',
    description: 'LLaMA-2-7B大语言模型的LoRA参数高效微调配置',
    isActive: true,
    createdAt: '2026-04-25 11:00',
    author: '赵工',
    usageCount: 8,
    params: [
      { name: '训练轮数', key: 'epochs', type: 'number', defaultValue: 3, min: 1, max: 20, required: true, description: '模型训练的总轮数' },
      { name: '批次大小', key: 'batchSize', type: 'number', defaultValue: 8, min: 1, max: 64, required: true, description: '每批次训练的样本数量' },
      { name: '学习率', key: 'lr0', type: 'range', defaultValue: 0.0001, min: 0.00001, max: 0.001, step: 0.00001, required: true, description: 'LoRA学习率' },
      { name: 'LoRA秩', key: 'loraRank', type: 'number', defaultValue: 64, min: 8, max: 256, required: true, description: 'LoRA低秩矩阵的秩' },
      { name: 'LoRA Alpha', key: 'loraAlpha', type: 'number', defaultValue: 128, min: 8, max: 512, required: true, description: 'LoRA缩放因子' },
      { name: '最大序列长度', key: 'maxSeqLen', type: 'number', defaultValue: 2048, min: 512, max: 4096, required: true, description: '输入序列最大长度' },
    ],
  },
]

function TemplateList() {
  const [templates, setTemplates] = useState(TEMPLATES)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [filterType, setFilterType] = useState<string>('all')

  const modelTypeLabels: Record<string, string> = {
    YOLO: '目标检测',
    QWEN: 'Qwen大模型',
    LLaMA: 'LLaMA大模型',
    OTHER: '其他',
  }

  const filteredTemplates = templates.filter(t => 
    filterType === 'all' || t.modelType === filterType
  )

  async function handleDelete(templateId: string) {
    const template = templates.find(t => t.id === templateId)
    if (template?.usageCount && template.usageCount > 0) {
      alert('该模板已被使用，无法删除')
      return
    }
    setDeleting(templateId)
    await new Promise(r => setTimeout(r, 500))
    setTemplates(prev => prev.filter(t => t.id !== templateId))
    setDeleting(null)
  }

  function handleCopy(templateId: string) {
    const template = templates.find(t => t.id === templateId)
    if (!template) return
    const newTemplate: Template = {
      ...template,
      id: `template-${Date.now()}`,
      name: `${template.name} (副本)`,
      createdAt: new Date().toLocaleString('zh-CN', { 
        year: 'numeric', 
        month: '2-digit', 
        day: '2-digit', 
        hour: '2-digit', 
        minute: '2-digit' 
      }).replace(/\//g, '-'),
      usageCount: 0,
    }
    setTemplates(prev => [newTemplate, ...prev])
  }

  return (
    <div style={{ animation: 'slideIn 0.3s ease-out' }}>
      <div className="page-header">
        <div>
          <div className="breadcrumb">科宝训练平台 › 训练模板</div>
          <h1 className="page-title">训练模板管理</h1>
        </div>
        <Link to="/template/create" className="btn btn-primary">
          <Plus size={15} /> 创建模板
        </Link>
      </div>

      <div style={{ padding: '24px 32px' }}>
        <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
          <button
            className={`btn btn-sm ${filterType === 'all' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setFilterType('all')}
          >
            全部
          </button>
          {Object.entries(modelTypeLabels).map(([key, label]) => (
            <button
              key={key}
              className={`btn btn-sm ${filterType === key ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setFilterType(key)}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="card">
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>模板名称</th>
                  <th>模型类型</th>
                  <th>基础模型</th>
                  <th>状态</th>
                  <th>参数数量</th>
                  <th>使用次数</th>
                  <th>创建人</th>
                  <th>创建时间</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {filteredTemplates.map((template) => (
                  <tr key={template.id}>
                    <td>
                      <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{template.name}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{template.description}</div>
                    </td>
                    <td>
                      <span className={`badge ${template.modelType === 'YOLO' ? 'badge-category' : 
                        template.modelType === 'QWEN' ? 'badge-published' : 
                        template.modelType === 'LLaMA' ? 'badge-teal' : 'badge'}`}>
                        {modelTypeLabels[template.modelType]}
                      </span>
                    </td>
                    <td className="mono" style={{ color: 'var(--text-secondary)' }}>{template.baseModel}</td>
                    <td>
                      {template.isActive ? (
                        <span className="badge badge-success">
                          <CheckCircle2 size={10} /> 启用
                        </span>
                      ) : (
                        <span className="badge badge-error">
                          <XCircle size={10} /> 禁用
                        </span>
                      )}
                    </td>
                    <td className="mono">{template.params.length}</td>
                    <td className="mono">{template.usageCount}</td>
                    <td>{template.author}</td>
                    <td>{template.createdAt}</td>
                    <td>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <Link
                          to="/template/$templateId"
                          params={{ templateId: template.id }}
                          className="btn btn-ghost btn-sm"
                          title="编辑"
                        >
                          <Edit3 size={13} />
                        </Link>
                        <button
                          className="btn btn-ghost btn-sm"
                          title="复制"
                          onClick={() => handleCopy(template.id)}
                        >
                          <Copy size={13} />
                        </button>
                        <button
                          className="btn btn-ghost btn-sm"
                          title="删除"
                          onClick={() => handleDelete(template.id)}
                          disabled={deleting === template.id || template.usageCount > 0}
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}