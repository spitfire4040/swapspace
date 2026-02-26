import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/useAuth';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { useState } from 'react';

const schema = z.object({
  email: z.string().email('Valid email required'),
  password: z.string().min(1, 'Password required'),
});
type FormData = z.infer<typeof schema>;

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [serverError, setServerError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormData) => {
    setServerError('');
    try {
      await login(data.email, data.password);
      navigate('/swipe');
    } catch (err: unknown) {
      const msg =
        err instanceof Error
          ? err.message
          : 'Login failed. Please check your credentials.';
      setServerError(msg);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 to-blue-50 px-4"
      style={{
        paddingTop: 'calc(1rem + env(safe-area-inset-top, 0px))',
        paddingBottom: 'calc(1rem + env(safe-area-inset-bottom, 0px))',
      }}
    >
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8">
        <h1 className="text-3xl font-black text-center text-brand-pink mb-2">SwapSpace</h1>
        <p className="text-center text-gray-500 mb-8">Sign in to your account</p>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <Input
            label="Email"
            type="email"
            placeholder="you@example.com"
            error={errors.email?.message}
            {...register('email')}
          />
          <Input
            label="Password"
            type="password"
            placeholder="••••••••"
            error={errors.password?.message}
            {...register('password')}
          />

          {serverError && (
            <p className="text-sm text-red-500 bg-red-50 rounded-lg px-3 py-2">{serverError}</p>
          )}

          <Button type="submit" isLoading={isSubmitting} className="mt-2">
            Sign In
          </Button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          Don't have an account?{' '}
          <Link to="/register" className="text-brand-pink font-semibold hover:underline">
            Register
          </Link>
        </p>
      </div>
    </div>
  );
}
