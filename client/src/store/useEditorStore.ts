import { ReactFlowInstance } from '@xyflow/react'
import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'
import { storeResetFns } from './useGlobalStore'
type IEditorStoreState = {
  instance: ReactFlowInstance | null
  workflow?: IWorkflow | null
}

type IEditorStoreActions = {
  setWorkflow: (
    workflow: IWorkflow | ((workflow?: IWorkflow | null) => IWorkflow),
  ) => void
  setEditorInstance: (instance: ReactFlowInstance) => void
}
export const EDITOR_INITIAL_STATE: IEditorStoreState = {
  instance: null,
  workflow: null,
}
const useEditorStore = create<IEditorStoreState & IEditorStoreActions>()(
  immer((set, get) => {
    storeResetFns.add(() => set(EDITOR_INITIAL_STATE))
    return {
      instance: null,
      workflow: null,
      setWorkflow(workflow) {
        set((s) => {
          if (typeof workflow == 'function') {
            s.workflow = workflow(get().workflow)
            return
          }
          s.workflow = workflow
        })
      },
      setEditorInstance(instance) {
        set((s) => {
          s.instance = instance
        })
      },
    }
  }),
)
export const useActiveWorkflow = () => useEditorStore((state) => state.workflow)
export const useEditorInstance = () => useEditorStore((state) => state.instance)

export const useStoreWorkflowActions = () => ({
  setWorkflow: useEditorStore((state) => state.setWorkflow),
  setEditor: useEditorStore((state) => state.setEditorInstance),
})
