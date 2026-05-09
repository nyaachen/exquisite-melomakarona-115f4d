export function SectionTitle({
  icon,
  title,
  subtitle,
}: {
  icon: React.ReactNode
  title: string
  subtitle: string
}) {
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 7, color: 'var(--text-primary)', fontWeight: 600, fontSize: 14 }}>
        <span style={{ color: 'var(--accent-bright)' }}>{icon}</span>
        {title}
      </div>
      {subtitle && <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{subtitle}</div>}
    </div>
  )
}
