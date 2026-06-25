import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { Metadata } from "next";
import { auth } from "@/lib/auth";
import { normalizeUserRole } from "@/lib/roles";
import { apiFetchJson } from "@/lib/api";
import { ClientesCrud, type ClienteDashboard } from "@/components/clientes-crud";
import { DashboardTabs } from "@/components/dashboard-shared";

export const metadata: Metadata = {
  title: "Clientes | Luminar",
  description: "Gestión de clientes de la tienda.",
};

export default async function ClientesPage() {
  const requestHeaders = await headers();
  const session = await auth.api.getSession({
    headers: requestHeaders,
  });

  if (!session) {
    redirect("/login");
  }

  const role = normalizeUserRole(session.user.role);
  const isAdmin = role === "admin";

  if (!isAdmin) {
    redirect("/dashboard/facturas");
  }

  const clientes = await apiFetchJson<ClienteDashboard[]>("/clientes");

  return (
    <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
      <div className="px-4 lg:px-6 reveal-up">
        <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-gray-500">
          Panel de control
        </p>
        <h1 className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-black sm:text-3xl">
          Gestión de clientes
        </h1>
        <p className="mt-2 text-sm text-gray-500">
          Administra los datos utilizados para emitir facturas.
        </p>
      </div>

      <DashboardTabs activeTab="clientes" isAdmin={isAdmin} />

      <div className="reveal-up-delay-3">
        <ClientesCrud data={clientes} />
      </div>
    </div>
  );
}
