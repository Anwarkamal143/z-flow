import { SidebarTrigger } from "./ui/sidebar";

type Props = {};

const AppHeader = (props: Props) => {
  return (
    <div className="border-b flex h-14 shrink-0 items-center gap-2 px-4 bg-background">
      <SidebarTrigger />
    </div>
  );
};

export default AppHeader;
