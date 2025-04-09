'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useForm, Controller } from 'react-hook-form';
import {
  Box,
  Button,
  Typography,
  CircularProgress,
  FormControl,
  InputLabel,
  OutlinedInput,
  FormHelperText,
} from '@mui/material';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useRouter } from 'next/navigation';
import { toast, ToastContainer } from 'react-toastify';

import { authClient } from '@/lib/auth/client';

const schema = yup.object({
  otp: yup
    .string()
    .length(6, 'OTP must be exactly 6 digits')
    .matches(/^\d+$/, 'OTP must contain only digits')
    .required('OTP is required'),
});

export default function OtpVerification(): React.JSX.Element {
  const { handleSubmit, control, formState: { errors } } = useForm({
    resolver: yupResolver(schema),
  });

  const router = useRouter();
  const [email, setEmail] = useState<string | null>(null);
  const [timer, setTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Retrieve email from localStorage
  useEffect(() => {
    const storedEmail = localStorage.getItem('resetEmail');
    if (!storedEmail) {
      toast.error('Email not found. Please try again.');
      router.push('/auth/forgot-password');
    } else {
      setEmail(storedEmail);
    }
  }, [router]);

  // OTP Resend Timer
  useEffect(() => {
    if (timer > 0) {
      const countdown = setTimeout(() => setTimer((prev) => prev - 1), 1000);
      return () => clearTimeout(countdown);
    } else {
      setCanResend(true);
    }
  }, [timer]);

  const onSubmit = useCallback(async (data: { otp: string }) => {
    console.log("Form submitted with data:", data); // Debugging line
    setIsPending(true);
    setError(null);

    try {
      if (!email) {
        throw new Error("Email not found. Please try again.");
      }

      console.log(`Verifying OTP: ${data.otp} for ${email}`);
      const response = await authClient.verifyOtp(data.otp, email);
      console.log("API Response:", response); // Debugging line

      if (response?.message === "OTP verified successfully") {
        toast.success("OTP verified successfully");
        setTimeout(() => router.push("/auth/change-password"), 1500);
        return;
      }

      throw new Error(response?.message || "Invalid or expired OTP");
    } catch (error: any) {
      console.error("Error verifying OTP:", error);
      setError(error.message || "Invalid or expired OTP");
    } finally {
      setIsPending(false);
    }
  }, [email, router]);

  // Log form errors
  console.log("Form errors:", errors);

  // ✅ Handle Resend OTP Functionality
  const handleResendOtp = useCallback(async () => {
    console.log("Resending OTP"); // Debugging line
    setIsPending(true);
    setError(null);
    try {
      if (!email) {
        throw new Error('Email not found. Please try again.');
      }

      console.log(`Resending OTP for ${email}`);
      const response = await authClient.resendOtp('000000', email); // Replace '000000' with the actual OTP if available

      toast.success('OTP resent successfully');
      setTimer(60);
      setCanResend(false);
    } catch (error: any) {
      console.error('Error resending OTP:', error);
      setError(error.message || 'Failed to resend OTP');
    } finally {
      setIsPending(false);
    }
  }, [email]);

  if (!email) {
    return (
      <Box sx={{ maxWidth: 400, margin: 'auto', mt: 5, p: 3, border: '1px solid #ddd', borderRadius: '8px', boxShadow: 2 }}>
        <Typography variant="h6" color="error">Email not found. Please try again.</Typography>
      </Box>
    );
  }

  return (
    <div className="shadow-md border-2 w-[80%] flex justify-center ml-[10%] p-6">
      <ToastContainer position="top-center" autoClose={3000} hideProgressBar newestOnTop closeOnClick />
      <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ maxWidth: 400, width: '100%', p: 3, boxSizing: 'border-box' }}>
        <Typography variant="h4" gutterBottom>
          Verify OTP
        </Typography>
        <Typography>{email}</Typography>
        <Controller
          name="otp"
          control={control}
          render={({ field }) => (
            <FormControl fullWidth variant="outlined" error={Boolean(errors.otp)} margin="normal">
              <InputLabel>OTP</InputLabel>
              <OutlinedInput
                {...field}
                label="OTP"
                inputProps={{
                  maxLength: 6, // Limit input to 6 characters
                }}
                onChange={(e) => {
                  // Allow only numeric input
                  const value = e.target.value.replace(/\D/g, ''); // Remove non-digits
                  field.onChange(value); // Update the form value
                }}
              />
              {errors.otp && <FormHelperText>{errors.otp.message}</FormHelperText>}
            </FormControl>
          )}
        />
        <Button type="submit" variant="contained" fullWidth disabled={isPending} sx={{ mt: 2 }}>
          {isPending ? <CircularProgress size={24} /> : 'Verify OTP'}
        </Button>
        {error && <Typography color="error" mt={2}>{error}</Typography>}
        <Box sx={{ mt: 2, textAlign: 'center' }}>
          {canResend ? (
            <Button onClick={handleResendOtp} disabled={isPending}>
            {isPending ? <CircularProgress size={24} /> : 'Resend OTP'}
          </Button>
          ) : (
            <Typography>Resend OTP in {timer} seconds</Typography>
          )}
        </Box>
      </Box>
    </div>
  );
}
