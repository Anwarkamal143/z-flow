import AppSidebar from "@/components/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import AuthWrapper from "@/providers/auth-provider";

type IPageProps = {
  children: React.ReactNode;
};

const DashBoardLayout = ({ children }: IPageProps) => {
  return (
    <AuthWrapper>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset className="bg-accent/20">{children}</SidebarInset>
      </SidebarProvider>
    </AuthWrapper>
  );
};

export default DashBoardLayout;
