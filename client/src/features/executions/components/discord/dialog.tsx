import ButtonLoader from '@/components/button-loader'
import Form from '@/components/form/Form'
import FormInput from '@/components/form/Input'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import useZodForm from '@/hooks/useZodForm'
import { useEffect } from 'react'
import z from 'zod'

import ObjectTemplateInput from '@/components/object-template-input'

const formSchema = z.object({
  username: z.string().optional(),
  content: z
    .string()
    .min(1, 'Message content is required')
    .max(2000, 'Discord messages cannot exceed 2000 characters'),
  webhookUrl: z.string().min(1, 'Webhook URL is required'),
  variableName: z
    .string()
    .min(1, { error: 'Variable name is required' })
    .regex(/^[A-Za-z_$][A-za-z0-9_$]*$/, {
      error:
        'Variable name must start with letter or underscore and contain only letters, numbers and underscores',
    }),
})

export type DiscordFormValues = z.infer<typeof formSchema>
type Props = {
  onSubmit: (values: DiscordFormValues) => void
  defaultValues?: Partial<DiscordFormValues>
  open: boolean
  onOpenChange: (isOpen: boolean) => void
}

const DiscordDialog = ({ defaultValues = {}, onSubmit, ...rest }: Props) => {
  const formDefaultValues: DiscordFormValues = {
    ...defaultValues,

    variableName: defaultValues.variableName || '',
    content: defaultValues.content || '',
    webhookUrl: defaultValues.webhookUrl || '',
    username: defaultValues.username || '',
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
    defaultValues.username,
    defaultValues.content,
    defaultValues.variableName,
    defaultValues.webhookUrl,
  ])

  const handleSubmit = (values: DiscordFormValues) => {
    onSubmit(values)
    rest.onOpenChange(false)
    form.reset()
  }

  const formValues = form.getValues()
  return (
    <Dialog {...rest}>
      <DialogContent className='max-h-10/12 overflow-auto'>
        <DialogHeader>
          <DialogTitle>Discord Configuration</DialogTitle>
          <DialogDescription>
            Configure the Discord webhook settings for this node.
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
            placeholder='myDiscord'
            helperText={`Use this name to refrence the result in other nodes: {{${data.variableName || 'myApiCall'}.text}}`}
          />

          <ObjectTemplateInput
            label='Webhook URL'
            id='webhook-url'
            name='webhookUrl'
            value={formValues.webhookUrl}
            onChange={(e) => form.setValue('webhookUrl', e)}
            placeholder='https://discord.com./api/webhooks/...'
            className='font-mono text-sm'
            helperText={
              <span>
                Get this from Discord: Channel Settings → Integrations →
                Webhooks
              </span>
            }
          />

          <FormInput
            name='content'
            type='textarea'
            label='Message Content'
            placeholder={'Summary: {{myGemini.text}}'}
            className='min-h-[80px] font-mono text-sm'
            helperText='The message to send. Use "{{variables}}" for simple values or "{{json variable}}" to stringify objects'
          />
          <FormInput
            label='Bot Username (Optional)'
            name='username'
            placeholder='Workflow Bot'
            helperText={`Override the webhook's default username`}
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

export default DiscordDialog
