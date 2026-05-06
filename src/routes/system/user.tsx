import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/system/user')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/system/user"!</div>
}
