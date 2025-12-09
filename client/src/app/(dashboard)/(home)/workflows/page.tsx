import Dataloader from "@/components/loaders";
import { HydrateClient } from "@/components/server";
import { prefetchWorkflows } from "@/features/workflows/api";
import Workflows from "@/features/workflows/components/workflows";
import { authSession } from "@/lib/auth/auth";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
type Props = {};

const WorkFlowPage = async (props: Props) => {
  const resp = await authSession();
  void prefetchWorkflows(resp?.cookie);

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
