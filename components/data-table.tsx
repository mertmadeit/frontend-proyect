"use client";

import { FormEvent, useState, useTransition } from "react";
import Link from "next/link";
import { Loader2, PackageOpen, Pencil, Plus, Search, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { crearProducto, eliminarProducto } from "@/app/dashboard/actions";
import { ConfirmDialog } from "@/components/confirm-dialog";
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

const formatoPrecio = new Intl.NumberFormat("es-MX", {
  style: "currency",
  currency: "MXN",
  maximumFractionDigits: 0,
});

type ProductoDashboard = {
  id: number;
  nombre: string;
  precio: number;
  cantidad: number;
};

export function DataTable({ data }: { data: ProductoDashboard[] }) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<ProductoDashboard | null>(null);
  const [itemToDelete, setItemToDelete] = useState<ProductoDashboard | null>(null);
  const [message, setMessage] = useState("");
  const [feedback, setFeedback] = useState("");
  const [isPending, startTransition] = useTransition();

  const filteredData = data.filter((producto) =>
    producto.nombre.toLowerCase().includes(search.toLowerCase()) ||
    producto.id.toString().includes(search)
  );

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    startTransition(async () => {
      const result = await crearProducto(formData);
      if (result.ok) {
        setOpen(false);
        setFeedback(result.message);
        router.refresh();
      } else {
        setMessage(result.message);
      }
    });
  }

  function confirmRemove(producto: ProductoDashboard) {
    setItemToDelete(producto);
  }

  function remove() {
    if (!itemToDelete) return;
    
    startTransition(async () => {
      const result = await eliminarProducto(itemToDelete.id);
      setFeedback(result.message);
      if (result.ok) router.refresh();
      setItemToDelete(null);
    });
  }

  return (
    <div className="px-4 lg:px-6">
      <Card className="shadow-xs bg-white/50 backdrop-blur-sm border-gray-200/60 transition-all duration-300 hover:shadow-sm">
        <CardHeader className="flex-col gap-4 sm:flex-row sm:items-center sm:justify-between pb-4">
          <div>
            <CardTitle className="flex items-center gap-2">
              <PackageOpen className="size-5 text-gray-500" />
              Catálogo de productos
            </CardTitle>
            <p className="mt-1 text-sm text-muted-foreground">
              Inventario conectado directamente con MySQL.
            </p>
          </div>
          <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-center">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 size-4 text-gray-500" />
              <Input
                type="search"
                placeholder="Buscar por nombre o SKU..."
                className="w-full pl-9 sm:w-64 bg-white"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Button size="sm" onClick={() => { setMessage(""); setOpen(true); }} className="shrink-0 transition-transform hover:scale-[1.02]">
              <Plus className="mr-1.5 size-4" />
              Agregar producto
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {feedback ? (
            <p className="mb-5 rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800">
              {feedback}
            </p>
          ) : null}
          <div className="overflow-hidden rounded-xl border border-gray-200/60 bg-white">
            <Table>
              <TableHeader className="bg-gray-50/80 backdrop-blur-sm">
                <TableRow className="hover:bg-transparent">
                  <TableHead className="font-semibold text-gray-700">Producto</TableHead>
                  <TableHead className="font-semibold text-gray-700">Estado</TableHead>
                  <TableHead className="text-right font-semibold text-gray-700">Precio</TableHead>
                  <TableHead className="text-right font-semibold text-gray-700">Existencias</TableHead>
                  <TableHead className="w-24" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredData.length > 0 ? (
                  filteredData.map((producto) => (
                    <TableRow key={producto.id} className="transition-colors hover:bg-gray-50/80 group">
                      <TableCell>
                        <div className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors">{producto.nombre}</div>
                        <div className="mt-0.5 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                          SKU · {producto.id.toString().padStart(4, "0")}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={
                            producto.cantidad > 5
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                              : producto.cantidad === 0
                                ? "bg-red-50 text-red-700 border-red-200"
                                : "bg-amber-50 text-amber-700 border-amber-200"
                          }
                        >
                          {producto.cantidad === 0
                            ? "Agotado"
                            : producto.cantidad <= 5
                              ? "Stock bajo"
                              : "Disponible"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-medium tabular-nums text-gray-700">
                        {formatoPrecio.format(producto.precio)}
                      </TableCell>
                      <TableCell className="text-right tabular-nums text-gray-600">
                        {producto.cantidad} piezas
                      </TableCell>
                      <TableCell>
                        <div className="flex justify-end gap-1 opacity-100 transition-opacity sm:opacity-0 sm:group-hover:opacity-100">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button variant="ghost" size="icon" asChild>
                                <Link
                                  href={`/productos/editar/${producto.id}`}
                                  aria-label={`Editar ${producto.nombre}`}
                                >
                                  <Pencil className="size-4 text-gray-500" />
                                </Link>
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent><p>Editar producto</p></TooltipContent>
                          </Tooltip>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                aria-label={`Eliminar ${producto.nombre}`}
                                disabled={isPending}
                                onClick={() => confirmRemove(producto)}
                                className="text-gray-500 hover:bg-red-50 hover:text-red-600"
                              >
                                <Trash2 className="size-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent><p>Eliminar producto</p></TooltipContent>
                          </Tooltip>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="h-32 text-center"
                    >
                      <div className="flex flex-col items-center justify-center text-muted-foreground">
                        <PackageOpen className="mb-2 size-8 text-gray-300" />
                        <p>{search ? "No se encontraron productos que coincidan con la búsqueda." : "Aún no hay productos en el catálogo."}</p>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-lg">
          <form onSubmit={submit}>
            <DialogHeader>
              <DialogTitle>Agregar producto</DialogTitle>
              <DialogDescription>
                Registra un artículo nuevo en el inventario de la tienda.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-5 py-6">
              <div className="grid gap-2">
                <Label htmlFor="producto-nombre">Nombre</Label>
                <Input id="producto-nombre" name="nombre" required />
              </div>
              <div className="grid gap-5 sm:grid-cols-2">
                <div className="grid gap-2">
                  <Label htmlFor="producto-precio">Precio (MXN)</Label>
                  <Input id="producto-precio" name="precio" type="number" min="0" step="1" required />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="producto-cantidad">Cantidad</Label>
                  <Input id="producto-cantidad" name="cantidad" type="number" min="0" step="1" required />
                </div>
              </div>
            </div>
            {message ? <p role="alert" className="rounded-md bg-red-50 p-3 text-sm font-medium text-red-600">{message}</p> : null}
            <DialogFooter className="mt-4">
              <Button type="button" variant="ghost" onClick={() => setOpen(false)}>Cancelar</Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? <Loader2 className="mr-2 size-4 animate-spin" /> : null}
                {isPending ? "Guardando..." : "Guardar"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      
      <ConfirmDialog
        open={itemToDelete !== null}
        onOpenChange={(open) => !open && setItemToDelete(null)}
        title={itemToDelete ? `¿Eliminar ${itemToDelete.nombre}?` : ""}
        description="Esta acción no se puede deshacer. El producto será eliminado permanentemente."
        onConfirm={remove}
      />
    </div>
  );
}
