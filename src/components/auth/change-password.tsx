'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Box, Button, Typography, CircularProgress, Alert } from '@mui/material';
import OutlinedInput from '@mui/material/OutlinedInput';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import { Eye as EyeIcon } from '@phosphor-icons/react/dist/ssr/Eye';
import { EyeSlash as EyeSlashIcon } from '@phosphor-icons/react/dist/ssr/EyeSlash';
import FormHelperText from '@mui/material/FormHelperText';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { authClient } from '@/lib/auth/client';
import { useUser } from '@/hooks/use-user';

const schema = yup.object().shape({
  newPassword: yup
    .string()
    .required('New password is required'),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref('newPassword'), ''], 'Passwords must match')
    .required('Confirm password is required'),
});

interface FormData {
  newPassword: string;
  confirmPassword: string;
}

export default function ChangePassword(): React.JSX.Element {
  const router = useRouter();
  const { user } =  useUser();
  const [isPending, setIsPending] = useState(false);
  const [showPassword, setShowPassword] = React.useState<boolean>(false);
  const [showConfrimPassword, setShowConfrimPassword] = React.useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>({ resolver: yupResolver(schema) });

  const handleChangePassword = async (data: FormData): Promise<void> => {
    setIsPending(true);
    setError(null);

    try {
      const email =  localStorage.getItem('resetEmail')

      if (!email) {
        throw new Error('Email not found. Please try again.');
      }
      const response = await authClient.changePassword(email, data.newPassword);

      if (response.error) {
        throw new Error(response.error);
        
      }

      toast.success('Password changed successfully! Redirecting...', { autoClose: 2000 });
      reset(); // Reset form fields
      setTimeout(() => router.push('/dashboard'), 1500);
    } catch (error: any) {
      setError(error.message || 'Failed to change password. Please try again.');
      toast.error(error.message || 'Failed to change password. Please try again.');
    } finally {
      setIsPending(false);
    }
  };

  return (
    <Box sx={{ maxWidth: 400, margin: 'auto', mt: 5, p: 3, border: '1px solid #ddd', borderRadius: '8px', boxShadow: 2 }}>
      <ToastContainer
        position="top-center"
        autoClose={3000}
        hideProgressBar
        newestOnTop
        closeOnClick
        pauseOnHover
        pauseOnFocusLoss
      />
      <Typography variant="h4" gutterBottom>
        Change Password
      </Typography>
      <form onSubmit={handleSubmit(handleChangePassword)}>
        <Controller
          name="newPassword"
          control={control}
          render={({ field }) => (
            <FormControl fullWidth variant="outlined" error={Boolean(errors.newPassword)} margin="normal">
              <InputLabel>New Password</InputLabel>
              <OutlinedInput {...field} label="New Password" disabled={isPending}
                endAdornment={
                  showPassword ? (
                    <EyeIcon
                      cursor="pointer"
                      fontSize="var(--icon-fontSize-md)"
                      onClick={() => setShowPassword(false)}
                    />
                  ) : (
                    <EyeSlashIcon
                      cursor="pointer"
                      fontSize="var(--icon-fontSize-md)"
                      onClick={() => setShowPassword(true)}
                    />
                  )
                }
                type={showPassword ? 'text' : 'password'}
              />
              {errors.newPassword && <FormHelperText>{errors.newPassword.message}</FormHelperText>}
            </FormControl>
          )}
        />
        <Controller
          name="confirmPassword"
          control={control}
          render={({ field }) => (
            <FormControl fullWidth variant="outlined" error={Boolean(errors.confirmPassword)} margin="normal">
              <InputLabel>Confirm Password</InputLabel>
              <OutlinedInput {...field} label="Confirm Password" type={showConfrimPassword ? 'text' : 'password'} disabled={isPending}
              endAdornment={
                showConfrimPassword ? (
                  <EyeIcon
                    cursor="pointer"
                    fontSize="var(--icon-fontSize-md)"
                    onClick={() => setShowConfrimPassword(false)}
                  />
                ) : (
                  <EyeSlashIcon
                    cursor="pointer"
                    fontSize="var(--icon-fontSize-md)"
                    onClick={() => setShowConfrimPassword(true)}
                  />
                )
              }
              
              />
              {errors.confirmPassword && <FormHelperText>{errors.confirmPassword.message}</FormHelperText>}
            </FormControl>
          )}
        />
        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        )}
        <Button type="submit" variant="contained" fullWidth sx={{ mt: 2 }} disabled={isPending}>
          {isPending ? <CircularProgress size={24} /> : 'Change Password'}
        </Button>
      </form>
    </Box>
  );
}