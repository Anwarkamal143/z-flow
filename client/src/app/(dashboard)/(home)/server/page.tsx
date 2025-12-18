import Dataloader from '@/components/loaders'
import { REFRESH_QUERY_KEY } from '@/config'
import { authSession } from '@/lib/auth/auth'
import Link from 'next/link'

type Props = { searchParams: Promise<any> }

async function Page({ searchParams }: Props) {
  const sparams = await searchParams
  const resp = await authSession(sparams)
  if (sparams?.[REFRESH_QUERY_KEY]) {
    return <Dataloader />
  }
  return (
    <div>
      {JSON.stringify(resp, null, 2)}
      <Link href={'/workflows?workflwos=true'}>Workflows</Link>
    </div>
  )
}

export default Page
