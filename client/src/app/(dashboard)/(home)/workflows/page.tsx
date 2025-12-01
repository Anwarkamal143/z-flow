import Dataloader from "@/components/loaders";
import { HydrateClient } from "@/components/server";
import { prefetchSubscriptions } from "@/features/payments/subscriptions/api/quries/prefetches";
import Workflows from "@/features/workflows/components/workflows";
import { authSession } from "@/lib/auth";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
type Props = {};

const WorkFlowPage = async (props: Props) => {
  await authSession();
  void prefetchSubscriptions();
  return (
    <HydrateClient>
      <ErrorBoundary fallback={<div>Something went wrong</div>}>
        <Suspense fallback={<Dataloader message="Workflows loading.." />}>
          <Workflows />
        </Suspense>
      </ErrorBoundary>
    </HydrateClient>
  );
};

export default WorkFlowPage;
