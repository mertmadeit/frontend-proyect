import { AuthPageShell } from "@/components/auth-page-shell";
import { ResetPasswordForm } from "@/components/reset-password-form";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{
    token?: string | string[];
    error?: string | string[];
  }>;
}) {
  const params = await searchParams;
  const token = Array.isArray(params.token) ? params.token[0] : params.token;
  const resetError = Array.isArray(params.error) ? params.error[0] : params.error;
  const tokenError = resetError
    ? "El enlace es inválido o ya expiró. Solicita uno nuevo."
    : undefined;

  return (
    <AuthPageShell>
      <ResetPasswordForm token={token} tokenError={tokenError} />
    </AuthPageShell>
  );
}
