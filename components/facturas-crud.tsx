"use client";

import React, { FormEvent, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus, ReceiptText } from "lucide-react";
import {
  eliminarFactura,
  guardarFactura,
} from "@/app/dashboard/actions";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
  CrudCard,
  Actions,
  SelectField,
  FormMessage,
  EmptyRow,
  SubmitButton,
  formatoPrecio,
  type Option,
  type StatusOption,
} from "@/components/dashboard-shared";
import { type ClienteDashboard } from "./clientes-crud";

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

export type ProductoDashboard = {
  id: number;
  nombre: string;
  precio: number;
  cantidad: number;
};

export function FacturasCrud({
  data,
  clientes,
  productos,
  formasPago,
  estadosFactura,
  canManage,
}: {
  data: FacturaDashboard[];
  clientes: ClienteDashboard[];
  productos: ProductoDashboard[];
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
  const [itemToDelete, setItemToDelete] = useState<FacturaDashboard | null>(null);
  const [isPending, startTransition] = useTransition();
  const [valor, setValor] = useState<number>(0);
  const [detalles, setDetalles] = useState<string>(...[]);
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
    setValor(factura?.valor ?? 0);
    setDetalles(factura?.detalles ?? "");
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

  function confirmRemove(factura: FacturaDashboard) {
    setItemToDelete(factura);
  }

  function remove() {
    if (!itemToDelete) return;

    startTransition(async () => {
      const result = await eliminarFactura(itemToDelete.id);
      setFeedback(result.message);
      if (result.ok) router.refresh();
      setItemToDelete(null);
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
                  onDelete={canManage ? () => confirmRemove(factura) : undefined}
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
              
              <div className="grid gap-2">
                <Label htmlFor="valor">Total (MXN)</Label>
                <Input
                  id="valor"
                  name="valor"
                  type="number"
                  min="1"
                  value={valor || ""}
                  onChange={(e) => setValor(Number(e.target.value))}
                  required
                />
              </div>
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
              <div className="grid gap-2 sm:col-span-2 rounded-lg border border-gray-200 bg-gray-50/50 p-4">
                <Label className="text-base font-semibold">Selector de Productos</Label>
                <p className="text-sm text-gray-500 mb-2">
                  Añade productos a la factura para calcular automáticamente el total y generar los detalles.
                </p>
                <div className="flex flex-col sm:flex-row gap-2">
                  <select
                    id="temp_producto"
                    className="flex-1 h-10 rounded-md border border-input bg-background px-3 text-sm ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    defaultValue=""
                  >
                    <option value="" disabled>Selecciona un producto</option>
                    {productos.map(p => (
                      <option key={p.id} value={p.id}>
                        {p.nombre} ({formatoPrecio.format(p.precio)} - {p.cantidad} en stock)
                      </option>
                    ))}
                  </select>
                  <div className="flex gap-2">
                    <Input 
                      type="number" 
                      id="temp_cantidad" 
                      defaultValue={1} 
                      min={1} 
                      className="w-24 bg-white" 
                      aria-label="Cantidad"
                    />
                    <Button 
                      type="button" 
                      variant="secondary"
                      onClick={() => {
                        const select = document.getElementById("temp_producto") as HTMLSelectElement;
                        const qtyInput = document.getElementById("temp_cantidad") as HTMLInputElement;
                        if (!select || !qtyInput) return;
                        
                        const prodId = Number(select.value);
                        const qty = Number(qtyInput.value);
                        const prod = productos.find(p => p.id === prodId);
                        
                        if (prod && qty > 0) {
                          const subtotal = prod.precio * qty;
                          setValor(prev => prev + subtotal);
                          setDetalles(prev => prev + (prev ? "\n" : "") + `${qty}x ${prod.nombre} - ${formatoPrecio.format(subtotal)}`);
                          qtyInput.value = "1";
                          select.value = "";
                        }
                      }}
                    >
                      <Plus className="mr-1 size-4" />
                      Añadir
                    </Button>
                  </div>
                </div>
              </div>

              <div className="grid gap-2 sm:col-span-2">
                <Label htmlFor="detalles">Detalles de la Factura</Label>
                <textarea
                  id="detalles"
                  name="detalles"
                  value={detalles}
                  onChange={(e) => setDetalles(e.target.value)}
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

      <ConfirmDialog
        open={itemToDelete !== null}
        onOpenChange={(open) => !open && setItemToDelete(null)}
        title={itemToDelete ? `¿Eliminar la factura #${itemToDelete.numero}?` : ""}
        description="Esta factura será eliminada permanentemente del registro."
        onConfirm={remove}
      />
    </CrudCard>
  );
}
