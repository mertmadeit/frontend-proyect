import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { Metadata } from "next";
import { auth } from "@/lib/auth";
import { normalizeUserRole } from "@/lib/roles";
import { apiFetchJson } from "@/lib/api";
import { FacturasCrud, type FacturaDashboard, type ProductoDashboard } from "@/components/facturas-crud";
import { type ClienteDashboard } from "@/components/clientes-crud";
import { type Option, type StatusOption } from "@/components/dashboard-shared";

export const metadata: Metadata = {
  title: "Facturas | Luminar",
  description: "Consulta, emite y administra las facturas de la tienda.",
};

type FacturaRaw = {
  id: number;
  numero: number;
  detalles: string;
  valor: number;
  idCliente: number;
  idforma: number;
  idestado: number;
  cliente: { nombre: string };
  formaPago: { nombre: string };
  estadoFactura: { estado: string };
};

export default async function FacturasPage() {
  const requestHeaders = await headers();
  const session = await auth.api.getSession({
    headers: requestHeaders,
  });

  if (!session) {
    redirect("/login");
  }

  const role = normalizeUserRole(session.user.role);
  const isAdmin = role === "admin";
  const canManageInvoices = role === "admin" || role === "supervisor";

  const [facturasFull, clientes, productos, formasPago, estadosFactura] = await Promise.all([
    apiFetchJson<FacturaRaw[]>("/facturas"),
    canManageInvoices
      ? apiFetchJson<ClienteDashboard[]>("/clientes")
      : Promise.resolve([] as ClienteDashboard[]),
    canManageInvoices
      ? apiFetchJson<ProductoDashboard[]>("/productos")
      : Promise.resolve([] as ProductoDashboard[]),
    canManageInvoices
      ? apiFetchJson<Option[]>("/formaspago")
      : Promise.resolve([] as Option[]),
    canManageInvoices
      ? apiFetchJson<StatusOption[]>("/estadosfacturas")
      : Promise.resolve([] as StatusOption[]),
  ]);

  facturasFull.sort((a, b) => b.id - a.id);

  const facturas: FacturaDashboard[] = facturasFull.map((f) => ({
    id: f.id,
    numero: f.numero,
    detalles: f.detalles,
    valor: f.valor,
    idCliente: f.idCliente,
    idforma: f.idforma,
    idestado: f.idestado,
    cliente: { nombre: f.cliente?.nombre ?? "" },
    forma: { nombre: f.formaPago?.nombre ?? "" },
    estadoFactura: { estado: f.estadoFactura?.estado ?? "" },
  }));

  return (
    <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
      <div className="px-4 lg:px-6 reveal-up">
        <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-gray-500">
          Panel de control
        </p>
        <h1 className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-black sm:text-3xl">
          Facturas Luminar
        </h1>
        <p className="mt-2 text-sm text-gray-500">
          {canManageInvoices
            ? "Consulta, emite y administra las facturas de la tienda."
            : "Consulta y descarga las facturas de la tienda."}
        </p>
      </div>

      <div className="reveal-up-delay-3">
        <FacturasCrud
          data={facturas}
          clientes={clientes}
          productos={productos}
          formasPago={formasPago}
          estadosFactura={estadosFactura}
          canManage={canManageInvoices}
        />
      </div>
    </div>
  );
}
