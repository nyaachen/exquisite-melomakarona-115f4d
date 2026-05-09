import { createFileRoute, Link } from '@tanstack/react-router'
import { useState } from 'react'
import {
  Clock,
  User,
  Upload,
  Search,
  Globe,
  Shield,
  ImageIcon,
} from 'lucide-react'
import { SQUARE_MODELS } from '../../data/models'

export const Route = createFileRoute('/models/')({
  component: SquareList,
})

function SquareList() {
  const [searchQuery, setSearchQuery] = useState('')
  const [imgErrors, setImgErrors] = useState<Set<string>>(new Set())

  const filteredModels = SQUARE_MODELS.filter(m =>
    m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.classes.some(c => c.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  return (
    <div className="slide-in">
      <div className="page-header">
        <div>
          <div className="breadcrumb">科宝训练平台 › 模型管理</div>
          <h1 className="page-title">模型广场</h1>
        </div>
        <Link to="/models/manualUpload" className="btn btn-secondary">
          <Upload size={14} /> 上传模型
        </Link>
      </div>

      <div className="p-content">
        <div style={{ marginBottom: 20 }}>
          <div className="search-input" style={{ maxWidth: 400 }}>
            <Search size={14} style={{ color: 'var(--text-muted)' }} />
            <input
              type="text"
              placeholder="搜索模型名称、描述、类别或标签..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input-field"
            />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
          {filteredModels.map((model) => (
            <Link
              key={model.id}
              to={model.source === 'platform' ? '/models/$modelId' : '/pretrained-models/$modelId'}
              params={{ modelId: model.id } as any}
              className="no-underline"
            >
              <div className="model-card" style={{ cursor: 'pointer', padding: 0, overflow: 'hidden' }}>
                {/* Cover image */}
                <div style={{ width: '100%', aspectRatio: '16/10', background: 'var(--bg-elevated)', position: 'relative', overflow: 'hidden' }}>
                  {!imgErrors.has(model.id) ? (
                    <img
                      src={model.coverImage}
                      alt={model.name}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      onError={() => setImgErrors(prev => new Set(prev).add(model.id))}
                    />
                  ) : (
                    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', gap: 8 }}>
                      <ImageIcon size={32} />
                      <span style={{ fontSize: 11 }}>{model.name}</span>
                    </div>
                  )}
                  {/* Source badge */}
                  <div style={{ position: 'absolute', top: 8, right: 8 }}>
                    <span className="badge" style={{
                      background: model.source === 'platform' ? 'var(--accent-glow)' : 'rgba(230, 162, 60, 0.12)',
                      color: model.source === 'platform' ? 'var(--accent)' : 'var(--warning)',
                      borderColor: model.source === 'platform' ? 'rgba(64,158,255,0.3)' : 'rgba(230,162,60,0.3)',
                      fontSize: 10,
                    }}>
                      {model.source === 'platform' ? <Shield size={9} /> : <Globe size={9} />}
                      {model.source === 'platform' ? '平台自有' : model.sourceLabel || '公开模型'}
                    </span>
                  </div>
                  {/* Category badge */}
                  <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '6px 10px', background: 'linear-gradient(transparent, rgba(0,0,0,0.6))' }}>
                    <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.85)', fontWeight: 500 }}>{model.category}</span>
                  </div>
                </div>

                {/* Card body */}
                <div style={{ padding: 14 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>{model.name}</div>
                  <p style={{ fontSize: 11.5, color: 'var(--text-secondary)', marginBottom: 10, lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {model.description}
                  </p>

                  {model.classes.length > 0 && (
                    <div style={{ display: 'flex', gap: 3, flexWrap: 'wrap', marginBottom: 10 }}>
                      {model.classes.slice(0, 5).map(cls => (
                        <span key={cls} className="class-tag" style={{ fontSize: 10 }}>{cls}</span>
                      ))}
                      {model.classes.length > 5 && (
                        <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>+{model.classes.length - 5}</span>
                      )}
                    </div>
                  )}

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 10, color: 'var(--text-muted)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <span style={{ fontFamily: "'JetBrains Mono', monospace", color: 'var(--text-secondary)' }}>{model.baseModel}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                        <User size={9} /> {model.author}
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                        <Clock size={9} /> {model.createdAt}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}