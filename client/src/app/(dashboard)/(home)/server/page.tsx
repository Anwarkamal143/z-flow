import Dataloader from '@/components/loaders'
import { isAccessTokenRefresing } from '@/lib'
import { authSession } from '@/lib/auth/auth'
import Link from 'next/link'

type Props = { searchParams: Promise<any> }

async function Page({ searchParams }: Props) {
  const sparams = await searchParams
  if (isAccessTokenRefresing(sparams)) {
    return <Dataloader />
  }
  const resp = await authSession(sparams)
  return (
    <div>
      {JSON.stringify(resp, null, 2)}
      <Link href={'/workflows?workflwos=true'}>Workflows</Link>
    </div>
  )
}

export default Page
