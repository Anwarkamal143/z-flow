import { formatZodError } from '@/lib'
import { ErrorCode } from '@/lib/error-code.enum'
import { credentialClient } from '@/models/v1'
import { CredentialUpdateSchema, ICredentialUpdate } from '../schema/credential'

export function useCreateCredential() {
  return credentialClient.usePost({
    invalidateQueries: [
      {
        queryKey: ['list'],
        exact: false,
      },
    ],
  })
}
export function useDeleteCredential() {
  return credentialClient.useDelete({
    invalidateQueries: [
      {
        queryKey: ['list'],
        exact: false,
      },
    ],
  })
}

export function useUpdateCredential() {
  const { handleUpdate, ...rest } = credentialClient.useUpdate<
    null,
    ICredentialUpdate
  >({
    optimisticUpdate: [
      {
        queryKey(vars) {
          return [vars?.id, 'get']
        },
        updateFn(oldData, newData) {
          if (!newData.data) {
            return oldData
          }
          const data = { ...(oldData.data || {}), ...(newData.data || {}) }
          oldData.data = data
          return oldData
        },
      },
    ],
    invalidateQueries: [
      {
        queryKey: ['list'],
        exact: false,
      },
    ],
  })

  const updateCredential = async (credential: ICredentialUpdate) => {
    const result = CredentialUpdateSchema.safeParse(credential)
    if (!result.success) {
      return {
        data: null,
        success: false,
        message: 'Invalid input',
        errorCode: ErrorCode.VALIDATION_ERROR,
        metadata: {
          validationErrors: formatZodError(result.error),
        },
        statusText: 'Unprocessable Entity',
      }
    }

    return await handleUpdate({
      id: credential.id,
      data: result.data,
    })
  }

  return { updateCredential, ...rest }
}
