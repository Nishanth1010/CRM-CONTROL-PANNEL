import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Button,
  TextField,
  Grid,
  Snackbar,
  Alert,
  CircularProgress,
  MenuItem,
} from '@mui/material';
import axios from 'axios';
import  CategoryAutocomplete  from '../common/category-autocomplete';
interface Customer {
  id: string;
  customerName: string;
  categoryId?: string;
  category?: Category;
  email: string;
  address: string;
  stateDistrictPin: string;
  gstNumber: string;
  cinNumber: string;
  businessLegalName: string;
  authorizedPersonName: string;
  mobileNumber: string;
  whatsappNumber: string;
}

interface Category {
  id: string;
  categoryName: string;
}

interface EditCustomerModalProps {
  customer: Customer;
  onClose: () => void;
  onUpdate: (updatedCustomer: Customer) => void;
  companyId: string | null;
}

const EditCustomerModal: React.FC<EditCustomerModalProps> = ({ customer, onClose, onUpdate, companyId }) => {
  const [formData, setFormData] = useState(customer);
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [categories, setCategories] = useState<Category[]>([]); // State to store categories

  // Fetch categories when the modal opens
  useEffect(() => {
    const fetchCategories = async () => {
      if (companyId) {
        try {
          const response = await axios.get(`/api/${companyId}/category`);
          setCategories(response.data.data);
        } catch (error) {
          console.error('Error fetching categories:', error);
          setSnackbar({ open: true, message: 'Failed to fetch categories.', severity: 'error' });
        }
      }
    };

    fetchCategories();
  }, [companyId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    // Restrict input based on field type
    if (name === 'mobileNumber' || name === 'whatsappNumber') {
      if (!/^[0-9]{0,10}$/.test(value)) return; // Only allow up to 10 digits
    } else if (name === 'gstNumber') {
      if (value.length > 15) return; // Only allow up to 15 characters
    } else if (name === 'cinNumber') {
      if (value.length > 21) return; // Only allow up to 21 characters
    }

    setFormData({ ...formData, [name]: value });
    setErrors({ ...errors, [name]: '' }); // Clear error for the field
  };

  const handleCategoryChange = (categoryId: string | null) => {
    setFormData({ ...formData, categoryId: categoryId || undefined });
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    // Required fields
    if (!formData.customerName) newErrors.customerName = 'Customer name is required.';
    if (!formData.email) newErrors.email = 'Email is required.';

    // Mobile number validation
    if (!formData.mobileNumber) {
      newErrors.mobileNumber = 'Mobile number is required.';
    } else if (!/^[0-9]{10}$/.test(formData.mobileNumber)) {
      newErrors.mobileNumber = 'Mobile number must be exactly 10 digits.';
    }

    // WhatsApp number validation
    if (formData.whatsappNumber && !/^[0-9]{10}$/.test(formData.whatsappNumber)) {
      newErrors.whatsappNumber = 'WhatsApp number must be exactly 10 digits.';
    }

    // GST number validation
    if (formData.gstNumber && formData.gstNumber.length !== 15) {
      newErrors.gstNumber = 'GST number must be exactly 15 characters.';
    }

    // CIN number validation
    if (formData.cinNumber && formData.cinNumber.length !== 21) {
      newErrors.cinNumber = 'CIN number must be exactly 21 characters.';
    }

    setErrors(newErrors);
    return newErrors;
  };

  const handleSubmit = async () => {
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setSnackbar({ open: true, message: 'Please fix the errors before submitting.', severity: 'error' });
      return;
    }

    setLoading(true);
    try {
      const { category, ...formDataWithoutCategory } = formData;
      const response = await axios.put(`/api/${companyId}/customers?id=${customer.id}`, formDataWithoutCategory);
      onUpdate({
        ...response.data,
        category: categories.find((cat) => cat.id === formData.categoryId), // Include the updated category
      });
      setSnackbar({ open: true, message: 'Customer updated successfully!', severity: 'success' });
      onClose();
    } catch (error) {
      console.error('Failed to update customer:', error);
      setSnackbar({ open: true, message: 'Failed to update customer.', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleSnackbarClose = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  return (
    <>
      <Dialog open onClose={onClose} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Customer</DialogTitle>
        <DialogContent>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Customer Name"
                name="customerName"
                value={formData.customerName}
                onChange={handleChange}
                margin="normal"
                fullWidth
                required
                error={!!errors.customerName}
                helperText={errors.customerName}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                margin="normal"
                fullWidth
                required
                error={!!errors.email}
                helperText={errors.email}
              />
            </Grid>
             {/* Category Autocomplete */}
             <Grid item xs={12} sm={6}>
              {companyId && (
                <CategoryAutocomplete
                  companyId={companyId}
                  selectedCategoryId={formData.categoryId || null}
                  setSelectedCategoryId={handleCategoryChange}
                />
              )}
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Address"
                name="address"
                value={formData.address}
                onChange={handleChange}
                fullWidth
                multiline
                rows={2}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="State, District, PIN (Comma Separated)"
                name="stateDistrictPin"
                value={formData.stateDistrictPin}
                onChange={handleChange}
                fullWidth
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="GST Number"
                name="gstNumber"
                value={formData.gstNumber}
                onChange={handleChange}
                fullWidth
                error={!!errors.gstNumber}
                helperText={errors.gstNumber}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="CIN Number"
                name="cinNumber"
                value={formData.cinNumber}
                onChange={handleChange}
                fullWidth
                error={!!errors.cinNumber}
                helperText={errors.cinNumber}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Business Legal Name"
                name="businessLegalName"
                value={formData.businessLegalName}
                onChange={handleChange}
                fullWidth
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Authorized Person Name"
                name="authorizedPersonName"
                value={formData.authorizedPersonName}
                onChange={handleChange}
                fullWidth
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Mobile Number"
                name="mobileNumber"
                value={formData.mobileNumber}
                onChange={handleChange}
                fullWidth
                error={!!errors.mobileNumber}
                helperText={errors.mobileNumber}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="WhatsApp Number"
                name="whatsappNumber"
                value={formData.whatsappNumber}
                onChange={handleChange}
                fullWidth
                error={!!errors.whatsappNumber}
                helperText={errors.whatsappNumber}
              />
            </Grid>
           
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} color="secondary">
            Cancel
          </Button>
          <Button onClick={handleSubmit} color="primary" variant="contained" disabled={loading}>
            {loading ? <CircularProgress size={20} /> : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert onClose={handleSnackbarClose} severity={snackbar.severity as 'success' | 'error' | 'warning' | 'info'} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default EditCustomerModal;