import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/models/square')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello 模型广场!</div>
}
