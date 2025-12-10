"use client";

import ButtonLoader from "@/components/button-loader";
import Dataloader from "@/components/loaders";
import { useCursorGetAllUsers } from "@/features/user/api/hooks";

const TestPage = () => {
  const { data, isLoading, fetchNextPage } = useCursorGetAllUsers();

  if (isLoading) {
    return <Dataloader message="Loading cursor users list..." />;
  }
  return (
    <div className="gap-2 px-2 flex justify-center items-center flex-col">
      {JSON.stringify(data?.data, null, 2)}

      <ButtonLoader
        disabled={!data?.pagination_meta?.hasMore}
        onClick={() => {
          fetchNextPage();
        }}
      >
        Fetch Next
      </ButtonLoader>
    </div>
  );
};

export default TestPage;
