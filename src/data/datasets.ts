// 数据集 — 接口与 mock 数据

// ─── 接口定义 ───

/** 标签详情（标签组内的单个标签） */
export interface LabelDetail {
  label: string // 英文标签代码，如 "Motorized"
  labelName: string // 中文标签名，如 "机动车"
  color: string // 颜色，如 "rgba(185, 177, 10, 1)"
}

/** 内容标签组（标注标签分组） */
export interface ContentTagGroup {
  id: string // 标签组 ID
  name: string // 标签组名称，如 "视频事件检测抛洒物标签"
  code: string
  targetType: string
  description: string
  isDefault: number
  labelDetails: LabelDetail[] // 组内标签列表
}

/** 标注形状的标签信息 */
export interface LabelInfo {
  code: string // 标签代码
  color: string // 颜色
  sortOrder: number // 排序
  name: string // 中文标签名
  id: string // 标签 ID
  type: string // 类型
}

/** 单个标注形状（边界框/多边形） */
export interface ResourceShape {
  boxes: [string, string, string, string] // [x1, y1, x2, y2] 矩形框
  labelInfo: LabelInfo
  visible: boolean
  bounds: [string, string, string, string] // 旋转边界
  label: string // 标签代码
  points: [[string, string], [string, string], [string, string], [string, string]] // 四点多边形
}

/** 数据集资源图片（单张标注图片） */
export interface DatasetResource {
  id: string // 资源 ID
  resourceId: string // 资源 ID（冗余）
  type: number
  url: string // 图片地址
  status: number
  targetType: string | null
  targetTypeName: string | null
  labelResult: string // 标注结果 JSON 字符串
  labelResultJson: {
    imageWidth: number // 图片实际宽度
    imageHeight: number // 图片实际高度
    imagePath: string // 文件名
    netPath: string // 完整图片 URL
    shapes: ResourceShape[] // 该图片包含的标注形状
  }
  imageHeight: number | null
  imageWidth: number | null
  needUpdateWidthAndHeight: boolean
  preAnnotation: unknown
  fileName: string // 文件名
  set: 'train' | 'val' | 'test' // 所属划分集合
}

/** 数据集详情（同时用于列表和详情页） */
export interface Dataset {
  id: string // 数据集 ID
  datasetName: string // 数据集名称
  description: string | null // 备注/描述
  dataType: number // 数据类型
  annotationType: number // 标注类型
  resourceId: string | null
  status: number // 状态
  resourceSize: number
  uploadStatus: number // 上传状态
  sourceType: number // 来源类型
  sourceTypeName: string // 来源类型名，如 "标注任务"
  sourceId: string // 来源 ID
  sourceName: string // 来源名称
  sceneTags: string | null // 场景标签
  contentTags: string | null // 内容标签（旧字段，实际使用 contentTagList）
  contentTagList: ContentTagGroup[] // 内容标签组列表
  dataCount: number // 数据总量
  openStatus: number
  canDelete: boolean | null
  canToggleOpen: boolean | null
  canEditSceneTags: boolean
  createBy: string // 创建人
  createTime: string // 创建时间，格式 YYYY-MM-DD HH:mm:ss
  questions: unknown
  resources: DatasetResource[] // 资源图片列表（含标注形状和划分归属）
}

// ─── Mock 数据 ───

/** 创建简易 shape */
function makeShape(
  code: string,
  name: string,
  color: string,
  sortOrder: number,
  labelId: string,
  x1: number, y1: number, x2: number, y2: number,
): ResourceShape {
  return {
    boxes: [String(x1), String(y1), String(x2), String(y2)],
    labelInfo: { code, color, sortOrder, name, id: labelId, type: '33' },
    visible: true,
    bounds: [String(x1 - 20), String(x2 + 20), String(y1 - 20), String(y2 + 20)],
    label: code,
    points: [
      [String(x1), String(y1)],
      [String(x2), String(y1)],
      [String(x2), String(y2)],
      [String(x1), String(y2)],
    ],
  }
}

/** 创建简易 resource */
function makeResource(
  id: string,
  fileName: string,
  imageWidth: number,
  imageHeight: number,
  set: 'train' | 'val' | 'test',
  shapes: ResourceShape[],
): DatasetResource {
  const url = `https://ai.gxtri.cn/data-annotation-platform/labeling-platform/demo/${fileName}`
  const labelResult = JSON.stringify({ imageWidth, imageHeight, imagePath: fileName, netPath: url, shapes })
  return {
    id,
    resourceId: id,
    type: 0,
    url,
    status: 1,
    targetType: null,
    targetTypeName: null,
    labelResult,
    labelResultJson: { imageWidth, imageHeight, imagePath: fileName, netPath: url, shapes },
    imageHeight: null,
    imageWidth: null,
    needUpdateWidthAndHeight: false,
    preAnnotation: null,
    fileName,
    set,
  }
}

// ─── 划分保存 API 类型 ───

/** 自动划分保存请求参数 */
export interface AutoSplitParams {
  datasetId: string
  trainCount: number
  valCount: number
  testCount: number
  trainRatio: number
  valRatio: number
  testRatio: number
  totalCount: number
  priorityLabels: string[]
}

/** 手动划分保存请求参数 */
export interface ManualSplitParams {
  datasetId: string
  assignments: Array<{ resourceId: string; set: 'train' | 'val' | 'test' }>
}

/** 划分保存响应 */
export interface SplitSaveResponse {
  code: number
  msg: string | null
  data: {
    datasetId: string
    splitResult: { train: number; val: number; test: number }
    trainCount: number
    valCount: number
    testCount: number
    updatedAt: string
  }
}

/**
 * 模拟「根据目标比例调整数据集划分」接口
 * POST /api/v1/datasets/{datasetId}/split/auto
 */
export async function simulateAutoSplitSave(params: AutoSplitParams): Promise<SplitSaveResponse> {
  const body = JSON.stringify({
    datasetId: params.datasetId,
    splitConfig: {
      trainRatio: params.trainRatio,
      valRatio: params.valRatio,
      testRatio: params.testRatio,
      trainCount: params.trainCount,
      valCount: params.valCount,
      testCount: params.testCount,
    },
    priorityLabels: params.priorityLabels,
    totalResources: params.totalCount,
  })
  console.log('[Mock API] POST /api/v1/datasets/{id}/split/auto', body)

  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        code: 200,
        msg: null,
        data: {
          datasetId: params.datasetId,
          splitResult: { train: params.trainRatio, val: params.valRatio, test: params.testRatio },
          trainCount: params.trainCount,
          valCount: params.valCount,
          testCount: params.testCount,
          updatedAt: new Date().toISOString().replace('T', ' ').slice(0, 19),
        },
      })
    }, 800 + Math.random() * 400)
  })
}

/**
 * 模拟「保存手动指定数据集资源划分」接口
 * POST /api/v1/datasets/{datasetId}/split/manual
 */
export async function simulateManualSplitSave(params: ManualSplitParams): Promise<SplitSaveResponse> {
  const body = JSON.stringify({
    datasetId: params.datasetId,
    assignments: params.assignments,
    totalResources: params.assignments.length,
  })
  console.log('[Mock API] POST /api/v1/datasets/{id}/split/manual', body)

  const counts = { train: 0, val: 0, test: 0 }
  params.assignments.forEach(a => { counts[a.set]++ })
  const total = params.assignments.length || 1

  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        code: 200,
        msg: null,
        data: {
          datasetId: params.datasetId,
          splitResult: {
            train: Math.round(counts.train / total * 100),
            val: Math.round(counts.val / total * 100),
            test: 100 - Math.round(counts.train / total * 100) - Math.round(counts.val / total * 100),
          },
          trainCount: counts.train,
          valCount: counts.val,
          testCount: counts.test,
          updatedAt: new Date().toISOString().replace('T', ' ').slice(0, 19),
        },
      })
    }, 800 + Math.random() * 400)
  })
}

// ─── 标注资源分页查询 API 类型 ───

/** 标注资源分页查询响应 */
export interface AnnotationResourcesResponse {
  code: number
  msg: string | null
  data: {
    resources: DatasetResource[]
    total: number
    page: number
    pageSize: number
  }
}

/**
 * 模拟「分页查询数据集标注资源」接口
 * GET /api/v1/datasets/{datasetId}/resources?page=&pageSize=
 */
export async function simulateFetchAnnotationResources(
  datasetId: string,
  page: number,
  pageSize: number,
): Promise<AnnotationResourcesResponse> {
  console.log(`[Mock API] GET /api/v1/datasets/${datasetId}/resources?page=${page}&pageSize=${pageSize}`)

  return new Promise((resolve) => {
    setTimeout(() => {
      const dataset = DATASETS.find(d => d.id === datasetId)
      if (!dataset) {
        resolve({ code: 404, msg: '数据集不存在', data: { resources: [], total: 0, page, pageSize } })
        return
      }
      const total = dataset.resources.length
      const start = (page - 1) * pageSize
      const resources = dataset.resources.slice(start, start + pageSize)
      resolve({
        code: 200,
        msg: null,
        data: { resources, total, page, pageSize },
      })
    }, 400 + Math.random() * 300)
  })
}

// ─── 类别分布查询 API 类型 ───

/** 类别分布查询响应 */
export interface ClassDistributionResponse {
  code: number
  msg: string | null
  data: Array<{
    name: string
    训练集: number
    验证集: number
    测试集: number
  }>
}

/**
 * 模拟「查询数据集类别分布」接口
 * GET /api/v1/datasets/{datasetId}/class-distribution
 */
export async function simulateFetchClassDistribution(
  datasetId: string,
  split: { train: number; val: number; test: number },
  flatContentTags: string[],
): Promise<ClassDistributionResponse> {
  console.log(`[Mock API] GET /api/v1/datasets/${datasetId}/class-distribution`)

  return new Promise((resolve) => {
    setTimeout(() => {
      const hash = (s: string) => { let h = 0; for (let i = 0; i < s.length; i++) h = ((h << 5) - h + s.charCodeAt(i)) | 0; return Math.abs(h) }
      const data = flatContentTags.map(cls => {
        const h = hash(cls)
        const base = 100 + (h % 600)
        const t = Math.round(base * (split.train / 100))
        const v = Math.round(base * (split.val / 100))
        return { name: cls, 训练集: t, 验证集: v, 测试集: Math.max(0, base - t - v) }
      })
      resolve({ code: 200, msg: null, data })
    }, 350 + Math.random() * 250)
  })
}

export const DATASETS: Dataset[] = [
  {
    id: '84',
    datasetName: 'paosawu_images_240826_已标注',
    description: null,
    dataType: 0,
    annotationType: 0,
    resourceId: null,
    status: 1,
    resourceSize: 0,
    uploadStatus: 1,
    sourceType: 1,
    sourceTypeName: '标注任务',
    sourceId: '31',
    sourceName: 'paosawu_images_240826',
    sceneTags: null,
    contentTags: null,
    contentTagList: [
      {
        id: '47',
        name: '视频事件检测抛洒物标签',
        code: '',
        targetType: '',
        description: '',
        isDefault: 0,
        labelDetails: [
          { label: 'Motorized', labelName: '机动车', color: 'rgba(185, 177, 10, 1)' },
          { label: 'Nonmotorized', labelName: '非机动车', color: 'rgba(101, 230, 103, 1)' },
          { label: 'paosawu', labelName: '抛洒物', color: 'rgba(158, 226, 182, 1)' },
          { label: 'Pedestrian', labelName: '行人', color: 'rgba(120, 218, 132, 1)' },
          { label: 'TrafficCone', labelName: '锥桶', color: 'rgba(197, 247, 170, 1)' },
        ],
      },
    ],
    dataCount: 96,
    openStatus: 0,
    canDelete: null,
    canToggleOpen: null,
    canEditSceneTags: true,
    createBy: 'lanyongqing',
    createTime: '2026-05-09 16:15:54',
    questions: null,
    resources: [
      makeResource('74646', 'K45+300_300.jpg', 1920, 1080, 'train', [
        makeShape('paosawu', '抛洒物', 'rgba(158, 226, 182, 1)', 4, '267', 1063, 827, 1096, 848),
        makeShape('Motorized', '机动车', 'rgba(185, 177, 10, 1)', 0, '263', 406, 107, 417, 117),
      ]),
      makeResource('74645', 'K45+300_200.jpg', 1920, 1080, 'train', [
        makeShape('paosawu', '抛洒物', 'rgba(158, 226, 182, 1)', 4, '267', 1059, 824, 1097, 853),
      ]),
      makeResource('74644', 'K45+300_100.jpg', 1920, 1080, 'train', [
        makeShape('Motorized', '机动车', 'rgba(185, 177, 10, 1)', 0, '263', 654, 650, 796, 790),
      ]),
      makeResource('74643', 'K45+000_300.jpg', 1920, 1080, 'val', [
        makeShape('Pedestrian', '行人', 'rgba(120, 218, 132, 1)', 5, '265', 800, 400, 860, 600),
      ]),
      makeResource('74642', 'K45+000_200.jpg', 1920, 1080, 'test', [
        makeShape('TrafficCone', '锥桶', 'rgba(197, 247, 170, 1)', 3, '266', 900, 500, 950, 560),
        makeShape('Nonmotorized', '非机动车', 'rgba(101, 230, 103, 1)', 2, '264', 200, 300, 280, 420),
      ]),
      makeResource('74641', 'K45+000_100.jpg', 1920, 1080, 'train', [
        makeShape('paosawu', '抛洒物', 'rgba(158, 226, 182, 1)', 4, '267', 1100, 700, 1150, 750),
      ]),
    ],
  },
  {
    id: '102',
    datasetName: '施工安全帽检测集_v1',
    description: '建筑工地施工人员安全帽佩戴检测数据集，包含多种角度和光照条件下的样本。',
    dataType: 0,
    annotationType: 0,
    resourceId: null,
    status: 1,
    resourceSize: 0,
    uploadStatus: 1,
    sourceType: 1,
    sourceTypeName: '标注任务',
    sourceId: '45',
    sourceName: 'safety_helmet_images',
    sceneTags: null,
    contentTags: null,
    contentTagList: [
      {
        id: '55',
        name: '安全帽检测标签组',
        code: '',
        targetType: '',
        description: '',
        isDefault: 0,
        labelDetails: [
          { label: 'helmet', labelName: '安全帽', color: 'rgba(59, 130, 246, 1)' },
          { label: 'no_helmet', labelName: '无安全帽', color: 'rgba(239, 68, 68, 1)' },
          { label: 'person', labelName: '人员', color: 'rgba(16, 185, 129, 1)' },
        ],
      },
    ],
    dataCount: 2391,
    openStatus: 0,
    canDelete: null,
    canToggleOpen: null,
    canEditSceneTags: true,
    createBy: '李工',
    createTime: '2026-05-08 10:30:00',
    questions: null,
    resources: [
      makeResource('80001', 'worker_helmet_01.jpg', 1920, 1080, 'train', [
        makeShape('helmet', '安全帽', 'rgba(59, 130, 246, 1)', 0, '301', 500, 200, 620, 380),
        makeShape('person', '人员', 'rgba(16, 185, 129, 1)', 2, '303', 400, 100, 700, 900),
      ]),
      makeResource('80002', 'worker_no_helmet_01.jpg', 1920, 1080, 'train', [
        makeShape('no_helmet', '无安全帽', 'rgba(239, 68, 68, 1)', 1, '302', 520, 180, 600, 300),
        makeShape('person', '人员', 'rgba(16, 185, 129, 1)', 2, '303', 420, 80, 680, 920),
      ]),
      makeResource('80003', 'worker_multi_01.jpg', 1920, 1080, 'train', [
        makeShape('helmet', '安全帽', 'rgba(59, 130, 246, 1)', 0, '301', 300, 150, 420, 320),
        makeShape('helmet', '安全帽', 'rgba(59, 130, 246, 1)', 0, '301', 900, 180, 1020, 350),
        makeShape('person', '人员', 'rgba(16, 185, 129, 1)', 2, '303', 280, 100, 450, 900),
        makeShape('person', '人员', 'rgba(16, 185, 129, 1)', 2, '303', 880, 100, 1060, 900),
      ]),
      makeResource('80004', 'worker_blue_helmet.jpg', 1920, 1080, 'val', [
        makeShape('helmet', '安全帽', 'rgba(59, 130, 246, 1)', 0, '301', 550, 150, 680, 320),
        makeShape('person', '人员', 'rgba(16, 185, 129, 1)', 2, '303', 480, 100, 750, 880),
      ]),
      makeResource('80005', 'worker_team_01.jpg', 1920, 1080, 'test', [
        makeShape('helmet', '安全帽', 'rgba(59, 130, 246, 1)', 0, '301', 200, 200, 320, 370),
        makeShape('helmet', '安全帽', 'rgba(59, 130, 246, 1)', 0, '301', 700, 180, 820, 350),
        makeShape('no_helmet', '无安全帽', 'rgba(239, 68, 68, 1)', 1, '302', 1100, 220, 1180, 360),
        makeShape('person', '人员', 'rgba(16, 185, 129, 1)', 2, '303', 180, 80, 350, 900),
        makeShape('person', '人员', 'rgba(16, 185, 129, 1)', 2, '303', 680, 80, 850, 900),
        makeShape('person', '人员', 'rgba(16, 185, 129, 1)', 2, '303', 1080, 100, 1200, 880),
      ]),
      makeResource('80006', 'worker_inspection.jpg', 1920, 1080, 'train', [
        makeShape('helmet', '安全帽', 'rgba(59, 130, 246, 1)', 0, '301', 460, 160, 590, 330),
        makeShape('person', '人员', 'rgba(16, 185, 129, 1)', 2, '303', 400, 80, 650, 860),
      ]),
    ],
  },
]
