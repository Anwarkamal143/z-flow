"use client";

import ButtonLoader from "@/components/ButtonLoader";
import { EntityContainer, EntityHeader } from "@/components/entity-components";
import useUpgradeModal from "@/hooks/use-upgrade-modal";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useCreateWorkflow, useDeleteWorkflows } from "../api";
import { useSuspenseGetAllWorkflows } from "../api/query-hooks";

type Props = {};

const Workflows = (props: Props) => {
  const { data, isLoading, error, isError, fetchPreviousPage, fetchNextPage } =
    useSuspenseGetAllWorkflows({
      params: {
        limit: 4,
      },
    });
  const { handleDelete } = useDeleteWorkflows();
  const router = useRouter();

  return (
    <div className="flex-1 flex-col justify-center items-center">
      <div className="flex gap-x-3 justify-center">
        <ButtonLoader
          onClick={async () => {
            await handleDelete();
          }}
        >
          Delete workflows
        </ButtonLoader>
        <ButtonLoader
          disabled={!data?.pagination_meta.previous}
          onClick={() => {
            fetchPreviousPage();
          }}
        >
          Previous Page ({data?.pagination_meta.previous})
        </ButtonLoader>
        <ButtonLoader
          onClick={() => {
            // setPage(data?.pagination_meta.next as number);
            fetchNextPage();
          }}
        >
          Next Page ({data?.pagination_meta.next})
        </ButtonLoader>
        <ButtonLoader
          onClick={() => {
            // setPage(data?.pagination_meta.next as number);
            router.push("/server?server=true");
          }}
        >
          Server
        </ButtonLoader>
        <ButtonLoader
          onClick={() => {
            // setPage(data?.pagination_meta.next as number);
            router.push("/workflows?server=true");
          }}
        >
          workflows
        </ButtonLoader>
      </div>
      {JSON.stringify(data, null, 2)}
    </div>
  );
};

export default Workflows;

export const WorkflowsHeader = ({ disabled }: { disabled?: boolean }) => {
  const { handleCreate, isPending } = useCreateWorkflow();
  const { handleError, ConfirmModal } = useUpgradeModal();
  const router = useRouter();

  return (
    <>
      <ConfirmModal />
      <EntityHeader
        title="Workflows"
        description="Create and manage your workflows"
        onNew={async () => {
          const resp = await handleCreate({});
          console.log(resp, "resp");
          if (resp?.data?.id) {
            toast.success("Workflow created");
            return router.push(`/workflows/${resp?.data?.id}`);
          }
          toast.error(resp.message || "Failed to create workflow");
          const res = await handleError(resp.errorCode);
        }}
        newButtonLabel="New workflow"
        disabled={disabled}
        isCreating={isPending}
      />
    </>
  );
};
export const WorkflowsContainer = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  return (
    <>
      <EntityContainer
        header={<WorkflowsHeader />}
        search={<></>}
        pagination={<></>}
      >
        {children}
      </EntityContainer>
    </>
  );
};
