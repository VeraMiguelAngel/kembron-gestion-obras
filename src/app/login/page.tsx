import { LoginForm } from "./login-form";

export default function LoginPage() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-8 px-4">
      <div className="flex flex-col items-center gap-1">
        <h1 className="text-3xl font-semibold text-zinc-900">Gestor de Obras</h1>
        <p className="text-sm text-zinc-600">Iniciar sesión</p>
      </div>
      <LoginForm />
    </div>
  );
}
