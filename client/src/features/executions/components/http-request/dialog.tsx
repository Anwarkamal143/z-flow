import { GlobeIcon } from '@/assets/icons'
import ButtonLoader from '@/components/button-loader'
import Form from '@/components/form/Form'
import FormInput from '@/components/form/Input'
import SelectComp from '@/components/form/Input/select'

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
const METHODS = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE']
const formSchema = z.object({
  endpoint: z.url({ error: 'Please enter a valid URL' }),
  method: z.enum(METHODS),
  body: z.string().optional(),
  variableName: z
    .string()
    .min(1, { error: 'Variable name is required' })
    .regex(/^[A-Za-z_$][A-za-z0-9_$]*$/, {
      error:
        'Variable name must start with letter or underscore and contain only letters, numbers and underscores',
    }),
  // .refine() TODO
})

export type HttpRequestFormValues = z.infer<typeof formSchema>
type Props = {
  onSubmit: (values: HttpRequestFormValues) => void
  defaultValues?: Partial<HttpRequestFormValues>
  open: boolean
  onOpenChange: (isOpen: boolean) => void
}
const HttpRequestDialog = ({
  defaultValues = {},
  onSubmit,
  ...rest
}: Props) => {
  const formDefaultValues: HttpRequestFormValues = {
    ...defaultValues,
    method: defaultValues.method || 'GET',
    endpoint: defaultValues.endpoint || '',
    body: defaultValues.body || '',
    variableName: defaultValues.variableName || '',
  }
  const form = useZodForm({
    schema: formSchema,
    defaultValues: {
      ...formDefaultValues,
    },
  })
  const { data } = form.useWatchValues({
    name: ['method', 'variableName'],
  })
  const showBodyField = ['POST', 'PUT', 'PATCH'].includes(data.method)
  useEffect(() => {
    if (rest.open) {
      form.reset({
        ...formDefaultValues,
      })
    }
    return () => {}
  }, [
    rest.open,
    defaultValues.body,
    defaultValues.endpoint,
    defaultValues.method,
    defaultValues.variableName,
  ])

  const handleSubmit = (values: HttpRequestFormValues) => {
    onSubmit(values)
    rest.onOpenChange(false)
    form.reset()
  }
  return (
    <Dialog {...rest}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>HTTP Request</DialogTitle>
          <DialogDescription>
            Configure settings for the HTTP Request node.
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
            placeholder='myApiCall'
            helperText={`Use this name to refrence the result in other nodes: {{${data.variableName || 'myApiCall'}.httpResponse.data}}`}
            // key={vaules.variableName}
          />
          <SelectComp
            placeholder={{ title: 'Select a method', icon: GlobeIcon }}
            name='method'
            options={[
              { value: 'GET', label: 'GET', icon: GlobeIcon },
              { value: 'POST', label: 'POST', icon: GlobeIcon },
              { value: 'PUT', label: 'PUT', icon: GlobeIcon },
              { value: 'PATCH', label: 'PATCH', icon: GlobeIcon },
              { value: 'DELETE', label: 'DELETE', icon: GlobeIcon },
            ]}
            label='Method'
            helperText='The HTTP method use for this request'
          />
          <FormInput
            label='Endpoint URL'
            name='endpoint'
            placeholder='https://api.example.com/users/{{httpResponse.data.id}}'
            helperText='Static URL or ues "{{variables}}" for simple values or "{{json variable}}" to stringify objects'
          />
          {showBodyField && (
            <FormInput
              name='body'
              isTextArea
              placeholder={
                '{ \n "userId": "{{httpResponse.data.id}}", \n "name": "{{httpResponse.data.name}}", \n "items": "{{httpResponse.data.items}}"\n }'
              }
              className='min-h-[120px] font-mono text-sm'
              helperText='JSON with template variabels. Use "{{variables}}" for simple values or "{{json variables}}" to strigify objects'
            />
          )}
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

export default HttpRequestDialog
