"use client";

import ButtonLoader from "@/components/ButtonLoader";
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
  console.log(isLoading, "isLoading");
  const { handleCreate } = useCreateWorkflow();
  const { handleDelete } = useDeleteWorkflows();

  return (
    <div>
      <div className="flex gap-x-3 justify-center">
        <ButtonLoader
          onClick={async () => {
            await handleCreate({});
          }}
        >
          Create workflow
        </ButtonLoader>
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
      </div>
      {JSON.stringify(data, null, 2)}
    </div>
  );
};

export default Workflows;
