"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";

export function ResetPasswordForm({
  token,
  tokenError,
}: {
  token?: string;
  tokenError?: string;
}) {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState(tokenError ?? "");
  const [success, setSuccess] = useState(false);
  const [isPending, setIsPending] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (!token) {
      setError("El enlace no contiene un token válido.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    setIsPending(true);

    try {
      const { error: resetError } = await authClient.resetPassword({
        token,
        newPassword,
      });

      if (resetError) {
        setError(
          resetError.message ?? "El enlace es inválido o ya expiró.",
        );
        return;
      }

      setSuccess(true);
    } catch {
      setError("No fue posible conectar con el servicio de autenticación.");
    } finally {
      setIsPending(false);
    }
  }

  return (
    <Card className="border-gray-200 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
      <CardHeader>
        <CardTitle className="text-2xl tracking-[-0.035em]">
          Crea una nueva contraseña
        </CardTitle>
        <CardDescription>
          Usa al menos 8 caracteres para proteger tu cuenta.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {success ? (
          <div className="space-y-4">
            <p className="rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-700">
              Tu contraseña se actualizó correctamente.
            </p>
            <Button className="w-full" asChild>
              <Link href="/login?reset=success">Iniciar sesión</Link>
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="new-password">Nueva contraseña</FieldLabel>
                <Input
                  id="new-password"
                  type="password"
                  autoComplete="new-password"
                  minLength={8}
                  value={newPassword}
                  onChange={(event) => setNewPassword(event.target.value)}
                  disabled={isPending || !token}
                  required
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="confirm-new-password">
                  Confirmar contraseña
                </FieldLabel>
                <Input
                  id="confirm-new-password"
                  type="password"
                  autoComplete="new-password"
                  minLength={8}
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  disabled={isPending || !token}
                  required
                />
              </Field>
              {error ? (
                <p role="alert" className="text-sm text-red-600">
                  {error}
                </p>
              ) : null}
              <Field>
                <Button type="submit" disabled={isPending || !token}>
                  {isPending ? "Actualizando..." : "Cambiar contraseña"}
                </Button>
                <Link
                  href="/olvide-password"
                  className="text-center text-sm text-gray-600 underline-offset-4 hover:text-black hover:underline"
                >
                  Solicitar un enlace nuevo
                </Link>
              </Field>
            </FieldGroup>
          </form>
        )}
      </CardContent>
    </Card>
  );
}
