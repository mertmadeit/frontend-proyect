"use client";

import Link from "next/link";
import {
  CircleHelp,
  Infinity as InfinityIcon,
  LayoutDashboard,
  ReceiptText,
  UserCog,
  UserRoundCog,
  Users,
} from "lucide-react";
import { NavDocuments } from "@/components/nav-documents";
import { NavSecondary } from "@/components/nav-secondary";
import { NavUser } from "@/components/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import type { UserRole } from "@/lib/roles";

const management = [
  {
    name: "Resumen",
    url: "/dashboard?seccion=resumen",
    icon: <LayoutDashboard />,
  },
  {
    name: "Clientes",
    url: "/dashboard?seccion=clientes#administracion",
    icon: <Users />,
  },
  {
    name: "Facturas",
    url: "/dashboard?seccion=facturas#administracion",
    icon: <ReceiptText />,
  },
  {
    name: "Perfiles",
    url: "/dashboard?seccion=perfiles#administracion",
    icon: <UserCog />,
  },
  {
    name: "Usuarios",
    url: "/dashboard?seccion=usuarios#administracion",
    icon: <UserRoundCog />,
  },
];

export function AppSidebar({
  user,
  ...props
}: React.ComponentProps<typeof Sidebar> & {
  user: { name: string; email: string; role: UserRole };
}) {
  const visibleManagement =
    user.role === "admin"
      ? management
      : management.filter((item) => item.name === "Facturas");

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:p-1.5!"
            >
              <Link href="/">
                <span className="flex size-7 items-center justify-center rounded-md bg-black text-white">
                  <InfinityIcon className="size-4" strokeWidth={2.4} />
                </span>
                <span>
                  <span className="block text-sm font-semibold leading-none tracking-[-0.03em]">
                    Luminar
                  </span>
                  <span className="mt-1 block text-[8px] uppercase tracking-[0.16em] text-muted-foreground">
                    Curaduría fotográfica
                  </span>
                </span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavDocuments items={visibleManagement} />
        <NavSecondary
          items={[
            {
              title: "Ayuda",
              url: "/#beneficios",
              icon: <CircleHelp />,
            },
          ]}
          className="mt-auto"
        />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
    </Sidebar>
  );
}
