import { GoogleFormIcon } from '@/assets/icons'
import useNodeStatus from '@/features/executions/hooks/use-realtime-node'
import { NodeProps } from '@xyflow/react'
import { memo, useState } from 'react'
import BaseTriggerNode from '../base-trigger-node'
import GoogleFormTriggerSettings from './dialog'

const GoogleFormTriggerNode = memo((props: NodeProps) => {
  const [open, onOpenChagne] = useState(false)
  const status = useNodeStatus({ nodeId: props.id, event: 'status' })
  const handleOpenSettings = () => onOpenChagne(true)
  const nodeStatus = status
  return (
    <>
      <GoogleFormTriggerSettings open={open} onOpenChange={onOpenChagne} />
      <BaseTriggerNode
        {...props}
        icon={GoogleFormIcon}
        name='Google Form'
        description='When form is submitted'
        status={nodeStatus}
        onSettings={handleOpenSettings}
        onDoubleClick={handleOpenSettings}
      />
    </>
  )
})

GoogleFormTriggerNode.displayName = 'GoogleFormTriggerNode'
export default GoogleFormTriggerNode
