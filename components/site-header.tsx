import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";

export function SiteHeader({ userName }: { userName: string }) {
  return (
    <header className="flex h-(--header-height) shrink-0 items-center border-b bg-white transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
      <div className="flex w-full items-center gap-2 px-4 lg:px-6">
        <SidebarTrigger className="-ml-1" />
        <Separator
          orientation="vertical"
          className="mx-1 data-[orientation=vertical]:h-4"
        />
        <h2 className="text-sm font-medium">Dashboard</h2>
        <span className="ml-auto hidden text-sm text-muted-foreground sm:inline">
          Hola, {userName}
        </span>
      </div>
    </header>
  );
}
