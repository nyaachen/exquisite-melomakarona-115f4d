import { useState, useRef, useEffect, useMemo } from 'react'
import { Search, ChevronDown, ChevronLeft, ChevronRight, X, CheckCircle2 } from 'lucide-react'

export interface DropdownItem {
  id: string
  name: string
  subtitle?: string
  tags?: string[]
  count?: number
  countLabel?: string
}

interface Props {
  label: string
  color?: string
  selectedId: string
  onChange: (id: string) => void
  items: DropdownItem[]
  placeholder?: string
  pageSize?: number
}

export function SearchableDropdown({ label, color, selectedId, onChange, items, placeholder = '点击选择...', pageSize = 8 }: Props) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(0)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
        setSearch('')
        setPage(0)
      }
    }
    if (open) document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [open])

  useEffect(() => { setPage(0) }, [search])

  const selected = items.find(i => i.id === selectedId)
  const c = color || 'var(--accent-bright)'

  const filtered = useMemo(() => {
    if (!search.trim()) return items
    const q = search.toLowerCase()
    return items.filter(i =>
      i.name.toLowerCase().includes(q) ||
      (i.subtitle && i.subtitle.toLowerCase().includes(q)) ||
      (i.tags && i.tags.some(t => t.toLowerCase().includes(q)))
    )
  }, [items, search])

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize))
  const paged = filtered.slice(page * pageSize, (page + 1) * pageSize)

  function select(id: string) {
    onChange(id)
    setOpen(false)
    setSearch('')
    setPage(0)
  }

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      {label && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
          <div style={{ width: 7, height: 7, background: c, flexShrink: 0 }} />
          <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)' }}>{label}</span>
        </div>
      )}

      <button
        type="button"
        onClick={() => setOpen(!open)}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 10,
          padding: '10px 12px',
          background: 'var(--bg-elevated)',
          border: `1px solid ${open ? c : 'var(--border-default)'}`,
          color: selectedId ? 'var(--text-primary)' : 'var(--text-muted)',
          fontSize: 13,
          fontFamily: 'inherit',
          cursor: 'pointer',
          transition: 'border-color 0.15s',
          textAlign: 'left',
        }}
      >
        <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {selectedId ? (
            <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span>{selected?.name}</span>
              {selected?.count !== undefined && (
                <span style={{ fontSize: 11, fontFamily: 'JetBrains Mono', color: c, fontWeight: 600, marginLeft: 'auto' }}>
                  {selected.count.toLocaleString()} {selected.countLabel || ''}
                </span>
              )}
            </span>
          ) : (
            placeholder
          )}
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 }}>
          {selectedId && (
            <span
              onClick={(e) => { e.stopPropagation(); onChange('') }}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 18, height: 18, color: 'var(--text-muted)', transition: 'color 0.15s' }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = 'var(--error)' }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'var(--text-muted)' }}
            >
              <X size={13} />
            </span>
          )}
          <ChevronDown size={14} style={{ color: 'var(--text-muted)', transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
        </div>
      </button>

      {open && (
        <div style={{
          position: 'absolute',
          top: '100%',
          left: 0,
          right: 0,
          marginTop: 4,
          background: 'var(--bg-card)',
          border: '1px solid var(--border-default)',
          boxShadow: '0 12px 32px rgba(0,0,0,0.12)',
          zIndex: 50,
          animation: 'slideDown 0.15s ease-out',
        }}>
          <div style={{ padding: '10px 12px', borderBottom: '1px solid var(--border-dim)' }}>
            <div className="search-input" style={{ minWidth: 'auto', width: '100%' }}>
              <Search size={13} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
              <input
                type="text"
                className="search-input-field"
                placeholder="搜索..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                autoFocus
              />
            </div>
          </div>

          <div style={{ maxHeight: 280, overflowY: 'auto', padding: '6px 8px' }}>
            {filtered.length === 0 ? (
              <div style={{ padding: '24px 16px', textAlign: 'center', fontSize: 12, color: 'var(--text-muted)' }}>
                未找到匹配项
              </div>
            ) : (
              paged.map(item => (
                <div
                  key={item.id}
                  onClick={() => select(item.id)}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    gap: 8, padding: '9px 8px', cursor: 'pointer',
                    background: selectedId === item.id ? `${c}0D` : 'transparent',
                    border: `1px solid ${selectedId === item.id ? `${c}30` : 'transparent'}`,
                    transition: 'background 0.1s',
                  }}
                  onMouseEnter={e => { if (selectedId !== item.id) (e.currentTarget as HTMLElement).style.background = 'var(--bg-hover)' }}
                  onMouseLeave={e => { if (selectedId !== item.id) (e.currentTarget as HTMLElement).style.background = 'transparent' }}
                >
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      {selectedId === item.id && <CheckCircle2 size={12} style={{ color: c, flexShrink: 0 }} />}
                      <span style={{ fontSize: 12.5, fontWeight: selectedId === item.id ? 600 : 400, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {item.name}
                      </span>
                    </div>
                    {item.subtitle && (
                      <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 2, marginLeft: selectedId === item.id ? 18 : 0 }}>
                        {item.subtitle}
                      </div>
                    )}
                    {item.tags && item.tags.length > 0 && (
                      <div style={{ display: 'flex', gap: 3, flexWrap: 'wrap', marginTop: 3, marginLeft: selectedId === item.id ? 18 : 0 }}>
                        {item.tags.map(t => (
                          <span key={t} style={{ fontSize: 9, padding: '1px 4px', background: 'var(--bg-elevated)', color: 'var(--text-muted)', border: '1px solid var(--border-dim)' }}>
                            {t}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  {item.count !== undefined && (
                    <div style={{ fontSize: 11, fontFamily: 'JetBrains Mono', fontWeight: 600, color: c, flexShrink: 0, textAlign: 'right' }}>
                      {item.count.toLocaleString()}
                      {item.countLabel && <div style={{ fontSize: 9, fontWeight: 400, color: 'var(--text-muted)' }}>{item.countLabel}</div>}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>

          {totalPages > 1 && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px', borderTop: '1px solid var(--border-dim)', fontSize: 11, color: 'var(--text-muted)' }}>
              <span>{filtered.length} 个结果 · 第 {page + 1}/{totalPages} 页</span>
              <div style={{ display: 'flex', gap: 4 }}>
                <button type="button" className="btn btn-ghost btn-sm" style={{ padding: '4px 8px' }} disabled={page === 0} onClick={() => setPage(p => p - 1)}>
                  <ChevronLeft size={12} />
                </button>
                <button type="button" className="btn btn-ghost btn-sm" style={{ padding: '4px 8px' }} disabled={page >= totalPages - 1} onClick={() => setPage(p => p + 1)}>
                  <ChevronRight size={12} />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
