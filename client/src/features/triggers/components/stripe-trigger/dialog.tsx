import { CopyIcon } from '@/assets/icons'
import ButtonLoader from '@/components/button-loader'
import InputComponent from '@/components/form/Input/Input'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  IDialogProps,
} from '@/components/ui/dialog'
import { API_BASE_URL } from '@/config'
import { removeVersionFromApiURL } from '@/lib'
import { useActiveWorkflow } from '@/store/useEditorStore'
import { useParams } from 'next/navigation'
import { toast } from 'sonner'
type Props = IDialogProps & { secret?: string }
const StripeTriggerSettings = (props: Props) => {
  const params = useParams()
  const workflow = useActiveWorkflow()
  const workflowId = params.workflowId as string
  // Construct the webhook URL
  const baseUrl = API_BASE_URL
  const webhookUrl = `${removeVersionFromApiURL(baseUrl)}/webhooks/stripe?workflowId=${workflowId}&secret=${workflow?.secret}`

  const copyToCipboard = async () => {
    try {
      await navigator.clipboard.writeText(webhookUrl)
      toast.success('webhook URL copied to clipboard')
    } catch (error) {
      toast.error('Failed to copy URL')
    }
  }
  return (
    <Dialog {...props}>
      <DialogContent className='max-h-10/12 overflow-auto'>
        <DialogHeader>
          <DialogTitle>Stripe Trigger Configuration</DialogTitle>
          <DialogDescription>
            Configure this webhook URL in your Stripe Dashboard to trigger this
            workflow on payment events.
          </DialogDescription>
        </DialogHeader>
        <div className='space-y-4'>
          <div className='space-y-2'>
            <div className='flex items-center justify-center gap-2'>
              <InputComponent
                label='Webhook URL'
                id='webhook-url'
                value={webhookUrl}
                readOnly
                className='font-mono text-sm'
                suffixComponent={
                  <ButtonLoader
                    className='ml-2'
                    size={'icon'}
                    variant={'outline'}
                    onClick={copyToCipboard}
                  >
                    <CopyIcon />
                  </ButtonLoader>
                }
              />
            </div>
          </div>
          <div className='bg-muted space-y-2 rounded-lg p-4'>
            <h4 className='text-sm font-medium'>Setup instructions:</h4>
            <ol className='text-muted-foreground list-inside list-decimal space-x-1 text-sm'>
              <li>Open your Stripe Dashboard</li>
              <li>Go to Developers → Webhooks</li>
              <li>Click {'Add endpoint'}</li>
              <li>Paste the webhook URL above</li>
              <li>
                Select the events to listen for (e.g., payment_intent_succeeded)
              </li>
              <li>Save and copy the signing secret</li>
            </ol>
          </div>

          <div className='bg-muted space-y-2 rounded-lg p-4'>
            <h4 className='text-sm font-medium'>Available Variables</h4>
            <ul className='text-muted-foreground space-y-1 text-sm'>
              <li>
                <code className='bg-background rounded-xs px-1 py-0.5'>
                  {'{{stripe.amount}}'}
                </code>
                - Payment amount
              </li>
              <li>
                <code className='bg-background rounded-xs px-1 py-0.5'>
                  {'{{stripe.currency}}'}
                </code>
                - Currency code
              </li>
              <li>
                <code className='bg-background rounded-xs px-1 py-0.5'>
                  {'{{stripe.customerId}}'}
                </code>
                - Customer ID
              </li>
              <li>
                <code className='bg-background rounded-xs px-1 py-0.5'>
                  {'{{json stripe}}'}
                </code>
                - Full event data as JSON
              </li>
              <li>
                <code className='bg-background rounded-xs px-1 py-0.5'>
                  {'{{stripe.eventType}}'}
                </code>
                - Event type (e.g., payment_intent.succeeded)
              </li>
            </ul>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default StripeTriggerSettings
