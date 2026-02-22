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
  username: z
    .string()
    .min(3, 'At least 3 characters')
    .max(30, 'Max 30 characters')
    .regex(/^[a-zA-Z0-9_]+$/, 'Only letters, numbers, and underscores'),
  password: z.string().min(8, 'At least 8 characters'),
});
type FormData = z.infer<typeof schema>;

export default function RegisterPage() {
  const { register: registerUser } = useAuth();
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
      await registerUser(data.email, data.username, data.password);
      navigate('/swipe');
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : 'Registration failed. Try again.';
      setServerError(msg);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 to-blue-50 p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8">
        <h1 className="text-3xl font-black text-center text-brand-pink mb-2">SwapSpace</h1>
        <p className="text-center text-gray-500 mb-8">Create your account</p>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <Input
            label="Email"
            type="email"
            placeholder="you@example.com"
            error={errors.email?.message}
            {...register('email')}
          />
          <Input
            label="Username"
            placeholder="cool_user_123"
            error={errors.username?.message}
            {...register('username')}
          />
          <Input
            label="Password"
            type="password"
            placeholder="Min. 8 characters"
            error={errors.password?.message}
            {...register('password')}
          />

          {serverError && (
            <p className="text-sm text-red-500 bg-red-50 rounded-lg px-3 py-2">{serverError}</p>
          )}

          <Button type="submit" isLoading={isSubmitting} className="mt-2">
            Create Account
          </Button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          Already have an account?{' '}
          <Link to="/login" className="text-brand-pink font-semibold hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
