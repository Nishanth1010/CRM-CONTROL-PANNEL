import React, { useEffect, useState } from 'react';
import {
  Alert,
  Autocomplete,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Grid,
  Snackbar,
  TextField,
  Typography,
} from '@mui/material';
import axios from 'axios';

enum LeadStatus {
  NEW = 'NEW',
  IN_PROGRESS = 'IN_PROGRESS',
  CUSTOMER = 'CUSTOMER',
  REJECTED = 'REJECTED',
}

interface Employee {
  id: number;
  name: string;
}

interface Lead {
  id: number;
  name: string;
  email: string;
  phone: string;
  companyName: string;
  status: LeadStatus;
  priority: string;
  company: { name: string };
  employee: Employee | null;
  products: Product[];
  source: Source | null;
  designation: string;
  place: string;
  description: string;
  nextFollowupDate?: string | Date | null;
}

interface Source {
  id: number;
  source: string;
}

interface Product {
  id: number;
  name: string;
}

interface EditLeadModalProps {
  lead: Lead | null;
  open: boolean;
  onClose: () => void;
  onSubmit: (lead: Lead) => void;
}

const EditLeadModal: React.FC<EditLeadModalProps> = ({ lead, open, onClose, onSubmit }) => {
  const [companyId, setCompanyId] = useState<number | null>(null);
  const [formValues, setFormValues] = useState<Lead | null>(null);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [sources, setSources] = useState<Source[]>([]);
  const [errorMessages, setErrorMessages] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loadingEmployees, setLoadingEmployees] = useState(false);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [loadingSource, setLoadingSource] = useState(false);

  // Retrieve company ID from local storage on mount
  useEffect(() => {
    const storedCompanyId = localStorage.getItem('companyId');
    if (storedCompanyId) {
      setCompanyId(Number(storedCompanyId));
    } else {
      console.error('Company ID not found in local storage.');
    }
  }, []);

  useEffect(() => {
    setFormValues(lead);
  }, [lead]);

  // Fetch all employees, products, and sources when modal opens
  useEffect(() => {
    if (open && companyId !== null) {
      fetchAllEmployees();
      fetchAllProducts();
      fetchAllSources();
    }
  }, [open, companyId]);

  const fetchAllEmployees = async () => {
    setLoadingEmployees(true);
    try {
      const response = await axios.get(`/api/${companyId}/employees`);
      setEmployees(response.data.data);
    } catch (error) {
      setApiError('Failed to load employees.');
    } finally {
      setLoadingEmployees(false);
    }
  };

  const fetchAllProducts = async () => {
    setLoadingProducts(true);
    try {
      const response = await axios.get(`/api/${companyId}/products`);
      setProducts(response.data.data);
    } catch (error) {
      setApiError('Failed to load products.');
    } finally {
      setLoadingProducts(false);
    }
  };

  const fetchAllSources = async () => {
    setLoadingSource(true);
    try {
      const response = await axios.get(`/api/${companyId}/sources`);
      setSources(response.data.data);
    } catch (error) {
      setApiError('Failed to load sources.');
    } finally {
      setLoadingSource(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormValues((prevValues) => (prevValues ? { ...prevValues, [name]: value } : prevValues));
  };

  const handleEmployeeChange = (event: any, newValue: Employee | null) => {
    setFormValues((prevValues) => (prevValues ? { ...prevValues, employee: newValue } : prevValues));
  };

  const handleProductChange = (event: any, newValue: Product[]) => {
    setFormValues((prevValues) => (prevValues ? { ...prevValues, products: newValue } : prevValues));
  };

  const handleSourceChange = (event: any, newValue: Source | null) => {
    setFormValues((prevValues) => (prevValues ? { ...prevValues, source: newValue } : prevValues));
  };

  const handleSave = async () => {
    if (!formValues || !validateForm()) return;

    setLoading(true);
    setApiError(null);

    try {
      const response = await axios.put(`/api/${companyId}/lead?leadId=${lead?.id}`, {
        ...formValues,
        employeeId: formValues.employee?.id,
        sourceId: formValues.source?.id,
        productIds: formValues.products.map((product) => product.id),
        nextFollowupDate: formValues.nextFollowupDate ? new Date(formValues.nextFollowupDate).toISOString() : null,
      });

      setSuccess(true);
      onSubmit(response.data);
      onClose();
    } catch (error) {
      setApiError('Failed to save changes. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const validateForm = (): boolean => {
    const errors: { [key: string]: string } = {};
    let valid = true;

    if (!formValues?.name) {
      errors.name = 'Name is required';
      valid = false;
    }

    if (!formValues?.phone) {
      errors.phone = 'Phone is required';
      valid = false;
    }
   
    setErrorMessages(errors);
    return valid;
  };

  if (!formValues || companyId === null) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Edit Lead</DialogTitle>
      <DialogContent>
        <DialogContentText>Edit the lead details below:</DialogContentText>
        <Grid container spacing={1} sx={{ mt: 1 }}>
          {/* Name */}
          <Grid item xs={12}>
            <TextField
              name="name"
              label="Name"
              placeholder="Enter name"
              fullWidth
              value={formValues.name}
              onChange={handleInputChange}
              error={!!errorMessages.name}
              helperText={errorMessages.name}
              variant="outlined"
              margin="normal"
            />
          </Grid>

          {/* Phone (disabled) and Email */}
          <Grid item xs={6}>
            <TextField
              name="phone"
              label="Phone"
              disabled
              fullWidth
              value={formValues.phone}
              error={!!errorMessages.phone}
              helperText={errorMessages.phone}
              variant="outlined"
              margin="normal"
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              name="email"
              label="Email"
              placeholder="Enter email"
              fullWidth
              value={formValues.email}
              onChange={handleInputChange}
              error={!!errorMessages.email}
              helperText={errorMessages.email}
              variant="outlined"
              margin="normal"
            />
          </Grid>

          {/* Company Name and Designation */}
          <Grid item xs={6}>
            <TextField
              name="companyName"
              label="Company Name"
              placeholder="Enter company name"
              fullWidth
              value={formValues.companyName}
              onChange={handleInputChange}
              error={!!errorMessages.companyName}
              helperText={errorMessages.companyName}
              variant="outlined"
              margin="normal"
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              name="designation"
              label="Designation"
              placeholder="Enter designation"
              fullWidth
              value={formValues.designation}
              onChange={handleInputChange}
              variant="outlined"
              margin="normal"
            />
          </Grid>

          {/* Employee Autocomplete */}
          <Grid item xs={6}>
            <Autocomplete
              options={employees}
              getOptionLabel={(option) => option.name}
              value={formValues.employee}
              onChange={handleEmployeeChange}
              loading={loadingEmployees}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Assign to Employee"
                  variant="outlined"
                  required
                  margin="normal"
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
              sx={{ '& .MuiInputBase-root': { height: '56px' } }}
            />
          </Grid>

          {/* Source Autocomplete */}
          <Grid item xs={6}>
            <Autocomplete
              options={sources}
              getOptionLabel={(option) => option.source}
              value={formValues.source}
              onChange={handleSourceChange}
              loading={loadingSource}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Source"
                  variant="outlined"
                  required
                  margin="normal"
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
              sx={{ '& .MuiInputBase-root': { height: '56px' } }}
            />
          </Grid>

          {/* Priority Dropdown */}
          <Grid item xs={6}>
            <TextField
              fullWidth
              select
              label="Priority"
              name="priority"
              value={formValues.priority || ''}
              onChange={handleInputChange}
              SelectProps={{ native: true }}
              required
              margin="normal"
              sx={{ '& .MuiInputBase-root': { height: '56px' } }}
            >
              <option value="" disabled>
                Select Priority
              </option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </TextField>
          </Grid>

          {/* Place Field */}
          <Grid item xs={12}>
            <TextField
              name="place"
              label="Place"
              fullWidth
              value={formValues.place || ''}
              onChange={handleInputChange}
              variant="outlined"
              margin="normal"
            />
          </Grid>

          {/* Products Autocomplete */}
          <Grid item xs={12}>
            <Autocomplete
              multiple
              options={products}
              getOptionLabel={(option) => option.name}
              value={formValues.products}
              onChange={handleProductChange}
              loading={loadingProducts}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Products"
                  placeholder="Select products"
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

          {/* Description */}
          <Grid item xs={12}>
            <TextField
              name="description"
              label="Description"
              placeholder="Enter description"
              fullWidth
              multiline
              rows={3}
              value={formValues.description}
              onChange={handleInputChange}
              variant="outlined"
              margin="normal"
            />
          </Grid>

          {/* Display API Error */}
          {apiError && (
            <Grid item xs={12}>
              <Typography color="error">{apiError}</Typography>
            </Grid>
          )}
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="secondary" variant="outlined">
          Cancel
        </Button>
        <Button onClick={handleSave} color="primary" variant="contained" disabled={loading}>
          {loading ? <CircularProgress size={24} /> : 'Save'}
        </Button>
      </DialogActions>

      {/* Success Snackbar */}
      <Snackbar open={success} autoHideDuration={3000} onClose={() => setSuccess(false)}>
        <Alert onClose={() => setSuccess(false)} severity="success">
          Lead updated successfully!
        </Alert>
      </Snackbar>
    </Dialog>
  );
};

export default EditLeadModal;