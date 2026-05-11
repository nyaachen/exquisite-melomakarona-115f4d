import { useState, useEffect, useRef, useCallback } from 'react'

export type ConnectionStatus = 'disconnected' | 'connecting' | 'connected'

interface SimulatedWebSocketOptions<T> {
  /** 模拟从服务器接收的数据生成器 */
  generateData: () => T
  /** 收到新数据时的回调 */
  onData: (data: T) => void
  /** 数据推送间隔（毫秒），默认 5000 */
  dataIntervalMs?: number
  /** 心跳间隔（毫秒），默认 30000 */
  heartbeatIntervalMs?: number
}

export function useSimulatedWebSocket<T>({
  generateData,
  onData,
  dataIntervalMs = 5000,
  heartbeatIntervalMs = 30000,
}: SimulatedWebSocketOptions<T>) {
  const [status, setStatus] = useState<ConnectionStatus>('disconnected')
  const [lastHeartbeat, setLastHeartbeat] = useState<number | null>(null)

  // 用 ref 保存最新的回调，避免闭包问题
  const onDataRef = useRef(onData)
  onDataRef.current = onData
  const generateDataRef = useRef(generateData)
  generateDataRef.current = generateData

  const connect = useCallback(() => {
    if (status !== 'disconnected') return
    setStatus('connecting')

    // 模拟 WebSocket 握手延迟
    const connectTimer = setTimeout(() => {
      setStatus('connected')
      setLastHeartbeat(Date.now())
    }, 300 + Math.random() * 300)

    return () => clearTimeout(connectTimer)
  }, [status])

  const disconnect = useCallback(() => {
    setStatus('disconnected')
    setLastHeartbeat(null)
  }, [])

  // 连接成功后：数据推送 + 心跳
  useEffect(() => {
    if (status !== 'connected') return

    // 每 ~5s 接收一次数据
    const dataTimer = setInterval(() => {
      const data = generateDataRef.current()
      onDataRef.current(data)
    }, dataIntervalMs)

    // 每 ~30s 发送一次心跳包
    const heartbeatTimer = setInterval(() => {
      setLastHeartbeat(Date.now())
    }, heartbeatIntervalMs)

    return () => {
      clearInterval(dataTimer)
      clearInterval(heartbeatTimer)
    }
  }, [status, dataIntervalMs, heartbeatIntervalMs])

  // 清理
  useEffect(() => {
    return () => {
      setStatus('disconnected')
    }
  }, [])

  return { status, connect, disconnect, lastHeartbeat }
}
