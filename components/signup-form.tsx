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
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import type { UserRole } from "@/lib/roles";

export function SignupForm({ ...props }: React.ComponentProps<typeof Card>) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState<UserRole>("supervisor");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isPending, setIsPending] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    setIsPending(true);

    try {
      const { error: signUpError } = await authClient.signUp.email({
        name,
        email,
        password,
        role,
        callbackURL: "/login",
      });

      if (signUpError) {
        setError(signUpError.message ?? "No fue posible crear la cuenta.");
        return;
      }

      setSuccess(
        "Cuenta creada. Revisa tu correo para verificarla antes de iniciar sesión.",
      );
    } catch {
      setError("No fue posible conectar con el servicio de autenticación.");
    } finally {
      setIsPending(false);
    }
  }

  return (
    <Card
      className="border-gray-200 shadow-[0_1px_2px_rgba(0,0,0,0.04)]"
      {...props}
    >
      <CardHeader>
        <CardTitle className="text-2xl tracking-[-0.035em]">
          Crea tu cuenta
        </CardTitle>
        <CardDescription>
          Regístrate para comenzar a comprar en Luminar.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit}>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="name">Nombre completo</FieldLabel>
              <Input
                id="name"
                type="text"
                placeholder="Nombre Apellido"
                autoComplete="name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                disabled={isPending}
                required
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="signup-role">Tipo de rol</FieldLabel>
              <select
                id="signup-role"
                value={role}
                onChange={(event) => setRole(event.target.value as UserRole)}
                disabled={isPending}
                className="h-10 w-full rounded-md border border-gray-300 bg-white px-3 text-sm outline-none transition-shadow focus:border-gray-500 focus:ring-2 focus:ring-gray-200 disabled:cursor-not-allowed disabled:opacity-50"
                required
              >
                <option value="supervisor">Supervisor</option>
                <option value="admin">Administrador</option>
              </select>
              <FieldDescription>
                El supervisor solo puede administrar facturas.
              </FieldDescription>
            </Field>
            <Field>
              <FieldLabel htmlFor="signup-email">
                Correo electrónico
              </FieldLabel>
              <Input
                id="signup-email"
                type="email"
                placeholder="tu@correo.com"
                autoComplete="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                disabled={isPending}
                required
              />
              <FieldDescription>
                Te enviaremos un enlace para verificar tu cuenta.
              </FieldDescription>
            </Field>
            <Field>
              <FieldLabel htmlFor="signup-password">Contraseña</FieldLabel>
              <Input
                id="signup-password"
                type="password"
                autoComplete="new-password"
                minLength={8}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                disabled={isPending}
                required
              />
              <FieldDescription>
                Debe tener al menos 8 caracteres.
              </FieldDescription>
            </Field>
            <Field>
              <FieldLabel htmlFor="confirm-password">
                Confirmar contraseña
              </FieldLabel>
              <Input
                id="confirm-password"
                type="password"
                autoComplete="new-password"
                minLength={8}
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                disabled={isPending}
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
                {isPending ? "Creando cuenta..." : "Crear cuenta"}
              </Button>
              <FieldDescription className="px-6 text-center">
                ¿Ya tienes una cuenta?{" "}
                <Link
                  href="/login"
                  className="font-medium text-black hover:underline"
                >
                  Inicia sesión
                </Link>
              </FieldDescription>
            </Field>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  );
}
