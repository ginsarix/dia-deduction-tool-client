"use client";

import {
  ClockIcon,
  IdCardLanyardIcon,
  PlugIcon,
  SquareTerminal,
} from "lucide-react";
import type * as React from "react";

import { NavMain } from "@/components/nav-main";
import { NavUser } from "@/components/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const data = {
    user: {
      name: "shadcn",
      email: "m@example.com",
      avatar: "/avatars/shadcn.jpg",
    },
    navMain: [
      {
        title: "Projeler",
        url: "/projects",
        icon: SquareTerminal,
        isActive: true,
        items: [],
      },
      {
        title: "Bağlantılar",
        url: "/connections",
        icon: PlugIcon,
        items: [],
      },
      {
        title: "Personeller",
        url: "/workers",
        icon: IdCardLanyardIcon,
        items: [],
      },
      {
        title: "Saat Tanımlamaları",
        url: "/hour-definitions",
        icon: ClockIcon,
        items: [],
      },
    ],
  };

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader className="px-3 py-3">
        <div className="flex items-center gap-2.5 px-1 overflow-hidden">
          <div className="flex flex-col min-w-0">
            <span className="text-sm font-semibold text-accent-foreground truncate leading-tight">
              AR-GE Merkez Hesaplama
            </span>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
