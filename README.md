# 科宝训练平台

科宝训练平台是一个面向计算机视觉 AI 管线的 YOLO 模型训练管理平台，覆盖从数据集导入、云端训练、模型验证到发布至科宝智能体中台的完整生命周期。

## 核心功能

- **模型广场** — 浏览、验证已训练模型，支持一键发布至科宝智能体中台
- **模型管理** — 管理模型版本、上传本地 .pt 模型文件
- **数据集管理** — 从科宝标注平台同步标注数据集，支持图片预览与标注框可视化
- **训练任务** — 发起 GPU 云端训练，实时查看训练指标与日志
- **验证任务** — 对已训练模型进行验证评估，输出 mAP / Precision / Recall / F1 等指标
- **训练预设** — 可复用的超参数与模型配置模板
- **模型模板** — 模型架构模板管理，支持动态参数配置
- **GPU 服务器** — GPU 服务器管理与远程命令执行
- **监控中心** — GPU 资源利用率与系统状态实时监控

## 技术栈

| 层级       | 技术                              |
| ---------- | --------------------------------- |
| 框架       | TanStack Start（SSR + React 19）  |
| 路由       | TanStack Router v1（文件系统路由） |
| 构建       | Vite 7                            |
| 样式       | Tailwind CSS 4 + CSS 变量         |
| 图表       | Recharts                          |
| 图标       | Lucide React                      |
| 语言       | TypeScript 5.7（strict 模式）      |
| 部署       | Netlify                           |

## 快速开始

```bash
# 安装依赖
npm install

# 启动开发服务器（端口 3000）
npm run dev

# 生产构建
npm run build
```

也可通过 Netlify CLI 在 8888 端口启动：

```bash
netlify dev
```

## 路由导航

| 路由                             | 说明                       |
| -------------------------------- | -------------------------- |
| `/`                              | 首页，重定向至模型广场     |
| `/plaza`                         | 模型广场 — 浏览已发布模型  |
| `/plaza/$modelId`                | 模型详情 — 指标、预测示例  |
| `/model-management`              | 模型管理 — 版本列表        |
| `/model-management/upload`       | 手动上传模型文件           |
| `/datasets`                      | 数据集管理 — 同步标注平台  |
| `/datasets/$datasetId`           | 数据集详情 — 标注预览      |
| `/train`                         | 训练任务列表               |
| `/train/create`                  | 创建训练任务（三步向导）   |
| `/train/$taskId`                 | 训练详情 — 实时指标、日志  |
| `/validate`                      | 验证任务列表               |
| `/validate/create`               | 创建验证任务               |
| `/validate/$taskId`              | 验证详情 — 分类指标、评级  |
| `/presets`                       | 训练预设列表               |
| `/presets/create`                | 创建训练预设               |
| `/presets/$presetId`             | 编辑预设参数               |
| `/architectures`                 | 模型模板列表               |
| `/architectures/create`          | 创建模型模板               |
| `/architectures/$architectureId` | 编辑模型模板               |
| `/gpu-servers`                   | GPU 服务器列表             |
| `/gpu-servers/create`            | 添加 GPU 服务器            |
| `/gpu-servers/$serverId`         | 服务器详情与命令执行       |
| `/monitor`                       | 监控中心 — GPU 资源监控    |
| `/system/user`                   | 用户设置                   |

## 项目结构

```
src/
├── routes/                  # 文件系统路由
│   ├── __root.tsx           # 根布局：侧边栏 + Outlet
│   ├── index.tsx            # 首页重定向
│   ├── plaza/               # 模型广场
│   ├── model-management/    # 模型管理
│   ├── datasets/            # 数据集管理
│   ├── train/               # 训练任务
│   ├── validate/            # 验证任务
│   ├── presets/             # 训练预设
│   ├── architectures/       # 模型模板
│   ├── gpu-servers/         # GPU 服务器
│   ├── monitor/             # 监控中心
│   └── system/              # 系统设置
├── components/              # 可复用组件
├── data/                    # 模拟数据
├── lib/                     # 工具库
├── styles.css               # 全局样式（CSS 变量 + 组件样式）
└── router.tsx               # 路由实例配置
```
