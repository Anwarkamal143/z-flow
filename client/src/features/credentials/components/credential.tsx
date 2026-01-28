'use client'

import { AnthropicIcon, GeminiIcon, OpenAiIcon } from '@/assets/icons'
import ButtonLoader from '@/components/button-loader'
import Form from '@/components/form/Form'
import InputComponent from '@/components/form/Input'
import SelectComp from '@/components/form/select'
import Dataloader from '@/components/loaders'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { CredentialType, ICredentialType } from '@/config/enums'
import useUpgradeModal from '@/hooks/use-upgrade-modal'
import useZodForm from '@/hooks/useZodForm'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import z from 'zod'
import { useCreateCredential, useUpdateCredential } from '../api/mutation-hooks'
import { useGetSuspenseCredential } from '../api/query-hooks'
import { ICredentialInsert, ICredentialUpdate } from '../schema/credential'

const credentialTypeOptions = [
  {
    value: CredentialType.OPENAI,
    label: 'OpenAI',
    icon: OpenAiIcon,
  },
  {
    value: CredentialType.GEMINI,
    label: 'Gemini',
    icon: GeminiIcon,
  },
  {
    value: CredentialType.ANTHROPIC,
    label: 'Anthropic',
    icon: AnthropicIcon,
  },
]
type ICredentialFormProps = {
  // Define your props here
  initialData?: {
    id?: string
    name: string
    type: ICredentialType
    value: string
  }
}
const formSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  type: z.enum(CredentialType as unknown as ICredentialType[]),
  value: z.string().min(1, 'Api key is required'),
})
const CredentialForm = ({ initialData }: ICredentialFormProps) => {
  const router = useRouter()
  const { handleCreate, isPending: isCreating } = useCreateCredential()
  const { updateCredential, isPending: isUpdating } = useUpdateCredential()
  const { handleError, ConfirmModal } = useUpgradeModal()
  //   useGetSuspenseCredential()
  const form = useZodForm({
    schema: formSchema,
    // Define your form schema and default values here
    defaultValues: initialData || {
      name: '',
      type: CredentialType.OPENAI,
      value: '',
    },
  })
  const isEdit = !!initialData?.id
  const handleSubmit = async (data: z.infer<typeof formSchema>) => {
    console.log(data, 'data')
    // return
    try {
      let errorCode = null
      let errorMessage = ''
      if (isEdit) {
        const resp = await updateCredential({
          id: initialData!.id!,
          ...data,
        } as ICredentialUpdate)
        if (resp.success) {
          toast.success('Credential updated successfully')
          return router.push('/credentials')
        }
        errorCode = resp.errorCode
        errorMessage = resp.message || 'Failed to update credential'
      } else {
        const resp = await handleCreate(data as ICredentialInsert)
        if (resp.success) {
          toast.success('Credential created successfully')
          return router.push('/credentials')
        }
        errorCode = resp.errorCode

        errorMessage = resp.message || 'Failed to create credential'
      }

      if (errorCode) {
        const isOk = await handleError(errorCode)
        if (isOk) {
          return
        }
      }
      toast.error(errorMessage)
      //   router.back()
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Something went wrong',
      )
    }
  }
  const reactive = form.useWatchValues({
    name: ['type', 'name'],
  })
  return (
    <>
      <ConfirmModal />
      <Card>
        <CardHeader>
          <CardTitle>
            {isEdit ? 'Edit Credential' : 'Create Credential'}
          </CardTitle>
          <CardDescription>
            {isEdit
              ? 'Update your API key or credential details.'
              : 'Add a new API key or credential to your account'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form form={form} onSubmit={handleSubmit} className='space-y-6'>
            <InputComponent label='Name' name='name' placeholder='My API key' />
            <SelectComp
              label='Type'
              name='type'
              options={credentialTypeOptions}
            />
            <InputComponent
              type='password'
              label='Value'
              name='value'
              placeholder='sk-....'
            />

            <div className='flex items-center gap-4'>
              <ButtonLoader disabled={isCreating || isUpdating} type='submit'>
                {isEdit ? 'Update Credential' : 'Create Credential'}
              </ButtonLoader>
              <ButtonLoader
                disabled={isCreating || isUpdating}
                variant={'outline'}
                asChild
              >
                <Link href={'/credentials'}>Cancel</Link>
              </ButtonLoader>
            </div>
          </Form>
        </CardContent>
      </Card>
    </>
  )
}

export default CredentialForm

export const CredentialView = ({ credentialId }: { credentialId: string }) => {
  const { data, isLoading } = useGetSuspenseCredential({
    id: credentialId,
  })
  if (isLoading) {
    return <Dataloader />
  }
  return (
    <div className='space-y-6'>
      <CredentialForm initialData={data?.data} />
    </div>
  )
}
