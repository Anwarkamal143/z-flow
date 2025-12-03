import { authSession } from "@/lib/auth/auth";

type Props = {};

const ExecutionsPage = async (props: Props) => {
  await authSession();
  return <div>ExecutionsPage</div>;
};

export default ExecutionsPage;
