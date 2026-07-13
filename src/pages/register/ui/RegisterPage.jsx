import { RegisterForm } from '@/features/register';

export function RegisterPage() {
  return (
    <div className="mx-auto max-w-sm px-4 py-16">
      <h1 className="mb-6 text-center text-2xl font-bold">Create account</h1>
      <RegisterForm />
    </div>
  );
}
