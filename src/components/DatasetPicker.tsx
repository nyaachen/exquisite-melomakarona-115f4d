import { useState, useRef, useEffect, useMemo } from 'react'
import { Search, ChevronDown, ChevronLeft, ChevronRight, X, CheckCircle2, Layers } from 'lucide-react'

export interface DatasetEntry {
  id: string
  name: string
  type: 'parent' | 'subdataset'
  parentName?: string
  totalImages: number
  trainImages: number
  valImages: number
  testImages: number
  classes: string[]
}

interface Props {
  label: string
  color: string
  selectedId: string
  onChange: (id: string) => void
  entries: DatasetEntry[]
  imageKey: 'trainImages' | 'valImages' | 'testImages'
}

const PAGE_SIZE = 6

export function DatasetPicker({ label, color, selectedId, onChange, entries, imageKey }: Props) {
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

  // Reset page when search changes
  useEffect(() => { setPage(0) }, [search])

  const selected = entries.find(e => e.id === selectedId)
  const imageCount = selected ? selected[imageKey] : 0

  const filtered = useMemo(() => {
    if (!search.trim()) return entries
    const q = search.toLowerCase()
    return entries.filter(e =>
      e.name.toLowerCase().includes(q) ||
      (e.parentName && e.parentName.toLowerCase().includes(q)) ||
      e.classes.some(c => c.toLowerCase().includes(q))
    )
  }, [entries, search])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const paged = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE)

  const parentEntries = paged.filter(e => e.type === 'parent')
  const subEntries = paged.filter(e => e.type === 'subdataset')

  function select(id: string) {
    onChange(id)
    setOpen(false)
    setSearch('')
    setPage(0)
  }

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      {/* Label */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
        <div style={{ width: 7, height: 7, background: color, flexShrink: 0 }} />
        <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)' }}>{label}</span>
      </div>

      {/* Trigger */}
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
          border: `1px solid ${open ? color : 'var(--border-default)'}`,
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
              <span style={{
                fontSize: 10,
                padding: '1px 6px',
                background: selected?.type === 'subdataset' ? 'rgba(13,148,136,0.12)' : 'rgba(27,107,239,0.1)',
                color: selected?.type === 'subdataset' ? 'var(--teal)' : 'var(--accent-bright)',
                fontWeight: 600,
              }}>
                {selected?.type === 'subdataset' ? '子数据集' : '父数据集'}
              </span>
              <span>{selected?.name}</span>
              <span style={{ fontSize: 11, fontFamily: 'JetBrains Mono', color, fontWeight: 600, marginLeft: 'auto' }}>
                {imageCount.toLocaleString()} 张
              </span>
            </span>
          ) : (
            '点击选择数据集...'
          )}
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 }}>
          {selectedId && (
            <span
              onClick={(e) => { e.stopPropagation(); onChange('') }}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                width: 18, height: 18, color: 'var(--text-muted)',
                transition: 'color 0.15s',
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = 'var(--error)' }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'var(--text-muted)' }}
            >
              <X size={13} />
            </span>
          )}
          <ChevronDown size={14} style={{ color: 'var(--text-muted)', transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
        </div>
      </button>

      {/* Dropdown Panel */}
      {open && (
        <div style={{
          position: 'absolute',
          top: '100%',
          left: 0,
          right: 0,
          marginTop: 4,
          background: 'var(--bg-card)',
          border: '1px solid var(--border-default)',
          boxShadow: '0 12px 32px rgba(0,0,0,0.12), 0 0 0 1px rgba(0,0,0,0.04)',
          zIndex: 50,
          animation: 'slideDown 0.15s ease-out',
          minWidth: 360,
        }}>
          {/* Search */}
          <div style={{ padding: '10px 12px', borderBottom: '1px solid var(--border-dim)' }}>
            <div className="search-input" style={{ minWidth: 'auto', width: '100%' }}>
              <Search size={13} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
              <input
                type="text"
                className="search-input-field"
                placeholder="搜索数据集名称或标签..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                autoFocus
              />
            </div>
          </div>

          {/* List */}
          <div style={{ maxHeight: 320, overflowY: 'auto', padding: '6px 8px' }}>
            {filtered.length === 0 ? (
              <div style={{ padding: '32px 16px', textAlign: 'center', fontSize: 12, color: 'var(--text-muted)' }}>
                未找到匹配的数据集
              </div>
            ) : (
              <>
                {parentEntries.length > 0 && (
                  <div>
                    <div style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', padding: '6px 6px 4px' }}>
                      父数据集
                    </div>
                    {parentEntries.map(entry => (
                      <DatasetRow
                        key={entry.id}
                        entry={entry}
                        imageKey={imageKey}
                        isSelected={selectedId === entry.id}
                        color={color}
                        onSelect={select}
                      />
                    ))}
                  </div>
                )}
                {subEntries.length > 0 && (
                  <div>
                    <div style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', padding: '6px 6px 4px', marginTop: parentEntries.length > 0 ? 6 : 0 }}>
                      子数据集
                    </div>
                    {subEntries.map(entry => (
                      <DatasetRow
                        key={entry.id}
                        entry={entry}
                        imageKey={imageKey}
                        isSelected={selectedId === entry.id}
                        color={color}
                        onSelect={select}
                      />
                    ))}
                  </div>
                )}
              </>
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '8px 12px', borderTop: '1px solid var(--border-dim)',
              fontSize: 11, color: 'var(--text-muted)',
            }}>
              <span>{filtered.length} 个结果 · 第 {page + 1}/{totalPages} 页</span>
              <div style={{ display: 'flex', gap: 4 }}>
                <button
                  type="button"
                  className="btn btn-ghost btn-sm"
                  style={{ padding: '4px 8px' }}
                  disabled={page === 0}
                  onClick={() => setPage(p => p - 1)}
                >
                  <ChevronLeft size={12} />
                </button>
                <button
                  type="button"
                  className="btn btn-ghost btn-sm"
                  style={{ padding: '4px 8px' }}
                  disabled={page >= totalPages - 1}
                  onClick={() => setPage(p => p + 1)}
                >
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

function DatasetRow({ entry, imageKey, isSelected, color, onSelect }: {
  entry: DatasetEntry
  imageKey: 'trainImages' | 'valImages' | 'testImages'
  isSelected: boolean
  color: string
  onSelect: (id: string) => void
}) {
  return (
    <div
      onClick={() => onSelect(entry.id)}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 8,
        padding: '9px 8px',
        cursor: 'pointer',
        background: isSelected ? `${color}0D` : 'transparent',
        border: `1px solid ${isSelected ? `${color}30` : 'transparent'}`,
        transition: 'background 0.1s',
      }}
      onMouseEnter={e => { if (!isSelected) (e.currentTarget as HTMLElement).style.background = 'var(--bg-hover)' }}
      onMouseLeave={e => { if (!isSelected) (e.currentTarget as HTMLElement).style.background = 'transparent' }}
    >
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          {isSelected && <CheckCircle2 size={12} style={{ color, flexShrink: 0 }} />}
          <span style={{
            fontSize: 12.5,
            fontWeight: isSelected ? 600 : 400,
            color: 'var(--text-primary)',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}>
            {entry.name}
          </span>
        </div>
        <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 2, marginLeft: isSelected ? 18 : 0 }}>
          {entry.type === 'subdataset' ? (
            <>来自「{entry.parentName}」· 已预划分</>
          ) : (
            <>{entry.classes.length} 个类别 · {entry.totalImages.toLocaleString()} 张图片</>
          )}
        </div>
        {/* Class tags */}
        {entry.classes.length <= 5 && (
          <div style={{ display: 'flex', gap: 3, flexWrap: 'wrap', marginTop: 3, marginLeft: isSelected ? 18 : 0 }}>
            {entry.classes.map(cls => (
              <span key={cls} style={{ fontSize: 9, padding: '1px 4px', background: 'var(--bg-elevated)', color: 'var(--text-muted)', border: '1px solid var(--border-dim)' }}>
                {cls}
              </span>
            ))}
          </div>
        )}
      </div>
      <div style={{
        fontSize: 11,
        fontFamily: 'JetBrains Mono',
        fontWeight: 600,
        color,
        flexShrink: 0,
        textAlign: 'right',
      }}>
        {entry[imageKey].toLocaleString()}
        <div style={{ fontSize: 9, fontWeight: 400, color: 'var(--text-muted)' }}>可用</div>
      </div>
    </div>
  )
}
