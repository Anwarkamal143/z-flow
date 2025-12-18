'use client'
import Dataloader from '@/components/loaders'
import { useHasActiveSubscription } from '@/features/payments/subscriptions'

const SubscriptionPage = () => {
  const { subscription, hasActiveSubscription, isSubscriptionLoading } =
    useHasActiveSubscription()
  if (isSubscriptionLoading) {
    return <Dataloader message='Subscription loading...' />
  }
  return <div>{JSON.stringify(subscription)}</div>
}

export default SubscriptionPage
