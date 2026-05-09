import { useState, useMemo } from 'react'
import {
  ScrollText,
  Search,
  User,
  Cpu,
  AlertTriangle,
  Clock,
  ChevronDown,
  X,
} from 'lucide-react'

type LogCategory = 'user' | 'system' | 'error'
type LogLevel = 'info' | 'success' | 'warning' | 'error'

interface LogEntry {
  id: string
  timestamp: string
  category: LogCategory
  level: LogLevel
  actor: string
  message: string
  detail?: string
}

const MOCK_LOGS: LogEntry[] = [
  { id: 'log-001', timestamp: '2026-05-09 14:32:11', category: 'user', level: 'info', actor: '张工', message: '用户登录系统', detail: 'IP: 192.168.1.100' },
  { id: 'log-002', timestamp: '2026-05-09 14:28:05', category: 'user', level: 'info', actor: '张工', message: '创建训练任务', detail: '任务: task-006 · YOLOv8-n 安全帽检测 v2' },
  { id: 'log-003', timestamp: '2026-05-09 13:55:42', category: 'user', level: 'info', actor: '李工', message: '发布模型到科宝智能体中台', detail: '模型: model-001 · YOLOv8-s 安全帽检测 v3' },
  { id: 'log-004', timestamp: '2026-05-09 13:20:18', category: 'user', level: 'info', actor: '张工', message: '创建子数据集', detail: '子数据集: sub-005 · 安全帽场景-训练集' },
  { id: 'log-005', timestamp: '2026-05-09 12:10:33', category: 'user', level: 'info', actor: '张工', message: '修改模型模板', detail: '模板: YOLOv8-s · 更新超参数配置' },
  { id: 'log-006', timestamp: '2026-05-09 11:45:09', category: 'user', level: 'info', actor: '李工', message: '用户登录系统', detail: 'IP: 192.168.1.101' },
  { id: 'log-007', timestamp: '2026-05-09 11:30:22', category: 'user', level: 'warning', actor: '王工', message: '尝试删除正在运行的任务被拒绝', detail: '任务: task-003 · 状态: running' },
  { id: 'log-008', timestamp: '2026-05-09 10:15:47', category: 'user', level: 'info', actor: '张工', message: '创建训练预设', detail: '预设: YOLOv8-m 安全帽标准预设' },
  { id: 'log-009', timestamp: '2026-05-09 09:50:03', category: 'user', level: 'info', actor: '张工', message: '导入数据集', detail: '数据集: ds-004 · 安全帽检测场景' },
  { id: 'log-010', timestamp: '2026-05-09 09:05:11', category: 'user', level: 'info', actor: '张工', message: '用户登录系统', detail: 'IP: 192.168.1.100' },
  { id: 'log-011', timestamp: '2026-05-08 18:22:30', category: 'user', level: 'info', actor: '李工', message: '创建验证任务', detail: '验证: val-002 · 模型 model-001 在 sub-003 上验证' },
  { id: 'log-012', timestamp: '2026-05-08 17:10:55', category: 'user', level: 'info', actor: '李工', message: '手动上传模型文件', detail: '文件: best.pt · 52.3 MB' },
  { id: 'log-013', timestamp: '2026-05-08 16:40:18', category: 'user', level: 'warning', actor: '张工', message: '数据集同步超时，已自动重试', detail: '数据集: ds-003 · 重试次数: 2/3' },
  { id: 'log-101', timestamp: '2026-05-09 14:32:15', category: 'system', level: 'info', actor: '调度器', message: '为任务 task-006 分配计算资源', detail: 'GPU: A5000-03 · 显存: 24GB · 优先级: 高' },
  { id: 'log-102', timestamp: '2026-05-09 14:32:18', category: 'system', level: 'info', actor: '调度器', message: '任务 task-006 开始执行', detail: '容器启动 · 镜像: yolo-train:v2.4 · Epoch 1/100' },
  { id: 'log-103', timestamp: '2026-05-09 14:35:42', category: 'system', level: 'success', actor: '调度器', message: '任务 task-005 训练完成', detail: '耗时: 2h 14m · mAP@0.5: 0.923 · 最佳Epoch: 78/100' },
  { id: 'log-104', timestamp: '2026-05-09 12:50:10', category: 'system', level: 'info', actor: '调度器', message: '为任务 task-005 分配计算资源', detail: 'GPU: A5000-01 · 显存: 24GB · 优先级: 中' },
  { id: 'log-105', timestamp: '2026-05-09 12:50:14', category: 'system', level: 'info', actor: '调度器', message: '任务 task-005 开始执行', detail: '容器启动 · 镜像: yolo-train:v2.4 · Epoch 1/100' },
  { id: 'log-106', timestamp: '2026-05-09 10:30:00', category: 'system', level: 'info', actor: '调度器', message: 'GPU 资源池健康检查通过', detail: '在线节点: 4/4 · 可用显存: 72GB / 96GB' },
  { id: 'log-107', timestamp: '2026-05-09 08:00:05', category: 'system', level: 'info', actor: '调度器', message: '验证任务 val-001 开始执行', detail: '模型: model-001 · 数据集: sub-003 · GPU: A5000-02' },
  { id: 'log-108', timestamp: '2026-05-09 07:55:32', category: 'system', level: 'success', actor: '调度器', message: '验证任务 val-001 执行完成', detail: '耗时: 4m 33s · mAP@0.5: 0.918 · 评级: A' },
  { id: 'log-109', timestamp: '2026-05-08 23:00:00', category: 'system', level: 'info', actor: '调度器', message: '系统自动备份完成', detail: '备份大小: 1.2GB · 存储位置: /backups/2026-05-08/' },
  { id: 'log-110', timestamp: '2026-05-08 20:15:44', category: 'system', level: 'info', actor: '调度器', message: '为任务 task-004 分配计算资源', detail: 'GPU: A5000-00 · 显存: 24GB · 优先级: 高' },
  { id: 'log-111', timestamp: '2026-05-08 20:15:48', category: 'system', level: 'info', actor: '调度器', message: '任务 task-004 开始执行', detail: '容器启动 · 镜像: yolo-train:v2.4 · Epoch 1/150' },
  { id: 'log-112', timestamp: '2026-05-08 14:20:33', category: 'system', level: 'success', actor: '调度器', message: '任务 task-003 训练完成', detail: '耗时: 3h 5m · mAP@0.5: 0.891 · 最佳Epoch: 112/150' },
  { id: 'log-201', timestamp: '2026-05-09 14:32:30', category: 'error', level: 'error', actor: 'task-006', message: '训练过程出现梯度爆炸警告', detail: 'Epoch 3 · Batch 128 · grad_norm: 142.3 · 已自动应用梯度裁剪 (max_norm=10.0)' },
  { id: 'log-202', timestamp: '2026-05-09 12:52:10', category: 'error', level: 'error', actor: 'task-005', message: '数据加载超时，重试中', detail: 'Dataset: sub-002 · Batch 失败，等待 30s 重试 · 重试 1/5' },
  { id: 'log-203', timestamp: '2026-05-09 10:15:33', category: 'error', level: 'error', actor: 'GPU A5000-02', message: 'GPU 显存不足告警', detail: '已用: 22.8GB / 24GB · 利用率: 95% · 建议调度至其他节点' },
  { id: 'log-204', timestamp: '2026-05-09 09:50:10', category: 'error', level: 'warning', actor: '数据集服务', message: '数据集 ds-004 标注格式校验异常，已自动修复', detail: '发现 3 条标注缺少 class_id · 已根据 label 名称自动匹配' },
  { id: 'log-205', timestamp: '2026-05-08 22:30:00', category: 'error', level: 'error', actor: 'task-003', message: '训练过程中出现 NaN Loss', detail: 'Epoch 45 · Batch 256 · loss: NaN · Learning rate 自动降低至 1e-5 · 恢复训练' },
  { id: 'log-206', timestamp: '2026-05-08 18:40:22', category: 'error', level: 'error', actor: '模型服务', message: '模型 model-002 导出 ONNX 格式失败', detail: '错误: Unsupported op "Focus" in ONNX export · 已回退至 TorchScript 格式' },
  { id: 'log-207', timestamp: '2026-05-08 16:40:20', category: 'error', level: 'warning', actor: '调度器', message: '节点 A5000-03 响应延迟过高', detail: 'Ping: 350ms · 阈值: 100ms · 暂时降级，监控中' },
  { id: 'log-208', timestamp: '2026-05-08 15:12:08', category: 'error', level: 'error', actor: 'task-002', message: '训练过程 OOM 错误，已自动重启', detail: 'OOM at Epoch 28 · Batch size 从 64 降至 32 · 重新分配显存' },
  { id: 'log-209', timestamp: '2026-05-08 11:20:45', category: 'error', level: 'warning', actor: '验证服务', message: '验证任务 val-001 部分类别无标注样本', detail: '类别: "forklift" 在验证集中无标注 · 已跳过该类别评估' },
  { id: 'log-210', timestamp: '2026-05-08 09:05:00', category: 'error', level: 'error', actor: '存储服务', message: '模型文件存储空间不足告警', detail: '已用: 92% · 可用: 18GB / 256GB · 建议清理历史版本' },
]

const CATEGORY_CONFIG: Record<LogCategory, { label: string; icon: React.ReactNode; badgeClass: string }> = {
  user:   { label: '用户行为', icon: <User size={12} />,   badgeClass: 'badge badge-teal' },
  system:{ label: '系统调度', icon: <Cpu size={12} />,    badgeClass: 'badge badge-running' },
  error: { label: '任务报错', icon: <AlertTriangle size={12} />, badgeClass: 'badge badge-failed' },
}

const LEVEL_CONFIG: Record<LogLevel, { label: string; color: string }> = {
  info:    { label: 'INFO',    color: 'var(--text-muted)' },
  success: { label: 'SUCCESS', color: 'var(--success)' },
  warning: { label: 'WARN',    color: 'var(--warning)' },
  error:   { label: 'ERROR',   color: 'var(--error)' },
}

export function SystemLogs() {
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<LogCategory | 'all'>('all')
  const [levelFilter, setLevelFilter] = useState<LogLevel | 'all'>('all')
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const filteredLogs = useMemo(() => {
    return MOCK_LOGS.filter((log) => {
      if (categoryFilter !== 'all' && log.category !== categoryFilter) return false
      if (levelFilter !== 'all' && log.level !== levelFilter) return false
      if (search) {
        const s = search.toLowerCase()
        return (
          log.message.toLowerCase().includes(s) ||
          log.actor.toLowerCase().includes(s) ||
          (log.detail && log.detail.toLowerCase().includes(s))
        )
      }
      return true
    })
  }, [search, categoryFilter, levelFilter])

  const stats = useMemo(() => {
    return {
      total: MOCK_LOGS.length,
      user: MOCK_LOGS.filter((l) => l.category === 'user').length,
      system: MOCK_LOGS.filter((l) => l.category === 'system').length,
      error: MOCK_LOGS.filter((l) => l.category === 'error').length,
    }
  }, [])

  return (
    <div>
      <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 6 }}>
        <Clock size={13} />
        <span>最近 {MOCK_LOGS.length} 条记录</span>
      </div>

      {/* Stats */}
      <div className="grid-4 mb-5">
        <div className="stat-card">
          <div className="stat-label">总日志数</div>
          <div className="stat-value">{stats.total}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <User size={12} style={{ color: 'var(--teal)' }} /> 用户行为
          </div>
          <div className="stat-value" style={{ color: 'var(--teal)' }}>{stats.user}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Cpu size={12} style={{ color: 'var(--accent-bright)' }} /> 系统调度
          </div>
          <div className="stat-value" style={{ color: 'var(--accent-bright)' }}>{stats.system}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <AlertTriangle size={12} style={{ color: 'var(--error)' }} /> 任务报错
          </div>
          <div className="stat-value" style={{ color: 'var(--error)' }}>{stats.error}</div>
        </div>
      </div>

      {/* Filters */}
      <div className="card card-padded mb-4">
        <div className="d-flex items-center gap-4 flex-wrap">
          <div className="search-input" style={{ flex: 1, minWidth: 240 }}>
            <Search size={14} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
            <input
              className="search-input-field"
              placeholder="搜索日志内容、操作人或详情…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2, color: 'var(--text-muted)' }}
              >
                <X size={14} />
              </button>
            )}
          </div>
          <div className="filter-select">
            <select
              className="filter-select-field"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value as LogCategory | 'all')}
            >
              <option value="all">全部类别</option>
              <option value="user">用户行为</option>
              <option value="system">系统调度</option>
              <option value="error">任务报错</option>
            </select>
          </div>
          <div className="filter-select">
            <select
              className="filter-select-field"
              value={levelFilter}
              onChange={(e) => setLevelFilter(e.target.value as LogLevel | 'all')}
            >
              <option value="all">全部级别</option>
              <option value="info">INFO</option>
              <option value="success">SUCCESS</option>
              <option value="warning">WARNING</option>
              <option value="error">ERROR</option>
            </select>
          </div>
        </div>
      </div>

      {/* Log List */}
      <div className="card">
        {filteredLogs.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon"><ScrollText size={40} /></div>
            <div className="empty-state-text">没有匹配的日志记录</div>
            <div className="empty-state-hint">尝试调整筛选条件或搜索关键词</div>
          </div>
        ) : (
          <div className="log-list">
            {filteredLogs.map((log) => {
              const catCfg = CATEGORY_CONFIG[log.category]
              const lvlCfg = LEVEL_CONFIG[log.level]
              const isExpanded = expandedId === log.id

              return (
                <div key={log.id} className="log-item">
                  <div
                    className={`log-item-main ${log.detail ? 'cursor-pointer' : ''}`}
                    onClick={() => log.detail && setExpandedId(isExpanded ? null : log.id)}
                  >
                    <span className="log-time">{log.timestamp}</span>
                    <span className={catCfg.badgeClass}>
                      {catCfg.icon}
                      {catCfg.label}
                    </span>
                    <span className="log-actor">{log.actor}</span>
                    <span className="log-msg">{log.message}</span>
                    <span className="log-level" style={{ color: lvlCfg.color }}>[{lvlCfg.label}]</span>
                    {log.detail && (
                      <ChevronDown
                        size={14}
                        className="log-chevron"
                        style={{ transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)' }}
                      />
                    )}
                  </div>
                  {isExpanded && log.detail && (
                    <div className="log-detail">{log.detail}</div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
