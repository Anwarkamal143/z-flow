import { authSession } from "@/lib/auth/auth";

type Props = {};

const CredentialsPage = async (props: Props) => {
  await authSession();
  return <div>CredentialsPage</div>;
};

export default CredentialsPage;
