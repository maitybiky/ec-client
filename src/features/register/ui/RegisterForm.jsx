import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate, Link } from 'react-router-dom';
import { registerSchema } from '../model/schema.js';
import { useRegister } from '../api/register.js';
import { Button, Input, PasswordInput, Spinner } from '@/shared/ui';
import { apiErrorMessage } from '@/shared/api';

export function RegisterForm() {
  const navigate = useNavigate();
  const registerUser = useRegister();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: zodResolver(registerSchema) });

  const onSubmit = (values) => {
    registerUser.mutate(values, {
      onSuccess: () => navigate('/', { replace: true }),
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Input label="Name" error={errors.name?.message} {...register('name')} />
      <Input
        label="Email"
        type="email"
        autoComplete="email"
        error={errors.email?.message}
        {...register('email')}
      />
      <PasswordInput
        label="Password"
        autoComplete="new-password"
        error={errors.password?.message}
        {...register('password')}
      />
      <PasswordInput
        label="Confirm password"
        autoComplete="new-password"
        error={errors.confirmPassword?.message}
        {...register('confirmPassword')}
      />
      {registerUser.isError && (
        <p className="text-sm text-red-600">
          {apiErrorMessage(registerUser.error)}
        </p>
      )}
      <Button type="submit" className="w-full" disabled={registerUser.isPending}>
        {registerUser.isPending ? <Spinner className="h-4 w-4" /> : 'Create account'}
      </Button>
      <p className="text-center text-sm text-gray-600">
        Already have an account?{' '}
        <Link to="/login" className="font-medium text-gray-900 underline">
          Log in
        </Link>
      </p>
    </form>
  );
}
