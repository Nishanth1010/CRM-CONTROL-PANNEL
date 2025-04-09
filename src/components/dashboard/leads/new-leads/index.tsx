'use client'
import React, { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  Autocomplete,
  Box,
  Button,
  CircularProgress,
  Grid,
  Snackbar,
  TextField,
  Typography,
  InputAdornment,
} from '@mui/material';
import axios from 'axios';
import dayjs, { Dayjs } from 'dayjs';
import debounce from 'lodash.debounce';
import { z } from 'zod';
import BulkUpload from '../bulk-upload';
import { DatePicker } from '@mui/x-date-pickers';

interface Employee {
  id: number;
  name: string;
}

interface Product {
  id: number;
  name: string;
}
interface Source {
  id: number;
  source: string;
}

const leadSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().optional(),
  phone: z.string().regex(/^\d{10}$/, 'Enter a valid 10-digit phone number'),
  companyName: z.string().optional(),
  designation: z.string().optional(),
  description: z.string().min(1, 'Description is required'),
  employeeId: z.object({
    id: z.number(),
    name: z.string(),
  }),
  productIds: z.array(
    z.object({
      id: z.number(),
      name: z.string(),
    })
  ).optional(),
  source: z.object({
    id: z.number(),
    source: z.string(),
  }),
  nextFollowupDate: z.string().nullable().optional(),
  priority: z.enum(['low', 'medium', 'high']),
  status: z.enum(['NEW', 'IN_PROGRESS', 'CUSTOMER', 'REJECTED']),
  place: z.string().min(1, 'Place is required'),
});

const initialFormData = {
  name: '',
  email: '',
  phone: '',
  companyName: '',
  designation: '',
  description: '',
  employeeId: null as Employee | null,
  productIds: [] as Product[],
  status: 'NEW',
  priority: 'medium',
  nextFollowupDate: null as string | null,
  place: '',
  source: null as Source | null,
};

const NewLead: React.FC = () => {
  const [formData, setFormData] = useState(initialFormData);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [source, setSource] = useState<Source[]>([]);
  const [loadingEmployees, setLoadingEmployees] = useState(false);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [loadingSource, setLoadingSource] = useState(false);
  const [loading, setLoading] = useState(false);
  const [companyId, setCompanyId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarType, setSnackbarType] = useState<'success' | 'error'>('success');

  useEffect(() => {
    const storedCompanyId = localStorage.getItem('companyId');
    if (storedCompanyId) setCompanyId(Number(storedCompanyId));
  }, []);

  const fetchEmployees = async (inputValue: string) => {
    if (!companyId) return;
    setLoadingEmployees(true);
    try {
      const response = await axios.get(`/api/${companyId}/search-employees?search=${inputValue}`);
      setEmployees(response.data.data);
    } catch {
      setError('Failed to load employees.');
    } finally {
      setLoadingEmployees(false);
    }
  };

  const fetchProducts = async (inputValue: string) => {
    if (!companyId) return;
    setLoadingProducts(true);
    try {
      const response = await axios.get(`/api/${companyId}/search-products?search=${inputValue}`);
      setProducts(response.data.data);
    } catch {
      setError('Failed to load products.');
    } finally {
      setLoadingProducts(false);
    }
  };

  const fetchSources = async (search: string) => {
    if (!companyId) return;
    setLoadingSource(true);
    try {
      const response = await axios.get(`/api/${companyId}/sources`, {
        params: {
          search,
          page: 1,
          limit: 50,
        },
      });
      setSource(response.data.data);
    } catch (error) {
      setError('Failed to load sources.');
    } finally {
      setLoadingSource(false);
    }
  };

  const debouncedFetchEmployees = useCallback(debounce(fetchEmployees, 500), [companyId]);
  const debouncedFetchProducts = useCallback(debounce(fetchProducts, 500), [companyId]);
  const debouncedFetchSources = useCallback(debounce(fetchSources, 500), [companyId]);

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
    setError(null);
    setSuccessMessage(null);
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const resetForm = () => {
    setFormData(initialFormData);
    setValidationErrors({});
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMessage(null);

    const parsedData = leadSchema.safeParse(formData);
    if (!parsedData.success) {
      const newErrors: Record<string, string> = {};
      parsedData.error.errors.forEach((err) => {
        if (err.path[0]) newErrors[err.path[0] as string] = err.message;
      });
      setValidationErrors(newErrors);
      setLoading(false);
      return;
    }

    const newLead = {
      ...formData,
      employeeId: formData.employeeId?.id || null,
      sourceId: formData.source?.id || null,
      productIds: formData.productIds.map((product) => product.id),
      nextFollowupDate: formData.nextFollowupDate ? `${formData.nextFollowupDate}T00:00:00Z` : null,
    };

    try {
      const res = await axios.post(`/api/${companyId}/lead`, newLead);
      setSuccessMessage(res.data.message);
      setSnackbarType('success');
      setSnackbarOpen(true);
      resetForm();
    } catch (error: any) {
      setError(error.response?.data.message || 'An error occurred while creating the lead.');
      setSnackbarType('error');
      setSnackbarOpen(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        maxWidth: '700px',
        maxHeight: '100vh',
        overflowY: 'auto',
        marginX: 'auto',
        padding: '20px',
        boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.1)',
        borderRadius: 3,
        backgroundColor: 'white',
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h5">Create New Lead</Typography>
        <BulkUpload companyId={companyId} />
      </Box>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert onClose={handleSnackbarClose} severity={snackbarType} sx={{ width: '100%' }}>
          {snackbarType === 'error' ? error : successMessage}
        </Alert>
      </Snackbar>

      <form onSubmit={handleSubmit}>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Name"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              error={!!validationErrors.name}
              helperText={validationErrors.name}
              required
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              fullWidth
              label="Phone"
              value={formData.phone}
              onChange={(e) =>
                handleInputChange('phone', e.target.value.replace(/\D/g, '').slice(0, 10))
              }
              error={!!validationErrors.phone}
              helperText={validationErrors.phone}
              InputProps={{ startAdornment: <InputAdornment position="start">+91</InputAdornment> }}
              required
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              fullWidth
              label="Email"
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              error={!!validationErrors.email}
              helperText={validationErrors.email}
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              fullWidth
              label="Company Name"
              value={formData.companyName}
              onChange={(e) => handleInputChange('companyName', e.target.value)}
              error={!!validationErrors.companyName}
              helperText={validationErrors.companyName}
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              fullWidth
              label="Designation"
              value={formData.designation}
              onChange={(e) => handleInputChange('designation', e.target.value)}
              error={!!validationErrors.designation}
              helperText={validationErrors.designation}
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              fullWidth
              label="Place"
              value={formData.place}
              onChange={(e) => handleInputChange('place', e.target.value)}
              error={!!validationErrors.place}
              helperText={validationErrors.place}
              required
            />
          </Grid>
          <Grid item xs={6}>
            <Autocomplete
              autoHighlight
              options={employees}
              getOptionLabel={(option) => option.name}
              value={formData.employeeId}
              onChange={(event, newValue) => handleInputChange('employeeId', newValue)}
              onInputChange={(event, inputValue) => debouncedFetchEmployees(inputValue)}
              onFocus={() => debouncedFetchEmployees('')}
              loading={loadingEmployees}
              ListboxProps={{
                style: {
                  maxHeight: '200px',
                  overflow: 'auto',
                },
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Assign to Employee"
                  fullWidth
                  required
                  InputProps={{
                    ...params.InputProps,
                    endAdornment: (
                      <>
                        {loadingEmployees ? <CircularProgress size={20} /> : null}
                        {params.InputProps.endAdornment}
                      </>
                    ),
                  }}
                />
              )}
            />
          </Grid>
          <Grid item xs={6}>
            <Autocomplete
              autoHighlight
              options={source}
              getOptionLabel={(option) => option.source}
              value={formData.source}
              onChange={(event, newValue) => handleInputChange('source', newValue)}
              onInputChange={(event, inputValue) => debouncedFetchSources(inputValue)}
              onFocus={() => debouncedFetchSources('')}
              loading={loadingSource}
              ListboxProps={{
                style: {
                  maxHeight: '200px',
                  overflow: 'auto',
                },
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Source"
                  fullWidth
                  required
                  InputProps={{
                    ...params.InputProps,
                    endAdornment: (
                      <>
                        {loadingSource ? <CircularProgress size={20} /> : null}
                        {params.InputProps.endAdornment}
                      </>
                    ),
                  }}
                />
              )}
            />
          </Grid>

          <Grid item xs={6}>
            <TextField
              fullWidth
              select
              label="Priority"
              value={formData.priority}
              onChange={(e) => handleInputChange('priority', e.target.value)}
              SelectProps={{ native: true }}
              required
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </TextField>
          </Grid>

          <Grid item xs={12}>
            <Autocomplete
              autoHighlight
              multiple
              options={products}
              getOptionLabel={(option) => option.name}
              value={formData.productIds}
              onChange={(event, newValue) => handleInputChange('productIds', newValue)}
              onOpen={() => debouncedFetchProducts("")}
              onInputChange={(e, value) => debouncedFetchProducts(value)}
              loading={loadingProducts}
              ListboxProps={{
                style: {
                  maxHeight: '200px',
                  overflow: 'auto',
                },
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Select Products"
                  placeholder="Select multiple products"
                  InputProps={{
                    ...params.InputProps,
                    endAdornment: (
                      <>
                        {loadingProducts ? <CircularProgress size={20} /> : null}
                        {params.InputProps.endAdornment}
                      </>
                    ),
                  }}
                />
              )}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              multiline
              rows={2}
              error={!!validationErrors.description}
              helperText={validationErrors.description}
              required
            />
          </Grid>
          <Grid item xs={6}>
            <DatePicker
              label="Next Follow Up Date"
              format="DD MM YYYY"
              value={formData.nextFollowupDate ? dayjs(formData.nextFollowupDate) : null}
              onChange={(newValue: Dayjs | null) => handleInputChange('nextFollowupDate', newValue ? newValue.format('YYYY-MM-DD') : null)}
              slotProps={{ textField: { fullWidth: true } }}
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              fullWidth
              disabled
              select
              label="Status"
              value={formData.status}
              onChange={(e) => handleInputChange('status', e.target.value)}
              SelectProps={{ native: true }}
              required
            >
              <option value="NEW">New</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="CUSTOMER">Customer</option>
              <option value="REJECTED">Rejected</option>
            </TextField>
          </Grid>
          <Grid item xs={12}>
            <Button type="submit" variant="contained" color="primary" fullWidth disabled={loading}>
              {loading ? <CircularProgress size={24} /> : 'Create Lead'}
            </Button>
          </Grid>
        </Grid>
      </form>
    </Box>
  );
};

export default NewLead;