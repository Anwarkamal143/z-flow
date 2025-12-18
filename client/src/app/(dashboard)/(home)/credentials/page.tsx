import { authSession } from '@/lib/auth/auth'

const CredentialsPage = async () => {
  await authSession()
  return <div>CredentialsPage</div>
}

export default CredentialsPage
