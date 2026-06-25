import { redirect } from "next/navigation";
import { Metadata } from "next";
import { getCachedSession } from "@/lib/auth";
import { normalizeUserRole } from "@/lib/roles";
import { apiFetchJson } from "@/lib/api";
import { DataTable } from "@/components/data-table";

export const metadata: Metadata = {
  title: "Productos | Luminar",
  description: "Catálogo e inventario de productos de la tienda.",
};

type Producto = {
  id: number;
  nombre: string;
  precio: number;
  cantidad: number;
  createdAt: string | null;
  updatedAt: string | null;
};

export default async function ProductosPage() {
  const session = await getCachedSession();

  if (!session) {
    redirect("/login");
  }

  const role = normalizeUserRole(session.user.role);
  const isAdmin = role === "admin";

  if (!isAdmin) {
    redirect("/dashboard/facturas");
  }

  const productos = await apiFetchJson<Producto[]>("/productos");
  productos.sort((a, b) => b.id - a.id);

  return (
    <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
      <div className="px-4 lg:px-6 reveal-up">
        <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-gray-500">
          Panel de control
        </p>
        <h1 className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-black sm:text-3xl">
          Productos registrados
        </h1>
        <p className="mt-2 text-sm text-gray-500">
          Administra el catálogo y las existencias del inventario.
        </p>
      </div>

      <div className="reveal-up-delay-3">
        <DataTable data={productos} />
      </div>
    </div>
  );
}
