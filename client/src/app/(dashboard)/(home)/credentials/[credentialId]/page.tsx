import { authSession } from "@/lib/auth/auth";

type PageProps = {
  params: Promise<{ credentialId: string }>;
};

const CredentaialPage = async (props: PageProps) => {
  await authSession();
  const { credentialId } = await props.params;
  return <div>Credentaial Id: {credentialId}</div>;
};

export default CredentaialPage;
