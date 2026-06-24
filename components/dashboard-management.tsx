"use client";

import { FormEvent, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Download, Loader2, Pencil, Plus, Trash2, Search, Users, ReceiptText, UserSquare2 } from "lucide-react";
import {
  eliminarCliente,
  eliminarFactura,
  eliminarPerfil,
  guardarCliente,
  guardarFactura,
  guardarPerfil,
} from "@/app/dashboard/actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

type Section = "clientes" | "facturas" | "perfiles";

export type ClienteDashboard = {
  id: number;
  nombre: string;
  rfc: string;
  direccion: string;
  telefono: string;
  email: string;
};

export type FacturaDashboard = {
  id: number;
  numero: number;
  detalles: string;
  valor: number;
  idCliente: number;
  idforma: number;
  idestado: number;
  cliente: { nombre: string };
  forma: { nombre: string };
  estadoFactura: { estado: string };
};

export type PerfilDashboard = {
  id: number;
  nombre: string;
  _count: { users: number };
};

type Option = { id: number; nombre: string };
type StatusOption = { id: number; estado: string };

const formatoPrecio = new Intl.NumberFormat("es-MX", {
  style: "currency",
  currency: "MXN",
  maximumFractionDigits: 0,
});

const tabs: { id: Section; label: string }[] = [
  { id: "clientes", label: "Clientes" },
  { id: "facturas", label: "Facturas" },
  { id: "perfiles", label: "Perfiles" },
];

export function DashboardManagement({
  section,
  clientes,
  facturas,
  perfiles,
  formasPago,
  estadosFactura,
  isAdmin,
  canManageInvoices,
}: {
  section: Section;
  clientes: ClienteDashboard[];
  facturas: FacturaDashboard[];
  perfiles: PerfilDashboard[];
  formasPago: Option[];
  estadosFactura: StatusOption[];
  isAdmin: boolean;
  canManageInvoices: boolean;
}) {
  const visibleTabs = isAdmin
    ? tabs
    : tabs.filter((tab) => tab.id === "facturas");

  return (
    <section id="administracion" className="px-4 lg:px-6">
      <div className="mb-4 overflow-x-auto">
        <nav className="flex w-fit items-center gap-1 rounded-xl border border-gray-200/60 bg-white/50 backdrop-blur-sm p-1 shadow-xs">
          {visibleTabs.map((tab) => (
            <Link
              key={tab.id}
              href={`/dashboard?seccion=${tab.id}#administracion`}
              aria-current={section === tab.id ? "page" : undefined}
              className={cn(
                "rounded-lg px-4 py-2 text-sm font-semibold transition-colors",
                section === tab.id
                  ? "bg-black text-white shadow-sm"
                  : "text-gray-500 hover:bg-gray-100 hover:text-black",
              )}
            >
              {tab.label}
            </Link>
          ))}
        </nav>
      </div>

      {section === "clientes" ? (
        <ClientesCrud data={clientes} />
      ) : section === "facturas" ? (
        <FacturasCrud
          data={facturas}
          clientes={clientes}
          formasPago={formasPago}
          estadosFactura={estadosFactura}
          canManage={canManageInvoices}
        />
      ) : (
        <PerfilesCrud data={perfiles} />
      )}
    </section>
  );
}

function ClientesCrud({ data }: { data: ClienteDashboard[] }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<ClienteDashboard | null>(null);
  const [message, setMessage] = useState("");
  const [feedback, setFeedback] = useState("");
  const [search, setSearch] = useState("");
  const [isPending, startTransition] = useTransition();

  const filteredData = data.filter((c) =>
    c.nombre.toLowerCase().includes(search.toLowerCase()) ||
    c.rfc.toLowerCase().includes(search.toLowerCase()) ||
    c.email.toLowerCase().includes(search.toLowerCase())
  );

  function openForm(cliente?: ClienteDashboard) {
    setEditing(cliente ?? null);
    setMessage("");
    setOpen(true);
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    if (editing) formData.set("id", String(editing.id));

    startTransition(async () => {
      const result = await guardarCliente(formData);
      if (result.ok) {
        setOpen(false);
        setFeedback(result.message);
        router.refresh();
      } else {
        setMessage(result.message);
      }
    });
  }

  function remove(cliente: ClienteDashboard) {
    if (!window.confirm(`¿Eliminar a ${cliente.nombre}?`)) return;

    startTransition(async () => {
      const result = await eliminarCliente(cliente.id);
      setFeedback(result.message);
      if (result.ok) router.refresh();
    });
  }

  return (
    <CrudCard
      title="Clientes registrados"
      description="Administra los clientes que se utilizan en las facturas."
      addLabel="Agregar cliente"
      onAdd={() => openForm()}
      feedback={feedback}
      searchValue={search}
      onSearchChange={setSearch}
      searchPlaceholder="Buscar por nombre, RFC o correo..."
    >
      <Table>
        <TableHeader className="bg-gray-50/80 backdrop-blur-sm">
          <TableRow className="hover:bg-transparent">
            <TableHead className="font-semibold text-gray-700">Cliente</TableHead>
            <TableHead className="font-semibold text-gray-700">RFC</TableHead>
            <TableHead className="font-semibold text-gray-700">Teléfono</TableHead>
            <TableHead className="font-semibold text-gray-700">Correo</TableHead>
            <TableHead className="w-24 text-right"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredData.length > 0 ? (
            filteredData.map((cliente) => (
              <TableRow key={cliente.id} className="transition-colors hover:bg-gray-50/80 group">
                <TableCell className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors">{cliente.nombre}</TableCell>
                <TableCell className="font-mono text-xs text-gray-500">{cliente.rfc}</TableCell>
                <TableCell className="text-gray-600">{cliente.telefono}</TableCell>
                <TableCell className="text-gray-600">{cliente.email}</TableCell>
                <Actions
                  editLabel={`Modificar ${cliente.nombre}`}
                  deleteLabel={`Eliminar ${cliente.nombre}`}
                  disabled={isPending}
                  onEdit={() => openForm(cliente)}
                  onDelete={() => remove(cliente)}
                />
              </TableRow>
            ))
          ) : (
            <EmptyRow
              columns={5}
              icon={<Users className="mb-2 size-8 text-gray-300" />}
              message={search ? "No se encontraron clientes que coincidan con la búsqueda." : "Aún no hay clientes registrados."}
            />
          )}
        </TableBody>
      </Table>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-xl">
          <form key={editing?.id ?? "new"} onSubmit={submit}>
            <DialogHeader>
              <DialogTitle className="text-xl">
                {editing ? "Modificar cliente" : "Agregar cliente"}
              </DialogTitle>
              <DialogDescription>
                Completa la información comercial y de contacto.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-5 py-6 sm:grid-cols-2">
              <Field label="Nombre" name="nombre" defaultValue={editing?.nombre} />
              <Field label="RFC" name="rfc" defaultValue={editing?.rfc} />
              <Field
                label="Teléfono"
                name="telefono"
                type="tel"
                defaultValue={editing?.telefono}
              />
              <Field
                label="Correo"
                name="email"
                type="email"
                defaultValue={editing?.email}
              />
              <Field
                label="Dirección"
                name="direccion"
                defaultValue={editing?.direccion}
                className="sm:col-span-2"
              />
            </div>
            <FormMessage message={message} />
            <DialogFooter className="mt-2">
              <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
                Cancelar
              </Button>
              <SubmitButton pending={isPending} />
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </CrudCard>
  );
}

function FacturasCrud({
  data,
  clientes,
  formasPago,
  estadosFactura,
  canManage,
}: {
  data: FacturaDashboard[];
  clientes: ClienteDashboard[];
  formasPago: Option[];
  estadosFactura: StatusOption[];
  canManage: boolean;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<FacturaDashboard | null>(null);
  const [message, setMessage] = useState("");
  const [feedback, setFeedback] = useState("");
  const [search, setSearch] = useState("");
  const [isPending, startTransition] = useTransition();
  const canCreate =
    canManage &&
    clientes.length > 0 &&
    formasPago.length > 0 &&
    estadosFactura.length > 0;

  const filteredData = data.filter((f) =>
    f.numero.toString().includes(search) ||
    f.cliente.nombre.toLowerCase().includes(search.toLowerCase()) ||
    f.estadoFactura.estado.toLowerCase().includes(search.toLowerCase())
  );

  function openForm(factura?: FacturaDashboard) {
    setEditing(factura ?? null);
    setMessage("");
    setOpen(true);
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    if (editing) formData.set("id", String(editing.id));

    startTransition(async () => {
      const result = await guardarFactura(formData);
      if (result.ok) {
        setOpen(false);
        setFeedback(result.message);
        router.refresh();
      } else {
        setMessage(result.message);
      }
    });
  }

  function remove(factura: FacturaDashboard) {
    if (!window.confirm(`¿Eliminar la factura #${factura.numero}?`)) return;

    startTransition(async () => {
      const result = await eliminarFactura(factura.id);
      setFeedback(result.message);
      if (result.ok) router.refresh();
    });
  }

  return (
    <CrudCard
      title="Facturas emitidas"
      description={
        canManage
          ? "Crea y administra las facturas vinculadas a tus clientes."
          : "Consulta y descarga las facturas de la tienda."
      }
      addLabel={canManage ? "Agregar factura" : undefined}
      onAdd={canManage ? () => openForm() : undefined}
      addDisabled={!canCreate}
      feedback={
        feedback ||
        (canManage && !canCreate
          ? "Agrega clientes y catálogos auxiliares antes de crear una factura."
          : "")
      }
      searchValue={search}
      onSearchChange={setSearch}
      searchPlaceholder="Buscar por folio, cliente o estado..."
    >
      <Table>
        <TableHeader className="bg-gray-50/80 backdrop-blur-sm">
          <TableRow className="hover:bg-transparent">
            <TableHead className="font-semibold text-gray-700">Factura</TableHead>
            <TableHead className="font-semibold text-gray-700">Cliente</TableHead>
            <TableHead className="font-semibold text-gray-700">Estado</TableHead>
            <TableHead className="font-semibold text-gray-700">Forma de pago</TableHead>
            <TableHead className="text-right font-semibold text-gray-700">Total</TableHead>
            <TableHead className="w-24 text-right"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredData.length > 0 ? (
            filteredData.map((factura) => (
              <TableRow key={factura.id} className="transition-colors hover:bg-gray-50/80 group">
                <TableCell className="font-mono text-xs text-gray-500">
                  #{factura.numero.toString().padStart(5, "0")}
                </TableCell>
                <TableCell className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors">{factura.cliente.nombre}</TableCell>
                <TableCell>
                  <Badge 
                    variant="outline" 
                    className={
                      factura.estadoFactura.estado.toLowerCase().includes("pagad")
                        ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                        : factura.estadoFactura.estado.toLowerCase().includes("cancelad")
                        ? "bg-red-50 text-red-700 border-red-200"
                        : "bg-blue-50 text-blue-700 border-blue-200"
                    }
                  >
                    {factura.estadoFactura.estado}
                  </Badge>
                </TableCell>
                <TableCell className="text-gray-600">{factura.forma.nombre}</TableCell>
                <TableCell className="text-right font-medium tabular-nums text-gray-800">
                  {formatoPrecio.format(factura.valor)}
                </TableCell>
                <Actions
                  editLabel={canManage ? `Modificar factura ${factura.numero}` : undefined}
                  deleteLabel={canManage ? `Eliminar factura ${factura.numero}` : undefined}
                  downloadLabel={`Descargar factura ${factura.numero} en PDF`}
                  downloadPath={`/api/facturas/${factura.id}/pdf`}
                  disabled={isPending}
                  onEdit={canManage ? () => openForm(factura) : undefined}
                  onDelete={canManage ? () => remove(factura) : undefined}
                />
              </TableRow>
            ))
          ) : (
            <EmptyRow 
              columns={6} 
              icon={<ReceiptText className="mb-2 size-8 text-gray-300" />}
              message={search ? "No se encontraron facturas." : "Aún no hay facturas emitidas."} 
            />
          )}
        </TableBody>
      </Table>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[90svh] overflow-y-auto sm:max-w-xl">
          <form key={editing?.id ?? "new"} onSubmit={submit}>
            <DialogHeader>
              <DialogTitle className="text-xl">
                {editing ? "Modificar factura" : "Agregar factura"}
              </DialogTitle>
              <DialogDescription>
                Relaciona la factura con un cliente, pago y estado.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-5 py-6 sm:grid-cols-2">
              <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 px-3 py-2 text-sm text-gray-600">
                {editing
                  ? `Folio #${editing.numero}`
                  : "El folio se generará automáticamente al guardar."}
              </div>
              <Field
                label="Total (MXN)"
                name="valor"
                type="number"
                min="1"
                defaultValue={editing?.valor}
              />
              <SelectField
                label="Cliente"
                name="idCliente"
                defaultValue={editing?.idCliente}
                options={clientes.map((cliente) => ({
                  value: cliente.id,
                  label: cliente.nombre,
                }))}
              />
              <SelectField
                label="Forma de pago"
                name="idforma"
                defaultValue={editing?.idforma}
                options={formasPago.map((forma) => ({
                  value: forma.id,
                  label: forma.nombre,
                }))}
              />
              <SelectField
                label="Estado"
                name="idestado"
                defaultValue={editing?.idestado}
                options={estadosFactura.map((estado) => ({
                  value: estado.id,
                  label: estado.estado,
                }))}
              />
              <div className="grid gap-2 sm:col-span-2">
                <Label htmlFor="detalles">Detalles</Label>
                <textarea
                  id="detalles"
                  name="detalles"
                  defaultValue={editing?.detalles}
                  className="min-h-24 rounded-md border border-input bg-transparent px-3 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/50 transition-colors"
                  required
                />
              </div>
            </div>
            <FormMessage message={message} />
            <DialogFooter className="mt-2">
              <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
                Cancelar
              </Button>
              <SubmitButton pending={isPending} />
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </CrudCard>
  );
}

function PerfilesCrud({ data }: { data: PerfilDashboard[] }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<PerfilDashboard | null>(null);
  const [message, setMessage] = useState("");
  const [feedback, setFeedback] = useState("");
  const [search, setSearch] = useState("");
  const [isPending, startTransition] = useTransition();

  const filteredData = data.filter((p) =>
    p.nombre.toLowerCase().includes(search.toLowerCase())
  );

  function openForm(perfil?: PerfilDashboard) {
    setEditing(perfil ?? null);
    setMessage("");
    setOpen(true);
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    if (editing) formData.set("id", String(editing.id));

    startTransition(async () => {
      const result = await guardarPerfil(formData);
      if (result.ok) {
        setOpen(false);
        setFeedback(result.message);
        router.refresh();
      } else {
        setMessage(result.message);
      }
    });
  }

  function remove(perfil: PerfilDashboard) {
    if (!window.confirm(`¿Eliminar el perfil ${perfil.nombre}?`)) return;

    startTransition(async () => {
      const result = await eliminarPerfil(perfil.id);
      setFeedback(result.message);
      if (result.ok) router.refresh();
    });
  }

  return (
    <CrudCard
      title="Perfiles de acceso"
      description="Administra los perfiles utilizados por los usuarios internos."
      addLabel="Agregar perfil"
      onAdd={() => openForm()}
      feedback={feedback}
      searchValue={search}
      onSearchChange={setSearch}
      searchPlaceholder="Buscar perfil..."
    >
      <Table>
        <TableHeader className="bg-gray-50/80 backdrop-blur-sm">
          <TableRow className="hover:bg-transparent">
            <TableHead className="font-semibold text-gray-700">Perfil</TableHead>
            <TableHead className="text-right font-semibold text-gray-700">Usuarios asignados</TableHead>
            <TableHead className="w-24 text-right"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredData.length > 0 ? (
            filteredData.map((perfil) => (
              <TableRow key={perfil.id} className="transition-colors hover:bg-gray-50/80 group">
                <TableCell className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors">{perfil.nombre}</TableCell>
                <TableCell className="text-right tabular-nums text-gray-600">
                  <Badge variant="secondary" className="bg-gray-100 text-gray-700 hover:bg-gray-200">
                    {perfil._count.users} {perfil._count.users === 1 ? "usuario" : "usuarios"}
                  </Badge>
                </TableCell>
                <Actions
                  editLabel={`Modificar ${perfil.nombre}`}
                  deleteLabel={`Eliminar ${perfil.nombre}`}
                  disabled={isPending}
                  onEdit={() => openForm(perfil)}
                  onDelete={() => remove(perfil)}
                />
              </TableRow>
            ))
          ) : (
            <EmptyRow 
              columns={3} 
              icon={<UserSquare2 className="mb-2 size-8 text-gray-300" />}
              message={search ? "No se encontraron perfiles." : "Aún no hay perfiles configurados."} 
            />
          )}
        </TableBody>
      </Table>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <form key={editing?.id ?? "new"} onSubmit={submit}>
            <DialogHeader>
              <DialogTitle className="text-xl">
                {editing ? "Modificar perfil" : "Agregar perfil"}
              </DialogTitle>
              <DialogDescription>
                Define el nombre que identificará este nivel de acceso.
              </DialogDescription>
            </DialogHeader>
            <div className="py-6">
              <Field label="Nombre del perfil" name="nombre" defaultValue={editing?.nombre} placeholder="Ej. Administrador" />
            </div>
            <FormMessage message={message} />
            <DialogFooter className="mt-2">
              <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
                Cancelar
              </Button>
              <SubmitButton pending={isPending} />
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </CrudCard>
  );
}

function CrudCard({
  title,
  description,
  addLabel,
  onAdd,
  addDisabled = false,
  feedback,
  searchValue,
  onSearchChange,
  searchPlaceholder,
  children,
}: {
  title: string;
  description: string;
  addLabel?: string;
  onAdd?: () => void;
  addDisabled?: boolean;
  feedback: string;
  searchValue?: string;
  onSearchChange?: (val: string) => void;
  searchPlaceholder?: string;
  children: React.ReactNode;
}) {
  return (
    <Card className="shadow-xs bg-white/50 backdrop-blur-sm border-gray-200/60 transition-all duration-300 hover:shadow-sm">
      <CardHeader className="flex-col gap-4 sm:flex-row sm:items-center sm:justify-between pb-4">
        <div>
          <CardTitle className="text-xl">{title}</CardTitle>
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        </div>
        <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-center">
          {onSearchChange !== undefined && (
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 size-4 text-gray-500" />
              <Input
                type="search"
                placeholder={searchPlaceholder || "Buscar..."}
                className="w-full pl-9 sm:w-64 bg-white"
                value={searchValue}
                onChange={(e) => onSearchChange(e.target.value)}
              />
            </div>
          )}
          {onAdd && addLabel ? (
            <Button size="sm" onClick={onAdd} disabled={addDisabled} className="shrink-0 transition-transform hover:scale-[1.02]">
              <Plus className="mr-1.5 size-4" />
              {addLabel}
            </Button>
          ) : null}
        </div>
      </CardHeader>
      <CardContent>
        {feedback ? (
          <p className="mb-5 rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800">
            {feedback}
          </p>
        ) : null}
        <div className="overflow-hidden rounded-xl border border-gray-200/60 bg-white">
          {children}
        </div>
      </CardContent>
    </Card>
  );
}

function Actions({
  editLabel,
  deleteLabel,
  downloadLabel,
  downloadPath,
  disabled,
  onEdit,
  onDelete,
}: {
  editLabel?: string;
  deleteLabel?: string;
  downloadLabel?: string;
  downloadPath?: string;
  disabled: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
}) {
  return (
    <TableCell>
      <div className="flex justify-end gap-1 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
        {downloadPath && downloadLabel ? (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="text-gray-500 hover:bg-emerald-50 hover:text-emerald-700"
                onClick={async () => {
                  try {
                    const res = await fetch(downloadPath, { method: "GET" });
                    if (!res.ok) throw new Error("Error al descargar");

                    const blob = await res.blob();
                    const url = window.URL.createObjectURL(blob);
                    const a = document.createElement("a");
                    a.href = url;
                    a.download = `factura-${downloadPath.split("/").pop()}.pdf`;
                    document.body.appendChild(a);
                    a.click();
                    a.remove();
                    window.URL.revokeObjectURL(url);
                  } catch {
                    alert("No fue posible descargar la factura PDF.");
                  }
                }}
              >
                <Download className="size-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Descargar PDF</p>
            </TooltipContent>
          </Tooltip>
        ) : null}
        {onEdit && editLabel ? <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" onClick={onEdit} disabled={disabled} className="text-gray-500 hover:text-blue-600 hover:bg-blue-50">
              <Pencil className="size-4" />
              <span className="sr-only">{editLabel}</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Editar</p>
          </TooltipContent>
        </Tooltip> : null}

        {onDelete && deleteLabel ? <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="text-gray-500 hover:bg-red-50 hover:text-red-600"
              onClick={onDelete}
              disabled={disabled}
            >
              <Trash2 className="size-4" />
              <span className="sr-only">{deleteLabel}</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Eliminar</p>
          </TooltipContent>
        </Tooltip> : null}
      </div>
    </TableCell>
  );
}

function Field({
  label,
  name,
  type = "text",
  defaultValue,
  className,
  ...props
}: {
  label: string;
  name: string;
  type?: string;
  defaultValue?: string | number;
  className?: string;
} & Omit<React.ComponentProps<typeof Input>, "name" | "type" | "defaultValue">) {
  return (
    <div className={cn("grid gap-2", className)}>
      <Label htmlFor={name} className="text-gray-700">{label}</Label>
      <Input
        id={name}
        name={name}
        type={type}
        defaultValue={defaultValue}
        className="transition-all focus-visible:ring-primary/20"
        required
        {...props}
      />
    </div>
  );
}

function SelectField({
  label,
  name,
  defaultValue,
  options,
}: {
  label: string;
  name: string;
  defaultValue?: string | number;
  options: { value: string | number; label: string }[];
}) {
  return (
    <div className="grid gap-2">
      <Label htmlFor={name} className="text-gray-700">{label}</Label>
      <select
        id={name}
        name={name}
        defaultValue={defaultValue ?? ""}
        className="h-10 rounded-md border border-input bg-background px-3 text-sm ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        required
      >
        <option value="" disabled>
          Selecciona una opción
        </option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}

function SubmitButton({ pending }: { pending: boolean }) {
  return (
    <Button type="submit" disabled={pending} className="min-w-28 transition-all">
      {pending ? <Loader2 className="mr-2 size-4 animate-spin" /> : null}
      {pending ? "Guardando..." : "Guardar"}
    </Button>
  );
}

function FormMessage({ message }: { message: string }) {
  return message ? (
    <p role="alert" className="text-sm font-medium text-red-600 bg-red-50 p-3 rounded-md">
      {message}
    </p>
  ) : null;
}

function EmptyRow({ columns, message, icon }: { columns: number; message: string; icon?: React.ReactNode }) {
  return (
    <TableRow>
      <TableCell
        colSpan={columns}
        className="h-40 text-center"
      >
        <div className="flex flex-col items-center justify-center text-muted-foreground">
          {icon}
          <p>{message}</p>
        </div>
      </TableCell>
    </TableRow>
  );
}
