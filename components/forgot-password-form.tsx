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

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isPending, setIsPending] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSuccess("");
    setIsPending(true);

    try {
      const { error: resetError } = await authClient.requestPasswordReset({
        email,
        redirectTo: `${window.location.origin}/restablecer-password`,
      });

      if (resetError) {
        setError(resetError.message ?? "No fue posible enviar el correo.");
        return;
      }

      setSuccess(
        "Si existe una cuenta con ese correo, recibirás un enlace para restablecer tu contraseña.",
      );
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
          Recupera tu contraseña
        </CardTitle>
        <CardDescription>
          Te enviaremos un enlace seguro a tu correo.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit}>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="reset-email">Correo electrónico</FieldLabel>
              <Input
                id="reset-email"
                type="email"
                placeholder="tu@correo.com"
                autoComplete="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                disabled={isPending || Boolean(success)}
                required
              />
            </Field>
            {error ? (
              <p role="alert" className="text-sm text-red-600">
                {error}
              </p>
            ) : null}
            {success ? (
              <p className="rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-700">
                {success}
              </p>
            ) : null}
            <Field>
              <Button type="submit" disabled={isPending || Boolean(success)}>
                {isPending ? "Enviando..." : "Enviar enlace"}
              </Button>
              <Link
                href="/login"
                className="text-center text-sm text-gray-600 underline-offset-4 hover:text-black hover:underline"
              >
                Volver a iniciar sesión
              </Link>
            </Field>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  );
}
