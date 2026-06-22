"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { authClient } from "@/lib/auth-client";
import { cn } from "@/lib/utils";
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

export function LoginForm({
  className,
  notice,
  ...props
}: React.ComponentProps<"div"> & { notice?: string }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isPending, setIsPending] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsPending(true);

    try {
      const { error: signInError } = await authClient.signIn.email({
        email,
        password,
        callbackURL: "/dashboard",
      });

      if (signInError) {
        setError(signInError.message ?? "No fue posible iniciar sesión.");
      }
    } catch {
      setError("No fue posible conectar con el servicio de autenticación.");
    } finally {
      setIsPending(false);
    }
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="border-gray-200 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
        <CardHeader>
          <CardTitle className="text-2xl tracking-[-0.035em]">
            Inicia sesión
          </CardTitle>
          <CardDescription>
            Accede a tu cuenta para continuar en Luminar.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="email">Correo electrónico</FieldLabel>
                <Input
                  id="email"
                  type="email"
                  placeholder="tu@correo.com"
                  autoComplete="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  disabled={isPending}
                  required
                />
              </Field>
              <Field>
                <div className="flex items-center">
                  <FieldLabel htmlFor="password">Contraseña</FieldLabel>
                  <Link
                    href="/olvide-password"
                    className="ml-auto inline-block text-sm underline-offset-4 hover:underline"
                  >
                    ¿Olvidaste tu contraseña?
                  </Link>
                </div>
                <Input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  disabled={isPending}
                  required
                />
              </Field>
              {notice ? (
                <p className="rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-700">
                  {notice}
                </p>
              ) : null}
              {error ? (
                <p role="alert" className="text-sm text-red-600">
                  {error}
                </p>
              ) : null}
              <Field>
                <Button type="submit" disabled={isPending}>
                  {isPending ? "Ingresando..." : "Iniciar sesión"}
                </Button>
                <FieldDescription className="text-center">
                  ¿Aún no tienes una cuenta?{" "}
                  <Link
                    href="/signup"
                    className="font-medium text-black hover:underline"
                  >
                    Regístrate
                  </Link>
                </FieldDescription>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
