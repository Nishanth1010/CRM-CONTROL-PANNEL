import React, { useState, useEffect } from 'react';

import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Grid,
  Snackbar,
  Alert,
  InputAdornment
} from '@mui/material';




interface Customer {
  id: string;
  customerName: string;
  email: string;
  address: string;
  stateDistrictPin: string;
  gstNumber: string;
  cinNumber: string;
  businessLeadName: string;
  authorizedPersonName: string;
  mobileNumber: string;
  whatsappNumber: string;
}

interface Payment {
  id: string;
  amount: number;
  date: string;
  paymentType: string;
  balanceAmount: number;
}

interface Deal {
  [x: string]: any;
  id: string;
  dealID: string;
  customer: Customer;
  requirement: string;
  dealValue: number;
  dealApprovalValue: number;
  advancePayment: number;
  balanceAmount: number;
  createdAt: string;
  balance: number; // Added balance property
  payments: Payment[]; // Added payments property
  initialBalance: number; // Added initial balance property
};


interface EditDealModalProps {
  open: boolean;
  deal: Deal | null;
  onClose: () => void;
  onSave: (updatedDeal: Deal) => Promise<void>;
}

const EditDealModal: React.FC<EditDealModalProps> = ({ open, deal, onClose, onSave }) => {
  const [formData, setFormData] = useState<Deal | null>(null);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success',
  });

  // Helper text states
  const [showHelperTextRequirement, setShowHelperTextRequirement] = useState<boolean>(false);
  const [showHelperTextDealValue, setShowHelperTextDealValue] = useState<boolean>(false);
  const [showHelperTextDealApprovalValue, setShowHelperTextDealApprovalValue] = useState<boolean>(false);
  const [showHelperTextAdvancePayment, setShowHelperTextAdvancePayment] = useState<boolean>(false);
  const [showHelperTextBalanceAmount, setShowHelperTextBalanceAmount] = useState<boolean>(false);
  const [advancePaymentError, setAdvancePaymentError] = useState<string>('');

  useEffect(() => {
    if (deal) {
      setFormData(deal);
    }
  }, [deal]);

  const handleChange = (field: keyof Deal, value: any) => {
    setFormData((prevData: Deal | null) => {
      if (!prevData) return prevData;

      const updatedFormData: Deal = { ...prevData, [field]: value };

      // Validation: Deal Approval Value should be greater than or equal to Deal Value
      if (field === 'dealApprovalValue' || field === 'dealValue') {
        const dealApprovalValue = field === 'dealApprovalValue' ? value : prevData.dealApprovalValue;
        const dealValue = field === 'dealValue' ? value : prevData.dealValue;

        if (dealApprovalValue > dealValue) {
          setShowHelperTextDealApprovalValue(true);
        } else {
          setShowHelperTextDealApprovalValue(false);
        }
      }

      // Calculate balance amount when dealApprovalValue or advancePayment changes
      if (field === 'advancePayment' || field === 'dealApprovalValue') {
        const dealApprovalValue = field === 'dealApprovalValue' ? value : prevData.dealApprovalValue;
        const advancePayment = field === 'advancePayment' ? value : prevData.advancePayment;

        updatedFormData.balanceAmount = Math.max(0, parseFloat((dealApprovalValue - advancePayment).toFixed(2)));

        if (advancePayment > dealApprovalValue) {
          setAdvancePaymentError('Advance payment cannot exceed the deal approval value.');
        } else {
          setAdvancePaymentError('');
        }
      }

      return updatedFormData;
    });
  };


  const handleSave = async () => {
    if (formData) {
      try {
        await onSave(formData);
        setSnackbar({ open: true, message: 'Deal updated successfully!', severity: 'success' });
      } catch (error) {
        setSnackbar({ open: true, message: 'Failed to update deal. Please try again.', severity: 'error' });
      }
    } else {
      setSnackbar({ open: true, message: 'Failed to update deal.', severity: 'error' });
    }
  };

  const handleSnackbarClose = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  return (
    <>
      <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
        <DialogTitle>Edit Deal</DialogTitle>
        <DialogContent>
          {formData && (
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <TextField
                  label="Deal ID"
                  fullWidth
                  value={formData.dealID}
                  disabled
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="Customer Name"
                  fullWidth
                  value={formData.customer.customerName}
                  disabled
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="Requirement"
                  fullWidth
                  value={formData.requirement}
                  onChange={(e) => handleChange('requirement', e.target.value)}
                  onFocus={() => setShowHelperTextRequirement(true)}
                  onBlur={() => setShowHelperTextRequirement(false)}
                  helperText={showHelperTextRequirement ? "Describe the requirement for the deal." : ""}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Deal Value (₹)"
                  fullWidth
                  type="number"
                  value={formData.dealValue}
                  onChange={(e) => handleChange('dealValue', parseFloat(e.target.value))}
                  onFocus={() => setShowHelperTextDealValue(true)}
                  onBlur={() => setShowHelperTextDealValue(false)}
                  helperText={showHelperTextDealValue ? "Enter the total value of the deal." : ""}
                  InputProps={{
                    endAdornment: <InputAdornment position="end">₹</InputAdornment>,
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Deal Approval Value (₹)"
                  fullWidth
                  type="number"
                  value={formData.dealApprovalValue}
                  onChange={(e) => handleChange('dealApprovalValue', parseFloat(e.target.value))}
                  error={showHelperTextDealApprovalValue}
                  helperText={showHelperTextDealApprovalValue ? "Deal Approval Value must be greater than or equal to Deal Value." : ""}
                  InputProps={{
                    endAdornment: <InputAdornment position="end">₹</InputAdornment>,
                  }}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  label="Advance Payment (₹)"
                  fullWidth
                  type="number"
                  value={formData.advancePayment}
                  onChange={(e) => handleChange('advancePayment', parseFloat(e.target.value))}
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
                  label="Balance Amount (₹)"
                  fullWidth
                  type="number"
                  value={formData.balanceAmount}
                  disabled
                  onFocus={() => setShowHelperTextBalanceAmount(true)}
                  onBlur={() => setShowHelperTextBalanceAmount(false)}
                  helperText={showHelperTextBalanceAmount ? "This is the remaining balance after advance payment." : ""}
                  InputProps={{
                    readOnly: true,
                    endAdornment: <InputAdornment position="end">₹</InputAdornment>,
                  }}
                />
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} color="secondary">
            Cancel
          </Button>
          <Button onClick={handleSave} color="primary">
            Save
          </Button>
        </DialogActions>
      </Dialog>
      <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={handleSnackbarClose}>
        <Alert onClose={handleSnackbarClose} severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default EditDealModal;
