"use client";

import {
  CreditCardIcon,
  FolderOpenIcon,
  HistoryIcon,
  KeyIcon,
  LogOutIcon,
  StarIcon,
} from "@/assets/icons";
import LogoIcon from "@/assets/icons/LogoIcon";
import { signOut } from "@/features/auth/api";
import { cn } from "@/lib/utils";
import { LucideProps } from "lucide-react";
import { useTheme } from "next-themes";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ForwardRefExoticComponent, RefAttributes } from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "./ui/sidebar";

type IPageProps = {};
type IMenuItem = {
  title: string;
  id?: string | number;
  url: string;
  icon: ForwardRefExoticComponent<
    Omit<LucideProps, "ref"> & RefAttributes<SVGSVGElement>
  >;
};
type IItem = {
  title: string;
  id?: string | number;

  items: IMenuItem[];
};
const MENU_ITEMS: IItem[] = [
  {
    title: "Workflows",

    items: [
      {
        title: "Workflows",
        icon: FolderOpenIcon,
        url: "/workflows",
        id: "workflows",
      },
      {
        title: "Credentials",
        icon: KeyIcon,
        url: "/credentials",
        id: "credentials",
      },
      {
        title: "Executions",
        icon: HistoryIcon,
        url: "/executions",
        id: "executions",
      },
    ],
  },
];
function RenderIfNotClosed({ children }: { children: React.ReactNode }) {
  const { open, isMobile } = useSidebar();
  if (!open && !isMobile) {
    return null;
  }
  return children;
}
const AppSidebar = (props: IPageProps) => {
  const { setTheme, theme } = useTheme();
  const newTheme = theme === "dark" ? "light" : "dark";
  const pathName = usePathname();
  const { open, isMobile } = useSidebar();
  const isSidebarClosed = !open && !isMobile;
  return (
    <Sidebar collapsible="icon">
      <SidebarHeader
        className={cn(
          "transition",
          isSidebarClosed && " items-center transition  "
        )}
      >
        <SidebarMenuItem className="list-none">
          <SidebarMenuButton
            tooltip={"ZFlow"}
            asChild
            className={cn(`gap-x-4 px-4 h-14 rounded-xs bg-primary text-primary-foreground 
            hover:bg-primary hover:text-primary-foreground active:text-primary-foreground active:bg-primary`)}
          >
            <Link href={"/"} prefetch>
              <LogoIcon
                className={cn("size-8!", isSidebarClosed && "size-5!")}
              />
              <RenderIfNotClosed>
                <span className="text-lg font-semibold ">ZFlow</span>
              </RenderIfNotClosed>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarHeader>
      <SidebarContent>
        {MENU_ITEMS.map((m) => {
          return (
            <SidebarGroup
              key={m.title}
              className={cn(isSidebarClosed && " items-center  ")}
            >
              <SidebarContent>
                <SidebarMenu>
                  {m.items.map((item) => {
                    return (
                      <SidebarMenuItem key={item.id || item.title}>
                        <SidebarMenuButton
                          tooltip={item.title}
                          id={item.id?.toString()}
                          asChild
                          isActive={
                            item.url === "/"
                              ? item.url === pathName
                              : pathName.startsWith(item.url)
                          }
                          className={cn(
                            `gap-x-4 h-10 px-4 dark:hover:bg-primary/30 dark:hover:text-white data-[active=true]:bg-primary data-[active=true]:text-primary-foreground `,

                            isSidebarClosed && "rounded-xs p-0 gap-0"
                          )}
                          onClick={(e) => {
                            // e.stopPropagation();
                            setTheme(newTheme);
                          }}
                        >
                          <Link href={item.url} prefetch={true}>
                            <item.icon className="" />
                            <RenderIfNotClosed>
                              <span>{item.title}</span>
                            </RenderIfNotClosed>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    );
                  })}
                </SidebarMenu>
              </SidebarContent>
            </SidebarGroup>
          );
        })}
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              tooltip={"Upgrade to Pro"}
              className="gap-x-4 h-10 px-4"
              onClick={async () => {
                await signOut();
              }}
            >
              <StarIcon className="h-4 w-4" />
              <RenderIfNotClosed>
                <span> Upgrade to Pro</span>
              </RenderIfNotClosed>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton
              tooltip={"Billing Portal"}
              className="gap-x-4 h-10 px-4"
              onClick={() => {}}
            >
              <CreditCardIcon className="h-4 w-4" />
              <RenderIfNotClosed>
                <span> Billing Portal</span>
              </RenderIfNotClosed>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton
              tooltip={"Sign out"}
              className="gap-x-4 h-10 px-4"
              onClick={async () => {
                await signOut();
              }}
            >
              <LogOutIcon className="h-4 w-4" />
              <RenderIfNotClosed>
                <span>Sign out</span>
              </RenderIfNotClosed>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
};

export default AppSidebar;
