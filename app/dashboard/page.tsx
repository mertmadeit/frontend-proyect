import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { AppSidebar } from "@/components/app-sidebar";
import { ChartAreaInteractive } from "@/components/chart-area-interactive";
import { DataTable } from "@/components/data-table";
import { DashboardManagement } from "@/components/dashboard-management";
import { SectionCards } from "@/components/section-cards";
import { SiteHeader } from "@/components/site-header";
import {
  UsersManagement,
  type ManagedUser,
} from "@/components/users-management";
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";
import { auth } from "@/lib/auth";
import { normalizeUserRole } from "@/lib/roles";

import { apiFetchJson } from "@/lib/api";

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

type Cliente = {
  id: number;
  nombre: string;
  rfc: string;
  direccion: string;
  telefono: string;
  email: string;
};

type Factura = {
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

type Perfil = {
  id: number;
  nombre: string;
};

type FormaPago = {
  id: number;
  nombre: string;
};

type EstadoFactura = {
  id: number;
  estado: string;
};

type DashboardSection =
  | "resumen"
  | "clientes"
  | "facturas"
  | "perfiles"
  | "usuarios";

const ADMIN_SECTIONS = new Set<DashboardSection>([
  "resumen",
  "clientes",
  "facturas",
  "perfiles",
  "usuarios",
]);

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ seccion?: string | string[] }>;
}) {
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

  const requestedSection = (await searchParams).seccion;
  const sectionValue = Array.isArray(requestedSection)
    ? requestedSection[0]
    : requestedSection;
  const section: DashboardSection =
    isAdmin &&
    typeof sectionValue === "string" &&
    ADMIN_SECTIONS.has(sectionValue as DashboardSection)
      ? (sectionValue as DashboardSection)
      : isAdmin
        ? "resumen"
        : "facturas";

  const needsUsers =
    isAdmin && (section === "usuarios" || section === "perfiles");
  const needsInvoices = section === "facturas";
  const needsProducts = (isAdmin && section === "resumen") || (needsInvoices && canManageInvoices);
  const needsClients =
    section === "clientes" || (needsInvoices && canManageInvoices);
  const needsInvoiceCatalogs = needsInvoices && canManageInvoices;
  const needsProfiles = isAdmin && section === "perfiles";

  const [
    productos,
    clientes,
    facturasFull,
    perfiles,
    formasPago,
    estadosFactura,
    userList,
  ] = await Promise.all([
    needsProducts
      ? apiFetchJson<Producto[]>("/productos")
      : Promise.resolve([] as Producto[]),
    needsClients
      ? apiFetchJson<Cliente[]>("/clientes")
      : Promise.resolve([] as Cliente[]),
    needsInvoices
      ? apiFetchJson<Factura[]>("/facturas")
      : Promise.resolve([] as Factura[]),
    needsProfiles
      ? apiFetchJson<Perfil[]>("/perfiles")
      : Promise.resolve([] as Perfil[]),
    needsInvoiceCatalogs
      ? apiFetchJson<FormaPago[]>("/formaspago")
      : Promise.resolve([] as FormaPago[]),
    needsInvoiceCatalogs
      ? apiFetchJson<EstadoFactura[]>("/estadosfacturas")
      : Promise.resolve([] as EstadoFactura[]),
    needsUsers
      ? auth.api.listUsers({
          query: {
            limit: 100,
            sortBy: "createdAt",
            sortDirection: "desc",
          },
          headers: requestHeaders,
        })
      : Promise.resolve({ users: [], total: 0 }),
  ]);

  const users: ManagedUser[] = userList.users.map((user) => ({
      id: user.id,
      name: user.name,
      email: user.email,
      emailVerified: user.emailVerified,
      role: normalizeUserRole(user.role),
      createdAt: new Date(user.createdAt).toISOString(),
    }));

  // Sort by id desc (API may not guarantee order)
  productos.sort((a, b) => b.id - a.id);
  facturasFull.sort((a, b) => b.id - a.id);

  // Map facturas to match the format expected by DashboardManagement
  const facturas = facturasFull.map((f) => ({
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

  // Map perfiles to include _count (not available from API, so set to 0)
  const perfilesConCount = perfiles.map((p) => {
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

  const sectionCopy: Record<
    DashboardSection,
    { title: string; description: string }
  > = {
    resumen: {
      title: "Resumen de inventario",
      description: "Indicadores, existencias y valor actual del catálogo.",
    },
    clientes: {
      title: "Gestión de clientes",
      description: "Administra los datos utilizados para emitir facturas.",
    },
    facturas: {
      title: "Facturas Luminar",
      description: canManageInvoices
        ? "Consulta, emite y administra las facturas de la tienda."
        : "Consulta y descarga las facturas de la tienda.",
    },
    perfiles: {
      title: "Perfiles de acceso",
      description: "Consulta y administra los perfiles internos.",
    },
    usuarios: {
      title: "Administración de usuarios",
      description: "Controla las cuentas y sus permisos de acceso.",
    },
  };

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
              <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
                <div className="px-4 lg:px-6 reveal-up">
                  <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-gray-500">
                    Panel de control
                  </p>
                  <h1 className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-black sm:text-3xl">
                    {sectionCopy[section].title}
                  </h1>
                  <p className="mt-2 text-sm text-gray-500">
                    {sectionCopy[section].description}
                  </p>
                </div>

                {section === "resumen" ? (
                  <>
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
                  </>
                ) : null}

                {section !== "resumen" ? (
                  <div className="reveal-up-delay-3">
                    {section === "usuarios" ? (
                      <UsersManagement
                        users={users}
                        currentUserId={session.user.id}
                      />
                    ) : (
                      <DashboardManagement
                        section={section}
                        clientes={clientes}
                        productos={productos}
                        facturas={facturas}
                        perfiles={perfilesConCount}
                        formasPago={formasPago}
                        estadosFactura={estadosFactura}
                        isAdmin={isAdmin}
                        canManageInvoices={canManageInvoices}
                      />
                    )}
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    </TooltipProvider>
  );
}
