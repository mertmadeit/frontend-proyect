import { AuthPageShell } from "@/components/auth-page-shell";
import { SignupForm } from "@/components/signup-form";

export default function Page() {
  return (
    <AuthPageShell>
      <SignupForm />
    </AuthPageShell>
  );
}
