import { Link } from '@tanstack/react-router'
import { AlertTriangle, ArrowLeft } from 'lucide-react'

export function NotFound({ message }: { message?: string }) {
  return (
    <div style={{ animation: 'slideIn 0.3s ease-out' }}>
      <div className="page-header">
        <div>
          <div className="breadcrumb">科宝训练平台</div>
          <h1 className="page-title">未找到</h1>
        </div>
      </div>

      <div style={{ padding: '24px 32px' }}>
        <div className="empty-state" style={{ padding: '60px 24px' }}>
          <AlertTriangle size={48} style={{ color: 'var(--warning)', marginBottom: 16, opacity: 0.6 }} />
          <h2 style={{ fontSize: 18, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 8 }}>
            找不到该资源
          </h2>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 20, maxWidth: 400, lineHeight: 1.6 }}>
            {message || '该资源不存在或已被删除。请检查 URL 是否正确，或返回列表页。'}
          </p>
          <Link to="/" className="btn btn-secondary" style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <ArrowLeft size={14} />
            返回首页
          </Link>
        </div>
      </div>
    </div>
  )
}
