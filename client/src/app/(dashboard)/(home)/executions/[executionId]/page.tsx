import { authSession } from '@/lib/auth/auth'

type PageProps = {
  params: Promise<{ executionId: string }>
}

const ExecutionPage = async (props: PageProps) => {
  await authSession()
  const { executionId } = await props.params
  return <div>Execution Id: {executionId}</div>
}

export default ExecutionPage
