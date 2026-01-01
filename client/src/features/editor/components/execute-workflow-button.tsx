import { FlaskConicalIcon } from '@/assets/icons'
import ButtonLoader from '@/components/button-loader'
import { useExecuteWorkflow } from '@/features/workflows/api'

type IExecutionWorkflowButton = {
  workflowId: string
}

const ExecuteWorkflowButton = ({ workflowId }: IExecutionWorkflowButton) => {
  const { handleCreate, isPending } = useExecuteWorkflow()

  const handleExecuteWorkflow = async () => {
    const resp = await handleCreate({
      id: workflowId,
    })
    console.log(resp, 'execution response')
  }
  return (
    <ButtonLoader
      size={'lg'}
      onClick={handleExecuteWorkflow}
      disabled={isPending}
    >
      <FlaskConicalIcon className='size-4' />
      Execute workflow
    </ButtonLoader>
  )
}

export default ExecuteWorkflowButton
