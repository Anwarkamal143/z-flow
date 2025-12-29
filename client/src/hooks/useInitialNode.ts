import { NodeType } from '@/config/enums'
import { generateUlid } from '@/lib'
import { useReactFlow } from '@xyflow/react'

const useInitialNode = () => {
  const { screenToFlowPosition } = useReactFlow()

  const getInitialNode = () => {
    const centerX = window.innerWidth / 2
    const centerY = window.innerHeight / 2
    const x = centerX
    const y = centerY
    const flowPosition = screenToFlowPosition({ x, y })

    const newNode = {
      id: generateUlid(),
      type: NodeType.INITIAL,
      position: flowPosition,
      data: {},
      name: NodeType.INITIAL,
    }
    return newNode
  }

  return { getInitialNode }
}

export default useInitialNode
