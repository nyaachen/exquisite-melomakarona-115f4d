import { createFileRoute } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import {
  RefreshCw,
  CheckCircle2,
  XCircle,
  Clock,
  AlertTriangle,
} from 'lucide-react'
import { NotFound } from '../../components/NotFound'
import { TRAIN_STATUS, DEFAULT_CLASS_COLORS } from '../../constants'
import { TaskHeader } from '../../components/train/TaskHeader'
import { CompletedTaskPanel } from '../../components/train/CompletedTaskPanel'
import { ModelValidationPanel } from '../../components/train/ModelValidationPanel'
import { TaskInfoCards } from '../../components/train/TaskInfoCards'
import { TrainingChartsSection } from '../../components/train/TrainingChartsSection'
import { TrainingLogPanel } from '../../components/train/TrainingLogPanel'
import { PublishModelModal } from '../../components/train/PublishModelModal'
import { useSimulatedWebSocket } from '../../lib/useSimulatedWebSocket'
import {
  TASK_DATA_DETAILED,
  VERIFICATION_RESULTS,
  TEST_IMAGES,
  PUBLISHABLE_MODELS,
  generateLog,
  type EpochMetric,
} from '../../data/train-tasks'

export const Route = createFileRoute('/train/$taskId')({
  component: TaskDetail,
})

const STATUS_ICONS: Record<string, React.ReactNode> = {
  running: <RefreshCw size={11} className="spinning" />,
  completed: <CheckCircle2 size={11} />,
  failed: <XCircle size={11} />,
  pending: <Clock size={11} />,
}

// ─── WebSocket 模拟：生成下一个 epoch 的训练数据 ───

interface TrainingUpdate {
  nextEpoch: number
  done: boolean
  metric: EpochMetric
  newPrec: number
  newRecall: number
}

function generateTrainingUpdate(
  currentEpoch: number,
  totalEpochs: number,
  targetMAP: number,
): TrainingUpdate {
  const next = currentEpoch + 1
  const done = next >= totalEpochs
  const t = next / totalEpochs
  const mapProgress = 1 / (1 + Math.exp(-10 * (t - 0.3)))
  const metric: EpochMetric = {
    epoch: next,
    mAP: Math.round((0.15 + (targetMAP - 0.15) * mapProgress) * 10000) / 10000,
    loss: Math.round((2.0 - (2.0 - 0.35) * mapProgress) * 10000) / 10000,
    valLoss: Math.round((2.1 - (2.1 - 0.4) * mapProgress) * 10000) / 10000,
  }
  return {
    nextEpoch: next,
    done,
    metric,
    newPrec: Math.round((metric.mAP * 1.07) * 10000) / 10000,
    newRecall: Math.round((metric.mAP * 0.96) * 10000) / 10000,
  }
}

function TaskDetail() {
  const { taskId } = Route.useParams()
  const task = TASK_DATA_DETAILED[taskId]
  if (!task) return <NotFound />

  const [epoch, setEpoch] = useState(task.startEpoch)
  const [mAP, setMAP] = useState(task.mAP)
  const [precision, setPrecision] = useState(task.precision)
  const [recall, setRecall] = useState(task.recall)
  const [logs, setLogs] = useState<Array<{ text: string; cls: string }>>([])
  const [mapHistory, setMapHistory] = useState<number[]>(
    () => task.epochs.map(e => e.mAP),
  )
  const [lossHistory, setLossHistory] = useState<number[]>(
    () => task.epochs.map(e => e.loss),
  )
  const [perfView, setPerfView] = useState<'val' | 'test'>('val')
  const [logExpanded, setLogExpanded] = useState(false)
  const [showPublishModal, setShowPublishModal] = useState(false)
  const [wsEnabled, setWsEnabled] = useState(false)

  // WebSocket — 训练任务持续推送 epoch 数据和指标
  const { status: wsStatus, connect } = useSimulatedWebSocket<TrainingUpdate>({
    generateData: () => generateTrainingUpdate(epoch, task.totalEpochs, task.mAP),
    dataIntervalMs: 1200,
    onData: (update) => {
      if (update.done) return
      setEpoch(update.nextEpoch)
      setMAP(update.metric.mAP)
      setPrecision(update.newPrec)
      setRecall(update.newRecall)
      setMapHistory(h => [...h, update.metric.mAP])
      setLossHistory(h => [...h, update.metric.loss])
      setLogs(prev => [
        ...prev.slice(-60),
        ...generateLog(update.metric, task.totalEpochs).map(t => ({ text: t, cls: 'log-info' })),
      ])
    },
  })

  // 训练中的任务：挂载后建立 WebSocket 接收实时数据
  useEffect(() => {
    if (task.status === 'running' && !wsEnabled) {
      setWsEnabled(true)
      connect()
    }
  }, [task.status, wsEnabled, connect])

  const progress = Math.round((epoch / task.totalEpochs) * 100)
  const sc = TRAIN_STATUS[task.status]
  const ic = STATUS_ICONS[task.status]
  const verification = VERIFICATION_RESULTS[taskId] || {
    quality: 'pass' as const,
    qualityLabel: '待评估',
    summary: '暂无验证结论',
    highlights: [],
    suggestions: [],
    details: [],
  }

  const configRows = [
    { label: '数据集', value: task.dataset },
    { label: '基础模型', value: task.baseModel },
    { label: '优化器', value: task.optimizer },
    { label: '批次大小', value: String(task.batchSize) },
    { label: '图像尺寸', value: `${task.imgSize}×${task.imgSize}` },
    { label: '训练设备', value: task.device },
    { label: '创建时间', value: task.createdAt },
  ]

  const snapshotRows = [
    { label: '数据集', value: task.dataset },
    { label: '划分', value: '训练 70% · 验证 15% · 测试 15%' },
    { label: '图片总数', value: '4,872 张' },
    { label: '类别', value: '裂缝、坑洼、破损、剥落、标线模糊、积水、障碍物' },
    { label: '快照时间', value: task.createdAt },
  ]

  const splitBar = (
    <div className="split-bar" style={{ marginTop: 4 }}>
      <div className="split-bar-train" style={{ flex: 70 }}>
        <span className="split-bar-label" style={{ color: '#409eff' }}>训练 70%</span>
      </div>
      <div className="split-bar-val" style={{ flex: 15 }}>
        <span className="split-bar-label" style={{ color: '#10b981' }}>验证 15%</span>
      </div>
      <div className="split-bar-test" style={{ flex: 15 }}>
        <span className="split-bar-label" style={{ color: '#f59e0b' }}>测试 15%</span>
      </div>
    </div>
  )

  return (
    <>
    <div className="slide-in">
      <TaskHeader
        taskName={task.name}
        statusBadge={
          <span className={`badge ${sc.cls}`}>{ic} {sc.label}</span>
        }
        wsStatus={task.status === 'running' ? wsStatus : undefined}
      />

      <div className="content-padded">
        {/* Failed error */}
        {task.status === 'failed' && task.errorMsg && (
          <div className="error-box mb-5">
            <AlertTriangle size={15} className="text-error flex-shrink-0 mt-0.5" />
            <div>
              <div className="text-sm font-semibold text-error mb-1">训练失败</div>
              <div className="font-mono text-xs text-secondary leading-relaxed">{task.errorMsg}</div>
            </div>
          </div>
        )}

        {/* Completed task: verification + validation */}
        {task.status === 'completed' && (
          <>
            <CompletedTaskPanel
              published={task.published}
              modelName={task.modelName}
              modelVersion={task.modelVersion}
              publishedAt={task.publishedAt}
              verification={verification}
              onPublishClick={() => setShowPublishModal(true)}
            />
            <ModelValidationPanel
              prefix={taskId}
              classes={task.classes}
              classColors={DEFAULT_CLASS_COLORS}
              testImages={TEST_IMAGES}
            />
          </>
        )}

        {/* Info + Progress cards */}
        <TaskInfoCards
          configRows={configRows}
          snapshotRows={snapshotRows}
          splitBar={splitBar}
          epoch={epoch}
          totalEpochs={task.totalEpochs}
          progress={progress}
          mAP={mAP}
          precision={precision}
          recall={recall}
          isRunning={task.status === 'running'}
          device={task.device}
        />

        {/* Training Charts */}
        <TrainingChartsSection
          mapHistory={mapHistory}
          lossHistory={lossHistory}
          classes={task.classes}
          mAP={mAP}
          perfView={perfView}
          onPerfViewChange={setPerfView}
        />

        {/* Training Log */}
        <TrainingLogPanel
          logs={logs}
          taskId={taskId}
          taskName={task.name}
          dataset={task.dataset}
          baseModel={task.baseModel}
          trainImages={task.trainImages}
          valImages={task.valImages}
          device={task.device}
          batchSize={task.batchSize}
          imgSize={task.imgSize}
          status={task.status}
          totalEpochs={task.totalEpochs}
          mAP={task.mAP}
          precision={task.precision}
          recall={task.recall}
          startEpoch={task.startEpoch}
          errorMsg={task.errorMsg}
          logExpanded={logExpanded}
          onToggle={() => setLogExpanded(!logExpanded)}
        />
      </div>
    </div>

    <PublishModelModal
      show={showPublishModal}
      taskName={task.name}
      baseModel={task.baseModel}
      mAP={task.mAP}
      publishableModels={PUBLISHABLE_MODELS}
      onClose={() => setShowPublishModal(false)}
    />
    </>
  )
}
