import { authSession } from '@/lib/auth/auth'

const ExecutionsPage = async () => {
  await authSession()
  return <div>ExecutionsPage</div>
}

export default ExecutionsPage
