import { Link } from '@tanstack/react-router'
import { ArrowLeft } from 'lucide-react'

export function TaskHeader({
  taskName,
  statusBadge,
}: {
  taskName: string
  statusBadge: React.ReactNode
}) {
  return (
    <div className="page-header">
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <Link to="/train" className="btn btn-ghost btn-sm">
          <ArrowLeft size={14} /> 返回
        </Link>
        <div>
          <div className="breadcrumb">
            <Link to="/">科宝训练平台</Link> ›
            <Link to="/train">训练任务</Link> ›
            <span>{taskName}</span>
          </div>
          <div className="flex items-center gap-3 mt-1">
            <h1 className="page-title mb-0">{taskName}</h1>
            {statusBadge}
          </div>
        </div>
      </div>
    </div>
  )
}
