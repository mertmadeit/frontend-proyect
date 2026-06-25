"use client";

import React, { FormEvent, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Users } from "lucide-react";
import {
  eliminarCliente,
  guardarCliente,
} from "@/app/dashboard/actions";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
  Field,
  FormMessage,
  EmptyRow,
  SubmitButton,
} from "@/components/dashboard-shared";

export type ClienteDashboard = {
  id: number;
  nombre: string;
  rfc: string;
  direccion: string;
  telefono: string;
  email: string;
};

export function ClientesCrud({ data }: { data: ClienteDashboard[] }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<ClienteDashboard | null>(null);
  const [message, setMessage] = useState("");
  const [feedback, setFeedback] = useState("");
  const [search, setSearch] = useState("");
  const [itemToDelete, setItemToDelete] = useState<ClienteDashboard | null>(null);
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

  function confirmRemove(cliente: ClienteDashboard) {
    setItemToDelete(cliente);
  }

  function remove() {
    if (!itemToDelete) return;

    startTransition(async () => {
      const result = await eliminarCliente(itemToDelete.id);
      setFeedback(result.message);
      if (result.ok) router.refresh();
      setItemToDelete(null);
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
                  onDelete={() => confirmRemove(cliente)}
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
      
      <ConfirmDialog
        open={itemToDelete !== null}
        onOpenChange={(open) => !open && setItemToDelete(null)}
        title={itemToDelete ? `¿Eliminar a ${itemToDelete.nombre}?` : ""}
        description="El cliente y todas sus referencias podrían ser eliminados."
        onConfirm={remove}
      />
    </CrudCard>
  );
}
