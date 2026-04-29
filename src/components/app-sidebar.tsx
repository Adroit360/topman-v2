"use client";

import * as React from "react";

import { NavMain } from "@/components/nav-main";
import { NavProjects } from "@/components/nav-projects";
import { TeamSwitcher } from "@/components/team-switcher";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";
import {
  GalleryVerticalEndIcon,
  TerminalSquareIcon,
  BotIcon,
  BookOpenIcon,
  Settings2Icon,
  MailIcon,
  ReceiptTextIcon,
} from "lucide-react";
import { Button } from "./ui/button";

// This is sample data.
const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: null,
  },
  teams: [
    {
      name: "Topman Books",
      logo: <GalleryVerticalEndIcon />,
      plan: "Enterprise",
    },
  ],
  navMain: [
    {
      title: "Analytics",
      url: "/dashboard",
      icon: <TerminalSquareIcon />,
      isActive: false,
      items: [
        {
          title: "Website Analytics",
          url: "/dashboard",
        },
        {
          title: "Order Analytics",
          url: "/dashboard/orders",
        },
      ],
    },
    {
      title: "Orders",
      url: "/dashboard/orders",
      icon: <BotIcon />,
      isActive: true,
      items: [
        {
          title: "All Orders",
          url: "/dashboard/orders",
        },
        {
          title: "Pending Orders",
          url: "/dashboard/orders?status=pending",
        },
        {
          title: "Completed Orders",
          url: "/dashboard/orders?status=delivered",
        },
      ],
    },
    {
      title: "Books",
      url: "/dashboard/books",
      icon: <BookOpenIcon />,
      items: [
        {
          title: "All Books",
          url: "/dashboard/books",
        },
        {
          title: "All Publishers",
          url: "/dashboard/publishers",
        },
      ],
    },
    {
      title: "List Order",
      url: "/dashboard/list",
      icon: <Settings2Icon />,
      items: [
        {
          title: "Book List",
          url: "/dashboard/list",
        },
      ],
    },
    {
      title: "Payments",
      url: "/dashboard/payments",
      icon: <ReceiptTextIcon />,
      items: [
        {
          title: "Payment Receipts",
          url: "/dashboard/payments",
        },
      ],
    },
    {
      title: "Contact",
      url: "/dashboard/contact",
      icon: <MailIcon />,
      items: [
        {
          title: "All Submissions",
          url: "/dashboard/contact",
        },
      ],
    },
  ],
  projects: [
    // {
    //   name: "Sales & Marketing",
    //   url: "#",
    //   icon: <PieChartIcon />,
    // },
    // {
    //   name: "Travel",
    //   url: "#",
    //   icon: <MapIcon />,
    // },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={data.teams} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavProjects projects={data.projects} />
      </SidebarContent>
      <SidebarFooter>
        <Button variant={"destructive"}>Logout</Button>
        {/* <NavUser user={data.user} /> */}</SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
