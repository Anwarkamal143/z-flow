'use client'

import { WorkflowIcon } from '@/assets/icons'
import {
  EmptyView,
  EntityContainer,
  EntityHeader,
  EntityItem,
  EntityList,
  EntityPaination,
  EntitySearch,
  ErrorView,
  LoadingView,
} from '@/components/entity-components'
import useEntitySearch from '@/hooks/use-entity-search'
import useUpgradeModal from '@/hooks/use-upgrade-modal'
import { formatDateDistanceToNow } from '@/lib/date-time'
import { useOffsetPaginationParams } from '@/queries/pagination/hooks/use-pagination-params'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { useCreateWorkflow, useDeleteWorkflows } from '../api'
import { useSuspenseOffsetWorkflows } from '../api/query-hooks'

const WorkflowList = () => {
  const { data } = useSuspenseOffsetWorkflows()

  return (
    <div className='relative h-full'>
      <EntityList
        className='absolute top-0 right-0 bottom-0 left-0 h-full w-full overflow-auto'
        items={data?.items}
        emptyView={<WorksflowEmpty />}
        getKey={(item, index) => item.id}
        renderItem={(item, index) => {
          return <WorkflowItem data={item} />
        }}
      />
    </div>
  )
}

export default WorkflowList

export const WorkflowSearch = () => {
  const {
    setParams: setUrlParams,
    params,
    search,
  } = useOffsetPaginationParams<IWorkflow>()
  const { searchValue, onSearchChange } = useEntitySearch({
    setParams(params) {
      setUrlParams({
        search: searchValue,
        page: params.page,
      })
    },
    params: {
      page: params.page as unknown as number,
      search: (search || '') as string,
    },
  })
  return (
    <EntitySearch
      placeholder='Search workflows'
      value={searchValue}
      onChange={(e) => {
        onSearchChange(e)
      }}
    />
  )
}

export const WorkflowsHeader = ({ disabled }: { disabled?: boolean }) => {
  const { handleCreate, isPending } = useCreateWorkflow()
  const { handleError, ConfirmModal } = useUpgradeModal()
  const router = useRouter()

  return (
    <>
      <ConfirmModal />
      <EntityHeader
        title='Workflows'
        description='Create and manage your workflows'
        onNew={async () => {
          const resp = await handleCreate({})
          if (resp?.data?.id) {
            toast.success('Workflow created')
            return router.push(`/workflows/${resp?.data?.id}`)
          }
          toast.error(resp.message || 'Failed to create workflow')
          const res = await handleError(resp.errorCode)
        }}
        newButtonLabel='New workflow'
        disabled={disabled}
        isCreating={isPending}
      />
    </>
  )
}

export const WorkflowPagination = () => {
  const { pagination_meta } = useSuspenseOffsetWorkflows()
  const { page, setPage } = useOffsetPaginationParams<IWorkflow>()
  return (
    <EntityPaination
      page={page}
      onPageChange={setPage}
      totalPages={pagination_meta?.totalPages}
      isNext={!!pagination_meta?.next}
    />
  )
}
export const WorkflowsContainer = ({
  children,
}: {
  children: React.ReactNode
}) => {
  return (
    <>
      <EntityContainer
        header={<WorkflowsHeader />}
        search={<WorkflowSearch />}
        pagination={<WorkflowPagination />}
        className='workflow_entity_container'
      >
        {children}
      </EntityContainer>
    </>
  )
}

export const WorksflowLoading = () => {
  return <LoadingView message='Loading workflows...' />
}
export const WorksflowError = () => {
  return <ErrorView message='Error while loading workflows.' />
}
export const WorksflowEmpty = () => {
  const { handleCreate } = useCreateWorkflow()
  const router = useRouter()
  const { handleError, ConfirmModal } = useUpgradeModal()

  const onNew = async () => {
    const resp = await handleCreate({})
    if (resp?.data?.id) {
      toast.success('Workflow created')
      return router.push(`/workflows/${resp?.data?.id}`)
    }
    toast.error(resp.message || 'Failed to create workflow')
    await handleError(resp.errorCode)
  }
  return (
    <>
      <ConfirmModal />

      <EmptyView
        message={`No workflows found. Get started by creating your first workflow`}
        onNew={onNew}
      />
    </>
  )
}

export const WorkflowItem = ({ data }: { data: IWorkflow }) => {
  const { id, name, created_at, updated_at } = data
  const { handleDelete } = useDeleteWorkflows()
  return (
    <EntityItem
      href={`/workflows/${id}`}
      title={name}
      onRemove={() => {
        handleDelete({
          id,
          options: {
            onSuccess(data, variables, onMutateResult, context) {
              toast.success(`Workflow ${data.data?.name} removed`)
            },
          },
        })
        console.log('Removing Item')
      }}
      subtitle={
        <>
          Updated {formatDateDistanceToNow(updated_at) + ' '} &bull; Created{' '}
          {formatDateDistanceToNow(created_at)}
        </>
      }
      image={
        <div className='flex size-8 items-center justify-center'>
          <WorkflowIcon className='text-muted-foreground size-5' />
        </div>
      }
    />
  )
}
