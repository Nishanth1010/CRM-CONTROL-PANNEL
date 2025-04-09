import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  MenuItem,
  Typography,
  Snackbar,
  Alert,
} from '@mui/material';

interface AddPaymentModalProps {
  open: boolean;
  deal: {
    balanceAmount: number;
  } | null;
  onClose: () => void;
  onSave: (payment: { amount: number; date: string; paymentType: string }) => void;
}

const AddPaymentModal: React.FC<AddPaymentModalProps> = ({ open, deal, onClose, onSave }) => {
  const [amount, setAmount] = useState<number>(0);
  const [remainingBalance, setRemainingBalance] = useState<number>(deal?.balanceAmount || 0);
  
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [paymentType, setPaymentType] = useState<string>('Cash');
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'error' | 'success' }>({
    open: false,
    message: '',
    severity: 'error',
  });

  // Update remaining balance when the deal or amount changes
  useEffect(() => {
    if (deal) {
      setRemainingBalance(deal.balanceAmount - (amount || 0));
    }
  }, [deal, amount]);
  

  const handleSave = () => {
    if (amount <= 0) {
      setSnackbar({ open: true, message: 'Amount must be greater than 0.', severity: 'error' });
      return;
    }
    if (amount > (deal?.balanceAmount || 0)) {
      setSnackbar({ open: true, message: 'Amount cannot exceed the available balance.', severity: 'error' });
      return;
    }
    onSave({ amount, date, paymentType });
    setSnackbar({ open: true, message: 'Payment successfully added!', severity: 'success' });
    onClose(); // Close the modal after saving
  };

  return (
    <>
      <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
        <DialogTitle>Add Payment</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <Typography variant="body1">
                Remaining Balance: ₹{remainingBalance.toFixed(2) ?? deal?.balanceAmount.toFixed(2)} 
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Amount (₹)"
                fullWidth
                type="number"
                value={amount}
                onChange={(e) => {
                  const enteredAmount = parseFloat(e.target.value);
                  setAmount(enteredAmount);

                  // Alert if the entered amount exceeds the balance
                  if (enteredAmount > (deal?.balanceAmount || 0)) {
                    setSnackbar({
                      open: true,
                      message: 'Amount cannot exceed the available balance.',
                      severity: 'error',
                    });
                  }
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <Typography variant="body1" color={remainingBalance < 0 ? 'error' : 'textPrimary'}>
               
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Payment Date"
                fullWidth
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Payment Type"
                fullWidth
                select
                value={paymentType}
                onChange={(e) => setPaymentType(e.target.value)}
              >
                <MenuItem value="Cash">Cash</MenuItem>
                <MenuItem value="Bank Transfer">Bank Transfer</MenuItem>
                <MenuItem value="Cheque">Cheque</MenuItem>
                <MenuItem value="Online Payment">Online Payment</MenuItem>
              </TextField>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} color="secondary">
            Cancel
          </Button>
          <Button onClick={handleSave} color="primary"  disabled={remainingBalance < 0 || amount <= 0  || !amount }          >
            Save
          </Button>
        </DialogActions>
      </Dialog>
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default AddPaymentModal;