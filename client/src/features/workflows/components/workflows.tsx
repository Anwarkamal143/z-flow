"use client";

import ButtonLoader from "@/components/button-loader";
import { EntityContainer, EntityHeader } from "@/components/entity-components";
import useUpgradeModal from "@/hooks/use-upgrade-modal";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useCreateWorkflow, useDeleteWorkflows } from "../api";
import { useSuspenseWorkflows } from "../api/query-hooks";

type Props = {};

const Workflows = (props: Props) => {
  const { data, page, pagination_meta, setPage, setSearch, isLoading } =
    useSuspenseWorkflows({
      params: {},
    });
  console.log(isLoading, "isLoading");
  const { handleDelete } = useDeleteWorkflows();
  const router = useRouter();
  return (
    <div className="">
      <div className="flex gap-x-3 justify-center">
        <ButtonLoader
          onClick={async () => {
            await handleDelete();
          }}
        >
          Delete workflows
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
            setSearch({
              columns: ["name"],
              mode: "all",
              term: "abundant",
            });
          }}
        >
          Search
        </ButtonLoader>
        <ButtonLoader
          onClick={() => {
            // setPage(data?.pagination_meta.next as number);
            setSearch(null);
          }}
        >
          Clear Search
        </ButtonLoader>
        <ButtonLoader
          onClick={() => {
            // setPage(data?.pagination_meta.next as number);
            if (pagination_meta.next) {
              setPage(pagination_meta.next as number);
            }
          }}
        >
          Fetch Next
        </ButtonLoader>
        <ButtonLoader
          onClick={() => {
            if (pagination_meta.previous) {
              setPage(pagination_meta.previous as number);
            }
          }}
        >
          Fetch Previous
        </ButtonLoader>
        <ButtonLoader
          onClick={() => {
            router.push("/workflows?server=true");
          }}
        >
          workflows
        </ButtonLoader>
      </div>
      {JSON.stringify(data?.items, null, 2)}
      <br />
      <br />
      {JSON.stringify(data?.pagination_meta, null, 2)}
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
