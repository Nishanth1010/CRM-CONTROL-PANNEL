'use client';

import * as React from 'react';
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
import Link from '@mui/material/Link';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import Grid from '@mui/material/Grid';
import { Controller, useForm } from 'react-hook-form';
import { z as zod } from 'zod';

const schema = zod.object({
  companyName: zod.string().min(1, { message: 'Company name is required' }),
  userName: zod.string().min(1, { message: 'User name is required' }),
  phone: zod.string().min(10, { message: 'Phone number should be at least 10 digits' }),
  alternatePhone: zod.string().optional(),
  email: zod.string().min(1, { message: 'Email is required' }).email({ message: 'Invalid email address' }),
  address: zod.string().min(1, { message: 'Address is required' }),
  website: zod.string().url({ message: 'Invalid URL' }).optional(),
});

type Values = zod.infer<typeof schema>;

const defaultValues: Values = {
  companyName: '',
  userName: '',
  phone: '',
  alternatePhone: '',
  email: '',
  address: '',
  website: '',
};

export function EnquiryForm(): React.JSX.Element {
  const router = useRouter();
  const [isPending, setIsPending] = React.useState<boolean>(false);

  const {
    control,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<Values>({ defaultValues, resolver: zodResolver(schema) });

  const onSubmit = async (values: Values): Promise<void> => {
    setIsPending(true);

    try {
      // Replace with actual API call or logic to handle the form submission
      // Navigate to a thank-you page on success (example)
      router.push('/thank-you');
    } catch (error) {
      setError('root', { type: 'server', message: 'Failed to submit enquiry' });
    } finally {
      setIsPending(false);
    }
  };

  const handleBackClick = () => {
    if (window.history.length > 2) {
      router.back();
    } else {
      router.push('/'); // Redirect to home if no history
    }
  };

  return (
    <Stack spacing={3}>
      <div className="">
      <Button onClick={handleBackClick} startIcon={<ArrowBackIcon />}>
          Back
        </Button>
      </div>
      
      <Stack direction="row" alignItems="center" spacing={2}>
       
        <Typography variant="h4">Enquiry Form</Typography>
      </Stack>
      <Typography color="text.secondary" variant="body2">
        Please fill out the form below and we'll get back to you as soon as possible.
      </Typography>

      <form onSubmit={handleSubmit(onSubmit)}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Controller
              control={control}
              name="companyName"
              render={({ field }) => (
                <FormControl fullWidth error={Boolean(errors.companyName)}>
                  <InputLabel>Company Name</InputLabel>
                  <OutlinedInput {...field} label="Company Name" />
                  {errors.companyName && <FormHelperText>{errors.companyName.message}</FormHelperText>}
                </FormControl>
              )}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <Controller
              control={control}
              name="userName"
              render={({ field }) => (
                <FormControl fullWidth error={Boolean(errors.userName)}>
                  <InputLabel>User Name</InputLabel>
                  <OutlinedInput {...field} label="User Name" />
                  {errors.userName && <FormHelperText>{errors.userName.message}</FormHelperText>}
                </FormControl>
              )}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <Controller
              control={control}
              name="phone"
              render={({ field }) => (
                <FormControl fullWidth error={Boolean(errors.phone)}>
                  <InputLabel>Phone</InputLabel>
                  <OutlinedInput {...field} label="Phone" type="tel" />
                  {errors.phone && <FormHelperText>{errors.phone.message}</FormHelperText>}
                </FormControl>
              )}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <Controller
              control={control}
              name="alternatePhone"
              render={({ field }) => (
                <FormControl fullWidth>
                  <InputLabel>Alternate Phone</InputLabel>
                  <OutlinedInput {...field} label="Alternate Phone" type="tel" />
                </FormControl>
              )}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <Controller
              control={control}
              name="email"
              render={({ field }) => (
                <FormControl fullWidth error={Boolean(errors.email)}>
                  <InputLabel>Email</InputLabel>
                  <OutlinedInput {...field} label="Email" type="email" />
                  {errors.email && <FormHelperText>{errors.email.message}</FormHelperText>}
                </FormControl>
              )}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <Controller
              control={control}
              name="website"
              render={({ field }) => (
                <FormControl fullWidth error={Boolean(errors.website)}>
                  <InputLabel>Website (Optional)</InputLabel>
                  <OutlinedInput {...field} label="Website (Optional)" type="url" />
                  {errors.website && <FormHelperText>{errors.website.message}</FormHelperText>}
                </FormControl>
              )}
            />
          </Grid>
          <Grid item xs={12}>
            <Controller
              control={control}
              name="address"
              render={({ field }) => (
                <FormControl fullWidth error={Boolean(errors.address)}>
                  <InputLabel>Address</InputLabel>
                  <OutlinedInput {...field} label="Address" multiline rows={2} />
                  {errors.address && <FormHelperText>{errors.address.message}</FormHelperText>}
                </FormControl>
              )}
            />
          </Grid>
        </Grid>

        {errors.root && <Alert severity="error">{errors.root.message}</Alert>}

        <Button disabled={isPending} type="submit" variant="contained" fullWidth sx={{ mt: 2 }}>
          Submit Enquiry
        </Button>
      </form>

      <Stack direction="row" justifyContent="center" mt={2}>
        <Typography variant="body2">
          Already a user?{' '}
          <Link href="/auth/sign-in" underline="hover" variant="subtitle2">
            Sign in
          </Link>
        </Typography>
      </Stack>
    </Stack>
  );
}
