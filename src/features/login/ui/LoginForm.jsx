import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { loginSchema } from '../model/schema.js';
import { useLogin } from '../api/login.js';
import { Button, Input, PasswordInput, Spinner } from '@/shared/ui';
import { apiErrorMessage } from '@/shared/api';

export function LoginForm() {
  const navigate = useNavigate();
  const location = useLocation();
  const login = useLogin();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: zodResolver(loginSchema) });

  const onSubmit = (values) => {
    login.mutate(values, {
      onSuccess: ({ user }) => {
        const to =
          location.state?.from ?? (user.role === 'admin' ? '/admin' : '/');
        navigate(to, { replace: true });
      },
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Input
        label="Email"
        type="email"
        autoComplete="email"
        error={errors.email?.message}
        {...register('email')}
      />
      <PasswordInput
        label="Password"
        autoComplete="current-password"
        error={errors.password?.message}
        {...register('password')}
      />
      {login.isError && (
        <p className="text-sm text-red-600">{apiErrorMessage(login.error)}</p>
      )}
      <Button type="submit" className="w-full" disabled={login.isPending}>
        {login.isPending ? <Spinner className="h-4 w-4" /> : 'Log in'}
      </Button>
      <p className="text-center text-sm text-gray-600">
        No account?{' '}
        <Link to="/register" className="font-medium text-gray-900 underline">
          Register
        </Link>
      </p>
    </form>
  );
}
