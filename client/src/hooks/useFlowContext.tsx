import { FlowContext } from '@/context/flow-context'
import { useContext } from 'react'

// Custom hook to use context inside node components
export const useFlowContext = () => {
  const ctx = useContext(FlowContext)
  if (!ctx)
    throw new Error('useFlowContext must be inside FlowContext provider')
  return ctx
}
