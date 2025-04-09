import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  CircularProgress,
  Box,
  Card,
  CardContent,
  Grid,
  Divider,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Chip,
} from '@mui/material';
import moment from 'moment';
import { AttachMoney, CalendarToday, Payment, Person } from '@mui/icons-material';

interface Payment {
  id: string;
  amount: number;
  paymentDate?: string;
  paymentType: string;
  createdBy?: {
    id: number;
    email: string;
    name: string;
  };
}

interface Deal {
  id: string;
  dealID: string;
  customer: any;
  requirement: string;
  dealValue: number;
  dealApprovalValue: number;
  advancePayment: number;
  balanceAmount: number;
  createdAt: string;
  payments: Payment[];
  balance: number;
}

interface ShowPaymentsModalProps {
  open: boolean;
  initialBalance: number;
  payments: Payment[];
  onClose: () => void;
  loading: boolean;
  deal: Deal | null;
}

const ShowPaymentsModal: React.FC<ShowPaymentsModalProps> = ({
  open,
  initialBalance,
  payments,
  loading,
  onClose,
  deal,
}) => {
  const calculateBalances = (payments: Payment[], initialBalance: number) => {
    let remainingBalance = initialBalance;
    return payments.map((payment) => {
      remainingBalance -= payment.amount;
      return {
        ...payment,
        balanceAmount: remainingBalance,
      };
    }).reverse(); // Show latest payments first
  };

  const paymentHistory = payments ? calculateBalances(payments, initialBalance) : [];

  const getPaymentColor = (paymentType: string) => {
    const type = paymentType.toLowerCase();
    if (type.includes('cash')) return 'success';
    if (type.includes('card')) return 'primary';
    if (type.includes('transfer') || type.includes('upi')) return 'info';
    return 'secondary';
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>
        <Box display="flex" alignItems="center">
          <AttachMoney color="primary" sx={{ mr: 1 }} />
          <Typography variant="h6">Payment History</Typography>
          {deal && (
            <Chip 
              label={`Deal #${deal.dealID}`} 
              color="primary" 
              size="small" 
              sx={{ ml: 2 }} 
            />
          )}
        </Box>
      </DialogTitle>
      
      <DialogContent dividers>
        {loading ? (
          <Box display="flex" justifyContent="center" alignItems="center" height={200}>
            <CircularProgress />
          </Box>
        ) : paymentHistory.length === 0 ? (
          <Box textAlign="center" py={4}>
            <Typography variant="body1" color="textSecondary">
              No payments recorded for this deal
            </Typography>
          </Box>
        ) : (
          <List sx={{ pt: 0 }}>
            {paymentHistory.map((payment) => (
              <React.Fragment key={payment.id}>
                <ListItem alignItems="flex-start">
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: 'primary.main' }}>
                      <Payment />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <Box display="flex" justifyContent="space-between">
                        <Typography variant="subtitle1" fontWeight="bold">
                          ₹{payment.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </Typography>
                        <Chip 
                          label={payment.paymentType} 
                          color={getPaymentColor(payment.paymentType)} 
                          size="small"
                        />
                      </Box>
                    }
                    secondary={
                      <React.Fragment>
                        <Grid container spacing={1} mt={0.5}>
                          <Grid item xs={12} sm={6}>
                            <Box display="flex" alignItems="center">
                              <CalendarToday fontSize="small" color="action" sx={{ mr: 1 }} />
                              <Typography variant="body2" color="text.secondary">
                                {moment(payment.paymentDate).format('DD MMM YYYY, hh:mm A')}
                              </Typography>
                            </Box>
                          </Grid>
                          <Grid item xs={12} sm={6}>
                            <Box display="flex" alignItems="center">
                              <Person fontSize="small" color="action" sx={{ mr: 1 }} />
                              <Typography variant="body2" color="text.secondary">
                                {payment.createdBy?.name || payment.createdBy?.email || 'System'}
                              </Typography>
                            </Box>
                          </Grid>
                        </Grid>
                        
                      </React.Fragment>
                    }
                  />
                </ListItem>
                <Divider variant="inset" component="li" />
              </React.Fragment>
            ))}
          </List>
        )}
      </DialogContent>
      
      <DialogActions sx={{ px: 3, py: 2 }}>
        <Box display="flex" justifyContent="space-between" width="100%">
          <Typography variant="subtitle2" color="text.secondary">
            Total Payments: {payments.length}
          </Typography>
          <Button 
            onClick={onClose} 
            variant="contained" 
            color="primary"
            size="small"
          >
            Close
          </Button>
        </Box>
      </DialogActions>
    </Dialog>
  );
};

export default ShowPaymentsModal;