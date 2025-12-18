import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { JSX, ReactNode, useState } from 'react'

type Props = {
  title: ReactNode
  message: ReactNode
}

const useConfirm = (
  props: Props,
): [() => JSX.Element, () => Promise<unknown>] => {
  const { title, message } = props
  const [promise, setPromise] = useState<{
    resolve: (value: boolean) => void
  } | null>(null)

  const confirm = () =>
    new Promise((resolve, _reject) => {
      setPromise({ resolve })
    })

  const handleClose = () => {
    setPromise(null)
  }

  const handleCancel = () => {
    promise?.resolve(false)
    handleClose()
  }

  const handleConfirm = () => {
    promise?.resolve(true)
    handleClose()
  }

  const ConfirmDialog = () => {
    return (
      <Dialog open={promise != null} onOpenChange={handleCancel}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
            <DialogDescription>{message}</DialogDescription>
          </DialogHeader>
          <DialogFooter className='pt-2'>
            <DialogClose asChild>
              <Button onClick={handleCancel} variant={'outline'}>
                Cancel
              </Button>
            </DialogClose>
            <Button onClick={handleConfirm}>Confirm</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    )
  }

  return [ConfirmDialog, confirm]
}

export default useConfirm
