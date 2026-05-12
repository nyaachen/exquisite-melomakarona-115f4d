import { createFileRoute, Link } from '@tanstack/react-router'
import { useState, useRef, useEffect, useCallback } from 'react'
import { ArrowLeft, Send, Server, Cpu, Clock, Square } from 'lucide-react'
import { NotFound } from '../../../components/NotFound'
import { GPU_SERVERS } from '../../../data/gpuServers'
import { useSimulatedWebSocket, type ConnectionStatus } from '../../../lib/useSimulatedWebSocket'

export const Route = createFileRoute('/gpu-servers/$serverId/execute')({
  component: ExecuteCommand,
})

interface LogLine {
  id: number
  text: string
  type: 'info' | 'success' | 'warn' | 'error' | 'dim'
  timestamp: string
}

const SIMULATED_LOGS: Record<string, LogLine[]> = {
  'nvidia-smi': [
    { id: 1, text: 'Tue May 11 14:32:10 2026', type: 'info', timestamp: '14:32:10' },
    { id: 2, text: '+-----------------------------------------------------------------------------+', type: 'dim', timestamp: '14:32:10' },
    { id: 3, text: '| NVIDIA-SMI 550.90.07    Driver Version: 550.90.07    CUDA Version: 12.4     |', type: 'info', timestamp: '14:32:10' },
    { id: 4, text: '|-------------------------------+----------------------+----------------------|', type: 'dim', timestamp: '14:32:10' },
    { id: 5, text: '| GPU  Name        Persistence-M| Bus-Id        Disp.A | Volatile Uncorr. ECC |', type: 'dim', timestamp: '14:32:10' },
    { id: 6, text: '| Fan  Temp  Perf  Pwr:Usage/Cap|         Memory-Usage | GPU-Util  Compute M. |', type: 'dim', timestamp: '14:32:10' },
    { id: 7, text: '|                               |                      |               MIG M. |', type: 'dim', timestamp: '14:32:10' },
    { id: 8, text: '|===============================+======================+======================|', type: 'dim', timestamp: '14:32:10' },
    { id: 9, text: '|   0  NVIDIA A100          On  | 00000000:00:1E.0 Off |                    0 |', type: 'info', timestamp: '14:32:10' },
    { id: 10, text: '| N/A   42C    P0    68W / 400W |  45231MiB / 81920MiB |     78%      Default |', type: 'info', timestamp: '14:32:10' },
    { id: 11, text: '+-------------------------------+----------------------+----------------------+', type: 'dim', timestamp: '14:32:10' },
    { id: 12, text: '|   1  NVIDIA A100          On  | 00000000:00:1F.0 Off |                    0 |', type: 'info', timestamp: '14:32:10' },
    { id: 13, text: '| N/A   39C    P0    62W / 400W |  39876MiB / 81920MiB |     65%      Default |', type: 'info', timestamp: '14:32:10' },
    { id: 14, text: '+-------------------------------+----------------------+----------------------+', type: 'dim', timestamp: '14:32:10' },
    { id: 15, text: '', type: 'info', timestamp: '14:32:10' },
    { id: 16, text: '+-----------------------------------------------------------------------------+', type: 'dim', timestamp: '14:32:10' },
    { id: 17, text: '| Processes:                                                                  |', type: 'dim', timestamp: '14:32:10' },
    { id: 18, text: '|  GPU   GI   CI        PID   Type   Process name                  GPU Memory |', type: 'dim', timestamp: '14:32:10' },
    { id: 19, text: '|  ID                   ID                                                   Usage      |', type: 'dim', timestamp: '14:32:10' },
    { id: 20, text: '|=============================================================================|', type: 'dim', timestamp: '14:32:10' },
    { id: 21, text: '|    0   N/A  N/A      1234      C   python3.10                     45100MiB |', type: 'info', timestamp: '14:32:10' },
    { id: 22, text: '|    1   N/A  N/A      1235      C   python3.10                     39800MiB |', type: 'info', timestamp: '14:32:10' },
    { id: 23, text: '+-----------------------------------------------------------------------------+', type: 'dim', timestamp: '14:32:10' },
    { id: 24, text: '命令执行完成 (exit code: 0)', type: 'success', timestamp: '14:32:10' },
  ],
  'ls -la /data/models': [
    { id: 1, text: 'total 48', type: 'dim', timestamp: '14:33:02' },
    { id: 2, text: 'drwxr-xr-x  6 root root  4096 May 10 08:30 .', type: 'dim', timestamp: '14:33:02' },
    { id: 3, text: 'drwxr-xr-x 15 root root  4096 May  1 12:00 ..', type: 'dim', timestamp: '14:33:02' },
    { id: 4, text: 'drwxr-xr-x  3 root root  4096 May  8 15:22 yolov8', type: 'info', timestamp: '14:33:02' },
    { id: 5, text: 'drwxr-xr-x  3 root root  4096 May  9 10:15 road-defect-v2', type: 'info', timestamp: '14:33:02' },
    { id: 6, text: 'drwxr-xr-x  3 root root  4096 Apr 28 09:45 person-fall', type: 'info', timestamp: '14:33:02' },
    { id: 7, text: '-rw-r--r--  1 root root 12288 May 10 08:30 .index.db', type: 'dim', timestamp: '14:33:02' },
    { id: 8, text: '命令执行完成 (exit code: 0)', type: 'success', timestamp: '14:33:02' },
  ],
  'docker ps': [
    { id: 1, text: 'CONTAINER ID   IMAGE                              COMMAND       CREATED        STATUS        PORTS     NAMES', type: 'dim', timestamp: '14:34:15' },
    { id: 2, text: 'a1b2c3d4e5f6   nvcr.io/nvidia/pytorch:24.04-py3   "jupyter"     3 days ago     Up 3 days               train-task-001', type: 'info', timestamp: '14:34:15' },
    { id: 3, text: 'b2c3d4e5f6a7   nvcr.io/nvidia/pytorch:24.04-py3   "jupyter"     5 days ago     Up 5 days               train-task-005', type: 'info', timestamp: '14:34:15' },
    { id: 4, text: 'c3d4e5f6a7b8   kebao/inference:latest              "serve"       2 weeks ago    Up 2 weeks              infer-gpu-003', type: 'info', timestamp: '14:34:15' },
    { id: 5, text: '命令执行完成 (exit code: 0)', type: 'success', timestamp: '14:34:15' },
  ],
}

function getLogsForCommand(command: string): LogLine[] {
  const trimmed = command.trim()
  if (trimmed.startsWith('nvidia-smi')) return SIMULATED_LOGS['nvidia-smi']
  if (trimmed.includes('ls ') && trimmed.includes('/data')) return SIMULATED_LOGS['ls -la /data/models']
  if (trimmed.startsWith('docker')) return SIMULATED_LOGS['docker ps']
  return [
    { id: 1, text: `$ ${trimmed}`, type: 'info', timestamp: new Date().toLocaleTimeString('zh-CN', { hour12: false }) },
    { id: 2, text: `执行中...`, type: 'info', timestamp: new Date().toLocaleTimeString('zh-CN', { hour12: false }) },
    { id: 3, text: `命令执行完成 (exit code: 0)`, type: 'success', timestamp: new Date().toLocaleTimeString('zh-CN', { hour12: false }) },
  ]
}

// ─── WebSocket 状态显示 ───

function WsStatusBadge({ status }: { status: ConnectionStatus }) {
  return (
    <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11 }}>
      <span style={{
        width: 7, height: 7, borderRadius: '50%',
        background: status === 'connected' ? 'var(--success)' : status === 'connecting' ? 'var(--warning)' : 'var(--text-muted)',
      }} />
      <span style={{ color: status === 'connected' ? 'var(--success)' : 'var(--text-muted)' }}>
        {status === 'connected' ? 'WS 已连接' : status === 'connecting' ? 'WS 连接中…' : 'WS 未连接'}
      </span>
    </span>
  )
}

function ExecuteCommand() {
  const { serverId } = Route.useParams()
  const server = GPU_SERVERS.find(s => s.id === serverId)
  if (!server) return <NotFound />
  const { host, port, username } = server

  const [command, setCommand] = useState('')
  const [logs, setLogs] = useState<LogLine[]>([])
  const [running, setRunning] = useState(false)
  const [logIdCounter, setLogIdCounter] = useState(0)
  const logEndRef = useRef<HTMLDivElement>(null)
  const runningRef = useRef(false)

  // WebSocket — 命令执行期间维持连接，接收实时输出
  const { status: wsStatus, connect, disconnect } = useSimulatedWebSocket<{ text: string }>({
    generateData: () => ({ text: 'heartbeat' }),
    onData: () => {
      // 心跳包静默处理，实际数据通过 handleRun 的 interval 推送
    },
  })

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [logs])

  // 命令执行时建立 WS，执行完毕后断开
  useEffect(() => {
    if (running && wsStatus === 'disconnected') {
      connect()
    } else if (!running && wsStatus === 'connected') {
      disconnect()
    }
  }, [running, wsStatus, connect, disconnect])

  const stopExecution = useCallback(() => {
    runningRef.current = false
    setRunning(false)
    setLogs(prev => [...prev, {
      id: logIdCounter + 1000,
      text: '用户终止执行',
      type: 'warn',
      timestamp: new Date().toLocaleTimeString('zh-CN', { hour12: false }),
    }])
    setLogIdCounter(prev => prev + 1)
  }, [logIdCounter])

  function handleRun() {
    if (!command.trim() || running) return

    const now = new Date().toLocaleTimeString('zh-CN', { hour12: false })
    setLogs([
      { id: 1, text: `┌─ 建立 WebSocket 连接到: ${host}:${port}`, type: 'dim', timestamp: now },
      { id: 2, text: `├─ 认证用户: ${username}`, type: 'dim', timestamp: now },
      { id: 3, text: `├─ 执行命令: ${command.trim()}`, type: 'info', timestamp: now },
      { id: 4, text: '', type: 'info', timestamp: now },
    ])

    const sourceLogs = getLogsForCommand(command)
    setLogIdCounter(sourceLogs.length)
    setRunning(true)
    runningRef.current = true

    let index = 0
    const interval = setInterval(() => {
      if (!runningRef.current || index >= sourceLogs.length) {
        clearInterval(interval)
        if (runningRef.current) {
          setLogs(prev => [...prev, {
            id: prev.length + index + 2,
            text: `WebSocket 连接关闭 (exit code: 0)`,
            type: 'dim',
            timestamp: new Date().toLocaleTimeString('zh-CN', { hour12: false }),
          }])
          setRunning(false)
        }
        return
      }
      setLogs(prev => [...prev, { ...sourceLogs[index], id: prev.length + index + 1 }])
      index++
      if (index >= sourceLogs.length) {
        clearInterval(interval)
        setLogs(prev => [...prev, {
          id: prev.length + index + 2,
          text: `WebSocket 连接关闭 (exit code: 0)`,
          type: 'dim',
          timestamp: new Date().toLocaleTimeString('zh-CN', { hour12: false }),
        }])
        setRunning(false)
      }
    }, 150)
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleRun()
    }
  }

  const PRESET_COMMANDS = [
    { label: 'GPU 状态', cmd: 'nvidia-smi' },
    { label: '模型目录', cmd: 'ls -la /data/models' },
    { label: '容器列表', cmd: 'docker ps' },
  ]

  return (
    <div style={{ animation: 'slideIn 0.3s ease-out' }}>
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Link to="/gpu-servers" className="btn btn-ghost btn-sm">
            <ArrowLeft size={14} /> 返回
          </Link>
          <div>
            <div className="breadcrumb">科宝训练平台 › GPU 服务器 › 任务执行</div>
            <h1 className="page-title">任务执行</h1>
          </div>
        </div>
      </div>

      <div className="content-padded" style={{ maxWidth: 960, margin: '0 auto' }}>
        {/* Server Info */}
        <div className="card" style={{ padding: 16, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{
            width: 40, height: 40, borderRadius: 4,
            background: server.status === 'online' ? 'var(--success-glow)' : 'var(--error-glow)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: server.status === 'online' ? 'var(--success)' : 'var(--error)',
          }}>
            <Server size={20} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)' }}>{server.name}</div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', fontFamily: 'JetBrains Mono' }}>
              {server.host}:{server.port} · {server.username}
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <WsStatusBadge status={wsStatus} />
            {server.gpus.slice(0, 4).map(g => (
              <span key={g.id} style={{
                fontSize: 11, padding: '3px 8px',
                background: 'var(--bg-elevated)',
                border: '1px solid var(--border-dim)',
                fontFamily: 'JetBrains Mono',
                color: 'var(--text-secondary)',
              }}>
                <Cpu size={9} style={{ marginRight: 4, display: 'inline' }} />
                GPU{g.index}
              </span>
            ))}
          </div>
        </div>

        {/* Command Input */}
        <div className="card" style={{ padding: 20, marginBottom: 20 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 12 }}>
            执行指令
          </div>

          <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
            {PRESET_COMMANDS.map(p => (
              <button
                key={p.cmd}
                className="btn btn-ghost btn-sm"
                onClick={() => setCommand(p.cmd)}
                disabled={running}
                style={{ fontFamily: 'JetBrains Mono', fontSize: 11 }}
              >
                {p.label}
              </button>
            ))}
          </div>

          <div className="command-input-area" style={{ background: '#020811', border: '1px solid var(--border-default)', borderRadius: 4, padding: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', padding: '8px 12px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              <span style={{ fontFamily: 'JetBrains Mono', fontSize: 11, color: 'var(--success)' }}>
                {server.username}@{server.host}
              </span>
              <span style={{ fontFamily: 'JetBrains Mono', fontSize: 11, color: 'var(--text-muted)', margin: '0 6px' }}>:</span>
              <span style={{ fontFamily: 'JetBrains Mono', fontSize: 11, color: 'var(--accent-bright)' }}>~</span>
              <span style={{ fontFamily: 'JetBrains Mono', fontSize: 11, color: 'var(--text-muted)' }}>$</span>
            </div>
            <textarea
              className="command-textarea"
              value={command}
              onChange={e => setCommand(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="输入要执行的命令，按 Enter 执行..."
              disabled={running}
              rows={3}
              style={{
                width: '100%',
                background: 'transparent',
                border: 'none',
                color: '#e8edf8',
                fontFamily: 'JetBrains Mono',
                fontSize: 13,
                padding: '12px',
                resize: 'vertical',
                outline: 'none',
              }}
            />
          </div>

          <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
            {running ? (
              <button className="btn btn-warning" onClick={stopExecution}>
                <Square size={14} /> 停止执行
              </button>
            ) : (
              <button className="btn btn-primary" onClick={handleRun} disabled={!command.trim()}>
                <Send size={14} /> 执行
              </button>
            )}
            <span style={{ fontSize: 11, color: 'var(--text-muted)', display: 'flex', alignItems: 'center' }}>
              Shift + Enter 换行，Enter 执行
            </span>
          </div>
        </div>

        {/* Log Output */}
        <div className="card">
          <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--border-dim)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 8 }}>
              <Clock size={14} style={{ color: 'var(--text-muted)' }} />
              执行日志
            </div>
            {logs.length > 0 && (
              <button className="btn btn-ghost btn-sm" onClick={() => setLogs([])}>
                清空
              </button>
            )}
          </div>
          <div className="log-terminal" style={{ minHeight: 400, maxHeight: 520 }}>
            {logs.length === 0 ? (
              <div style={{ color: 'var(--text-muted)', fontStyle: 'italic', padding: '40px 0', textAlign: 'center' }}>
                输入命令并点击"执行"通过 WebSocket 执行远程命令
              </div>
            ) : (
              logs.map(log => (
                <span
                  key={log.id}
                  className={`log-line ${log.type === 'success' ? 'log-success' : log.type === 'warn' ? 'log-warn' : log.type === 'error' ? 'log-error' : log.type === 'dim' ? 'log-dim' : 'log-info'}`}
                >
                  {log.text || ' '}
                  {'\n'}
                </span>
              ))
            )}
            {running && (
              <span className="cursor-blink" style={{ color: 'var(--accent-bright)' }}>▌</span>
            )}
            <div ref={logEndRef} />
          </div>
        </div>
      </div>
    </div>
  )
}
