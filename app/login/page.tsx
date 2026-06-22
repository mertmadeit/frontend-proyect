import { AuthPageShell } from "@/components/auth-page-shell";
import { LoginForm } from "@/components/login-form";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ reset?: string | string[] }>;
}) {
  const { reset } = await searchParams;
  const notice =
    reset === "success" ? "Tu contraseña fue actualizada correctamente." : undefined;

  return (
    <AuthPageShell>
      <LoginForm notice={notice} />
    </AuthPageShell>
  );
}
