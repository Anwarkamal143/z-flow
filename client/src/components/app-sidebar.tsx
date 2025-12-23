'use client'

import {
  CreditCardIcon,
  FolderOpenIcon,
  HistoryIcon,
  KeyIcon,
  LogOutIcon,
} from '@/assets/icons'
import LogoIcon from '@/assets/icons/LogoIcon'
import { signOut } from '@/features/auth/api'
import { useHasActiveSubscription } from '@/features/payments/subscriptions'
import { openWindow } from '@/lib'
import { cn } from '@/lib/utils'
import { checkoutClient } from '@/models'
import { portalClient } from '@/models/v1/payments/Portal.model'
import { LucideProps, StarIcon } from 'lucide-react'
import { useTheme } from 'next-themes'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ForwardRefExoticComponent, RefAttributes } from 'react'
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
} from './ui/sidebar'

type IMenuItem = {
  title: string
  id?: string | number
  url: string
  icon: ForwardRefExoticComponent<
    Omit<LucideProps, 'ref'> & RefAttributes<SVGSVGElement>
  >
}
type IItem = {
  title: string
  id?: string | number

  items: IMenuItem[]
}
const MENU_ITEMS: IItem[] = [
  {
    title: 'Workflows',

    items: [
      {
        title: 'Workflows',
        icon: FolderOpenIcon,
        url: '/workflows',
        id: 'workflows',
      },
      {
        title: 'Credentials',
        icon: KeyIcon,
        url: '/credentials',
        id: 'credentials',
      },
      {
        title: 'Executions',
        icon: HistoryIcon,
        url: '/executions',
        id: 'executions',
      },
    ],
  },
]
function RenderIfNotClosed({ children }: { children: React.ReactNode }) {
  const { open, isMobile } = useSidebar()
  if (!open && !isMobile) {
    return null
  }
  return children
}
const AppSidebar = () => {
  const { setTheme, theme } = useTheme()
  const newTheme = theme === 'dark' ? 'light' : 'dark'
  const pathName = usePathname()
  const { open, isMobile } = useSidebar()
  const { hasActiveSubscription, isSubscriptionLoading } =
    useHasActiveSubscription()
  const isSidebarClosed = !open && !isMobile
  return (
    <Sidebar collapsible='icon'>
      <SidebarHeader
        className={cn(
          'transition',
          isSidebarClosed && 'items-center transition',
        )}
      >
        <SidebarMenuItem className='list-none'>
          <SidebarMenuButton
            tooltip={'ZFlow'}
            asChild
            className={cn(
              `bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground active:text-primary-foreground active:bg-primary h-14 gap-x-4 rounded-xs px-4`,
            )}
          >
            <Link href={'/'} prefetch>
              <LogoIcon
                className={cn('size-8!', isSidebarClosed && 'size-5!')}
              />
              <RenderIfNotClosed>
                <span className='text-lg font-semibold'>ZFlow</span>
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
              className={cn(isSidebarClosed && 'items-center')}
            >
              <SidebarContent>
                <SidebarMenu>
                  {m.items.map((item) => {
                    const isActive =
                      item.url === '/'
                        ? item.url === pathName
                        : pathName.startsWith(item.url)
                    return (
                      <SidebarMenuItem key={item.id || item.title}>
                        <SidebarMenuButton
                          tooltip={item.title}
                          id={item.id?.toString()}
                          asChild
                          isActive={isActive}
                          className={cn(
                            `relative h-10 gap-x-4 px-4`,

                            isSidebarClosed && 'gap-0 rounded-xs p-0',
                          )}
                        >
                          <Link href={item.url} prefetch={true}>
                            {isActive && (
                              <span className='bg-primary absolute left-0 h-full w-0.5' />
                            )}
                            <item.icon className='' />
                            <RenderIfNotClosed>
                              <span>{item.title}</span>
                            </RenderIfNotClosed>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    )
                  })}
                </SidebarMenu>
              </SidebarContent>
            </SidebarGroup>
          )
        })}
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          {!isSubscriptionLoading && !hasActiveSubscription && (
            <SidebarMenuItem>
              <SidebarMenuButton
                tooltip={'Upgrade to Pro'}
                className='h-10 gap-x-4 px-4'
                onClick={async () => {
                  openWindow(checkoutClient.getUrl('pro'), '_self')
                }}
              >
                <StarIcon className='h-4 w-4' />
                <RenderIfNotClosed>
                  <span> Upgrade to Pro</span>
                </RenderIfNotClosed>
              </SidebarMenuButton>
            </SidebarMenuItem>
          )}

          <SidebarMenuItem>
            <SidebarMenuButton
              tooltip={'Billing Portal'}
              className='h-10 gap-x-4 px-4'
              onClick={() => {
                setTheme(newTheme)
              }}
            >
              Change Theme
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton
              tooltip={'Billing Portal'}
              className='h-10 gap-x-4 px-4'
              onClick={() => {
                openWindow(portalClient.getUrl(''), '_self')
              }}
            >
              <CreditCardIcon className='h-4 w-4' />
              <RenderIfNotClosed>
                <span> Billing Portal</span>
              </RenderIfNotClosed>
            </SidebarMenuButton>
          </SidebarMenuItem>

          <SidebarMenuItem>
            <SidebarMenuButton
              tooltip={'Sign out'}
              className='h-10 gap-x-4 px-4'
              onClick={async () => {
                await signOut()
              }}
            >
              <LogOutIcon className='h-4 w-4' />
              <RenderIfNotClosed>
                <span>Sign out</span>
              </RenderIfNotClosed>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}

export default AppSidebar
