import React from "react";
import { redirect } from "next/navigation";
import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";
import { getCachedSession } from "@/lib/auth";
import { normalizeUserRole } from "@/lib/roles";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getCachedSession();

  if (!session) {
    redirect("/login");
  }

  const role = normalizeUserRole(session.user.role);

  return (
    <TooltipProvider>
      <SidebarProvider
        style={
          {
            "--sidebar-width": "calc(var(--spacing) * 68)",
            "--header-height": "calc(var(--spacing) * 14)",
          } as React.CSSProperties
        }
      >
        <AppSidebar
          variant="inset"
          user={{
            name: session.user.name,
            email: session.user.email,
            role,
          }}
        />
        <SidebarInset>
          <SiteHeader userName={session.user.name} />
          <div className="flex flex-1 flex-col bg-[#fafafa]">
            <div className="@container/main flex flex-1 flex-col gap-2">
              {children}
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    </TooltipProvider>
  );
}
