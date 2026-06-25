import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { Metadata } from "next";
import { auth, getCachedSession } from "@/lib/auth";
import { normalizeUserRole } from "@/lib/roles";
import { UsersManagement, type ManagedUser } from "@/components/users-management";

export const metadata: Metadata = {
  title: "Administración de usuarios | Luminar",
  description: "Controla las cuentas y sus permisos de acceso.",
};

export default async function UsuariosPage() {
  const session = await getCachedSession();

  if (!session) {
    redirect("/login");
  }

  const role = normalizeUserRole(session.user.role);
  const isAdmin = role === "admin";

  if (!isAdmin) {
    redirect("/dashboard/facturas");
  }

  const userList = await auth.api.listUsers({
    query: {
      limit: 100,
      sortBy: "createdAt",
      sortDirection: "desc",
    },
    headers: await headers(),
  });

  const users: ManagedUser[] = userList.users.map((user) => ({
    id: user.id,
    name: user.name,
    email: user.email,
    emailVerified: user.emailVerified,
    role: normalizeUserRole(user.role),
    createdAt: new Date(user.createdAt).toISOString(),
  }));

  return (
    <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
      <div className="px-4 lg:px-6 reveal-up">
        <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-gray-500">
          Panel de control
        </p>
        <h1 className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-black sm:text-3xl">
          Administración de usuarios
        </h1>
        <p className="mt-2 text-sm text-gray-500">
          Controla las cuentas y sus permisos de acceso.
        </p>
      </div>

      <div className="reveal-up-delay-3">
        <UsersManagement
          users={users}
          currentUserId={session.user.id}
        />
      </div>
    </div>
  );
}
