import { StripeIcon } from '@/assets/icons'
import useNodeStatus from '@/features/executions/hooks/use-realtime-node'
import { NodeProps } from '@xyflow/react'
import { memo, useState } from 'react'
import BaseTriggerNode from '../base-trigger-node'
import StripeTriggerSettings from './dialog'

const StripeTriggerNode = memo((props: NodeProps) => {
  const [open, onOpenChagne] = useState(false)
  const status = useNodeStatus({ nodeId: props.id, event: 'status' })
  const handleOpenSettings = () => onOpenChagne(true)
  const nodeStatus = status
  return (
    <>
      <StripeTriggerSettings open={open} onOpenChange={onOpenChagne} />
      <BaseTriggerNode
        {...props}
        icon={StripeIcon}
        name='Stripe'
        description='When stripe event is captured'
        status={nodeStatus}
        onSettings={handleOpenSettings}
        onDoubleClick={handleOpenSettings}
      />
    </>
  )
})

StripeTriggerNode.displayName = 'StripeTriggerNode'
export default StripeTriggerNode
