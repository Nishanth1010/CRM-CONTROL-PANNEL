'use client';

import * as React from 'react';
import { useState } from 'react';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import {
  Alert,
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  CardHeader,
  CircularProgress,
  Divider,
  FormControl,
  IconButton,
  InputAdornment,
  InputLabel,
  OutlinedInput,
  Snackbar,
  Stack,
  Typography,
} from '@mui/material';
import axios from 'axios';

export function UpdatePasswordForm(): React.JSX.Element {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error'>('success');
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const toggleVisibility = (setter: React.Dispatch<React.SetStateAction<boolean>>) => () => {
    setter((show) => !show);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);

    if (newPassword !== confirmPassword) {
      setSnackbarSeverity('error');
      setSnackbarMessage('New password and confirmation password do not match');
      setSnackbarOpen(true);
      setLoading(false);
      return;
    }

    if (newPassword.length < 8) {
      setSnackbarSeverity('error');
      setSnackbarMessage('New password should be at least 8 characters long');
      setSnackbarOpen(true);
      setLoading(false);
      return;
    }

    const companyId = localStorage.getItem('companyId');
    const employeeId = localStorage.getItem('userId');
    const role = localStorage.getItem('role');

    if (!companyId || !employeeId || !role) {
      setSnackbarSeverity('error');
      setSnackbarMessage('Required user information is missing');
      setSnackbarOpen(true);
      setLoading(false);
      return;
    }

    try {
      const response = await axios.patch(`/api/company/${companyId}/employees/password`, {
        currentPassword,
        newPassword,
        employeeId,
        role,
      });

      if (response.data.success) {
        setSnackbarSeverity('success');
        setSnackbarMessage('Password updated successfully!');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        setSnackbarSeverity('error');
        setSnackbarMessage(response.data.message || 'Failed to update password');
      }
    } catch (error) {
      setSnackbarSeverity('error');
      setSnackbarMessage('An error occurred while updating the password');
      console.error('Error updating password:', error);
    } finally {
      setSnackbarOpen(true);
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        backgroundColor: '#f5f5f5',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 5,

      }}
    >
      <Card
        sx={{
          maxWidth: 600,
          width: '100%',
          boxShadow: '0px 10px 30px rgba(0,0,0,0.1)',
          margin: 'auto',
        }}
      >
        <CardHeader
          title={<Typography variant="h4" fontWeight="bold">Update Password</Typography>}
          subheader={<Typography variant="body2" color="text.secondary">Ensure a strong password to keep your account secure</Typography>}
          sx={{ textAlign: 'center', paddingBottom: 0 }}
        />
        <Divider sx={{ marginBottom: 2 }} />
        <CardContent>
          <Stack spacing={3} component="form" onSubmit={handleSubmit}>
            <FormControl fullWidth variant="outlined">
              <InputLabel>Current Password</InputLabel>
              <OutlinedInput
                label="Current Password"
                type={showCurrentPassword ? 'text' : 'password'}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                endAdornment={
                  <InputAdornment position="end">
                    <IconButton onClick={toggleVisibility(setShowCurrentPassword)} edge="end">
                      {showCurrentPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                }
              />
            </FormControl>
            <FormControl fullWidth variant="outlined">
              <InputLabel>New Password</InputLabel>
              <OutlinedInput
                label="New Password"
                type={showNewPassword ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                endAdornment={
                  <InputAdornment position="end">
                    <IconButton onClick={toggleVisibility(setShowNewPassword)} edge="end">
                      {showNewPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                }
              />
            </FormControl>
            <FormControl fullWidth variant="outlined">
              <InputLabel>Confirm New Password</InputLabel>
              <OutlinedInput
                label="Confirm New Password"
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                endAdornment={
                  <InputAdornment position="end">
                    <IconButton onClick={toggleVisibility(setShowConfirmPassword)} edge="end">
                      {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                }
              />
            </FormControl>
            <Box textAlign="center" mt={2}>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                sx={{
                  padding: '12px 24px',
                  fontSize: '1rem',
                  fontWeight: 'bold',
                  textTransform: 'none',
                  borderRadius: 2,
                  backgroundImage: 'linear-gradient(45deg, #3f51b5, #1e88e5)',
                  boxShadow: '0px 5px 15px rgba(33, 150, 243, 0.4)',
                }}
                disabled={loading}
              >
                {loading ? <CircularProgress size={24} color="inherit" /> : 'Update Password'}
              </Button>
            </Box>
          </Stack>
        </CardContent>
      </Card>

      {/* Snackbar with Alert */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={4000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert onClose={() => setSnackbarOpen(false)} severity={snackbarSeverity} sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
}
