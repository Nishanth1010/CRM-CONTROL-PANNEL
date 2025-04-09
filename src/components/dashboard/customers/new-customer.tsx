'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  Button,
  Grid,
  Typography,
  Divider,
  Tooltip,
  InputAdornment,
  Snackbar,
  Alert,
  CircularProgress,
} from '@mui/material';
import { Email, Phone, LocationOn, Person, Business, WhatsApp } from '@mui/icons-material';
import axios from 'axios';
import CategoryAutocomplete from '../common/category-autocomplete';

const CreateCustomerForm = () => {
  const [formData, setFormData] = useState({
    customerName: '',
    email: '',
    address: '',
    stateDistrictPin: '',
    gstNumber: '',
    cinNumber: '',
    businessLegalName: '',
    authorizedPersonName: '',
    mobileNumber: '',
    whatsappNumber: '',
  });

  const [companyId, setCompanyId] = useState<string | null>(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null); // Add category state
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    const storedCompanyId = localStorage.getItem('companyId');
    setCompanyId(storedCompanyId);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    if (name === 'mobileNumber' || name === 'whatsappNumber') {
      if (!/^[0-9]*$/.test(value)) return;
    }

    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};
    if (!formData.customerName) newErrors.customerName = 'Customer name is required.';
    if (!formData.email) newErrors.email = 'Email is required.';
    if (!formData.mobileNumber) {
      newErrors.mobileNumber = 'Mobile number is required.';
    } else if (!/^[0-9]{10}$/.test(formData.mobileNumber)) {
      newErrors.mobileNumber = 'Mobile number must be exactly 10 digits.';
    }
    if (formData.whatsappNumber && !/^[0-9]{10}$/.test(formData.whatsappNumber)) {
      newErrors.whatsappNumber = 'WhatsApp number must be exactly 10 digits.';
    }
    if (formData.gstNumber && formData.gstNumber.length !== 15) {
      newErrors.gstNumber = 'GST number must be exactly 15 characters.';
    }
    return newErrors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      setSnackbar({ open: true, message: 'Please fix the errors before submitting.', severity: 'error' });
      return;
    }

    if (!companyId) {
      setSnackbar({ open: true, message: 'Company ID not found.', severity: 'error' });
      return;
    }

    setErrors({});
    setLoading(true);

    try {
      await axios.post(`/api/${companyId}/customers`, {
        ...formData,
        categoryId: selectedCategoryId, // Include categoryId in request
      });

      setSnackbar({ open: true, message: 'Customer created successfully!', severity: 'success' });

      setFormData({
        customerName: '',
        email: '',
        address: '',
        stateDistrictPin: '',
        gstNumber: '',
        cinNumber: '',
        businessLegalName: '',
        authorizedPersonName: '',
        mobileNumber: '',
        whatsappNumber: '',
      });
    } catch (error: any) {
      setSnackbar({
        open: true,
        message: error.response?.data?.error || 'An error occurred while creating the customer.',
        severity: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSnackbarClose = () => setSnackbar((prev) => ({ ...prev, open: false }));

  return (
    <Box
      component="form"
      onSubmit={handleSubmit}
      sx={{
        display: 'flex',
        flexDirection: 'column',
        // justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',

        padding: 3,
        backgroundColor: '#ffffff',
      }}
    >
      <Box
        sx={{
          maxWidth: 700,
          width: '100%',
          padding: 4,
          borderRadius: 4,
          boxShadow: '0px 4px 16px rgba(0, 0, 0, 0.1)',
          backgroundColor: '#ffffff',
        }}
      >
        <Typography variant="h5" mb={3}>Create Customer</Typography>
    
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Customer Name"
              name="customerName"
              value={formData.customerName}
              onChange={handleInputChange}
              variant="outlined"
              required
              error={!!errors.customerName}
              helperText={errors.customerName}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Person />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Email ID"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              type="email"
              variant="outlined"
              required
              error={!!errors.email}
              helperText={errors.email}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Email />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item xs={12}>
            <CategoryAutocomplete companyId={companyId || ''} selectedCategoryId={selectedCategoryId} setSelectedCategoryId={setSelectedCategoryId} />
          </Grid>
          <Grid item xs={12}>
            <Tooltip title="Maximum 30 characters allowed">
              <TextField
                fullWidth
                label="Address"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                inputProps={{ maxLength: 30 }}
                variant="outlined"
                required
              />
            </Tooltip>
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="District, State, PIN (Comma Separated)"
              required
              name="stateDistrictPin"
              value={formData.stateDistrictPin}
              onChange={handleInputChange}
              variant="outlined"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LocationOn />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              required
              fullWidth
              label="GST Number"
              name="gstNumber"
              value={formData.gstNumber}
              onChange={handleInputChange}
              variant="outlined"
              inputProps={{ maxLength: 15 }}
              error={!!errors.gstNumber}
              helperText={errors.gstNumber}
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              fullWidth
              label="CIN Number"
              name="cinNumber"
              inputProps={{ maxLength: 21 }}
              value={formData.cinNumber}
              onChange={handleInputChange}
              variant="outlined"
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Business Legal Name"
              name="businessLegalName"
              value={formData.businessLegalName}
              onChange={handleInputChange}
              variant="outlined"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Business />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              fullWidth
              label="Authorized Account Person Name"
              name="authorizedPersonName"
              value={formData.authorizedPersonName}
              onChange={handleInputChange}
              variant="outlined"
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              fullWidth
              label="Mobile Number"
              name="mobileNumber"
              value={formData.mobileNumber}
              onChange={handleInputChange}
              type="tel"
              variant="outlined"
              required
              inputProps={{ maxLength: 10 }}
              error={!!errors.mobileNumber}
              helperText={errors.mobileNumber}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Phone />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              fullWidth
              label="WhatsApp Number"
              name="whatsappNumber"
              value={formData.whatsappNumber}
              onChange={handleInputChange}
              type="tel"
              variant="outlined"
              inputProps={{ maxLength: 10 }}
              error={!!errors.whatsappNumber}
              helperText={errors.whatsappNumber}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <WhatsApp />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item xs={12}>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              fullWidth
              sx={{
                padding: 1,
                backgroundColor: '#1976d2',
                '&:hover': { backgroundColor: '#1565c0' },
              }}
              disabled={loading}
              startIcon={loading ? <CircularProgress size={20} /> : null}
            >
              {loading ? 'Submitting...' : 'Create Customer'}
            </Button>
          </Grid>
        </Grid>
        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={handleSnackbarClose}
          anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        >
          <Alert onClose={handleSnackbarClose} severity={snackbar.severity as any} sx={{ width: '100%' }}>
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Box>
    </Box>
  );
};

export default CreateCustomerForm;
