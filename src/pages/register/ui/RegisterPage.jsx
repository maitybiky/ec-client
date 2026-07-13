import { RegisterForm } from '@/features/register';

export function RegisterPage() {
  return (
    <div className="mx-auto max-w-sm px-4 py-16">
      <div className="card p-6 shadow-soft sm:p-8">
        <h1 className="mb-1 text-center text-2xl font-bold tracking-tight">
          Create account
        </h1>
        <p className="mb-6 text-center text-sm text-muted">
          Join and start saving with limited discounts
        </p>
        <RegisterForm />
      </div>
    </div>
  );
}
