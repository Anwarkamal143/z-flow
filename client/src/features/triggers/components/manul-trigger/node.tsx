import { NodeProps } from '@xyflow/react'
import { MousePointer } from 'lucide-react'
import { memo, useState } from 'react'
import BaseTriggerNode from '../base-trigger-node'
import ManualTriggerSettings from './dialog'

const ManualTriggerNode = memo((props: NodeProps) => {
  const [open, onOpenChagne] = useState(false)

  const handleOpenSettings = () => onOpenChagne(true)
  const nodeStatus = 'initial'
  return (
    <>
      <ManualTriggerSettings open={open} onOpenChange={onOpenChagne} />
      <BaseTriggerNode
        {...props}
        icon={MousePointer}
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
