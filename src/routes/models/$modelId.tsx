import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/models/$modelId')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/models/$modelId"!</div>
}
