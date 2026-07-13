import { LoginForm } from '@/features/login';

export function LoginPage() {
  return (
    <div className="mx-auto max-w-sm px-4 py-16">
      <div className="card p-6 shadow-soft sm:p-8">
        <h1 className="mb-1 text-center text-2xl font-bold tracking-tight">
          Welcome back
        </h1>
        <p className="mb-6 text-center text-sm text-muted">
          Log in to your account
        </p>
        <LoginForm />
      </div>
    </div>
  );
}
