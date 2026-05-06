import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/models/manualUpload')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/models/manualUpload"!
    手动上传模型
    
  </div>
}
