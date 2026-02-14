import { IWorkflow } from '@/types/Iworkflow'
import { createContext } from 'react'

interface FlowContextType {
  workflowId: string
  workflow?: IWorkflow
}

export const FlowContext = createContext<FlowContextType | null>(null)
