'use client';

import React, { useState, useEffect, FormEvent } from 'react';
import axios from 'axios';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';
import CircularProgress from '@mui/material/CircularProgress';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Divider from '@mui/material/Divider';
import InputAdornment from '@mui/material/InputAdornment';

// Types
type SnackbarState = {
  open: boolean;
  message: string;
  severity: 'success' | 'error';
};

type CustomerOption = {
  id: string; // Customer ID
  customerName: string; // Customer Name
};

type DealPayload = {
  customerId: string; // Send customerId instead of customerName
  requirement: string;
  dealValue: number;
  dealApprovalValue: number;
  advancePayment: number;
  balanceAmount: number;
};

const DealCreateForm: React.FC = () => {
  // State variables
  const [customerName, setCustomerName] = useState<string>(''); // Autocomplete input value
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null); // Selected customerId
  const [requirement, setRequirement] = useState<string>(''); // Requirement input
  const [dealValue, setDealValue] = useState<number | ''>(''); // Deal Value input
  const [dealApprovalValue, setDealApprovalValue] = useState<number | ''>(''); // Deal Approval Value input
  const [advancePayment, setAdvancePayment] = useState<number | ''>(''); // Advance Payment input
  const [balanceAmount, setBalanceAmount] = useState<number>(0); // Balance Amount input (calculated)
  const [customerOptions, setCustomerOptions] = useState<CustomerOption[]>([]); // Customer autocomplete options
  const [loading, setLoading] = useState<boolean>(false); // Loader state for autocomplete
  const [snackbar, setSnackbar] = useState<SnackbarState>({
    open: false,
    message: '',
    severity: 'success',
  });
  const [advancePaymentError, setAdvancePaymentError] = useState<string>(''); // Error message for advance payment
  const [dealApprovalError, setDealApprovalError] = useState<string>(''); // Error message for deal approval value
  const [showHelperText, setShowHelperText] = useState<boolean>(false); // State for showing helper text

  // Get company ID from local storage
  const companyId = localStorage.getItem('companyId');

  // Fetch customer names for autocomplete
  useEffect(() => {
    const fetchCustomers = async () => {
      if (!customerName) return;

      setLoading(true); // Start loader
      try {
        const response = await axios.get<CustomerOption[]>(
          `/api/${companyId}/customers/search?query=${customerName}`
        );
        setCustomerOptions(response.data); // Expecting [{ id, customerName }]
      } catch (error) {
        console.error('Failed to fetch customer names:', error);
      } finally {
        setLoading(false); // Stop loader
      }
    };

    fetchCustomers();
  }, [customerName, companyId]);

  // Calculate balance amount when dealApprovalValue or advancePayment changes
  useEffect(() => {
    if (typeof dealApprovalValue === 'number' && typeof advancePayment === 'number') {
      const balance = dealApprovalValue - advancePayment;
      setBalanceAmount(balance >= 0 ? balance : 0); // Prevent negative values
    }
  }, [dealApprovalValue, advancePayment]);

  // Validate advance payment
  useEffect(() => {
    if (typeof advancePayment === 'number' && typeof dealApprovalValue === 'number') {
      if (advancePayment > dealApprovalValue) {
        setAdvancePaymentError('Advance payment cannot exceed the deal approval value.');
      } else {
        setAdvancePaymentError('');
      }
    }
  }, [advancePayment, dealApprovalValue]);

  // Validate Deal Approval Value
  useEffect(() => {
    if (typeof dealApprovalValue === 'number' && typeof dealValue === 'number') {
      if (dealApprovalValue > dealValue) {
        setDealApprovalError('Deal approval value cannot exceed the deal value.');
      } else {
        setDealApprovalError('');
      }
    }
  }, [dealApprovalValue, dealValue]);

  // Handle form submission
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!selectedCustomerId) {
      setSnackbar({ open: true, message: 'Please select a valid customer.', severity: 'error' });
      return;
    }

    if (advancePaymentError || dealApprovalError) {
      setSnackbar({ open: true, message: advancePaymentError || dealApprovalError, severity: 'error' });
      return;
    }

    try {
      const payload: DealPayload = {
        customerId: selectedCustomerId, // Send customerId instead of customerName
        requirement,
        dealValue: dealValue as number,
        dealApprovalValue: dealApprovalValue as number,
        advancePayment: advancePayment as number,
        balanceAmount,
      };

      await axios.post(`/api/${companyId}/deals`, payload);

      // Show success snackbar
      setSnackbar({ open: true, message: 'Deal created successfully!', severity: 'success' });

      // Reset fields
      resetForm();
    } catch (error) {
      setSnackbar({ open: true, message: 'Error creating deal', severity: 'error' });
    }
  };

  // Reset form fields
  const resetForm = () => {
    setCustomerName('');
    setSelectedCustomerId(null);
    setRequirement('');
    setDealValue('');
    setDealApprovalValue('');
    setAdvancePayment('');
    setBalanceAmount(0);
    setAdvancePaymentError('');
    setDealApprovalError('');
  };

  const [showHelperTextCustomer, setShowHelperTextCustomer] = useState<boolean>(false);
  const [showHelperTextRequirement, setShowHelperTextRequirement] = useState<boolean>(false);
  const [showHelperTextDealValue, setShowHelperTextDealValue] = useState<boolean>(false);
  const [showHelperTextAdvancePayment, setShowHelperTextAdvancePayment] = useState<boolean>(false);
  const [showHelperTextBalance, setShowHelperTextBalance] = useState<boolean>(false);

  return (
    <Paper elevation={4} sx={{ p: 5, maxWidth: 600, margin: '30px auto', borderRadius: '15px' }}>
      <Typography variant="h5" mb={3}>Create Deal</Typography>

      <form onSubmit={handleSubmit}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Autocomplete
              autoHighlight
              autoFocus
              options={customerOptions}
              getOptionLabel={(option) => option.customerName}
              value={customerOptions.find((option) => option.id === selectedCustomerId) || null}
              onInputChange={(event, newInputValue) => setCustomerName(newInputValue)}
              onChange={(event, newValue) => {
                if (newValue) {
                  setSelectedCustomerId(newValue.id);
                } else {
                  setSelectedCustomerId(null);
                }
              }}
              loading={loading}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Customer Name"
                  variant="outlined"
                  fullWidth
                  required
                  onFocus={() => setShowHelperTextCustomer(true)}
                  onBlur={() => setShowHelperTextCustomer(false)}
                  helperText={showHelperTextCustomer ? "Start typing to search for a customer." : ""}
                  InputProps={{
                    ...params.InputProps,
                    endAdornment: (
                      <>
                        {loading ? <CircularProgress color="inherit" size={20} /> : null}
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
              label="Requirement"
              value={requirement}
              onChange={(e) => setRequirement(e.target.value)}
              variant="outlined"
              fullWidth
              multiline
              maxRows={3}
              required
              onFocus={() => setShowHelperTextRequirement(true)}
              onBlur={() => setShowHelperTextRequirement(false)}
              helperText={showHelperTextRequirement ? "Describe the requirement for the deal." : ""}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              label="Deal Value"
              type="number"
              value={dealValue}
              onChange={(e) => setDealValue(e.target.value === '' ? '' : Number(e.target.value))}
              variant="outlined"
              fullWidth
              required
              onFocus={() => setShowHelperTextDealValue(true)}
              onBlur={() => setShowHelperTextDealValue(false)}
              InputProps={{
                endAdornment: <InputAdornment position="end">₹</InputAdornment>,
              }}
              helperText={showHelperTextDealValue ? "Enter the total value of the deal." : ""}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              label="Deal Approval Value"
              type="number"
              value={dealApprovalValue}
              onChange={(e) => {
                const value = e.target.value === '' ? '' : Number(e.target.value);
                setDealApprovalValue(value);
              }}
              variant="outlined"
              fullWidth
              required
              error={!!dealApprovalError}
              onFocus={() => setShowHelperTextDealValue(true)}
              onBlur={() => setShowHelperTextDealValue(false)}
              helperText={dealApprovalError || (showHelperTextDealValue ? "Enter the approved value of the deal." : "")}
              InputProps={{
                endAdornment: <InputAdornment position="end">₹</InputAdornment>,
              }}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              label="Advance Payment"
              type="number"
              value={advancePayment}
              onChange={(e) => setAdvancePayment(e.target.value === '' ? '' : Number(e.target.value))}
              variant="outlined"
              fullWidth
              required
              error={!!advancePaymentError}
              onFocus={() => setShowHelperTextAdvancePayment(true)}
              onBlur={() => setShowHelperTextAdvancePayment(false)}
              helperText={advancePaymentError || (showHelperTextAdvancePayment ? "Enter the advance payment amount." : "")}
              InputProps={{
                endAdornment: <InputAdornment position="end">₹</InputAdornment>,
              }}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              label="Balance Amount"
              type="number"
              value={balanceAmount}
              variant="outlined"
              fullWidth
              disabled
              onFocus={() => setShowHelperTextBalance(true)}
              onBlur={() => setShowHelperTextBalance(false)}
              InputProps={{
                readOnly: true,
                endAdornment: <InputAdornment position="end">₹</InputAdornment>,
              }}
              helperText={showHelperTextBalance ? "This is the remaining balance after advance payment." : ""}
            />
          </Grid>
          <Grid item xs={12}>
            <Button
              type="submit"
              variant="contained"
              fullWidth
              sx={{
                backgroundColor: '#5A67D8',
                py: 1.5,
                '&:hover': {
                  backgroundColor: '#4349B5',
                },
              }}
            >
              Create Deal
            </Button>
          </Grid>
        </Grid>
      </form>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={5000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Paper>
  );
};

export default DealCreateForm;