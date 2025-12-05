"use client";

import ButtonLoader from "@/components/ButtonLoader";
import Dataloader from "@/components/loaders";
import { useCursorGetAllUsers } from "@/features/user/api/hooks";
import { useState } from "react";

type Props = {};

const TestPage = (props: Props) => {
  const [page, setPage] = useState(0);
  const { data, isLoading } = useCursorGetAllUsers();
  if (isLoading) {
    return <Dataloader message="Loading cursor users list..." />;
  }
  return (
    <div>
      {JSON.stringify(data?.data, null, 2)}

      <ButtonLoader
        onClick={() => {
          setPage(page + 1);
        }}
      >
        Fetch Next
      </ButtonLoader>
    </div>
  );
};

export default TestPage;
