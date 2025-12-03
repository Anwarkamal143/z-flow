"use client";
import { PageLoader } from "@/components/loaders";
import { Role } from "@/config/enums";
import { useAuthGuard } from "@/hooks/useAuthGuard";

function AuthGuard({
  children,
  roles,
}: {
  children: React.ReactNode;
  roles?: Role[];
}) {
  const { loading, user } = useAuthGuard(roles);

  if (loading) return <PageLoader />;

  if (!user) return null; // redirect already handled

  return <>{children}</>;
}
export default AuthGuard;
