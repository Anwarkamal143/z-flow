import { authSession } from "@/lib/auth";

type Props = {};

const WorkFlowPage = async (props: Props) => {
  await authSession();
  return <div>WorkFlowPage</div>;
};

export default WorkFlowPage;
