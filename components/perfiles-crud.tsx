"use client";

import React, { FormEvent, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { UserSquare2 } from "lucide-react";
import {
  eliminarPerfil,
  guardarPerfil,
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

export type PerfilDashboard = {
  id: number;
  nombre: string;
  _count: { users: number };
};

export function PerfilesCrud({ data }: { data: PerfilDashboard[] }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<PerfilDashboard | null>(null);
  const [message, setMessage] = useState("");
  const [feedback, setFeedback] = useState("");
  const [search, setSearch] = useState("");
  const [itemToDelete, setItemToDelete] = useState<PerfilDashboard | null>(null);
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

  function confirmRemove(perfil: PerfilDashboard) {
    setItemToDelete(perfil);
  }

  function remove() {
    if (!itemToDelete) return;

    startTransition(async () => {
      const result = await eliminarPerfil(itemToDelete.id);
      setFeedback(result.message);
      if (result.ok) router.refresh();
      setItemToDelete(null);
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
                  onDelete={() => confirmRemove(perfil)}
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

      <ConfirmDialog
        open={itemToDelete !== null}
        onOpenChange={(open) => !open && setItemToDelete(null)}
        title={itemToDelete ? `¿Eliminar el perfil ${itemToDelete.nombre}?` : ""}
        description="Si hay usuarios asignados a este perfil, la eliminación no será posible."
        onConfirm={remove}
      />
    </CrudCard>
  );
}
