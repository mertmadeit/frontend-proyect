"use client";

import { FormEvent, useState, useTransition } from "react";
import { Pencil, Plus, Search, ShieldCheck, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import {
  eliminarCliente,
  eliminarUsuario,
  guardarCliente,
  guardarUsuario,
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
  getUserRoleLabel,
  USER_ROLES,
  type UserRole,
} from "@/lib/roles";

export type ManagedUser = {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  role: UserRole | "cliente";
  rfc: string | null;
  direccion: string | null;
  telefono: string | null;
  createdAt: string;
};

function roleLabel(role: ManagedUser["role"]) {
  return role === "cliente" ? "Cliente" : getUserRoleLabel(role);
}

const dateFormatter = new Intl.DateTimeFormat("es-MX", {
  dateStyle: "medium",
});

export function UsersManagement({
  users,
  currentUserId,
}: {
  users: ManagedUser[];
  currentUserId: string;
}) {
  const router = useRouter();
  const [editing, setEditing] = useState<ManagedUser | null>(null);
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [message, setMessage] = useState("");
  const [feedback, setFeedback] = useState("");
  const [selectedRole, setSelectedRole] =
    useState<ManagedUser["role"]>("empleado");
  const [isPending, startTransition] = useTransition();

  const normalizedSearch = search.toLowerCase();
  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(normalizedSearch) ||
      user.email.toLowerCase().includes(normalizedSearch) ||
      roleLabel(user.role).toLowerCase().includes(normalizedSearch) ||
      Boolean(user.rfc?.toLowerCase().includes(normalizedSearch)),
  );

  function openForm(user?: ManagedUser) {
    setEditing(user ?? null);
    setSelectedRole(user?.role ?? "empleado");
    setMessage("");
    setOpen(true);
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    if (editing) formData.set("id", editing.id);

    startTransition(async () => {
      const isClient = formData.get("role") === "cliente";
      if (isClient) {
        formData.set("nombre", String(formData.get("name") ?? ""));
      }
      const result = isClient
        ? await guardarCliente(formData)
        : await guardarUsuario(formData);
      if (result.ok) {
        setOpen(false);
        setFeedback(result.message);
        router.refresh();
      } else {
        setMessage(result.message);
      }
    });
  }

  function remove(user: ManagedUser) {
    if (!window.confirm(`¿Eliminar la cuenta de ${user.name}?`)) return;

    startTransition(async () => {
      const result = user.role === "cliente"
        ? await eliminarCliente(user.id)
        : await eliminarUsuario(user.id);
      setFeedback(result.message);
      if (result.ok) router.refresh();
    });
  }

  return (
    <Card id="administracion" className="mx-4 border-gray-200/60 bg-white/50 shadow-xs backdrop-blur-sm lg:mx-6">
      <CardHeader className="flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <CardTitle className="text-xl">Usuarios</CardTitle>
          <p className="mt-1 text-sm text-muted-foreground">
            Cuentas internas y clientes reunidos en una sola tabla.
          </p>
        </div>
        <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 size-4 text-gray-500" />
            <Input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Buscar usuario..."
              className="bg-white pl-9 sm:w-64"
            />
          </div>
          <Button size="sm" onClick={() => openForm()}>
            <Plus className="mr-1.5 size-4" />
            Agregar usuario
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
            <TableHeader className="bg-gray-50/80">
              <TableRow>
                <TableHead>Usuario</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Alta</TableHead>
                <TableHead className="w-24" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.length ? (
                filteredUsers.map((user) => {
                  const isCurrentUser = user.id === currentUserId;
                  return (
                    <TableRow key={user.id} className="group">
                      <TableCell>
                        <p className="font-medium text-gray-900">
                          {user.name}
                          {isCurrentUser ? " (tú)" : ""}
                        </p>
                        <p className="text-xs text-gray-500">{user.email}</p>
                      </TableCell>
                      <TableCell>
                        <Badge variant={user.role === "admin" ? "default" : "secondary"}>
                          {roleLabel(user.role)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className="inline-flex items-center gap-1.5 text-sm text-gray-600">
                          <ShieldCheck className="size-4 text-emerald-600" />
                          {user.role === "cliente"
                            ? "Cliente registrado"
                            : user.emailVerified ? "Verificado" : "Pendiente"}
                        </span>
                      </TableCell>
                      <TableCell className="text-sm text-gray-500">
                        {dateFormatter.format(new Date(user.createdAt))}
                      </TableCell>
                      <TableCell>
                        <div className="flex justify-end gap-1">
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => openForm(user)}
                            aria-label={`Editar ${user.name}`}
                          >
                            <Pencil className="size-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            disabled={isPending || isCurrentUser}
                            onClick={() => remove(user)}
                            aria-label={`Eliminar ${user.name}`}
                            className="text-red-600 hover:bg-red-50 hover:text-red-700"
                          >
                            <Trash2 className="size-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="h-28 text-center text-gray-500">
                    No se encontraron usuarios.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-lg">
          <form key={editing?.id ?? "new"} onSubmit={submit}>
            <DialogHeader>
              <DialogTitle>
                {editing ? "Editar usuario" : "Agregar usuario"}
              </DialogTitle>
              <DialogDescription>
                Administra los datos y el tipo de usuario desde un solo lugar.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-6 sm:grid-cols-2">
              <div className="grid gap-2 sm:col-span-2">
                <Label htmlFor="user-name">Nombre</Label>
                <Input id="user-name" name="name" defaultValue={editing?.name} required />
              </div>
              <div className="grid gap-2 sm:col-span-2">
                <Label htmlFor="user-email">Correo</Label>
                <Input
                  id="user-email"
                  name="email"
                  type="email"
                  defaultValue={editing?.email}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="user-role">Tipo</Label>
                <select
                  id="user-role"
                  name="role"
                  defaultValue={editing?.role ?? "empleado"}
                  onChange={(event) =>
                    setSelectedRole(event.target.value as ManagedUser["role"])
                  }
                  className="h-10 rounded-md border border-input bg-transparent px-3 text-sm"
                  required
                >
                  {(editing?.role === "cliente"
                    ? (["cliente"] as const)
                    : editing
                      ? USER_ROLES
                      : ([...USER_ROLES, "cliente"] as const)
                  ).map((role) => (
                    <option key={role} value={role}>
                      {roleLabel(role)}
                    </option>
                  ))}
                </select>
              </div>
              {selectedRole === "cliente" ? (
                <>
                  <div className="grid gap-2">
                    <Label htmlFor="user-rfc">RFC</Label>
                    <Input
                      id="user-rfc"
                      name="rfc"
                      defaultValue={editing?.rfc ?? ""}
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="user-phone">Teléfono</Label>
                    <Input
                      id="user-phone"
                      name="telefono"
                      type="tel"
                      defaultValue={editing?.telefono ?? ""}
                      required
                    />
                  </div>
                  <div className="grid gap-2 sm:col-span-2">
                    <Label htmlFor="user-address">Dirección</Label>
                    <Input
                      id="user-address"
                      name="direccion"
                      defaultValue={editing?.direccion ?? ""}
                      required
                    />
                  </div>
                </>
              ) : (
                <div className="grid gap-2">
                  <Label htmlFor="user-password">
                    {editing ? "Nueva contraseña" : "Contraseña"}
                  </Label>
                  <Input
                    id="user-password"
                    name="password"
                    type="password"
                    minLength={8}
                    required={!editing}
                    placeholder={editing ? "Dejar igual" : "Mínimo 8 caracteres"}
                  />
                </div>
              )}
            </div>
            {message ? (
              <p role="alert" className="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-700">
                {message}
              </p>
            ) : null}
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? "Guardando..." : "Guardar usuario"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
