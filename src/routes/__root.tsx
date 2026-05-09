import { HeadContent, Link, Outlet, Scripts, createRootRoute, useRouterState } from '@tanstack/react-router'
import {
  LayoutDashboard,
  Cpu,
  Package,
  Activity,
  ChevronRight,
  Layers,
  Sliders,
  Boxes,
  User,
  Globe,
  Shield,
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
        
        <NavLink to="/" icon={<LayoutDashboard size={15} />} label="首页" />

        <div className="nav-label">模型</div>
        <NavLink to="/plaza" icon={<Package size={15} />} label="模型广场" />
        <NavLink to="/model-management" icon={<Layers size={15} />} label="模型管理" />
        <NavLink to="/models" icon={<Package size={15} />} label="模型广场 (旧)" />
        <NavLink to="/pretrained-models" icon={<Globe size={15} />} label="公开模型 (旧)" />
        <NavLink to="/system/private-models" icon={<Shield size={15} />} label="私有模型 (旧)" />

        <div className="nav-label">数据</div>
        <NavLink to="/datasets" icon={<Layers size={15} />} label="数据集" />
        <NavLink to="/subdatasets" icon={<Layers size={15} />} label="子数据集" />

        <div className="nav-label">训练</div>
        <NavLink to="/train" icon={<Cpu size={15} />} label="训练任务" />
        <NavLink to="/validate" icon={<Package size={15} />} label="验证任务" />
        <NavLink to="/presets" icon={<Sliders size={15} />} label="训练预设" />

        <div className="nav-label">系统配置</div>
        <NavLink to="/architectures" icon={<Boxes size={15} />} label="模型模板" />
        <NavLink to="/gpu-servers" icon={<Cpu size={15} />} label="GPU 服务器" />
        <NavLink to="/monitor" icon={<Activity size={15} />} label="监控中心" />
      </div>

      <div className="sidebar-footer">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 32, height: 32, borderRadius: '50%',
            background: 'var(--accent)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
          }}>
            <User size={16} style={{ color: '#fff' }} />
          </div>
          <div>
            <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-primary)' }}>张工</div>
            <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>zhanggong@kebao.cn</div>
          </div>
        </div>
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
      {isActive && <ChevronRight size={12} className="ml-auto opacity-60" />}
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
