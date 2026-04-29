import { HeadContent, Link, Outlet, Scripts, createRootRoute, useRouterState } from '@tanstack/react-router'
import {
  LayoutDashboard,
  Cpu,
  Package,
  PlusCircle,
  Activity,
  ChevronRight,
  Layers,
} from 'lucide-react'
import '../styles.css'

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { title: '科宝训练平台' },
    ],
  }),
  shellComponent: RootDocument,
  component: RootLayout,
})

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  )
}

function Sidebar() {
  return (
    <nav className="sidebar">
      <div className="brand">
        <div className="brand-logo">
          <div className="brand-icon">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2L2 7l10 5 10-5-10-5z" />
              <path d="M2 17l10 5 10-5" />
              <path d="M2 12l10 5 10-5" />
            </svg>
          </div>
          <div>
            <div className="brand-name">科宝训练平台</div>
            <div className="brand-sub">KEBAO TRAIN · v2.4</div>
          </div>
        </div>
      </div>

      <div className="nav-section">
        <div className="nav-label">工作台</div>
        <NavLink to="/" icon={<LayoutDashboard size={15} />} label="训练概览" />
        <NavLink to="/tasks/create" icon={<PlusCircle size={15} />} label="创建训练任务" />

        <div className="nav-label">任务管理</div>
        <NavLink to="/tasks" icon={<Cpu size={15} />} label="训练任务列表" />
        <NavLink to="/models" icon={<Package size={15} />} label="模型管理" />

        <div className="nav-label">数据</div>
        <NavLink to="/datasets" icon={<Layers size={15} />} label="数据集同步" />
        <NavLink to="/monitor" icon={<Activity size={15} />} label="资源监控" />
      </div>

      <div className="sidebar-footer">
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
          <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--success)' }} />
          <span>云服务器 · GPU×4 在线</span>
        </div>
        <div style={{ color: 'var(--text-muted)', fontSize: 10 }}>已连接科宝智能体中台</div>
      </div>
    </nav>
  )
}

function NavLink({ to, icon, label }: { to: string; icon: React.ReactNode; label: string }) {
  const state = useRouterState()
  const pathname = state.location.pathname
  const isActive = to === '/' ? pathname === '/' : pathname.startsWith(to)

  return (
    <Link to={to as any} className={`nav-link ${isActive ? 'active' : ''}`}>
      {icon}
      <span>{label}</span>
      {isActive && <ChevronRight size={12} style={{ marginLeft: 'auto', opacity: 0.6 }} />}
    </Link>
  )
}

function RootLayout() {
  return (
    <div className="app-shell">
      <Sidebar />
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  )
}
