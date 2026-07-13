import { LoginForm } from '@/features/login';

export function LoginPage() {
  return (
    <div className="mx-auto max-w-sm px-4 py-16">
      <h1 className="mb-6 text-center text-2xl font-bold">Log in</h1>
      <LoginForm />
    </div>
  );
}
