'use client'

import {
  AnthropicIcon,
  GeminiIcon,
  OpenAiIcon,
  WorkflowIcon,
} from '@/assets/icons'
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
import { CredentialType } from '@/config/enums'
import useEntitySearch from '@/hooks/use-entity-search'
import { formatDateDistanceToNow } from '@/lib/date-time'
import { useOffsetPaginationParams } from '@/queries/pagination/hooks/use-pagination-params'
import { useRouter } from 'next/navigation'
import { createElement } from 'react'
import { toast } from 'sonner'
import { useDeleteCredential } from '../api/mutation-hooks'
import { useSuspenseOffsetCredentials } from '../api/query-hooks'
import { ICredential } from '../schema/credential'

const CredentialsList = () => {
  const { data } = useSuspenseOffsetCredentials()

  return (
    <div className='relative h-full'>
      <EntityList
        className='absolute top-0 right-0 bottom-0 left-0 h-full w-full overflow-auto'
        items={data?.items}
        emptyView={<CredentialsEmpty />}
        getKey={(item) => item.id}
        renderItem={(item) => {
          return <CredentialsItem data={item} />
        }}
      />
    </div>
  )
}

export default CredentialsList

export const CredentialsSearch = () => {
  const {
    setParams: setUrlParams,
    params,
    search,
  } = useOffsetPaginationParams<ICredential>()
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
      autoFocus={true}
      placeholder='Search credentails'
      value={searchValue}
      onChange={(e) => {
        onSearchChange(e)
      }}
    />
  )
}

export const CredentialsHeader = ({ disabled }: { disabled?: boolean }) => {
  return (
    <>
      <EntityHeader
        title='Credentials'
        description='Create and manage your credentials'
        newButtonHref='/credentials/new'
        newButtonLabel='New credential'
        disabled={disabled}
      />
    </>
  )
}

export const CredentialsPagination = () => {
  const { pagination_meta } = useSuspenseOffsetCredentials()
  const { page, setPage } = useOffsetPaginationParams<ICredential>()
  return (
    <EntityPaination
      page={page}
      onPageChange={setPage}
      totalPages={pagination_meta?.totalPages}
      isNext={!!pagination_meta?.next}
    />
  )
}
export const CredentialsContainer = ({
  children,
}: {
  children: React.ReactNode
}) => {
  return (
    <>
      <EntityContainer
        header={<CredentialsHeader />}
        search={<CredentialsSearch />}
        pagination={<CredentialsPagination />}
        className='credential_entity_container'
      >
        {children}
      </EntityContainer>
    </>
  )
}
type LoaingErrorProps = {
  message?: string
}
export const CredentialsLoading = ({ message }: LoaingErrorProps) => {
  return <LoadingView message={message || 'Loading credentials...'} />
}
export const CredentialsError = ({ message }: LoaingErrorProps) => {
  return <ErrorView message={message || 'Error while loading credentials.'} />
}
export const CredentialsEmpty = () => {
  const router = useRouter()

  const onNew = async () => {
    router.push(`/credentials/new`)
  }
  return (
    <>
      <EmptyView
        message={`No credentials found. Get started by adding your first credential`}
        onNew={onNew}
      />
    </>
  )
}

const CredentialLogos = {
  [CredentialType.OPENAI]: OpenAiIcon,
  [CredentialType.ANTHROPIC]: AnthropicIcon,
  [CredentialType.GEMINI]: GeminiIcon,
}

export const CredentialsItem = ({ data }: { data: ICredential }) => {
  const { id, name, created_at, updated_at } = data
  const { handleDelete } = useDeleteCredential()
  return (
    <EntityItem
      href={`/credentials/${id}`}
      title={name}
      onRemove={() => {
        handleDelete({
          id,
          options: {
            onSuccess(data, variables, onMutateResult, context) {
              toast.success(`Credential ${data.data?.name} removed`)
            },
          },
        })
      }}
      subtitle={
        <>
          Updated {formatDateDistanceToNow(updated_at) + ' '} &bull; Created{' '}
          {formatDateDistanceToNow(created_at)}
        </>
      }
      image={
        <div className='flex size-8 items-center justify-center'>
          {CredentialLogos[data.type] ? (
            createElement(CredentialLogos[data.type], {
              className: 'text-muted-foreground size-5',
            })
          ) : (
            <WorkflowIcon className='text-muted-foreground size-5' />
          )}
        </div>
      }
    />
  )
}
