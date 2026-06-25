import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { Metadata } from "next";
import { auth } from "@/lib/auth";
import { normalizeUserRole } from "@/lib/roles";
import { apiFetchJson } from "@/lib/api";
import { PerfilesCrud, type PerfilDashboard } from "@/components/perfiles-crud";
import { DashboardTabs } from "@/components/dashboard-shared";

export const metadata: Metadata = {
  title: "Perfiles de acceso | Luminar",
  description: "Consulta y administra los perfiles internos de la tienda.",
};

type PerfilRaw = {
  id: number;
  nombre: string;
};

export default async function PerfilesPage() {
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

  const [perfiles, userList] = await Promise.all([
    apiFetchJson<PerfilRaw[]>("/perfiles"),
    auth.api.listUsers({
      query: {
        limit: 100,
        sortBy: "createdAt",
        sortDirection: "desc",
      },
      headers: requestHeaders,
    }),
  ]);

  const users = userList.users.map((user) => ({
    id: user.id,
    name: user.name,
    email: user.email,
    role: normalizeUserRole(user.role),
  }));

  const perfilesConCount: PerfilDashboard[] = perfiles.map((p) => {
    const perfilRole = p.nombre.toLowerCase().startsWith("admin")
      ? "admin"
      : p.nombre.toLowerCase().startsWith("super")
        ? "supervisor"
        : "empleado";

    return {
      ...p,
      _count: { users: users.filter((user) => user.role === perfilRole).length },
    };
  });

  return (
    <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
      <div className="px-4 lg:px-6 reveal-up">
        <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-gray-500">
          Panel de control
        </p>
        <h1 className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-black sm:text-3xl">
          Perfiles de acceso
        </h1>
        <p className="mt-2 text-sm text-gray-500">
          Consulta y administra los perfiles internos.
        </p>
      </div>

      <DashboardTabs activeTab="perfiles" isAdmin={isAdmin} />

      <div className="reveal-up-delay-3">
        <PerfilesCrud data={perfilesConCount} />
      </div>
    </div>
  );
}
