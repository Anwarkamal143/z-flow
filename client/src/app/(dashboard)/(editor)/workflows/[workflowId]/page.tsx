import { authSession } from "@/lib/auth";

type IPageProps = {
  params: Promise<{ workflowId: string }>;
};

const WorkflowPage = async (props: IPageProps) => {
  await authSession();
  const { workflowId } = await props.params;
  return <div>Workflow Id: {workflowId}</div>;
};

export default WorkflowPage;
