"use client";

import React from "react";
import { Download, Loader2, Pencil, Plus, Search, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TableRow, TableCell } from "@/components/ui/table";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

export type Option = { id: number; nombre: string };
export type StatusOption = { id: number; estado: string };

export const formatoPrecio = new Intl.NumberFormat("es-MX", {
  style: "currency",
  currency: "MXN",
  maximumFractionDigits: 0,
});

export function CrudCard({
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
    <div className="px-4 lg:px-6">
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
    </div>
  );
}

export function Actions({
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
        {onEdit && editLabel ? (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" onClick={onEdit} disabled={disabled} className="text-gray-500 hover:text-blue-600 hover:bg-blue-50">
                <Pencil className="size-4" />
                <span className="sr-only">{editLabel}</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Editar</p>
            </TooltipContent>
          </Tooltip>
        ) : null}

        {onDelete && deleteLabel ? (
          <Tooltip>
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
          </Tooltip>
        ) : null}
      </div>
    </TableCell>
  );
}

export function Field({
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

export function SelectField({
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

export function SubmitButton({ pending }: { pending: boolean }) {
  return (
    <Button type="submit" disabled={pending} className="min-w-28 transition-all">
      {pending ? <Loader2 className="mr-2 size-4 animate-spin" /> : null}
      {pending ? "Guardando..." : "Guardar"}
    </Button>
  );
}

export function FormMessage({ message }: { message: string }) {
  return message ? (
    <p role="alert" className="text-sm font-medium text-red-600 bg-red-50 p-3 rounded-md">
      {message}
    </p>
  ) : null;
}

export function EmptyRow({ columns, message, icon }: { columns: number; message: string; icon?: React.ReactNode }) {
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
