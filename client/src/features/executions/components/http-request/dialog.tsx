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
  // .refine() TODO
})
type IInitialValues = {
  endpoint?: string
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
  body?: string
  // defaultEndpoint?: string
  // defaultMethod?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
  // defaultBody?: string
}
export type IFormType = z.infer<typeof formSchema>
type Props = {
  onSubmit: (values: IFormType) => void
  initialValues: IInitialValues
  open: boolean
  onOpenChange: (isOpen: boolean) => void
}
const HttpRequestDialog = ({ initialValues, onSubmit, ...rest }: Props) => {
  const form = useZodForm({
    schema: formSchema,
    defaultValues: {
      ...initialValues,
      method: initialValues.method || 'GET',
      endpoint: initialValues.endpoint || '',
      body: initialValues.body || '',
    },
  })
  const { data } = form.useWatchValues({
    name: ['method'],
  })
  const showBodyField = ['POST', 'PUT', 'PATCH'].includes(data.method)
  useEffect(() => {
    if (rest.open) {
      form.reset({
        ...initialValues,
      })
    }
    return () => {}
  }, [
    rest.open,
    initialValues.body,
    initialValues.endpoint,
    initialValues.method,
  ])

  const handleSubmit = (values: IFormType) => {
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
            <ButtonLoader type='submit'>Save</ButtonLoader>
          </DialogFooter>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

export default HttpRequestDialog
