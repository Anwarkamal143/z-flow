"use client";

import { useCursorGetAllUsers } from "@/features/user/api/hooks";

type Props = {};

const TestPage = (props: Props) => {
  const { data } = useCursorGetAllUsers();
  console.log(data?.pagination_meta, "All users");
  return <div>{JSON.stringify(data, null, 2)}</div>;
};

export default TestPage;
