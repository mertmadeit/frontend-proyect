import { actualizarProducto } from "@/app/dashboard/actions";
import { apiFetchJson } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ArrowLeft,
  Infinity as InfinityIcon,
  Package,
  Save,
} from "lucide-react";
import Link from "next/link";
import { getCachedSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { normalizeUserRole } from "@/lib/roles";

type Props = {
  params: Promise<{
    id: string;
  }>;
};

export default async function EditarProducto({ params }: Props) {
  const session = await getCachedSession();
  
  if (!session) {
    redirect("/login");
  }

  if (normalizeUserRole(session.user.role) !== "admin") {
    redirect("/dashboard/facturas");
  }

  const { id } = await params;

  let producto: { id: number; nombre: string; precio: number; cantidad: number } | null = null;
  try {
    producto = await apiFetchJson<{ id: number; nombre: string; precio: number; cantidad: number }>(`/productos/${id}`);
  } catch {
    // API not available
  }

  if (!producto) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f9fafb] p-6">
        <div className="rounded-xl border border-gray-200 bg-white p-10 text-center shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
          <Package className="mx-auto h-10 w-10 text-muted-foreground" />
          <h1 className="mt-5 text-2xl font-semibold">Producto no encontrado</h1>
          <Button className="mt-6 rounded-md" asChild>
            <Link href="/">Volver a la tienda</Link>
          </Button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f9fafb] px-4 py-8 sm:px-6 sm:py-12">
      <div className="mx-auto max-w-3xl">
        <Link
          href="/dashboard/productos"
          className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver al panel
        </Link>

        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
          <div className="border-b border-gray-200 bg-white p-7 text-[#111827] sm:p-9">
            <div className="flex h-10 w-10 items-center justify-center rounded-md border border-gray-200 bg-white text-black shadow-sm">
              <InfinityIcon className="h-5 w-5" strokeWidth={2.4} />
            </div>
            <p className="mt-7 font-mono text-[11px] font-semibold uppercase tracking-[0.18em] text-gray-500">
              Catálogo Luminar
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-[-0.04em]">
              Editar producto
            </h1>
            <p className="mt-2 text-sm leading-6 text-gray-500">
              Actualiza la información que se muestra en la tienda.
            </p>
          </div>

          <form action={actualizarProducto} className="grid gap-5 p-7 sm:p-9">
            <input type="hidden" name="id" value={producto.id} />

            <label className="grid gap-2 text-sm font-semibold">
              Nombre del producto
              <Input
                type="text"
                name="nombre"
                defaultValue={producto.nombre}
                required
                className="h-10 rounded-md border-gray-300 bg-white px-3 font-normal"
              />
            </label>

            <div className="grid gap-5 sm:grid-cols-2">
              <label className="grid gap-2 text-sm font-semibold">
                Precio (MXN)
                <Input
                  type="number"
                  name="precio"
                  min="0"
                  defaultValue={producto.precio}
                  required
                  className="h-10 rounded-md border-gray-300 bg-white px-3 font-normal"
                />
              </label>

              <label className="grid gap-2 text-sm font-semibold">
                Cantidad disponible
                <Input
                  type="number"
                  name="cantidad"
                  min="0"
                  defaultValue={producto.cantidad}
                  required
                  className="h-10 rounded-md border-gray-300 bg-white px-3 font-normal"
                />
              </label>
            </div>

            <div className="mt-2 grid gap-3 sm:grid-cols-2">
              <Button
                variant="outline"
                className="h-10 rounded-md bg-white"
                asChild
              >
                <Link href="/dashboard/productos">Cancelar</Link>
              </Button>
              <Button type="submit" className="h-10 rounded-md">
                <Save className="h-4 w-4" />
                Guardar cambios
              </Button>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}
