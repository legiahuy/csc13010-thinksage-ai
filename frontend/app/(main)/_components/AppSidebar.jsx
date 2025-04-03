'use client';
import React from 'react';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarHeader,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from '@/components/ui/sidebar';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { HomeIcon, LucideFileVideo, LogOut } from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuthContext } from '@/app/providers';

const MenuItems = [
  {
    title: 'Home',
    url: '/dashboard',
    icon: HomeIcon,
    type: 'link',
  },
  {
    title: 'Create New Video',
    url: '/create-new-video',
    icon: LucideFileVideo,
    type: 'link',
  },
  {
    title: 'Log out',
    icon: LogOut,
    type: 'action',
    action: 'logout',
  },
];

function AppSidebar() {
  const path = usePathname();
  const router = useRouter();
  const { signOut } = useAuthContext();
  const handleLogout = async () => {
    await signOut();
    router.push('/');
  };
  return (
    <Sidebar>
      <SidebarHeader>
        <div>
          <Link href={'/'}>
            <div className="flex items-center gap-3 w-full justify-center mt-5">
              <Image src={'/logo.svg'} alt="logo" width={40} height={40} />
              <h2 className="font-bold text-2xl">ThinkSage AI</h2>
            </div>
          </Link>
          <h2 className="text-lg text-gray-400 text-center mt-3">Science Video Generator</h2>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <div className="mx-3 mt-8">
              <Link href={'/create-new-video'}>
                <Button className="w-full">+ Create New Video</Button>
              </Link>
            </div>
            <SidebarMenu>
              {MenuItems.filter((menu) => menu.type === 'link').map((menu, index) => (
                <SidebarMenuItem className="mt-3 mx-3" key={index}>
                  <SidebarMenuButton isActive={path === menu.url} className="p-5">
                    <Link href={menu.url} className="flex items-center gap-4 p-3">
                      <menu.icon />
                      <span>{menu.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}

              {MenuItems.filter((menu) => menu.type === 'action' && menu.action === 'logout').map(
                (menu, index) => (
                  <SidebarMenuItem className="mt-1 mx-3" key={`action-${index}`}>
                    <div className="px-5">
                      <div
                        className="flex items-center gap-4 p-3 cursor-pointer hover:bg-slate-800 rounded-md transition-colors"
                        onClick={handleLogout}
                      >
                        <menu.icon />
                        <span>{menu.title}</span>
                      </div>
                    </div>
                  </SidebarMenuItem>
                )
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup />
      </SidebarContent>
    </Sidebar>
  );
}

export default AppSidebar;
