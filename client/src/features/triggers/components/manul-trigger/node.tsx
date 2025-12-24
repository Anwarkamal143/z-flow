import { NodeProps } from '@xyflow/react'
import { MousePointer } from 'lucide-react'
import { memo } from 'react'
import BaseTriggerNode from '../base-trigger-node'

const ManualTriggerNode = memo((props: NodeProps) => {
  return (
    <>
      <BaseTriggerNode
        {...props}
        icon={MousePointer}
        name="When clicking  'Execute workflow'"
        description='Triggered manually'
        //   status={nodeStatus} TODO: add status
        // onSettings={handleOpenSettings} TODO
        // onDoubleClick={handleOpenSettings} TODO
      />
    </>
  )
})

ManualTriggerNode.displayName = 'ManualTriggerNode'
export default ManualTriggerNode
