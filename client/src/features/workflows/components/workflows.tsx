"use client";

import {
  EntityContainer,
  EntityHeader,
  EntityPaination,
  EntitySearch,
} from "@/components/entity-components";
import useEntitySearch from "@/hooks/use-entity-search";
import useUpgradeModal from "@/hooks/use-upgrade-modal";
import { useOffsetPaginationParams } from "@/queries/pagination/hooks/use-pagination-params";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useCreateWorkflow, useDeleteWorkflows } from "../api";
import { useSuspenseOffsetWorkflows } from "../api/query-hooks";

type Props = {};

const Workflows = (props: Props) => {
  const { data } = useSuspenseOffsetWorkflows();
  const { handleDelete } = useDeleteWorkflows();
  const router = useRouter();
  return (
    <div className="">
      {JSON.stringify(data?.items, null, 2)}
      <br />
      <br />
      {JSON.stringify(data?.pagination_meta, null, 2)}
    </div>
  );
};

export default Workflows;

export const WorkflowSearch = () => {
  const {
    setParams: setUrlParams,
    params,
    search,
  } = useOffsetPaginationParams<IWorkflow>();
  const { searchValue, onSearchChange } = useEntitySearch({
    setParams(params) {
      setUrlParams({
        search: searchValue,
        page: params.page,
      });
    },
    params: {
      page: params.page as unknown as number,
      search: (search || "") as string,
    },
  });
  return (
    <EntitySearch
      placeholder="Search workflows"
      value={searchValue}
      onChange={(e) => {
        onSearchChange(e);
      }}
    />
  );
};

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

export const WorkflowPagination = () => {
  const { pagination_meta } = useSuspenseOffsetWorkflows();
  const { page, setPage } = useOffsetPaginationParams<IWorkflow>();
  return (
    <EntityPaination
      page={page}
      onPageChange={setPage}
      totalPages={pagination_meta?.totalPages}
      isNext={!!pagination_meta?.next}
    />
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
        search={<WorkflowSearch />}
        pagination={<WorkflowPagination />}
      >
        {children}
      </EntityContainer>
    </>
  );
};
