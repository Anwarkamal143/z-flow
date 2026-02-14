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
  content: z.string().min(1, 'Message content is required'),
  webhookUrl: z.string().min(1, 'Webhook URL is required'),
  variableName: z
    .string()
    .min(1, { error: 'Variable name is required' })
    .regex(/^[A-Za-z_$][A-za-z0-9_$]*$/, {
      error:
        'Variable name must start with letter or underscore and contain only letters, numbers and underscores',
    }),
})

export type SlackFormValues = z.infer<typeof formSchema>
type Props = {
  onSubmit: (values: SlackFormValues) => void
  defaultValues?: Partial<SlackFormValues>
  open: boolean
  onOpenChange: (isOpen: boolean) => void
}

const SlackDialog = ({ defaultValues = {}, onSubmit, ...rest }: Props) => {
  const formDefaultValues: SlackFormValues = {
    ...defaultValues,

    variableName: defaultValues.variableName || '',
    content: defaultValues.content || '',
    webhookUrl: defaultValues.webhookUrl || '',
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
    defaultValues.content,
    defaultValues.variableName,
    defaultValues.webhookUrl,
  ])

  const handleSubmit = (values: SlackFormValues) => {
    onSubmit(values)
    rest.onOpenChange(false)
    form.reset()
  }

  const formValues = form.getValues()
  return (
    <Dialog {...rest}>
      <DialogContent className='max-h-10/12 overflow-auto'>
        <DialogHeader>
          <DialogTitle>Slack Configuration</DialogTitle>
          <DialogDescription>
            Configure the Slack webhook settings for this node.
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
            placeholder='mySlack'
            helperText={`Use this name to refrence the result in other nodes: {{${data.variableName || 'myApiCall'}.text}}`}
          />

          <ObjectTemplateInput
            label='Webhook URL'
            id='webhook-url'
            name='webhookUrl'
            value={formValues.webhookUrl}
            onChange={(e) => form.setValue('webhookUrl', e)}
            placeholder='https://hooks.slack.com./services/...'
            className='font-mono text-sm'
            helperText={
              <span>
                Get this from Slack: Workspace Settings → Workflows → Webhooks
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

export default SlackDialog
