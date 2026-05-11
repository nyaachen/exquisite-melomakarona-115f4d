import { Link } from '@tanstack/react-router'
import { ArrowLeft } from 'lucide-react'
import type { ConnectionStatus } from '../../lib/useSimulatedWebSocket'

export function TaskHeader({
  taskName,
  statusBadge,
  wsStatus,
}: {
  taskName: string
  statusBadge: React.ReactNode
  wsStatus?: ConnectionStatus
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
            {wsStatus && (
              <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11 }}>
                <span style={{
                  width: 6, height: 6, borderRadius: '50%',
                  background: wsStatus === 'connected' ? 'var(--success)' : wsStatus === 'connecting' ? 'var(--warning)' : 'var(--text-muted)',
                }} />
                <span style={{ color: wsStatus === 'connected' ? 'var(--success)' : 'var(--text-muted)' }}>
                  WS 实时推送中
                </span>
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
