import AppHeader from "@/components/app-header";

type IHomeLayoutProps = {
  children: React.ReactNode;
};

const HomeLayout = ({ children }: IHomeLayoutProps) => {
  return (
    <>
      <AppHeader />
      <main className="flex-1">{children}</main>
    </>
  );
};

export default HomeLayout;
