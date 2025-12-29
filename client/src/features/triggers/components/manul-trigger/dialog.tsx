import {
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  IDialogProps,
} from '@/components/ui/dialog'
import { Dialog } from '@radix-ui/react-dialog'
type Props = IDialogProps

const ManualTriggerSettings = (props: Props) => {
  return (
    <Dialog {...props}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Manual Trigger</DialogTitle>
          <DialogDescription>
            Configure settings for the manual trigger node.
          </DialogDescription>
        </DialogHeader>
        <div className='py-4'>
          <p className='text-muted-foreground text-sm'>
            Used to manually execute a workflow, no configuration available.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default ManualTriggerSettings
