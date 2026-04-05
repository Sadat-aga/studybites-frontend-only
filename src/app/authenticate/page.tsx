import { LoginForm } from "@/components/login-form";
import { StudybitesAuthShell } from "@/components/studybites-auth-shell";

export default function AuthenticatePage() {
  return (
    <StudybitesAuthShell>
      <LoginForm />
    </StudybitesAuthShell>
  );
}
