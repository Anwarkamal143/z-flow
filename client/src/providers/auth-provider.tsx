"use client";
import { Loader } from "@/components/loaders";
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

  if (loading) return <Loader size="lg" full />;

  if (!user) return null; // redirect already handled

  return <>{children}</>;
}
export default AuthGuard;
