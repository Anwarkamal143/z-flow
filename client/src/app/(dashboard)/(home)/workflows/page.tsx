import Dataloader from "@/components/loaders";
import { HydrateClient } from "@/components/server";
import { REFRESH_QUERY_KEY } from "@/config";
import { prefetchWorkflows } from "@/features/workflows/api";
import Workflows, {
  WorkflowsContainer,
} from "@/features/workflows/components/workflows";
import { authSession } from "@/lib/auth/auth";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
type Props = any;

const WorkFlowPage = async (props: Props) => {
  const params = await props.searchParams;
  const resp = await authSession(params);
  if (params?.[REFRESH_QUERY_KEY]) {
    return <Dataloader />;
  }
  void prefetchWorkflows(resp?.cookie);

  return (
    <WorkflowsContainer>
      <HydrateClient>
        <ErrorBoundary fallback={<div>Something went wrong</div>}>
          <Suspense fallback={<Dataloader message="Workflows loading.." />}>
            <Workflows />
          </Suspense>
        </ErrorBoundary>
      </HydrateClient>
    </WorkflowsContainer>
  );
};

export default WorkFlowPage;
