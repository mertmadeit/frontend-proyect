import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { SectionCards } from "@/components/section-cards";
import dynamic from "next/dynamic";
import { Metadata } from "next";
import { auth } from "@/lib/auth";
import { normalizeUserRole } from "@/lib/roles";
import { apiFetchJson } from "@/lib/api";

const ChartAreaInteractive = dynamic(() => import("@/components/chart-area-interactive").then(mod => mod.ChartAreaInteractive));
const DataTable = dynamic(() => import("@/components/data-table").then(mod => mod.DataTable));

export const metadata: Metadata = {
  title: "Dashboard | Luminar",
  description: "Panel de administración y gestión de tienda.",
};

const formatoPrecio = new Intl.NumberFormat("es-MX", {
  style: "currency",
  currency: "MXN",
  maximumFractionDigits: 0,
});

type Producto = {
  id: number;
  nombre: string;
  precio: number;
  cantidad: number;
  createdAt: string | null;
  updatedAt: string | null;
};

export default async function DashboardPage() {
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

  const productos = await apiFetchJson<Producto[]>("/productos");
  productos.sort((a, b) => b.id - a.id);

  const totalUnidades = productos.reduce(
    (total, producto) => total + producto.cantidad,
    0,
  );
  const valorInventario = productos.reduce(
    (total, producto) => total + producto.precio * producto.cantidad,
    0,
  );
  const productosBajoStock = productos.filter(
    (producto) => producto.cantidad <= 5,
  ).length;

  return (
    <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
      <div className="px-4 lg:px-6 reveal-up">
        <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-gray-500">
          Panel de control
        </p>
        <h1 className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-black sm:text-3xl">
          Resumen de inventario
        </h1>
        <p className="mt-2 text-sm text-gray-500">
          Indicadores, existencias y valor actual del catálogo.
        </p>
      </div>

      <div className="reveal-up-delay-1">
        <SectionCards
          totalProductos={productos.length}
          totalUnidades={totalUnidades}
          valorInventario={formatoPrecio.format(valorInventario)}
          productosBajoStock={productosBajoStock}
        />
      </div>

      <div className="px-4 lg:px-6 reveal-up-delay-2">
        <ChartAreaInteractive
          data={productos.map((producto) => ({
            nombre: producto.nombre,
            cantidad: producto.cantidad,
          }))}
        />
      </div>

      <div className="reveal-up-delay-3">
        <DataTable data={productos} />
      </div>
    </div>
  );
}
