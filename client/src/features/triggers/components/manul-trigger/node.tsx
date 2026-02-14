import { MousePointerIcon } from '@/assets/icons'
import useNodeStatus from '@/features/executions/hooks/use-realtime-node'
import { NodeProps } from '@xyflow/react'
import { memo, useState } from 'react'
import BaseTriggerNode from '../base-trigger-node'
import ManualTriggerSettings from './dialog'

const ManualTriggerNode = memo((props: NodeProps) => {
  const [open, onOpenChagne] = useState(false)
  const status = useNodeStatus({ nodeId: props.id, event: 'status' })

  const handleOpenSettings = () => onOpenChagne(true)
  const nodeStatus = status
  return (
    <>
      <ManualTriggerSettings open={open} onOpenChange={onOpenChagne} />
      <BaseTriggerNode
        {...props}
        icon={MousePointerIcon}
        name="When clicking  'Execute workflow'"
        description='Triggered manually'
        status={nodeStatus}
        onSettings={handleOpenSettings}
        onDoubleClick={handleOpenSettings}
      />
    </>
  )
})

ManualTriggerNode.displayName = 'ManualTriggerNode'
export default ManualTriggerNode
