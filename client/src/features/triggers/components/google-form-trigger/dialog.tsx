import { CopyIcon } from '@/assets/icons'
import ButtonLoader from '@/components/button-loader'
import InputComponent from '@/components/form/Input/Input'
import {
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  IDialogProps,
} from '@/components/ui/dialog'
import { API_BASE_URL } from '@/config'
import { removeVersionFromApiURL } from '@/lib'
import { useActiveWorkflow } from '@/store/useEditorStore'
import { Dialog } from '@radix-ui/react-dialog'
import { useParams } from 'next/navigation'
import { toast } from 'sonner'
import { generateGoogleFormScript } from './utils'
type Props = IDialogProps
const GoogleFormTriggerSettings = (props: Props) => {
  const params = useParams()
  const workflowId = params.workflowId as string
  const workflow = useActiveWorkflow()
  // Construct the webhook URL
  const baseUrl = API_BASE_URL
  const webhookUrl = `${removeVersionFromApiURL(baseUrl)}/webhooks/google-form?workflowId=${workflowId}&secret=${workflow?.secret}`

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
          <DialogTitle>Google Form Trigger Configuration</DialogTitle>
          <DialogDescription>
            Use this webhook URL in your Google Form&apos;s Apps Script to
            trigger this workflow when a form is submitted.
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
              <li>Open your Google Form</li>
              <li>Click the three dots menu → Script editor</li>
              <li>Copy and paste the script below</li>
              <li>Replace WEBHOOK_URL with your webhook URL above</li>
              <li>Save and click &quot;Triggers&quot; → Add Trigger</li>
              <li>Choose: From form → On form submit → Save</li>
            </ol>
          </div>
          <div className='bg-muted space-y-3 rounded-lg p-4'>
            <h4 className='text-sm font-medium'>Google Apps Script:</h4>
            <ButtonLoader
              type='button'
              variant={'outline'}
              onClick={async () => {
                const script = generateGoogleFormScript(webhookUrl)
                try {
                  await navigator.clipboard.writeText(script)
                  toast.success('script copied to clipboard')
                } catch (error) {
                  toast.error('Failed to copy script to clipboard')
                }
              }}
            >
              <CopyIcon className='mr-2 size-4' />
              Copy Google Apps Script
            </ButtonLoader>
            <p className='text-muted-foreground text-xs'>
              This script includes your webhook URL and handles form submissions
            </p>
          </div>
          <div className='bg-muted space-y-2 rounded-lg p-4'>
            <h4 className='text-sm font-medium'>Available Variables</h4>
            <ul className='text-muted-foreground space-y-1 text-sm'>
              <li>
                <code className='bg-background rounded-xs px-1 py-0.5'>
                  {'{{googleForm.respondentEmail}}'}
                </code>
                - Respondent&apos;s email
              </li>
              <li>
                <code className='bg-background rounded-xs px-1 py-0.5'>
                  {'{{googleForm.formTitle}}'}
                </code>
                - Form title
              </li>
              <li>
                <code className='bg-background rounded-xs px-1 py-0.5'>
                  {'{{json googleForm.responses}}'}
                </code>
                - All responses as JSON
              </li>
            </ul>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default GoogleFormTriggerSettings
