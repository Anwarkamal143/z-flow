import { useCreateWorkflow, useDeleteWorkflows } from "./mutation-hooks";
import { prefetchWorkflows } from "./prefetch";
import { useGetAllWorkflows, useSuspenseGetAllWorkflows } from "./query-hooks";

export {
  prefetchWorkflows,
  useCreateWorkflow,
  useDeleteWorkflows,
  useGetAllWorkflows,
  useSuspenseGetAllWorkflows,
};
