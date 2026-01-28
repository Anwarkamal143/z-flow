import ButtonLoader from '@/components/button-loader'
import Form from '@/components/form/Form'
import FormInput from '@/components/form/Input'

import {
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import useZodForm from '@/hooks/useZodForm'
import { Dialog } from '@radix-ui/react-dialog'
import { useEffect } from 'react'
import z from 'zod'

import SelectComp from '@/components/form/select'
import { CredentialType } from '@/config/enums'
import {
  credentialFilters,
  useSuspenseCredentialsList,
} from '@/features/credentials/api/query-hooks'
import { GOOGLE_GENERATIVE_AI_MODELS } from './utils'
const ModelOptions = GOOGLE_GENERATIVE_AI_MODELS.map((m) => ({
  value: m,
  label: m,
}))
const formSchema = z.object({
  model: z.union([
    z.enum(GOOGLE_GENERATIVE_AI_MODELS),
    z.string().min(1, { error: 'Model is required' }),
  ]),
  systemPropmt: z.string().optional(),
  userPrompt: z.string().min(1, { error: 'User Prompt is required' }),
  credentialId: z.string().min(1, { error: 'Credential is required' }),

  variableName: z
    .string()
    .min(1, { error: 'Variable name is required' })
    .regex(/^[A-Za-z_$][A-za-z0-9_$]*$/, {
      error:
        'Variable name must start with letter or underscore and contain only letters, numbers and underscores',
    }),
})

export type GeminiFormValues = z.infer<typeof formSchema>
type Props = {
  onSubmit: (values: GeminiFormValues) => void
  defaultValues?: Partial<GeminiFormValues>
  open: boolean
  onOpenChange: (isOpen: boolean) => void
}
export const isKnownGeminiModel = (model: string): boolean =>
  GOOGLE_GENERATIVE_AI_MODELS.includes(
    model as (typeof GOOGLE_GENERATIVE_AI_MODELS)[number],
  )
const GeminiDialog = ({ defaultValues = {}, onSubmit, ...rest }: Props) => {
  const { data: geminiCredsOptions, isLoading } = useSuspenseCredentialsList({
    params: {
      filters: [credentialFilters.type.eq(CredentialType.GEMINI)],
    },
  })

  const formDefaultValues: GeminiFormValues = {
    ...defaultValues,

    variableName: defaultValues.variableName || '',
    model: defaultValues.model || GOOGLE_GENERATIVE_AI_MODELS[18],
    systemPropmt: defaultValues.systemPropmt || '',
    userPrompt: defaultValues.userPrompt || '',
    credentialId: defaultValues.credentialId || '',
  }
  const form = useZodForm({
    schema: formSchema,
    defaultValues: {
      ...formDefaultValues,
    },
  })
  const { data } = form.useWatchValues({
    name: ['variableName'],
  })
  useEffect(() => {
    if (rest.open) {
      form.reset({
        ...formDefaultValues,
      })
    }
    return () => {}
  }, [
    rest.open,
    defaultValues.userPrompt,
    defaultValues.systemPropmt,
    defaultValues.model,
    defaultValues.variableName,
    defaultValues.credentialId,
  ])

  const handleSubmit = (values: GeminiFormValues) => {
    onSubmit(values)
    rest.onOpenChange(false)
    form.reset()
  }
  const credentialOptions = geminiCredsOptions?.items.map((cred) => ({
    value: cred.id as string,
    label: cred.name,
  }))
  return (
    <Dialog {...rest}>
      <DialogContent className='max-h-10/12 overflow-auto'>
        <DialogHeader>
          <DialogTitle>Gemini</DialogTitle>
          <DialogDescription>
            Configure the AI model and prompts for this node.
          </DialogDescription>
        </DialogHeader>
        <Form
          form={form}
          onSubmit={handleSubmit}
          className='mt-4 max-w-full space-y-8'
        >
          <FormInput
            label='VariableName'
            name='variableName'
            placeholder='myGemini'
            helperText={`Use this name to refrence the result in other nodes: {{${data.variableName || 'myApiCall'}.text}}`}
            // key={vaules.variableName}
          />
          <SelectComp
            placeholder={'Select a Credential'}
            name='credentialId'
            options={credentialOptions || []}
            label='Credential'
            helperText='The credential to use for this request'
            disabled={isLoading}
          />
          <SelectComp
            placeholder={'Select a Model'}
            name='model'
            options={ModelOptions}
            label='Model'
            helperText='The HTTP method use for this request'
          />
          <SelectComp
            placeholder={'Select a Model'}
            name='model'
            options={ModelOptions}
            label='Model'
            helperText='The Model use for this request'
          />

          <FormInput
            name='systemPrompt'
            type='textarea'
            label='System Prompt (Optional)'
            placeholder={'You are a helpful assistant.'}
            className='min-h-[80px] font-mono text-sm'
            helperText='Sets the behavior of the assistant. Use "{{variables}}" for simple values or "{{json variable}}" to stringify objects'
          />
          <FormInput
            name='userPrompt'
            type='textarea'
            label='User Prompt'
            placeholder={'Summarize this text: {{json httpResponse.data}}'}
            className='min-h-[120px] font-mono text-sm'
            helperText='The pormpt to send to the AI. Use "{{variables}}" for simple values or "{{json variable}}" to stringify objects'
          />
          <DialogFooter className='mt-4'>
            <ButtonLoader type='submit' className='w-full'>
              Save
            </ButtonLoader>
          </DialogFooter>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

export default GeminiDialog
