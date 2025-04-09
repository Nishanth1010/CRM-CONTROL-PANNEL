import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Button,
  TextField,
  MenuItem,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  Typography,
} from '@mui/material';
import axios from 'axios';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';

interface PaymentModalProps {
  open: boolean;
  deal: any;
  onClose: () => void;
  onSave: () => void;
  payment?: any; // Existing payment for edit mode
}

const PaymentModal: React.FC<PaymentModalProps> = ({ 
  open, 
  deal, 
  onClose, 
  onSave, 
  payment 
}) => {
  
  const [amount, setAmount] = useState(payment?.amount?.toString() || '');
  const [paymentType, setPaymentType] = useState(payment?.paymentType || '');
  const [paymentDate, setPaymentDate] = useState<Date | null>(
    payment?.paymentDate ? new Date(payment.paymentDate) : new Date()
  );
  const [remarks, setRemarks] = useState(payment?.remarks || '');
  const [createdById, setCreatedById] = useState(payment?.createdById || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const paymentMethods = [
    'Credit Card', 
    'Debit Card', 
    'Bank Transfer', 
    'UPI', 
    'Cash',
    'Cheque',
    'Online Payment'
  ];

  useEffect(() => {
    if (payment) {
      setAmount(payment.amount?.toString() || '');
      setPaymentType(payment.paymentType || '');
      setPaymentDate(payment.paymentDate ? new Date(payment.paymentDate) : new Date());
      setRemarks(payment.remarks || '');
      setCreatedById(payment.createdById || '');
    } 
  }, [payment]);

  const handleSave = async () => {
    if (!amount || !paymentType || !paymentDate) {
      setError('Please fill in all required fields.');
      return;
    }

    if (isNaN(Number(amount)) || Number(amount) <= 0) {
      setError('Please enter a valid payment amount.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const paymentData = {
        amount: Number(amount),
        paymentType,
        paymentDate: paymentDate?.toISOString(),
        remarks,
        createdById: createdById || null,
        dealId: deal.id
      };

      if (payment) {
        // Update existing payment
        await axios.put(`/api/payments/${deal.companyId}`, {
          id: payment.id,
          ...paymentData
        });
      } else {
        // Create new payment
        await axios.post(`/api/payments/${deal.companyId}`, paymentData);
      }

      onSave(); // Refresh payments after save
      onClose();
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.error || 'Failed to save payment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setError(null);
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
      <DialogTitle>{payment ? 'Edit Payment' : 'Add Payment'}</DialogTitle>
      <DialogContent>
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <DatePicker
            label="Payment Date"
            value={paymentDate}
            onChange={(newValue) => setPaymentDate(newValue)}
          
          />
        </LocalizationProvider>

        <TextField
          label="Amount"
          type="number"
          fullWidth
          margin="dense"
          required
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          inputProps={{ min: 0, step: 0.01 }}
        />

        <TextField
          label="Payment Method"
          select
          fullWidth
          margin="dense"
          required
          value={paymentType}
          onChange={(e) => setPaymentType(e.target.value)}
        >
          {paymentMethods.map((method) => (
            <MenuItem key={method} value={method}>
              {method}
            </MenuItem>
          ))}
        </TextField>

        <TextField
          label="Remarks"
          fullWidth
          margin="dense"
          multiline
          rows={3}
          value={remarks}
          onChange={(e) => setRemarks(e.target.value)}
        />

        

        {error && (
          <Typography color="error" variant="body2" sx={{ mt: 2 }}>
            {error}
          </Typography>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} color="secondary" disabled={loading}>
          Cancel
        </Button>
        <Button 
          onClick={handleSave} 
          color="primary" 
          disabled={loading}
          variant="contained"
        >
          {loading ? <CircularProgress size={24} /> : 'Save'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default PaymentModal;