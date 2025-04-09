'use client';

import React from 'react';
import RouterLink from 'next/link';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import FormControl from '@mui/material/FormControl';
import FormHelperText from '@mui/material/FormHelperText';
import InputLabel from '@mui/material/InputLabel';
import OutlinedInput from '@mui/material/OutlinedInput';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { Controller, useForm } from 'react-hook-form';
import { toast, ToastContainer } from 'react-toastify';
import { z as zod } from 'zod';


import { authClient } from '@/lib/auth/client';

const schema = zod.object({
  email: zod.string().email({ message: 'Invalid email address' }).min(1, { message: 'Email is required' }),
});

type Values = zod.infer<typeof schema>;

const defaultValues: Values = { email: '' };

export default function ForgotPassword(): React.JSX.Element {
  const router = useRouter();
  const [error, setError] = React.useState<string | null>(null);
  const [isPending, setIsPending] = React.useState<boolean>(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<Values>({ defaultValues, resolver: zodResolver(schema) });

  const onSubmit = React.useCallback(
    async (values: Values): Promise<void> => {
      setIsPending(true);
      setError(null);
      try {
        const response = await authClient.forgotPassword(values.email);
        if (response.error) {
          throw new Error(response.error);
        }
        // Store the email in localStorage
        localStorage.setItem('resetEmail', values.email);
        toast.success('OTP sent to your email successfully');
        setTimeout(() => {
          router.push('/auth/otp-verification'); // Redirect to OTP verification page
        }, 1500);
      } catch (error: any) {
        setError(error.message || 'An unexpected error occurred. Please try again later.');
      } finally {
        setIsPending(false);
      }
    },
    [router]
  );

  return (
    <Stack spacing={4}>
      <Stack spacing={1}>
        <ToastContainer position="top-center" autoClose={3000} hideProgressBar newestOnTop closeOnClick />
        <Typography variant="h4">Forgot Password</Typography>
        <Typography color="text.secondary" variant="body2">
          Enter your email address to receive a password reset OTP.
        </Typography>
      </Stack>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Stack spacing={2}>
          <Controller
            control={control}
            name="email"
            render={({ field }) => (
              <FormControl error={Boolean(errors.email)} variant="outlined" fullWidth>
                <InputLabel>Email</InputLabel>
                <OutlinedInput {...field} label="Email" type="email" />
                {errors.email && <FormHelperText>{errors.email.message}</FormHelperText>}
              </FormControl>
            )}
          />
          {error && <Alert severity="error">{error}</Alert>}
          <Button disabled={isPending} type="submit" variant="contained" fullWidth>
            {isPending ? 'Sending OTP...' : 'Send OTP'}
          </Button>
          <Typography align="center" variant="body2">
            <RouterLink href="/auth/sign-in">Back to Sign In</RouterLink>
          </Typography>
        </Stack>
      </form>
    </Stack>
  );
}
