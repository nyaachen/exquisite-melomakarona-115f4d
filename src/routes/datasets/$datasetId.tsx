import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/datasets/$datasetId')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/datasets/$datasetId"!
    数据集详情
    主要展示数据集分布情况。
    查看数据的功能在科宝标注平台。
  </div>
}
